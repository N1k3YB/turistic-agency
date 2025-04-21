import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Схема валидации для создания/обновления направления
const destinationSchema = z.object({
  name: z.string().min(2, { message: "Название должно содержать минимум 2 символа" })
    .max(100, { message: "Название не должно превышать 100 символов" }),
  slug: z.string().min(2, { message: "URL-идентификатор должен содержать минимум 2 символа" })
    .max(100, { message: "URL-идентификатор не должен превышать 100 символов" })
    .regex(/^[a-z0-9а-яё-]+$/i, { message: "URL-идентификатор может содержать только буквы, цифры и дефисы" }),
  description: z.string().min(10, { message: "Описание должно содержать минимум 10 символов" }),
  imageUrl: z.string().url({ message: "Введите корректный URL изображения" }),
});

// GET запрос для получения списка направлений
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  
  // Проверка авторизации и роли администратора для некоторых параметров
  // Для обычного списка направлений авторизация не требуется
  const isAdmin = session?.user?.role === 'ADMIN';
  
  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '10');
  const search = url.searchParams.get('search') || '';
  
  const skip = (page - 1) * limit;
  
  try {
    // Формируем условие поиска
    const where: any = {};
    
    // Добавляем поиск по названию
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    // Получаем количество направлений
    const totalDestinations = await prisma.destination.count({ where });
    
    // Получаем направления с пагинацией
    const destinations = await prisma.destination.findMany({
      where,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        imageUrl: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            tours: true,
          }
        }
      },
      skip,
      take: limit,
      orderBy: {
        name: 'asc'
      }
    });
    
    return NextResponse.json({
      destinations,
      pagination: {
        page,
        limit,
        totalDestinations,
        totalPages: Math.ceil(totalDestinations / limit)
      }
    });
  } catch (error) {
    console.error('Ошибка при получении направлений:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' }, 
      { status: 500 }
    );
  }
}

// POST запрос для создания нового направления
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
  // Проверка авторизации и роли администратора
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
  
  try {
    const body = await req.json();
    
    // Валидация данных
    const validationResult = destinationSchema.safeParse(body);
    if (!validationResult.success) {
      const formattedErrors = validationResult.error.format();
      // Преобразуем ошибки в более читаемый формат
      const errorMessages = [];
      
      if (formattedErrors.name?._errors) {
        errorMessages.push(formattedErrors.name._errors[0]);
      }
      
      if (formattedErrors.slug?._errors) {
        errorMessages.push(formattedErrors.slug._errors[0]);
      }
      
      if (formattedErrors.description?._errors) {
        errorMessages.push(formattedErrors.description._errors[0]);
      }
      
      if (formattedErrors.imageUrl?._errors) {
        errorMessages.push(formattedErrors.imageUrl._errors[0]);
      }
      
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
        imageUrl,
      }
    });
    
    return NextResponse.json(
      { 
        message: 'Направление успешно создано',
        destination: {
          id: newDestination.id,
          name: newDestination.name,
          slug: newDestination.slug,
          description: newDestination.description,
          imageUrl: newDestination.imageUrl,
        }
      }, 
      { status: 201 }
    );
  } catch (error) {
    console.error('Ошибка при создании направления:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' }, 
      { status: 500 }
    );
  }
} 