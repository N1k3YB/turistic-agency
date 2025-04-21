import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Получить список тикетов текущего пользователя
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Необходима авторизация" }, { status: 401 });
    }

    // Получение userId из сессии
    const userId = session.user.id;
    
    // Параметры запроса для фильтрации и сортировки
    const url = new URL(req.url);
    const search = url.searchParams.get("search") || "";
    const status = url.searchParams.get("status");
    const sort = url.searchParams.get("sort") || "newest";
    
    // Создаем базовое условие фильтрации по userId
    const where: any = {
      userId: userId
    };

    // Добавляем фильтрацию по статусу если указан
    if (status) {
      where.status = status;
    }

    // Добавляем поиск по теме и сообщению если указан
    if (search) {
      where.OR = [
        { subject: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Определяем сортировку
    let orderBy: any = { createdAt: 'desc' }; // По умолчанию - от новых к старым
    
    if (sort === 'oldest') {
      orderBy = { createdAt: 'asc' };
    } else if (sort === 'updated') {
      orderBy = { updatedAt: 'desc' };
    }

    // Получаем тикеты с ответами
    const tickets = await prisma.ticket.findMany({
      where,
      include: {
        responses: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy,
    });

    return NextResponse.json(tickets);
  } catch (error) {
    console.error("Ошибка при получении тикетов:", error);
    return NextResponse.json({ error: "Ошибка при получении тикетов" }, { status: 500 });
  }
}

// Создать новый тикет
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Необходима авторизация" }, { status: 401 });
    }

    // Получение userId из сессии
    const userId = session.user.id;
    
    // Получаем данные из запроса
    const data = await req.json();
    const { subject, message } = data;
    
    // Валидация
    if (!subject || !message) {
      return NextResponse.json({ error: "Необходимо указать тему и сообщение" }, { status: 400 });
    }

    // Создаем новый тикет
    const ticket = await prisma.ticket.create({
      data: {
        userId,
        subject,
        message,
        status: "OPEN",
      },
    });

    return NextResponse.json(ticket);
  } catch (error) {
    console.error("Ошибка при создании тикета:", error);
    return NextResponse.json({ error: "Ошибка при создании тикета" }, { status: 500 });
  }
} 