import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface Params {
  params: { slug: string };
}

export async function GET(request: Request, { params }: Params) {
  const { slug } = params;

  try {
    const tour = await prisma.tour.findUnique({
      where: { slug },
      include: {
        destination: true, // Включаем связанные данные направления
      },
    });

    if (!tour) {
      return NextResponse.json({ error: 'Тур не найден' }, { status: 404 });
    }

    // Преобразуем Decimal в строку для JSON-сериализации
    const tourWithStringPrice = {
      ...tour,
      price: tour.price.toString(),
    };

    return NextResponse.json(tourWithStringPrice);
  } catch (error) {
    console.error('[API_TOUR_SLUG_GET]', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
} 