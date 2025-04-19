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

    // Создаем менеджера
    const managerHashedPassword = await hash("manager12345", 10);
    const manager = await prisma.user.create({
      data: {
        name: "Менеджер",
        email: "manager@example.com",
        hashedPassword: managerHashedPassword,
        role: "MANAGER",
      },
    });

    // Создаем пользователя
    const userHashedPassword = await hash("user12345", 10);
    const user = await prisma.user.create({
      data: {
        name: "Пользователь",
        email: "user@example.com",
        hashedPassword: userHashedPassword,
        role: "USER",
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
          id: manager.id,
          email: manager.email,
          name: manager.name,
          role: manager.role,
        },
        {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
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