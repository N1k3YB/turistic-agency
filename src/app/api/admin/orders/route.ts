import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

// GET - получить все заказы (для админов и менеджеров)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (session.user.role !== "ADMIN" && session.user.role !== "MANAGER") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const orders = await prisma.order.findMany({
      include: {
        tour: {
          select: {
            title: true,
            imageUrl: true,
            price: true,
            currency: true,
            availableSeats: true,
            nextTourDate: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("[ADMIN_ORDERS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// PATCH - обновить статус заказа
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (session.user.role !== "ADMIN" && session.user.role !== "MANAGER") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const body = await request.json();
    const { orderId, status } = body;

    if (!orderId || !status) {
      return new NextResponse("Не все обязательные поля заполнены", {
        status: 400,
      });
    }

    // Проверяем существование заказа
    const existingOrder = await prisma.order.findUnique({
      where: {
        id: parseInt(orderId),
      },
    });

    if (!existingOrder) {
      return new NextResponse("Заказ не найден", { status: 404 });
    }

    // Обновляем статус заказа
    const order = await prisma.order.update({
      where: {
        id: parseInt(orderId),
      },
      data: {
        status,
      },
    });

    // Если заказ отменен, возвращаем свободные места в тур
    if (status === "CANCELLED" && existingOrder.status !== "CANCELLED") {
      await prisma.tour.update({
        where: {
          id: existingOrder.tourId,
        },
        data: {
          availableSeats: {
            increment: existingOrder.quantity,
          },
        },
      });
    }

    // Если заказ был отменен, а теперь подтвержден, уменьшаем количество свободных мест
    if (
      status === "CONFIRMED" &&
      existingOrder.status === "CANCELLED"
    ) {
      const tour = await prisma.tour.findUnique({
        where: {
          id: existingOrder.tourId,
        },
      });

      if (tour && tour.availableSeats >= existingOrder.quantity) {
        await prisma.tour.update({
          where: {
            id: existingOrder.tourId,
          },
          data: {
            availableSeats: {
              decrement: existingOrder.quantity,
            },
          },
        });
      } else {
        // Если недостаточно мест, оставляем заказ отмененным
        await prisma.order.update({
          where: {
            id: parseInt(orderId),
          },
          data: {
            status: "CANCELLED",
          },
        });

        return new NextResponse(
          "Недостаточно свободных мест для возобновления заказа",
          { status: 400 }
        );
      }
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("[ADMIN_ORDERS_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 