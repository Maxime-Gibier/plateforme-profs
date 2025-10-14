import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "PROFESSOR") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const professorId = session.user.id;

    // Compter les clients uniques ayant des cours avec ce professeur
    const clientsCount = await prisma.course.findMany({
      where: {
        professorId: professorId,
      },
      select: {
        clientId: true,
      },
      distinct: ["clientId"],
    }).then(clients => clients.length);

    // Compter les cours à venir
    const upcomingCourses = await prisma.course.count({
      where: {
        professorId: professorId,
        date: {
          gte: new Date(),
        },
        status: "SCHEDULED",
      },
    });

    // Compter les factures en attente
    const pendingInvoices = await prisma.invoice.count({
      where: {
        professorId: professorId,
        status: {
          in: ["SENT", "OVERDUE"],
        },
      },
    });

    // Calculer les revenus du mois
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyInvoices = await prisma.invoice.findMany({
      where: {
        professorId: professorId,
        status: "PAID",
        updatedAt: {
          gte: startOfMonth,
        },
      },
      select: {
        totalAmount: true,
      },
    });

    const monthlyRevenue = monthlyInvoices.reduce(
      (sum, invoice) => sum + invoice.totalAmount,
      0
    );

    return NextResponse.json({
      clientsCount,
      upcomingCourses,
      pendingInvoices,
      monthlyRevenue,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
