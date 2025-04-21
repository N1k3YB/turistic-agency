import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

interface Params {
  params: { slug: string };
}

export async function GET(request: Request, { params }: Params) {
  try {
    const slug = params.slug;
    const session = await getServerSession(authOptions);

    // Получаем информацию о туре
    const tour = await prisma.tour.findUnique({
      where: {
        slug,
      },
      include: {
        destination: true, // Включаем связанные данные направления
      },
    });

    if (!tour) {
      return new NextResponse("Тур не найден", { status: 404 });
    }

    // Получаем общее количество заказанных мест для этого тура
    const orderedSeats = await prisma.order.aggregate({
      where: {
        tourId: tour.id,
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

    // Проверяем, есть ли заказ у пользователя на этот тур
    let hasOrder = false;
    if (session?.user) {
      const userOrder = await prisma.order.findFirst({
        where: {
          userId: session.user.id,
          tourId: tour.id,
          status: {
            in: ['PENDING', 'CONFIRMED']
          }
        }
      });
      hasOrder = !!userOrder;
    }

    // Возвращаем тур с актуальным количеством свободных мест и информацией о заказе
    return NextResponse.json({
      ...tour,
      availableSeats,
      hasOrder
    });
  } catch (error) {
    console.error("[TOUR_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 