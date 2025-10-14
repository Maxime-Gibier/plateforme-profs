import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "PROFESSOR") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const upcoming = searchParams.get("upcoming") === "true";
    const uninvoiced = searchParams.get("uninvoiced") === "true";
    const clientId = searchParams.get("clientId");
    const limit = parseInt(searchParams.get("limit") || "10");

    const courses = await prisma.course.findMany({
      where: {
        professorId: session.user.id,
        ...(upcoming && {
          date: { gte: new Date() },
          status: "SCHEDULED",
        }),
        ...(uninvoiced && {
          status: { in: ["SCHEDULED", "COMPLETED"] },
          invoiceId: null,
        }),
        ...(clientId && { clientId }),
      },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        date: "asc",
      },
      take: limit,
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

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "PROFESSOR") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();

    const course = await prisma.course.create({
      data: {
        title: body.title,
        description: body.description,
        subject: body.subject,
        date: body.date ? new Date(body.date) : null,
        duration: body.duration,
        price: body.price,
        location: body.location,
        notes: body.notes,
        professorId: session.user.id,
        clientId: body.clientId,
      },
      include: {
        client: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création du cours:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
