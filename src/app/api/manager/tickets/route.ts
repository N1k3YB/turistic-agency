import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// Получить все тикеты для менеджера
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Необходима авторизация" }, { status: 401 });
    }

    // Проверяем роль пользователя
    if (session.user.role !== "MANAGER" && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Недостаточно прав для этого действия" }, { status: 403 });
    }

    // Параметры запроса
    const url = new URL(req.url);
    const search = url.searchParams.get("search") || "";
    const status = url.searchParams.get("status");
    const sort = url.searchParams.get("sort") || "newest";
    
    // Создаем условия фильтрации
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { subject: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } },
        { user: { 
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search, mode: 'insensitive' } }
          ] 
        } }
      ];
    }

    // Определяем сортировку
    let orderBy: any = { createdAt: 'desc' }; // По умолчанию - от новых к старым
    
    if (sort === 'oldest') {
      orderBy = { createdAt: 'asc' };
    } else if (sort === 'updated') {
      orderBy = { updatedAt: 'desc' };
    } else if (sort === 'status') {
      orderBy = { status: 'asc' };
    }

    // Получаем тикеты с данными о пользователях и ответами
    const tickets = await prisma.ticket.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            image: true
          }
        },
        responses: {
          orderBy: {
            createdAt: 'asc'
          }
        }
      },
      orderBy
    });

    return NextResponse.json(tickets);
  } catch (error) {
    console.error("Ошибка при получении тикетов:", error);
    return NextResponse.json({ error: "Ошибка при получении тикетов" }, { status: 500 });
  }
}

// Обновить статус тикета
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Необходима авторизация" }, { status: 401 });
    }

    // Проверяем роль пользователя
    if (session.user.role !== "MANAGER" && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Недостаточно прав для этого действия" }, { status: 403 });
    }

    // Получаем данные из запроса
    const data = await req.json();
    const { ticketId, status } = data;
    
    if (!ticketId || !status) {
      return NextResponse.json({ error: "Необходимо указать ID тикета и новый статус" }, { status: 400 });
    }

    // Проверяем существование тикета
    const ticket = await prisma.ticket.findUnique({
      where: { id: parseInt(ticketId) }
    });

    if (!ticket) {
      return NextResponse.json({ error: "Тикет не найден" }, { status: 404 });
    }

    // Обновляем статус тикета
    const updatedTicket = await prisma.ticket.update({
      where: { id: parseInt(ticketId) },
      data: { status }
    });

    return NextResponse.json(updatedTicket);
  } catch (error) {
    console.error("Ошибка при обновлении статуса тикета:", error);
    return NextResponse.json({ error: "Ошибка при обновлении статуса тикета" }, { status: 500 });
  }
} 