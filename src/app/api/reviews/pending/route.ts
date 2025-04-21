import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET запрос для проверки наличия ожидающего отзыва от пользователя для конкретного тура
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  
  // Проверка авторизации
  if (!session || !session.user) {
    return NextResponse.json(
      { error: 'Необходима авторизация' }, 
      { status: 401 }
    );
  }
  
  const url = new URL(req.url);
  const tourId = url.searchParams.get('tourId');
  
  if (!tourId) {
    return NextResponse.json({ error: 'Не указан ID тура' }, { status: 400 });
  }
  
  try {
    // Поиск неодобренного отзыва от текущего пользователя для указанного тура
    const pendingReview = await prisma.review.findFirst({
      where: {
        tourId: parseInt(tourId),
        userId: session.user.id,
        isApproved: false
      }
    });
    
    // Также проверяем, есть ли уже одобренный отзыв
    const approvedReview = await prisma.review.findFirst({
      where: {
        tourId: parseInt(tourId),
        userId: session.user.id,
        isApproved: true
      }
    });
    
    return NextResponse.json({
      hasPendingReview: !!pendingReview,
      hasApprovedReview: !!approvedReview
    });
  } catch (error) {
    console.error('Ошибка при проверке отзывов пользователя:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' }, 
      { status: 500 }
    );
  }
} 