import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

// GET - получить детали конкретного заказа
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const orderId = parseInt(params.id);
    
    if (isNaN(orderId)) {
      return new NextResponse("Некорректный ID заказа", { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
      include: {
        tour: {
          select: {
            title: true,
            imageUrl: true,
            price: true,
            currency: true,
            availableSeats: true,
            nextTourDate: true,
            groupSize: true,
            slug: true,
          },
        },
      },
    });

    if (!order) {
      return new NextResponse("Заказ не найден", { status: 404 });
    }

    // Проверяем, что заказ принадлежит текущему пользователю или пользователь админ/менеджер
    if (
      order.userId !== session.user.id &&
      session.user.role !== "ADMIN" &&
      session.user.role !== "MANAGER"
    ) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("[ORDERS_GET_BY_ID]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// PATCH - обновить статус заказа (возможность отмены заказа пользователем)
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const orderId = parseInt(params.id);
    
    if (isNaN(orderId)) {
      return new NextResponse("Некорректный ID заказа", { status: 400 });
    }

    const body = await request.json();
    const { action } = body;

    if (action !== "cancel") {
      return new NextResponse("Неподдерживаемое действие", { status: 400 });
    }

    // Находим заказ
    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
    });

    if (!order) {
      return new NextResponse("Заказ не найден", { status: 404 });
    }

    // Проверяем, что заказ принадлежит текущему пользователю
    if (order.userId !== session.user.id) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Проверяем, что заказ можно отменить (не отменен и не завершен)
    if (order.status === "CANCELLED" || order.status === "COMPLETED") {
      return new NextResponse(
        `Невозможно отменить заказ в статусе ${order.status}`,
        { status: 400 }
      );
    }

    // Используем транзакцию для отмены заказа и обновления количества свободных мест
    const result = await prisma.$transaction(async (tx) => {
      // Обновляем статус заказа
      const updatedOrder = await tx.order.update({
        where: {
          id: orderId,
        },
        data: {
          status: "CANCELLED",
        },
      });

      // Увеличиваем количество свободных мест в туре
      await tx.tour.update({
        where: {
          id: order.tourId,
        },
        data: {
          availableSeats: {
            increment: order.quantity,
          },
        },
      });

      return updatedOrder;
    });

    return NextResponse.json({
      message: "Заказ успешно отменен",
      order: result,
    });
  } catch (error) {
    console.error("[ORDERS_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 