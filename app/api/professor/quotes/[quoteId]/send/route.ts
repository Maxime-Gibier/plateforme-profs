import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";
import { generateQuotePDF } from "@/lib/quote-pdf-generator";

export async function POST(
  request: Request,
  { params }: { params: { quoteId: string } }
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

    // Récupérer le devis avec tous les détails
    const quote = await prisma.quote.findUnique({
      where: {
        id: params.quoteId,
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
    });

    if (!quote) {
      return NextResponse.json(
        { error: "Devis non trouvé" },
        { status: 404 }
      );
    }

    // Générer le PDF du devis
    const professorInfo = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      address: user.address,
    };

    const pdfDoc = generateQuotePDF(quote as any, professorInfo);
    const pdfBuffer = Buffer.from(pdfDoc.output("arraybuffer"));

    // Configurer le transporteur d'email
    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || "smtp.ethereal.email",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Préparer l'email
    const mailOptions = {
      from: `${user.firstName} ${user.lastName} <${process.env.SMTP_FROM || user.email}>`,
      to: quote.client.email,
      subject: `Devis ${quote.quoteNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Nouveau Devis</h2>

          <p>Bonjour ${quote.client.firstName},</p>

          <p>Veuillez trouver ci-joint le devis <strong>${quote.quoteNumber}</strong> pour un montant de <strong>${quote.totalAmount.toFixed(2)} €</strong>.</p>

          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Montant HT:</strong> ${quote.amount.toFixed(2)} €</p>
            <p style="margin: 5px 0;"><strong>TVA (${(quote.taxRate * 100).toFixed(0)}%):</strong> ${quote.taxAmount.toFixed(2)} €</p>
            <p style="margin: 5px 0;"><strong>Montant Total TTC:</strong> ${quote.totalAmount.toFixed(2)} €</p>
          </div>

          <p style="margin: 20px 0;"><strong>Valable jusqu'au:</strong> ${new Date(quote.validUntil).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

          <div style="background-color: #eff6ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-weight: bold;">Description:</p>
            <p style="margin: 10px 0 0 0; white-space: pre-wrap;">${quote.description}</p>
          </div>

          ${quote.notes ? `<p style="color: #6b7280; font-style: italic;">${quote.notes}</p>` : ''}

          <p>Cordialement,</p>
          <p><strong>${user.firstName} ${user.lastName}</strong></p>
        </div>
      `,
      attachments: [
        {
          filename: `Devis_${quote.quoteNumber}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    };

    // Envoyer l'email
    await transporter.sendMail(mailOptions);

    return NextResponse.json({
      success: true,
      message: "Devis envoyé avec succès",
    });
  } catch (error) {
    console.error("Error sending quote:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'envoi du devis" },
      { status: 500 }
    );
  }
}
