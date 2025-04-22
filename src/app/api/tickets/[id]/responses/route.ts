import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Добавить ответ на тикет
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id: ticketIdParam } = await params;
  const ticketId = parseInt(ticketIdParam, 10);

  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Необходима авторизация" }, { status: 401 });
    }

    if (isNaN(ticketId)) {
      return NextResponse.json({ error: "Некорректный ID тикета" }, { status: 400 });
    }

    // Получаем данные из запроса
    const data = await req.json();
    const { message } = data;
    
    // Валидация
    if (!message || message.trim() === "") {
      return NextResponse.json({ error: "Необходимо указать сообщение" }, { status: 400 });
    }

    // Получаем тикет для проверки доступа
    const ticket = await prisma.ticket.findUnique({
      where: {
        id: ticketId,
      },
    });

    // Если тикет не найден
    if (!ticket) {
      return NextResponse.json({ error: "Тикет не найден" }, { status: 404 });
    }

    // Определяем, от кого ответ - от пользователя или от сотрудника
    const isAdminOrManager = session.user.role === "ADMIN" || session.user.role === "MANAGER";
    const isFromStaff = isAdminOrManager;
    
    // Проверка доступа: владелец тикета или админ/менеджер могут отвечать
    if (ticket.userId !== session.user.id && !isAdminOrManager) {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
    }

    // Если тикет закрыт или решен, отвечать нельзя
    if (ticket.status === "CLOSED" || ticket.status === "RESOLVED") {
      return NextResponse.json({ error: "Невозможно ответить на закрытый тикет" }, { status: 400 });
    }

    // Создаем ответ на тикет
    const response = await prisma.ticketResponse.create({
      data: {
        ticketId,
        message: message.trim(),
        isFromStaff,
      },
    });

    // Если отвечает сотрудник, меняем статус тикета на "В обработке"
    if (isFromStaff && ticket.status === "OPEN") {
      await prisma.ticket.update({
        where: {
          id: ticketId,
        },
        data: {
          status: "IN_PROGRESS",
          updatedAt: new Date(),
        },
      });
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Ошибка при добавлении ответа:", error);
    return NextResponse.json({ error: "Ошибка при добавлении ответа" }, { status: 500 });
  }
} 