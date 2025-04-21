import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';
import { Tour } from '@/generated/prisma';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get('search');
  const destinationId = searchParams.get('destinationId');
  const popular = searchParams.get('popular');
  const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit') || '0', 10) : undefined;
  const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset') || '0', 10) : undefined;

  try {
    const whereClause: any = {};

    if (search) {
      whereClause.title = {
        contains: search,
        mode: 'insensitive', // Поиск без учета регистра
      };
    }

    if (destinationId) {
      // Убедимся, что destinationId - это число
      const destId = parseInt(destinationId, 10);
      if (!isNaN(destId)) {
        whereClause.destinationId = destId;
      }
    }

    let tours;

    if (popular === 'true') {
      // Получаем популярные туры на основе количества заказов
      tours = await prisma.tour.findMany({
        where: whereClause,
        include: {
          destination: true,
          _count: {
            select: {
              orders: true,
              reviews: true // Добавляем количество отзывов
            }
          }
        },
        orderBy: {
          orders: {
            _count: 'desc'  // Сортировка по количеству заказов
          }
        },
        take: limit,
        skip: offset,
      });
    } else {
      // Стандартный запрос туров
      tours = await prisma.tour.findMany({
        where: whereClause,
        include: {
          destination: true, // Включаем направление для отображения в карточке
          _count: {
            select: {
              reviews: true // Добавляем количество отзывов
            }
          }
        },
        orderBy: {
          createdAt: 'desc', // Сортируем по дате создания (новые сверху)
        },
        take: limit,
        skip: offset,
      });
    }

    // Получаем средние рейтинги для всех туров в одном запросе
    const tourIds = tours.map((tour: any) => tour.id);
    
    // Получаем средние рейтинги для всех туров одним запросом
    const ratingsData = await prisma.review.groupBy({
      by: ['tourId'],
      where: {
        tourId: { in: tourIds },
        isApproved: true // Учитываем только одобренные отзывы
      },
      _avg: {
        rating: true
      }
    });
    
    // Создаем мапу tourId -> averageRating для быстрого доступа
    const ratingMap = new Map();
    ratingsData.forEach(item => {
      if (item._avg.rating) {
        ratingMap.set(item.tourId, item._avg.rating);
      }
    });
    
    // Добавляем средний рейтинг к турам
    const toursWithRatings = tours.map((tour: any) => ({
      ...tour,
      price: tour.price.toString(),
      averageRating: ratingMap.get(tour.id) || 0
    }));

    return NextResponse.json(toursWithRatings);
  } catch (error) {
    console.error('[API_TOURS_GET]', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
} 