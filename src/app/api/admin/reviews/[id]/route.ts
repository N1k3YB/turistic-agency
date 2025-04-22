import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  // Проверка авторизации и роли администратора
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return NextResponse.json(
      { error: 'Необходима авторизация' }, 
      { status: 401 }
    );
  }
  
  if (session.user.role !== 'ADMIN') {
    return NextResponse.json(
      { error: 'Недостаточно прав' }, 
      { status: 403 }
    );
  }
  
  const { id } = await params;
  
  if (!id || isNaN(parseInt(id))) {
    return NextResponse.json(
      { error: 'Неверный ID отзыва' }, 
      { status: 400 }
    );
  }
  
  try {
    // Проверка существования отзыва
    const review = await prisma.review.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!review) {
      return NextResponse.json(
        { error: 'Отзыв не найден' }, 
        { status: 404 }
      );
    }
    
    // Удаление отзыва
    await prisma.review.delete({
      where: { id: parseInt(id) }
    });
    
    return NextResponse.json(
      { message: 'Отзыв успешно удален' }
    );
  } catch (error) {
    console.error('Ошибка при удалении отзыва:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' }, 
      { status: 500 }
    );
  }
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  
  // ... existing code ...
} 