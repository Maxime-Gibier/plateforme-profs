import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";
import { generateInvoicePDF } from "@/lib/pdf-generator";

export async function POST(
  request: Request,
  { params }: { params: { invoiceId: string } }
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

    // Récupérer la facture avec tous les détails
    const invoice = await prisma.invoice.findUnique({
      where: {
        id: params.invoiceId,
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
    });

    if (!invoice) {
      return NextResponse.json(
        { error: "Facture non trouvée" },
        { status: 404 }
      );
    }

    // Vérifier que la facture est en brouillon
    if (invoice.status !== "DRAFT") {
      return NextResponse.json(
        { error: "Seules les factures brouillon peuvent être envoyées" },
        { status: 400 }
      );
    }

    // Générer le PDF de la facture
    const professorInfo = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      address: user.address,
    };

    const pdfDoc = generateInvoicePDF(invoice as any, professorInfo);
    const pdfBuffer = Buffer.from(pdfDoc.output("arraybuffer"));

    // Configurer le transporteur d'email
    // Pour le développement, utilisez un service comme Ethereal ou Mailtrap
    // Pour la production, utilisez un vrai service SMTP (Gmail, SendGrid, etc.)
    const transporter = nodemailer.createTransport({
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
      to: invoice.client.email,
      subject: `Facture ${invoice.invoiceNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Nouvelle Facture</h2>

          <p>Bonjour ${invoice.client.firstName},</p>

          <p>Veuillez trouver ci-joint la facture <strong>${invoice.invoiceNumber}</strong> pour un montant de <strong>${invoice.totalAmount.toFixed(2)} €</strong>.</p>

          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Montant HT:</strong> ${invoice.amount.toFixed(2)} €</p>
            <p style="margin: 5px 0;"><strong>TVA (${(invoice.taxRate * 100).toFixed(0)}%):</strong> ${invoice.taxAmount.toFixed(2)} €</p>
            <p style="margin: 5px 0;"><strong>Montant Total TTC:</strong> ${invoice.totalAmount.toFixed(2)} €</p>
          </div>

          <p style="margin: 20px 0;"><strong>Date d'échéance:</strong> ${new Date(invoice.dueDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

          ${invoice.notes ? `<p style="color: #6b7280; font-style: italic;">${invoice.notes}</p>` : ''}

          <p>Cordialement,</p>
          <p><strong>${user.firstName} ${user.lastName}</strong></p>
        </div>
      `,
      attachments: [
        {
          filename: `Facture_${invoice.invoiceNumber}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    };

    // Envoyer l'email
    await transporter.sendMail(mailOptions);

    // Mettre à jour le statut de la facture
    const updatedInvoice = await prisma.invoice.update({
      where: { id: params.invoiceId },
      data: {
        status: "SENT",
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
    });

    return NextResponse.json({
      success: true,
      message: "Facture envoyée avec succès",
      invoice: updatedInvoice,
    });
  } catch (error) {
    console.error("Error sending invoice:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'envoi de la facture" },
      { status: 500 }
    );
  }
}
