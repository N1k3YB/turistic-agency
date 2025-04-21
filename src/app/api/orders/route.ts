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

    // Получаем общее количество заказанных мест для этого тура
    const orderedSeats = await prisma.order.aggregate({
      where: {
        tourId: parseInt(tourId),
        status: {
          in: ['PENDING', 'CONFIRMED']
        }
      },
      _sum: {
        quantity: true
      }
    });

    const totalOrderedSeats = orderedSeats._sum.quantity || 0;
    const availableSeats = tour.groupSize - totalOrderedSeats;

    // Проверяем наличие свободных мест
    if (availableSeats < quantity) {
      return new NextResponse(
        `Недостаточно свободных мест. Доступно: ${availableSeats}`,
        { status: 400 }
      );
    }

    // Создаем заказ
    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        tourId: parseInt(tourId),
        quantity,
        totalPrice: tour.price.mul(quantity),
        contactEmail,
        contactPhone,
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error("[ORDERS_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 