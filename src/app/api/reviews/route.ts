import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Схема валидации
const reviewSchema = z.object({
  tourId: z.number().int().positive(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(10).max(1000),
});

// GET запрос для получения всех одобренных отзывов
export async function GET(req: Request) {
  const url = new URL(req.url);
  const tourId = url.searchParams.get('tourId');
  
  if (!tourId) {
    return NextResponse.json({ error: 'Не указан ID тура' }, { status: 400 });
  }
  
  try {
    const reviews = await prisma.review.findMany({
      where: {
        tourId: parseInt(tourId),
        isApproved: true
      },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Ошибка при получении отзывов:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' }, 
      { status: 500 }
    );
  }
}

// POST запрос для создания нового отзыва
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
  // Проверка авторизации
  if (!session || !session.user) {
    return NextResponse.json(
      { error: 'Необходима авторизация' }, 
      { status: 401 }
    );
  }
  
  try {
    const body = await req.json();
    
    // Валидация данных
    const validationResult = reviewSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Некорректные данные', details: validationResult.error.format() }, 
        { status: 400 }
      );
    }
    
    const { tourId, rating, comment } = validationResult.data;
    
    // Проверка существования тура
    const tour = await prisma.tour.findUnique({
      where: { id: tourId }
    });
    
    if (!tour) {
      return NextResponse.json(
        { error: 'Тур не найден' }, 
        { status: 404 }
      );
    }
    
    // Проверка, оставлял ли пользователь уже отзыв для этого тура
    const existingReview = await prisma.review.findFirst({
      where: {
        tourId,
        userId: session.user.id
      }
    });
    
    if (existingReview) {
      return NextResponse.json(
        { error: 'Вы уже оставили отзыв для этого тура' }, 
        { status: 400 }
      );
    }
    
    // Создание отзыва
    const review = await prisma.review.create({
      data: {
        rating,
        comment,
        tourId,
        userId: session.user.id,
        isApproved: false // Отзыв появится только после модерации
      }
    });
    
    return NextResponse.json(
      { message: 'Отзыв успешно отправлен и будет опубликован после проверки модератором', id: review.id }, 
      { status: 201 }
    );
  } catch (error) {
    console.error('Ошибка при создании отзыва:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' }, 
      { status: 500 }
    );
  }
} 