import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: { clientId: string } }
) {
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

    const { clientId } = params;
    const body = await request.json();

    // Vérifier que le client existe et a bien un cours avec ce professeur
    const clientCourses = await prisma.course.findFirst({
      where: {
        professorId: session.user.id,
        clientId: clientId,
      },
    });

    if (!clientCourses) {
      return NextResponse.json(
        { error: "Ce client n'a pas de cours avec vous" },
        { status: 403 }
      );
    }

    // Mettre à jour le client
    const updatedClient = await prisma.user.update({
      where: { id: clientId },
      data: {
        ...(body.firstName && { firstName: body.firstName }),
        ...(body.lastName && { lastName: body.lastName }),
        ...(body.email && { email: body.email }),
        ...(body.phone !== undefined && { phone: body.phone || null }),
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
      },
    });

    return NextResponse.json(updatedClient);
  } catch (error) {
    console.error("Error updating client:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du client" },
      { status: 500 }
    );
  }
}
