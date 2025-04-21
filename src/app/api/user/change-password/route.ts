import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { hash, compare } from 'bcrypt';
import { z } from 'zod';

// Схема валидации для смены пароля
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, { message: "Введите текущий пароль" }),
  newPassword: z.string().min(6, { message: "Новый пароль должен содержать минимум 6 символов" }),
});

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
    const validationResult = changePasswordSchema.safeParse(body);
    if (!validationResult.success) {
      const formattedErrors = validationResult.error.format();
      
      const errorMessages = [];
      
      if (formattedErrors.currentPassword?._errors) {
        errorMessages.push(formattedErrors.currentPassword._errors[0]);
      }
      
      if (formattedErrors.newPassword?._errors) {
        errorMessages.push(formattedErrors.newPassword._errors[0]);
      }
      
      return NextResponse.json(
        { 
          error: errorMessages.length > 0 
            ? errorMessages[0]
            : 'Некорректные данные' 
        }, 
        { status: 400 }
      );
    }
    
    const { currentPassword, newPassword } = validationResult.data;
    
    // Получаем пользователя с хешированным паролем
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id
      },
      select: {
        hashedPassword: true
      }
    });
    
    if (!user || !user.hashedPassword) {
      return NextResponse.json(
        { error: 'Пользователь не найден или для этого аккаунта не установлен пароль' }, 
        { status: 404 }
      );
    }
    
    // Проверяем текущий пароль
    const isCorrectPassword = await compare(currentPassword, user.hashedPassword);
    
    if (!isCorrectPassword) {
      return NextResponse.json(
        { error: 'Неверный текущий пароль' }, 
        { status: 400 }
      );
    }
    
    // Хеширование нового пароля
    const hashedPassword = await hash(newPassword, 10);
    
    // Обновляем пароль пользователя
    await prisma.user.update({
      where: {
        id: session.user.id
      },
      data: {
        hashedPassword
      }
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Пароль успешно изменен' 
    });
  } catch (error) {
    console.error('Ошибка при смене пароля:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' }, 
      { status: 500 }
    );
  }
} 