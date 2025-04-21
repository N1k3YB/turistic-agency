import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

// GET - получить заказы текущего пользователя
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        tour: {
          select: {
            title: true,
            imageUrl: true,
            price: true,
            currency: true,
            groupSize: true,
            nextTourDate: true,
            slug: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("[ORDERS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// POST - создать новый заказ
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { tourId, quantity, contactEmail, contactPhone } = body;

    if (!tourId || !quantity || !contactEmail) {
      return new NextResponse("Не все обязательные поля заполнены", {
        status: 400,
      });
    }

    // Получаем информацию о туре
    const tour = await prisma.tour.findUnique({
      where: {
        id: parseInt(tourId),
      },
    });

    if (!tour) {
      return new NextResponse("Тур не найден", { status: 404 });
    }

    // Вычисляем доступные места напрямую из таблицы туров
    if (tour.availableSeats < quantity) {
      return new NextResponse(
        `Недостаточно свободных мест. Доступно: ${tour.availableSeats}`,
        { status: 400 }
      );
    }

    // Используем транзакцию для обновления заказа и количества свободных мест
    const result = await prisma.$transaction(async (tx) => {
      // Создаем заказ
      const order = await tx.order.create({
        data: {
          userId: session.user.id,
          tourId: parseInt(tourId),
          quantity,
          totalPrice: tour.price.mul(quantity),
          contactEmail,
          contactPhone,
        },
      });

      // Обновляем количество свободных мест в туре
      await tx.tour.update({
        where: { id: parseInt(tourId) },
        data: {
          availableSeats: tour.availableSeats - quantity
        }
      });

      return order;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[ORDERS_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 