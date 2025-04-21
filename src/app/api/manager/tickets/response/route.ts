import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// Добавить ответ на тикет
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Необходима авторизация" }, { status: 401 });
    }

    // Проверяем роль пользователя
    const isStaff = session.user.role === "MANAGER" || session.user.role === "ADMIN";

    // Получаем данные из запроса
    const data = await req.json();
    const { ticketId, message } = data;
    
    if (!ticketId || !message) {
      return NextResponse.json({ error: "Необходимо указать ID тикета и сообщение" }, { status: 400 });
    }

    // Проверяем существование тикета
    const ticket = await prisma.ticket.findUnique({
      where: { id: parseInt(ticketId) }
    });

    if (!ticket) {
      return NextResponse.json({ error: "Тикет не найден" }, { status: 404 });
    }

    // Проверяем права доступа: только менеджер/админ или владелец тикета может отвечать
    if (!isStaff && ticket.userId !== session.user.id) {
      return NextResponse.json({ error: "У вас нет прав для ответа на этот тикет" }, { status: 403 });
    }

    // Создаем ответ на тикет
    const response = await prisma.ticketResponse.create({
      data: {
        ticketId: parseInt(ticketId),
        message,
        isFromStaff: isStaff
      }
    });

    // Если это первый ответ менеджера, обновляем статус тикета на "IN_PROGRESS"
    if (isStaff && ticket.status === "OPEN") {
      await prisma.ticket.update({
        where: { id: parseInt(ticketId) },
        data: { status: "IN_PROGRESS" }
      });
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Ошибка при добавлении ответа на тикет:", error);
    return NextResponse.json({ error: "Ошибка при добавлении ответа на тикет" }, { status: 500 });
  }
} 