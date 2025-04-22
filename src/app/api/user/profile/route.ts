import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export async function GET() {
  const session = await getServerSession(authOptions);
  
  // Проверка авторизации
  if (!session || !session.user) {
    return NextResponse.json(
      { error: 'Необходима авторизация' }, 
      { status: 401 }
    );
  }
  
  try {
    // Получаем данные пользователя
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        phone: true,
        address: true,
        createdAt: true,
      }
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'Пользователь не найден' }, 
        { status: 404 }
      );
    }
    
    return NextResponse.json(user);
  } catch (error) {
    console.error('Ошибка при получении данных пользователя:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' }, 
      { status: 500 }
    );
  }
}

// Схема валидации для обновления профиля пользователя
const updateProfileSchema = z.object({
  name: z.string().min(2, { message: "Имя должно содержать минимум 2 символа" }).max(100, { message: "Имя не должно превышать 100 символов" }),
  phone: z.string().regex(/^(\+7|8)[0-9]{10}$/, { message: "Номер телефона должен быть в формате +7XXXXXXXXXX или 8XXXXXXXXXX" }).optional().nullable(),
  address: z.string().regex(/^[А-Яа-яЁё\s-]+$/, { message: "Адрес должен содержать только название города на русском языке" }).optional().nullable(),
});

export async function PUT(req: Request) {
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
    const validationResult = updateProfileSchema.safeParse(body);
    if (!validationResult.success) {
      const formattedErrors = validationResult.error.format();
      
      const errorMessages = [];
      
      if (formattedErrors.name?._errors) {
        errorMessages.push(formattedErrors.name._errors[0]);
      }
      
      if (formattedErrors.phone?._errors) {
        errorMessages.push(formattedErrors.phone._errors[0]);
      }
      
      if (formattedErrors.address?._errors) {
        errorMessages.push(formattedErrors.address._errors[0]);
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
    
    const { name, phone, address } = validationResult.data;
    
    // Подготовка данных для обновления
    const updateData: any = {
      name,
      phone,
      address
    };
    
    // Если указан телефон, устанавливаем emailVerified
    if (phone) {
      updateData.emailVerified = new Date();
    }
    
    // Обновление пользователя
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData
    });
    
    return NextResponse.json({
      message: 'Профиль пользователя успешно обновлен',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        address: updatedUser.address,
        emailVerified: updatedUser.emailVerified
      }
    });
  } catch (error) {
    console.error('Ошибка при обновлении профиля пользователя:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' }, 
      { status: 500 }
    );
  }
} 