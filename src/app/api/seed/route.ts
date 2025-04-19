import { hash } from "bcrypt";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Проверяем, существует ли уже администратор
    const adminExists = await prisma.user.findFirst({
      where: {
        role: "ADMIN",
      },
    });

    if (adminExists) {
      return NextResponse.json({
        message: "Администратор уже существует",
        admin: {
          id: adminExists.id,
          email: adminExists.email,
          name: adminExists.name,
          role: adminExists.role,
        },
      });
    }

    // Создаем администратора
    const hashedPassword = await hash("admin12345", 10);
    const admin = await prisma.user.create({
      data: {
        name: "Администратор",
        email: "admin@example.com",
        hashedPassword,
        role: "ADMIN",
      },
    });

    // Создаем тренера
    const coachHashedPassword = await hash("coach12345", 10);
    const coach = await prisma.user.create({
      data: {
        name: "Тренер",
        email: "coach@example.com",
        hashedPassword: coachHashedPassword,
        role: "COACH",
      },
    });

    // Создаем игрока
    const playerHashedPassword = await hash("player12345", 10);
    const player = await prisma.user.create({
      data: {
        name: "Игрок",
        email: "player@example.com",
        hashedPassword: playerHashedPassword,
        role: "PLAYER",
      },
    });

    return NextResponse.json({
      message: "База данных успешно заполнена начальными данными",
      users: [
        {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role,
        },
        {
          id: coach.id,
          email: coach.email,
          name: coach.name,
          role: coach.role,
        },
        {
          id: player.id,
          email: player.email,
          name: player.name,
          role: player.role,
        },
      ],
    });
  } catch (error) {
    console.error("Ошибка при создании начальных данных:", error);
    return NextResponse.json(
      { 
        error: "Ошибка при создании начальных данных",
        details: (error as Error).message
      },
      { status: 500 }
    );
  }
} 