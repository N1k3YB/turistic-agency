import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';
import { Tour } from '@/generated/prisma';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get('search');
  const destinationId = searchParams.get('destinationId');

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

    const tours = await prisma.tour.findMany({
      where: whereClause,
      include: {
        destination: true, // Включаем направление для отображения в карточке
      },
      orderBy: {
        createdAt: 'desc', // Сортируем по дате создания (новые сверху)
      },
    });

    // Преобразуем Decimal в строку для JSON
    const toursWithStringPrice = tours.map((tour: Tour) => ({
      ...tour,
      price: tour.price.toString(),
    }));

    return NextResponse.json(toursWithStringPrice);
  } catch (error) {
    console.error('[API_TOURS_GET]', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
} 