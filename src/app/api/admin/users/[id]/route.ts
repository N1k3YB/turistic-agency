import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { hash } from 'bcrypt';

// Схема валидации для обновления пользователя
const updateUserSchema = z.object({
  name: z.string().min(2, { message: "Имя должно содержать минимум 2 символа" }).max(100, { message: "Имя не должно превышать 100 символов" }),
  email: z.string().email({ message: "Некорректный формат email" }),
  password: z.string().min(6, { message: "Пароль должен содержать минимум 6 символов" }).optional(),
  role: z.enum(['USER', 'MANAGER', 'ADMIN'], { 
    errorMap: () => ({ message: "Выберите одну из доступных ролей: USER, MANAGER, ADMIN" })
  }),
});

// PUT запрос для обновления пользователя
export async function PUT(
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
  
  const id = params.id;
  
  if (!id) {
    return NextResponse.json(
      { error: 'Неверный ID пользователя' }, 
      { status: 400 }
    );
  }
  
  try {
    const body = await req.json();
    
    // Валидация данных
    const validationResult = updateUserSchema.safeParse(body);
    if (!validationResult.success) {
      const formattedErrors = validationResult.error.format();
      // Преобразуем ошибки в более читаемый формат
      const errorMessages = [];
      
      if (formattedErrors.name?._errors) {
        errorMessages.push(formattedErrors.name._errors[0]);
      }
      
      if (formattedErrors.email?._errors) {
        errorMessages.push(formattedErrors.email._errors[0]);
      }
      
      if (formattedErrors.password?._errors) {
        errorMessages.push(formattedErrors.password._errors[0]);
      }
      
      if (formattedErrors.role?._errors) {
        errorMessages.push(formattedErrors.role._errors[0]);
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
    
    const { name, email, password, role } = validationResult.data;
    
    // Проверка существования пользователя
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });
    
    if (!existingUser) {
      return NextResponse.json(
        { error: 'Пользователь не найден' }, 
        { status: 404 }
      );
    }
    
    // Проверка email только если он изменился
    if (email !== existingUser.email) {
      const userWithSameEmail = await prisma.user.findUnique({
        where: { email }
      });
      
      if (userWithSameEmail) {
        return NextResponse.json(
          { error: 'Пользователь с таким email уже существует' }, 
          { status: 400 }
        );
      }
    }
    
    // Подготовка данных для обновления
    const updateData: any = {
      name,
      email,
      role,
    };
    
    // Обновляем пароль только если он предоставлен
    if (password) {
      updateData.hashedPassword = await hash(password, 10);
    }
    
    // Обновление пользователя
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData
    });
    
    return NextResponse.json({
      message: 'Пользователь успешно обновлен',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role
      }
    });
  } catch (error) {
    console.error('Ошибка при обновлении пользователя:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' }, 
      { status: 500 }
    );
  }
}

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
  
  const id = params.id;
  
  if (!id) {
    return NextResponse.json(
      { error: 'Неверный ID пользователя' }, 
      { status: 400 }
    );
  }
  
  try {
    // Проверка, не пытается ли администратор удалить сам себя
    if (id === session.user.id) {
      return NextResponse.json(
        { error: 'Нельзя удалить собственную учетную запись' }, 
        { status: 400 }
      );
    }
    
    // Проверка существования пользователя
    const user = await prisma.user.findUnique({
      where: { id }
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'Пользователь не найден' }, 
        { status: 404 }
      );
    }
    
    // Удаляем сначала все зависимые записи
    // 1. Удаляем все отзывы пользователя
    await prisma.review.deleteMany({
      where: { userId: id }
    });
    
    // 2. Удаляем сессии пользователя
    await prisma.session.deleteMany({
      where: { userId: id }
    });
    
    // 3. Удаляем аккаунты пользователя (OAuth)
    await prisma.account.deleteMany({
      where: { userId: id }
    });
    
    // 4. Удаляем самого пользователя
    await prisma.user.delete({
      where: { id }
    });
    
    return NextResponse.json(
      { message: 'Пользователь успешно удален' }
    );
  } catch (error) {
    console.error('Ошибка при удалении пользователя:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' }, 
      { status: 500 }
    );
  }
} 
 