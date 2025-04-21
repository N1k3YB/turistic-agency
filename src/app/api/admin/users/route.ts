import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcrypt';
import { z } from 'zod';

// Схема валидации для создания пользователя
const createUserSchema = z.object({
  name: z.string().min(2, { message: "Имя должно содержать минимум 2 символа" }).max(100, { message: "Имя не должно превышать 100 символов" }),
  email: z.string().email({ message: "Некорректный формат email" }),
  password: z.string().min(6, { message: "Пароль должен содержать минимум 6 символов" }),
  role: z.enum(['USER', 'MANAGER', 'ADMIN'], { 
    errorMap: () => ({ message: "Выберите одну из доступных ролей: USER, MANAGER, ADMIN" })
  }),
  phone: z.string().optional(),
  address: z.string().optional(),
});

// GET запрос для получения списка пользователей
export async function GET(req: Request) {
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
  
  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '10');
  const search = url.searchParams.get('search') || '';
  const role = url.searchParams.get('role');
  
  const skip = (page - 1) * limit;
  
  try {
    // Формируем условие поиска
    const where: any = {};
    
    // Добавляем поиск по имени или email
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    // Добавляем фильтр по роли
    if (role) {
      where.role = role;
    }
    
    // Получаем количество пользователей
    const totalUsers = await prisma.user.count({ where });
    
    // Получаем пользователей с пагинацией
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        emailVerified: true,
        phone: true,
        address: true,
        createdAt: true,
        _count: {
          select: {
            reviews: true,
          }
        }
      },
      skip,
      take: limit,
      orderBy: {
        email: 'asc'
      }
    });
    
    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        totalUsers,
        totalPages: Math.ceil(totalUsers / limit)
      }
    });
  } catch (error) {
    console.error('Ошибка при получении пользователей:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' }, 
      { status: 500 }
    );
  }
}

// POST запрос для создания нового пользователя
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
    const validationResult = createUserSchema.safeParse(body);
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
      
      if (formattedErrors.phone?._errors) {
        errorMessages.push(formattedErrors.phone._errors[0]);
      }
      
      if (formattedErrors.address?._errors) {
        errorMessages.push(formattedErrors.address._errors[0]);
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
    
    const { name, email, password, role, phone, address } = validationResult.data;
    
    // Проверка, существует ли пользователь с таким email
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'Пользователь с таким email уже существует' }, 
        { status: 400 }
      );
    }
    
    // Хеширование пароля
    const hashedPassword = await hash(password, 10);
    
    // Создание пользователя
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        hashedPassword,
        role,
        phone,
        address,
      }
    });
    
    return NextResponse.json(
      { 
        message: 'Пользователь успешно создан',
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role
        }
      }, 
      { status: 201 }
    );
  } catch (error) {
    console.error('Ошибка при создании пользователя:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' }, 
      { status: 500 }
    );
  }
} 