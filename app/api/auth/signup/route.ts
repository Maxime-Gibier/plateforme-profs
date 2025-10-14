import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const signupSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  role: z.enum(["PROFESSOR", "CLIENT"]),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = signupSchema.parse(body);

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Un utilisateur avec cet email existe déjà" },
        { status: 400 }
      );
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        role: validatedData.role,
        phone: validatedData.phone,
        address: validatedData.address,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    return NextResponse.json(
      { message: "Utilisateur créé avec succès", user },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Formater les erreurs de validation de manière lisible
      const fieldErrors = error.errors.map(err => {
        const field = err.path[0];
        return `${field}: ${err.message}`;
      }).join(", ");

      return NextResponse.json(
        { error: `Données invalides - ${fieldErrors}`, details: error.errors },
        { status: 400 }
      );
    }

    console.error("Erreur lors de la création de l'utilisateur:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de l'utilisateur" },
      { status: 500 }
    );
  }
}
