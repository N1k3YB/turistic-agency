import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Получить конкретный тикет по ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id: ticketIdParam } = await params;
  const ticketId = parseInt(ticketIdParam);

  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Необходима авторизация" }, { status: 401 });
    }

    if (isNaN(ticketId)) {
      return NextResponse.json({ error: "Неверный формат ID" }, { status: 400 });
    }

    // Получаем тикет с учетом прав доступа
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        responses: {
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    });

    if (!ticket) {
      return NextResponse.json({ error: "Тикет не найден" }, { status: 404 });
    }

    // Проверяем доступ - только владелец тикета или менеджер может его просматривать
    const isOwner = ticket.userId === session.user.id;
    const isStaff = session.user.role === "MANAGER" || session.user.role === "ADMIN";
    
    if (!isOwner && !isStaff) {
      return NextResponse.json({ error: "У вас нет прав для просмотра этого тикета" }, { status: 403 });
    }

    return NextResponse.json(ticket);
  } catch (error) {
    console.error("Ошибка при получении тикета:", error);
    return NextResponse.json({ error: "Ошибка при получении тикета" }, { status: 500 });
  }
}

// Обновить статус тикета
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id: ticketIdParam } = await params;
  const ticketId = parseInt(ticketIdParam, 10);

  try {
    const session = await getServerSession(authOptions);
    
    // Только авторизованные пользователи могут обновлять тикеты
    if (!session?.user) {
      return NextResponse.json({ error: "Необходима авторизация" }, { status: 401 });
    }

    if (isNaN(ticketId)) {
      return NextResponse.json({ error: "Некорректный ID тикета" }, { status: 400 });
    }

    // Получаем данные из запроса
    const data = await req.json();
    const { status } = data;
    
    // Валидация статуса
    const validStatuses = ["OPEN", "IN_PROGRESS", "CLOSED", "RESOLVED"];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json({ error: "Некорректный статус" }, { status: 400 });
    }

    // Получаем текущий тикет для проверки доступа
    const existingTicket = await prisma.ticket.findUnique({
      where: {
        id: ticketId,
      },
    });

    if (!existingTicket) {
      return NextResponse.json({ error: "Тикет не найден" }, { status: 404 });
    }

    // Проверка доступа: только админ или менеджер могут изменять статус
    const isAdminOrManager = session.user.role === "ADMIN" || session.user.role === "MANAGER";
    
    if (!isAdminOrManager) {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
    }

    // Обновляем статус тикета
    const updatedTicket = await prisma.ticket.update({
      where: {
        id: ticketId,
      },
      data: {
        status,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedTicket);
  } catch (error) {
    console.error("Ошибка при обновлении тикета:", error);
    return NextResponse.json({ error: "Ошибка при обновлении тикета" }, { status: 500 });
  }
} 