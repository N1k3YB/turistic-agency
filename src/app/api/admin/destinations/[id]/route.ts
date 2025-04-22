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
    .max(100, { message: "URL-идентификатор не должно превышать 100 символов" })
    .regex(/^[a-z0-9а-яё-]+$/i, { message: "URL-идентификатор может содержать только буквы, цифры и дефисы" }),
  description: z.string().min(10, { message: "Описание должно содержать минимум 10 символов" }),
  imageUrl: z.string().url({ message: "Введите корректный URL изображения" }),
});

// GET запрос для получения одного направления по ID
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id: idParam } = await params;
  const id = parseInt(idParam);
  
  if (isNaN(id) || id <= 0) {
    return NextResponse.json(
      { error: 'Неверный ID направления' }, 
      { status: 400 }
    );
  }
  
  try {
    // Получаем направление со всеми полями
    const destination = await prisma.destination.findUnique({
      where: { id }
    });
    
    if (!destination) {
      return NextResponse.json(
        { error: 'Направление не найдено' }, 
        { status: 404 }
      );
    }
    
    return NextResponse.json({ destination });
  } catch (error) {
    console.error('Ошибка при получении направления:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' }, 
      { status: 500 }
    );
  }
}

// PUT запрос для обновления направления
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
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
  
  const { id: idParam } = await params;
  const id = parseInt(idParam);
  
  if (isNaN(id) || id <= 0) {
    return NextResponse.json(
      { error: 'Неверный ID направления' }, 
      { status: 400 }
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
    
    // Проверка существования направления
    const existingDestination = await prisma.destination.findUnique({
      where: { id }
    });
    
    if (!existingDestination) {
      return NextResponse.json(
        { error: 'Направление не найдено' }, 
        { status: 404 }
      );
    }
    
    // Проверка уникальности slug только если он изменился
    if (slug !== existingDestination.slug) {
      const destinationWithSameSlug = await prisma.destination.findUnique({
        where: { slug }
      });
      
      if (destinationWithSameSlug) {
        return NextResponse.json(
          { error: 'Направление с таким URL-идентификатором уже существует' }, 
          { status: 400 }
        );
      }
    }
    
    // Обновление направления
    const updatedDestination = await prisma.destination.update({
      where: { id },
      data: {
        name,
        slug,
        description,
        imageUrl,
      }
    });
    
    return NextResponse.json({
      message: 'Направление успешно обновлено',
      destination: {
        id: updatedDestination.id,
        name: updatedDestination.name,
        slug: updatedDestination.slug,
        description: updatedDestination.description,
        imageUrl: updatedDestination.imageUrl,
      }
    });
  } catch (error) {
    console.error('Ошибка при обновлении направления:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' }, 
      { status: 500 }
    );
  }
}

// DELETE запрос для удаления направления
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
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
  
  const { id: idParam } = await params;
  const id = parseInt(idParam);
  
  if (isNaN(id) || id <= 0) {
    return NextResponse.json(
      { error: 'Неверный ID направления' }, 
      { status: 400 }
    );
  }
  
  try {
    // Проверка существования направления
    const destination = await prisma.destination.findUnique({
      where: { id },
      include: {
        tours: true
      }
    });
    
    if (!destination) {
      return NextResponse.json(
        { error: 'Направление не найдено' }, 
        { status: 404 }
      );
    }
    
    // Проверка, есть ли связанные туры
    if (destination.tours.length > 0) {
      // Удаляем все отзывы для всех туров этого направления
      await prisma.review.deleteMany({
        where: {
          tour: {
            destinationId: id
          }
        }
      });
      
      // Удаляем все туры этого направления
      await prisma.tour.deleteMany({
        where: {
          destinationId: id
        }
      });
    }
    
    // Удаляем направление
    await prisma.destination.delete({
      where: { id }
    });
    
    return NextResponse.json({
      message: 'Направление и все связанные туры и отзывы успешно удалены'
    });
  } catch (error) {
    console.error('Ошибка при удалении направления:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' }, 
      { status: 500 }
    );
  }
} 