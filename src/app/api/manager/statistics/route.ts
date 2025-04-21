import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET - получить статистику для менеджера
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    // Проверка авторизации
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Проверка роли
    if (session.user.role !== "MANAGER" && session.user.role !== "ADMIN") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Получение количества заказов за текущий месяц
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    firstDayOfMonth.setHours(0, 0, 0, 0);

    const ordersThisMonth = await prisma.order.count({
      where: {
        createdAt: {
          gte: firstDayOfMonth,
        },
      },
    });

    // Получение количества обработанных заказов
    const ordersProcessed = await prisma.order.count({
      where: {
        status: {
          in: ["CONFIRMED", "COMPLETED"],
        },
      },
    });

    // Получение количества заказов, ожидающих действий
    const ordersAwaitingAction = await prisma.order.count({
      where: {
        status: "PENDING",
      },
    });

    // Получаем все запросы из заказов, используем их как запросы клиентов
    // (в реальном приложении здесь может быть другая логика с отдельной таблицей для запросов)
    const requestsThisMonth = await prisma.order.count({
      where: {
        createdAt: {
          gte: firstDayOfMonth,
        },
      },
    });

    // Среднее время ответа (имитация, т.к. нет реальной таблицы с историей ответов)
    // В реальном приложении здесь был бы расчет на основе данных
    const averageResponseTime = "2 часа";

    // Получение последних запросов клиентов (имитация из заказов)
    const recentOrders = await prisma.order.findMany({
      take: 3,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        tour: {
          select: {
            title: true,
          },
        },
      },
    });

    // Формируем запросы из заказов (для примера)
    const recentRequests = recentOrders.map((order, index) => ({
      id: `REQ-${order.id.toString().padStart(3, '0')}`,
      date: order.createdAt.toLocaleDateString('ru-RU'),
      name: order.user.name || "Клиент",
      phone: order.contactPhone || "+7 (XXX) XXX-XX-XX",
      email: order.contactEmail || order.user.email || "client@example.com",
      message: `Запрос на тур "${order.tour.title}" на ${order.quantity} человек`,
      status: index === 0 ? "Новый" : index === 1 ? "В обработке" : "Обработан"
    }));

    // Формирование и возврат статистики
    return NextResponse.json({
      ordersThisMonth,
      requestsThisMonth,
      ordersProcessed,
      ordersAwaitingAction,
      averageResponseTime,
      recentRequests
    });
  } catch (error) {
    console.error("[MANAGER_STATISTICS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 