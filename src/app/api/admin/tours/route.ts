import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Схема валидации для создания/обновления тура
const tourSchema = z.object({
  title: z.string().min(3, { message: "Название должно содержать минимум 3 символа" })
    .max(100, { message: "Название не должно превышать 100 символов" }),
  slug: z.string().min(3, { message: "URL-идентификатор должен содержать минимум 3 символа" })
    .max(100, { message: "URL-идентификатор не должен превышать 100 символов" })
    .regex(/^[a-z0-9а-яё-]+$/i, { message: "URL-идентификатор может содержать только буквы, цифры и дефисы" }),
  price: z.number().positive({ message: "Цена должна быть положительным числом" }),
  currency: z.string().min(3).max(3),
  imageUrl: z.string().min(5, { message: "URL изображения должен содержать минимум 5 символов" }),
  shortDescription: z.string().min(10, { message: "Краткое описание должно содержать минимум 10 символов" })
    .max(250, { message: "Краткое описание не должно превышать 250 символов" }),
  fullDescription: z.string().min(50, { message: "Полное описание должно содержать минимум 50 символов" }),
  inclusions: z.string().optional().default(""),
  exclusions: z.string().optional().default(""),
  itinerary: z.string().optional().default(""),
  imageUrls: z.array(z.string()).optional().default([]),
  destinationId: z.number().positive({ message: "Необходимо выбрать направление" }),
  duration: z.number().positive({ message: "Продолжительность тура должна быть положительным числом" }),
  groupSize: z.number().positive({ message: "Размер группы должен быть положительным числом" }),
  nextTourDate: z.string().optional(),
});

// GET запрос для получения списка туров
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  
  // Для получения списка туров авторизация не требуется
  // Проверим роль администратора только для дополнительной информации
  const isAdmin = session?.user?.role === 'ADMIN';
  
  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '10');
  const search = url.searchParams.get('search') || '';
  const destinationId = url.searchParams.get('destinationId') ? 
    parseInt(url.searchParams.get('destinationId')!) : null;
  
  const skip = (page - 1) * limit;
  
  try {
    // Формируем условие поиска
    const where: any = {};
    
    // Добавляем поиск по названию или описанию
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { shortDescription: { contains: search, mode: 'insensitive' } },
        { fullDescription: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    // Фильтр по направлению
    if (destinationId) {
      where.destinationId = destinationId;
    }
    
    // Получаем количество туров
    const totalTours = await prisma.tour.count({ where });
    
    // Получаем туры с пагинацией
    const tours = await prisma.tour.findMany({
      where,
      select: {
        id: true,
        title: true,
        slug: true,
        price: true,
        currency: true,
        imageUrl: true,
        shortDescription: true,
        duration: true,
        groupSize: true,
        availableSeats: true,
        nextTourDate: true,
        createdAt: true,
        updatedAt: true,
        destinationId: true,
        destination: {
          select: {
            name: true,
            slug: true,
          }
        },
        _count: {
          select: {
            reviews: true,
            orders: true,
          }
        }
      },
      skip,
      take: limit,
      orderBy: {
        title: 'asc'
      }
    });
    
    return NextResponse.json({
      tours,
      pagination: {
        page,
        limit,
        totalTours,
        totalPages: Math.ceil(totalTours / limit)
      }
    });
  } catch (error) {
    console.error('Ошибка при получении туров:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' }, 
      { status: 500 }
    );
  }
}

// POST запрос для создания нового тура
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
    console.log('Полученные данные:', body);
    
    // Валидация данных
    const validationResult = tourSchema.safeParse(body);
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
    
    const { 
      title, slug, price, currency, imageUrl, shortDescription, 
      fullDescription, inclusions, exclusions, itinerary, 
      imageUrls, destinationId, duration, groupSize, nextTourDate 
    } = validationResult.data;
    
    // Проверка существования направления
    const destination = await prisma.destination.findUnique({
      where: { id: destinationId }
    });
    
    if (!destination) {
      return NextResponse.json(
        { error: 'Указанное направление не найдено' }, 
        { status: 400 }
      );
    }
    
    // Проверка уникальности slug
    const existingTour = await prisma.tour.findUnique({
      where: { slug }
    });
    
    if (existingTour) {
      return NextResponse.json(
        { error: 'Тур с таким URL-идентификатором уже существует' }, 
        { status: 400 }
      );
    }
    
    // Создание тура
    const newTour = await prisma.tour.create({
      data: {
        title,
        slug,
        price,
        currency,
        imageUrl,
        shortDescription,
        fullDescription,
        inclusions,
        exclusions,
        itinerary,
        imageUrls,
        destinationId,
        duration,
        groupSize,
        nextTourDate: nextTourDate ? new Date(nextTourDate) : null,
      }
    });
    
    return NextResponse.json(
      { 
        message: 'Тур успешно создан',
        tour: {
          id: newTour.id,
          title: newTour.title,
          slug: newTour.slug,
          price: newTour.price,
          currency: newTour.currency,
          destinationId: newTour.destinationId
        }
      }, 
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Ошибка при создании тура:', error);
    return NextResponse.json(
      { error: error.message || 'Внутренняя ошибка сервера' }, 
      { status: 500 }
    );
  }
} 