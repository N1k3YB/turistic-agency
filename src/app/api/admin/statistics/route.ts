import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET - получить статистику для администратора
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    // Проверка авторизации
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Проверка роли
    if (session.user.role !== "ADMIN") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Получение количества пользователей
    const usersCount = await prisma.user.count();

    // Получение количества заказов
    const ordersCount = await prisma.order.count();

    // Получение количества направлений
    const destinationsCount = await prisma.destination.count();

    // Получение количества туров
    const toursCount = await prisma.tour.count();

    // Получение общей выручки (сумма всех заказов)
    const revenue = await prisma.order.aggregate({
      _sum: {
        totalPrice: true,
      },
    });

    // Получение среднего чека
    const averageOrderValue = await prisma.order.aggregate({
      _avg: {
        totalPrice: true,
      },
    });

    // Получение количества новых заказов за последний месяц
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const newOrdersLastMonth = await prisma.order.count({
      where: {
        createdAt: {
          gte: lastMonth,
        },
      },
    });

    // Получение количества отмененных заказов
    const cancelledOrders = await prisma.order.count({
      where: {
        status: "CANCELLED",
      },
    });

    // Процент отмененных заказов
    const cancelledOrdersPercentage = ordersCount > 0
      ? (cancelledOrders / ordersCount * 100).toFixed(1)
      : "0";

    // Формирование и возврат статистики
    return NextResponse.json({
      users: usersCount,
      orders: ordersCount,
      destinations: destinationsCount,
      tours: toursCount,
      revenue: revenue._sum.totalPrice || 0,
      averageOrderValue: averageOrderValue._avg.totalPrice || 0,
      newOrdersLastMonth,
      cancelledOrders,
      cancelledOrdersPercentage
    });
  } catch (error) {
    console.error("[ADMIN_STATISTICS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 