import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Схема валидации для обновления тура
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
  duration: z.number().int().positive({ message: "Длительность тура должна быть положительным числом" }).default(7),
  groupSize: z.number().int().positive({ message: "Размер группы должен быть положительным числом" }).default(10),
  availableSeats: z.number().int().positive({ message: "Количество доступных мест должно быть положительным числом" }).default(10),
  nextTourDate: z.string().refine(
    (val) => !val || !isNaN(Date.parse(val)), 
    { message: "Некорректная дата начала тура" }
  ).optional().nullable(),
});

// Тип для данных тура
type TourData = z.infer<typeof tourSchema>;

// GET запрос для получения одного тура по ID
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
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
  
  const { id: idParam } = await params;
  const id = parseInt(idParam);
  
  if (isNaN(id) || id <= 0) {
    return NextResponse.json(
      { error: 'Неверный ID тура' }, 
      { status: 400 }
    );
  }
  
  try {
    // Получаем тур со всеми полями
    const tour = await prisma.tour.findUnique({
      where: { id },
      include: {
        destination: {
          select: {
            name: true,
            slug: true,
          }
        }
      }
    });
    
    if (!tour) {
      return NextResponse.json(
        { error: 'Тур не найден' }, 
        { status: 404 }
      );
    }
    
    return NextResponse.json({ tour });
  } catch (error) {
    console.error('Ошибка при получении тура:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' }, 
      { status: 500 }
    );
  }
}

// PUT запрос для обновления тура
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
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
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    
    // Проверка на валидность ID
    if (isNaN(id) || id <= 0) {
      return NextResponse.json(
        { error: 'Некорректный ID тура' }, 
        { status: 400 }
      );
    }
    
    const body = await req.json();
    console.log('Полученные данные для обновления тура:', body);
    
    // Проверка существования тура
    const existingTour = await prisma.tour.findUnique({
      where: { id }
    });
    
    if (!existingTour) {
      return NextResponse.json(
        { error: 'Тур не найден' }, 
        { status: 404 }
      );
    }
    
    // Валидация данных
    const validationResult = tourSchema.safeParse(body);
    if (!validationResult.success) {
      const formattedErrors = validationResult.error.format();
      console.error('Ошибки валидации при обновлении:', formattedErrors);
      
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
      imageUrls, destinationId, duration, groupSize, availableSeats, nextTourDate
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
    
    // Проверка уникальности slug для других туров (не включая текущий)
    const duplicateSlug = await prisma.tour.findFirst({
      where: {
        slug,
        id: {
          not: id
        }
      }
    });
    
    if (duplicateSlug) {
      return NextResponse.json(
        { error: 'Тур с таким URL-идентификатором уже существует' }, 
        { status: 400 }
      );
    }
    
    // Обновление тура
    const updatedTour = await prisma.tour.update({
      where: { id },
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
        availableSeats,
        nextTourDate: nextTourDate ? new Date(nextTourDate) : null,
      }
    });
    
    return NextResponse.json(
      { 
        message: 'Тур успешно обновлен',
        tour: {
          id: updatedTour.id,
          title: updatedTour.title,
          slug: updatedTour.slug,
          price: updatedTour.price,
          currency: updatedTour.currency,
          destinationId: updatedTour.destinationId
        }
      }
    );
  } catch (error: any) {
    console.error('Ошибка при обновлении тура:', error);
    return NextResponse.json(
      { error: error.message || 'Внутренняя ошибка сервера' }, 
      { status: 500 }
    );
  }
}

// DELETE запрос для удаления тура
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
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
  
  const { id: idParam } = await params;
  const id = parseInt(idParam);
  console.log(`Запрос на удаление тура с ID: ${id}`);
  
  if (isNaN(id) || id <= 0) {
    console.warn(`Попытка удаления тура с некорректным ID: ${idParam}`);
    return NextResponse.json(
      { error: 'Некорректный ID тура' }, 
      { status: 400 }
    );
  }
  
  try {
    // Проверка существования тура
    const tour = await prisma.tour.findUnique({
      where: { id },
      include: {
        reviews: true,
        orders: true
      }
    });
    
    if (!tour) {
      console.warn(`Попытка удаления несуществующего тура с ID: ${id}`);
      return NextResponse.json(
        { error: 'Тур не найден' }, 
        { status: 404 }
      );
    }
    
    console.log(`Найден тур "${tour.title}" с ${tour.reviews.length} отзывами и ${tour.orders.length} заказами для удаления`);
    
    // Обновляем статус заказов на CANCELLED для этого тура
    if (tour.orders.length > 0) {
      await prisma.order.updateMany({
        where: { tourId: id },
        data: { 
          status: 'CANCELLED',
          updatedAt: new Date()
        }
      });
      console.log(`Обновлен статус ${tour.orders.length} заказов для тура с ID: ${id} на CANCELLED`);
    }
    
    // Удаляем все отзывы для этого тура
    if (tour.reviews.length > 0) {
      await prisma.review.deleteMany({
        where: { tourId: id }
      });
      console.log(`Удалено ${tour.reviews.length} отзывов для тура с ID: ${id}`);
    }
    
    // Удаляем тур
    await prisma.tour.delete({
      where: { id }
    });
    
    console.log(`Тур "${tour.title}" с ID: ${id} успешно удален`);
    
    return NextResponse.json({
      message: 'Тур и все связанные данные успешно обработаны',
      details: {
        tourId: id,
        tourTitle: tour.title,
        cancelledOrders: tour.orders.length,
        deletedReviews: tour.reviews.length
      }
    });
  } catch (error: any) {
    console.error('Ошибка при удалении тура:', error);
    
    // Обработка ошибок, связанных с внешними ключами
    if (error.code === 'P2003') {
      return NextResponse.json(
        { 
          error: 'Невозможно удалить тур, так как он связан с другими данными',
          details: error.message
        }, 
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Внутренняя ошибка сервера' }, 
      { status: 500 }
    );
  }
} 