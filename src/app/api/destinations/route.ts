import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const destinations = await prisma.destination.findMany({
      orderBy: {
        name: 'asc', // Сортируем по названию
      },
    });
    return NextResponse.json(destinations);
  } catch (error) {
    console.error('[API_DESTINATIONS_GET]', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
} 