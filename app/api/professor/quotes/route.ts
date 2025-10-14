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
    const { clientId, description, amount, taxRate, validityDays, notes } = body;

    if (!clientId || !description || amount === undefined || amount <= 0) {
      return NextResponse.json(
        { error: "Client, description et montant requis" },
        { status: 400 }
      );
    }

    // Calculer les montants
    const taxRateValue = taxRate || 0.20;
    const taxAmount = amount * taxRateValue;
    const totalAmount = amount + taxAmount;

    // Générer un numéro de devis
    const now = new Date();
    const quoteNumber = `DEV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

    // Calculer la date de validité (30 jours par défaut)
    const validUntil = new Date(now.getTime() + (validityDays || 30) * 24 * 60 * 60 * 1000);

    // Créer le devis
    const quote = await prisma.quote.create({
      data: {
        quoteNumber,
        issueDate: now,
        validUntil,
        amount,
        taxRate: taxRateValue,
        taxAmount,
        totalAmount,
        description,
        notes: notes || "",
        professorId: session.user.id,
        clientId,
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

    return NextResponse.json(quote, { status: 201 });
  } catch (error) {
    console.error("Error creating quote:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du devis" },
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

    // Récupérer tous les devis du professeur
    const quotes = await prisma.quote.findMany({
      where: {
        professorId: session.user.id,
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
        issueDate: "desc",
      },
    });

    return NextResponse.json(quotes);
  } catch (error) {
    console.error("Error fetching quotes:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des devis" },
      { status: 500 }
    );
  }
}
