import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const popular = searchParams.get('popular');
  const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit') || '0', 10) : undefined;

  try {
    if (popular === 'true') {
      // Получаем популярные направления на основе общего количества заказов в турах
      const popularDestinations = await prisma.destination.findMany({
        include: {
          tours: {
            include: {
              _count: {
                select: {
                  orders: true
                }
              }
            }
          },
        },
        take: limit,
      });

      // Рассчитываем и сортируем направления по количеству заказов
      const sortedDestinations = popularDestinations
        .map(destination => {
          const totalOrders = destination.tours.reduce((sum, tour) => sum + tour._count.orders, 0);
          return {
            ...destination,
            totalOrders,
            tourCount: destination.tours.length
          };
        })
        .sort((a, b) => {
          if (a.totalOrders === b.totalOrders) {
            return b.tourCount - a.tourCount; // Если заказов поровну, сортируем по количеству туров
          }
          return b.totalOrders - a.totalOrders; // Сортировка по количеству заказов
        });

      return NextResponse.json(sortedDestinations);
    } else {
      // Стандартный запрос направлений
      const destinations = await prisma.destination.findMany({
        orderBy: {
          name: 'asc', // Сортируем по названию
        },
        take: limit,
      });
      return NextResponse.json(destinations);
    }
  } catch (error) {
    console.error('[API_DESTINATIONS_GET]', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
} 