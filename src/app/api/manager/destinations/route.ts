import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Схема валидации для создания/обновления направления
const destinationSchema = z.object({
  name: z.string().min(3, { message: "Название должно содержать минимум 3 символа" })
    .max(100, { message: "Название не должно превышать 100 символов" }),
  slug: z.string().min(3, { message: "URL-идентификатор должен содержать минимум 3 символа" })
    .max(100, { message: "URL-идентификатор не должен превышать 100 символов" })
    .regex(/^[a-z0-9а-яё-]+$/i, { message: "URL-идентификатор может содержать только буквы, цифры и дефисы" }),
  description: z.string().min(10, { message: "Описание должно содержать минимум 10 символов" }),
  imageUrl: z.string().min(5, { message: "URL изображения должен содержать минимум 5 символов" }),
});

// GET запрос для получения списка направлений менеджером
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  
  // Проверка авторизации и роли менеджера или админа
  if (!session || !session.user) {
    return NextResponse.json(
      { error: 'Необходима авторизация' }, 
      { status: 401 }
    );
  }
  
  if (session.user.role !== 'MANAGER' && session.user.role !== 'ADMIN') {
    return NextResponse.json(
      { error: 'Недостаточно прав' }, 
      { status: 403 }
    );
  }
  
  try {
    // Получаем все направления
    const destinations = await prisma.destination.findMany({
      orderBy: {
        name: 'asc'
      }
    });
    
    return NextResponse.json({ destinations });
  } catch (error) {
    console.error('Ошибка при получении направлений:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' }, 
      { status: 500 }
    );
  }
}

// POST запрос для создания нового направления менеджером
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
  // Проверка авторизации и роли менеджера
  if (!session || !session.user) {
    return NextResponse.json(
      { error: 'Необходима авторизация' }, 
      { status: 401 }
    );
  }
  
  if (session.user.role !== 'MANAGER' && session.user.role !== 'ADMIN') {
    return NextResponse.json(
      { error: 'Недостаточно прав' }, 
      { status: 403 }
    );
  }
  
  try {
    const body = await req.json();
    console.log('Полученные данные для создания направления:', body);
    
    // Валидация данных
    const validationResult = destinationSchema.safeParse(body);
    if (!validationResult.success) {
      const formattedErrors = validationResult.error.format();
      console.error('Ошибки валидации:', formattedErrors);
      
      // Преобразуем ошибки в более читаемый формат
      const errorMessages: string[] = [];
      
      Object.entries(formattedErrors).forEach(([key, value]) => {
        if (key !== '_errors' && typeof value === 'object' && value !== null && '_errors' in value) {
          const errors = (value as any)._errors;
          if (Array.isArray(errors) && errors.length > 0) {
            errorMessages.push(`${key}: ${errors[0]}`);
          }
        }
      });
      
      return NextResponse.json(
        { 
          error: errorMessages.length > 0 
            ? `Ошибка валидации: ${errorMessages.join(", ")}` 
            : 'Некорректные данные',
          details: formattedErrors 
        }, 
        { status: 400 }
      );
    }
    
    const { name, slug, description, imageUrl } = validationResult.data;
    
    // Проверка уникальности slug
    const existingDestination = await prisma.destination.findUnique({
      where: { slug }
    });
    
    if (existingDestination) {
      return NextResponse.json(
        { error: 'Направление с таким URL-идентификатором уже существует' }, 
        { status: 400 }
      );
    }
    
    // Создание направления
    const newDestination = await prisma.destination.create({
      data: {
        name,
        slug,
        description,
        imageUrl
      }
    });
    
    return NextResponse.json(
      { 
        message: 'Направление успешно создано',
        destination: {
          id: newDestination.id,
          name: newDestination.name,
          slug: newDestination.slug
        }
      }, 
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Ошибка при создании направления:', error);
    return NextResponse.json(
      { error: error.message || 'Внутренняя ошибка сервера' }, 
      { status: 500 }
    );
  }
} 