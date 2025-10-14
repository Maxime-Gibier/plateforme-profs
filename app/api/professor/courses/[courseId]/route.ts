import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { courseId } = params;
    const body = await request.json();

    // Vérifier que le cours appartient au professeur
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json({ error: "Cours non trouvé" }, { status: 404 });
    }

    if (course.professorId !== session.user.id) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    // Mettre à jour le cours
    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: {
        ...(body.date && { date: new Date(body.date) }),
        ...(body.title && { title: body.title }),
        ...(body.duration && { duration: body.duration }),
        ...(body.price && { price: body.price }),
        ...(body.status && { status: body.status }),
        ...(body.location && { location: body.location }),
        ...(body.notes && { notes: body.notes }),
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

    return NextResponse.json(updatedCourse);
  } catch (error) {
    console.error("Error updating course:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du cours" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { courseId } = params;

    // Vérifier que le cours appartient au professeur
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json({ error: "Cours non trouvé" }, { status: 404 });
    }

    if (course.professorId !== session.user.id) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    // Vérifier que le cours n'est pas terminé (seuls les cours SCHEDULED peuvent être supprimés)
    if (course.status === "COMPLETED") {
      return NextResponse.json(
        { error: "Les cours terminés ne peuvent pas être supprimés" },
        { status: 400 }
      );
    }

    // Vérifier que le cours n'est pas associé à une facture
    if (course.invoiceId) {
      return NextResponse.json(
        { error: "Impossible de supprimer un cours associé à une facture" },
        { status: 400 }
      );
    }

    // Supprimer le cours
    await prisma.course.delete({
      where: { id: courseId },
    });

    return NextResponse.json({ message: "Cours supprimé avec succès" });
  } catch (error) {
    console.error("Error deleting course:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du cours" },
      { status: 500 }
    );
  }
}
