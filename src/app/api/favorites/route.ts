import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

// GET - получить избранные туры пользователя
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const favorites = await prisma.favorite.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        tour: {
          select: {
            id: true,
            title: true,
            imageUrl: true,
            price: true,
            currency: true,
            shortDescription: true,
            availableSeats: true,
            nextTourDate: true,
            slug: true,
          },
        },
      },
    });

    return NextResponse.json(favorites);
  } catch (error) {
    console.error("[FAVORITES_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// POST - добавить тур в избранное
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { tourId } = body;

    if (!tourId) {
      return new NextResponse("Не указан ID тура", { status: 400 });
    }

    // Проверяем существование тура
    const tour = await prisma.tour.findUnique({
      where: {
        id: parseInt(tourId),
      },
    });

    if (!tour) {
      return new NextResponse("Тур не найден", { status: 404 });
    }

    // Проверяем, не добавлен ли тур уже в избранное
    const existingFavorite = await prisma.favorite.findFirst({
      where: {
        userId: session.user.id,
        tourId: parseInt(tourId),
      },
    });

    if (existingFavorite) {
      return new NextResponse("Тур уже добавлен в избранное", { status: 400 });
    }

    // Добавляем тур в избранное
    const favorite = await prisma.favorite.create({
      data: {
        userId: session.user.id,
        tourId: parseInt(tourId),
      },
    });

    return NextResponse.json(favorite);
  } catch (error) {
    console.error("[FAVORITES_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// DELETE - удалить тур из избранного
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tourId = searchParams.get("tourId");

    if (!tourId) {
      return new NextResponse("Не указан ID тура", { status: 400 });
    }

    // Проверяем существование записи в избранном
    const favorite = await prisma.favorite.findFirst({
      where: {
        userId: session.user.id,
        tourId: parseInt(tourId),
      },
    });

    if (!favorite) {
      return new NextResponse("Тур не найден в избранном", { status: 404 });
    }

    // Удаляем запись из избранного
    await prisma.favorite.delete({
      where: {
        id: favorite.id,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[FAVORITES_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 