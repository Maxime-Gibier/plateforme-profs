import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
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

    // Récupérer tous les clients uniques ayant des cours avec ce professeur
    const courses = await prisma.course.findMany({
      where: {
        professorId: session.user.id,
      },
      include: {
        client: true,
      },
      orderBy: {
        date: "desc",
      },
    });

    // Extraire les clients uniques avec leurs statistiques
    const clientsMap = new Map();
    const now = new Date();

    courses.forEach((course) => {
      const clientId = course.client.id;
      const courseDate = new Date(course.date);

      if (!clientsMap.has(clientId)) {
        clientsMap.set(clientId, {
          id: course.client.id,
          firstName: course.client.firstName,
          lastName: course.client.lastName,
          email: course.client.email,
          phone: course.client.phone,
          totalCourses: 0,
          upcomingCourses: 0,
          completedCourses: 0,
          totalRevenue: 0,
          lastCourseDate: null,
          nextCourse: null,
          subjects: new Set(),
        });
      }

      const clientData = clientsMap.get(clientId);
      clientData.totalCourses += 1;

      if (course.status === "SCHEDULED") {
        clientData.upcomingCourses += 1;

        // Trouver le prochain cours (le plus proche dans le futur)
        if (courseDate >= now) {
          if (
            !clientData.nextCourse ||
            courseDate < new Date(clientData.nextCourse.date)
          ) {
            clientData.nextCourse = {
              id: course.id,
              title: course.title,
              subject: course.subject,
              date: course.date,
              duration: course.duration,
            };
          }
        }
      }

      if (course.status === "COMPLETED") {
        clientData.completedCourses += 1;
        clientData.totalRevenue += course.price;
      }

      clientData.subjects.add(course.subject);

      if (
        !clientData.lastCourseDate ||
        new Date(course.date) > new Date(clientData.lastCourseDate)
      ) {
        clientData.lastCourseDate = course.date;
      }
    });

    // Convertir en tableau et formater les données
    const clients = Array.from(clientsMap.values()).map((client) => ({
      ...client,
      subjects: Array.from(client.subjects),
    }));

    return NextResponse.json(clients);
  } catch (error) {
    console.error("Error fetching clients:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des clients" },
      { status: 500 }
    );
  }
}
