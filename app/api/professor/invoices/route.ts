import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Vérifier que l'utilisateur est un professeur
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (user?.role !== "PROFESSOR") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const body = await request.json();
    const { clientId, courseIds } = body;

    if (!clientId || !courseIds || courseIds.length === 0) {
      return NextResponse.json(
        { error: "Client et cours requis" },
        { status: 400 }
      );
    }

    // Vérifier que tous les cours appartiennent au professeur et au client
    const courses = await prisma.course.findMany({
      where: {
        id: { in: courseIds },
        professorId: session.user.id,
        clientId: clientId,
        status: { in: ["SCHEDULED", "COMPLETED"] },
        invoiceId: null,
      },
    });

    if (courses.length !== courseIds.length) {
      return NextResponse.json(
        { error: "Certains cours ne sont pas valides" },
        { status: 400 }
      );
    }

    // Calculer les montants
    const amount = courses.reduce((sum, course) => sum + course.price, 0);
    const taxRate = 0.20;
    const taxAmount = amount * taxRate;
    const totalAmount = amount + taxAmount;

    // Générer un numéro de facture
    const now = new Date();
    const invoiceNumber = `FAC-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

    // Créer la facture
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        status: "DRAFT",
        issueDate: now,
        dueDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 jours
        amount,
        taxRate,
        taxAmount,
        totalAmount,
        professorId: session.user.id,
        clientId,
        notes: "Cours de soutien scolaire",
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
    });

    // Lier les cours à la facture
    await prisma.course.updateMany({
      where: {
        id: { in: courseIds },
      },
      data: {
        invoiceId: invoice.id,
      },
    });

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    console.error("Error creating invoice:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la facture" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Vérifier que l'utilisateur est un professeur
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (user?.role !== "PROFESSOR") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    // Récupérer toutes les factures du professeur
    const invoices = await prisma.invoice.findMany({
      where: {
        professorId: session.user.id,
        ...(status && { status: status as any }),
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
        courses: {
          select: {
            id: true,
            title: true,
            subject: true,
            date: true,
            duration: true,
            price: true,
          },
        },
      },
      orderBy: {
        issueDate: "desc",
      },
    });

    // Filtrer les factures qui ont au moins un cours
    const validInvoices = invoices.filter(invoice => invoice.courses.length > 0);

    return NextResponse.json(validInvoices);
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des factures" },
      { status: 500 }
    );
  }
}
