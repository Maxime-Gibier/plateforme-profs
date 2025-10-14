import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "CLIENT") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const upcoming = searchParams.get("upcoming") === "true";

    const courses = await prisma.course.findMany({
      where: {
        clientId: session.user.id,
        ...(upcoming && {
          date: { gte: new Date() },
          status: "SCHEDULED",
        }),
      },
      include: {
        professor: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        date: upcoming ? "asc" : "desc",
      },
    });

    return NextResponse.json(courses);
  } catch (error) {
    console.error("Erreur lors de la récupération des cours:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
