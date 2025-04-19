import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Decimal } from '@prisma/client/runtime/library'; // Импорт Decimal
// Импортируем тип Tour из сгенерированного клиента
import { Tour } from '@/generated/prisma';

interface Params {
  params: { slug: string };
}

export async function GET(request: Request, { params }: Params) {
  const { slug } = params;

  try {
    const destination = await prisma.destination.findUnique({
      where: { slug },
      include: {
        tours: true, // Включаем связанные туры
      },
    });

    if (!destination) {
      return NextResponse.json({ error: 'Направление не найдено' }, { status: 404 });
    }

    // Преобразуем Decimal в строку для каждого тура
    const destinationWithFormattedTours = {
      ...destination,
      // Явно указываем тип tour
      tours: destination.tours.map((tour: Tour) => ({
        ...tour,
        price: tour.price.toString(),
      })),
    };

    return NextResponse.json(destinationWithFormattedTours);
  } catch (error) {
    console.error('[API_DESTINATION_SLUG_GET]', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
} 