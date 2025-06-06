import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Схема валидации для обновления направления
const destinationSchema = z.object({
  name: z.string().min(3, { message: "Название должно содержать минимум 3 символа" })
    .max(100, { message: "Название не должно превышать 100 символов" }),
  slug: z.string().min(3, { message: "URL-идентификатор должен содержать минимум 3 символа" })
    .max(100, { message: "URL-идентификатор не должен превышать 100 символов" })
    .regex(/^[a-z0-9а-яё-]+$/i, { message: "URL-идентификатор может содержать только буквы, цифры и дефисы" }),
  description: z.string().min(10, { message: "Описание должно содержать минимум 10 символов" }),
  imageUrl: z.string().min(5, { message: "URL изображения должен содержать минимум 5 символов" }),
});

// GET запрос для получения одного направления по ID
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
      { error: 'Неверный ID направления' }, 
      { status: 400 }
    );
  }
  
  try {
    // Получаем направление
    const destination = await prisma.destination.findUnique({
      where: { id },
      include: {
        _count: {
          select: { tours: true }
        }
      }
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
      { error: 'Некорректный ID направления' }, 
      { status: 400 }
    );
  }
  
  try {
    const body = await req.json();
    console.log('Полученные данные для обновления направления:', body);
    
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
    
    // Валидация данных
    const validationResult = destinationSchema.safeParse(body);
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
    
    const { name, slug, description, imageUrl } = validationResult.data;
    
    // Проверка уникальности slug для других направлений (не включая текущее)
    const duplicateSlug = await prisma.destination.findFirst({
      where: {
        slug,
        id: {
          not: id
        }
      }
    });
    
    if (duplicateSlug) {
      return NextResponse.json(
        { error: 'Направление с таким URL-идентификатором уже существует' }, 
        { status: 400 }
      );
    }
    
    // Обновление направления
    const updatedDestination = await prisma.destination.update({
      where: { id },
      data: {
        name,
        slug,
        description,
        imageUrl
      }
    });
    
    return NextResponse.json(
      { 
        message: 'Направление успешно обновлено',
        destination: {
          id: updatedDestination.id,
          name: updatedDestination.name,
          slug: updatedDestination.slug
        }
      }
    );
  } catch (error: any) {
    console.error('Ошибка при обновлении направления:', error);
    return NextResponse.json(
      { error: error.message || 'Внутренняя ошибка сервера' }, 
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
  console.log(`Запрос на удаление направления с ID: ${id}`);
  
  if (isNaN(id) || id <= 0) {
    console.warn(`Попытка удаления направления с некорректным ID: ${idParam}`);
    return NextResponse.json(
      { error: 'Некорректный ID направления' }, 
      { status: 400 }
    );
  }
  
  try {
    // Проверка существования направления
    const destination = await prisma.destination.findUnique({
      where: { id },
      include: {
        tours: {
          select: { id: true }
        }
      }
    });
    
    if (!destination) {
      console.warn(`Попытка удаления несуществующего направления с ID: ${id}`);
      return NextResponse.json(
        { error: 'Направление не найдено' }, 
        { status: 404 }
      );
    }
    
    // Проверка наличия туров для данного направления
    if (destination.tours.length > 0) {
      return NextResponse.json(
        { 
          error: 'Невозможно удалить направление, т.к. к нему привязаны туры',
          tourCount: destination.tours.length
        }, 
        { status: 400 }
      );
    }
    
    // Удаляем направление
    await prisma.destination.delete({
      where: { id }
    });
    
    console.log(`Направление "${destination.name}" с ID: ${id} успешно удалено`);
    
    return NextResponse.json({
      message: 'Направление успешно удалено',
      details: {
        id: id,
        name: destination.name
      }
    });
  } catch (error: any) {
    console.error('Ошибка при удалении направления:', error);
    
    // Обработка ошибок, связанных с внешними ключами
    if (error.code === 'P2003') {
      return NextResponse.json(
        { 
          error: 'Невозможно удалить направление, так как оно связано с другими данными',
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