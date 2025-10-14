import jsPDF from "jspdf";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Course {
  id: string;
  title: string;
  subject: string;
  date: string;
  duration: number;
  price: number;
}

interface Invoice {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  notes?: string;
  client: {
    firstName: string;
    lastName: string;
    email: string;
  };
  courses: Course[];
}

export function generateInvoicePDF(invoice: Invoice, professorInfo: any) {
  const doc = new jsPDF();

  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;
  let yPos = 20;

  // En-tête - FACTURE
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.text("FACTURE", margin, yPos);

  // Numéro de facture
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  yPos += 10;
  doc.text(`N° ${invoice.invoiceNumber}`, margin, yPos);

  yPos += 15;

  // Informations du professeur (émetteur) - à gauche
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Émetteur:", margin, yPos);
  doc.setFont("helvetica", "normal");
  yPos += 5;
  doc.text(`${professorInfo.firstName} ${professorInfo.lastName}`, margin, yPos);
  yPos += 5;
  if (professorInfo.address) {
    doc.text(professorInfo.address, margin, yPos);
    yPos += 5;
  }
  doc.text(professorInfo.email, margin, yPos);
  yPos += 5;
  if (professorInfo.phone) {
    doc.text(professorInfo.phone, margin, yPos);
  }

  // Informations du client - à droite
  const clientX = pageWidth - margin - 70;
  let clientY = 45;
  doc.setFont("helvetica", "bold");
  doc.text("Client:", clientX, clientY);
  doc.setFont("helvetica", "normal");
  clientY += 5;
  doc.text(`${invoice.client.firstName} ${invoice.client.lastName}`, clientX, clientY);
  clientY += 5;
  doc.text(invoice.client.email, clientX, clientY);

  yPos = Math.max(yPos, clientY) + 15;

  // Dates
  doc.setFont("helvetica", "bold");
  doc.text("Date d'émission:", margin, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(format(new Date(invoice.issueDate), "dd MMMM yyyy", { locale: fr }), margin + 40, yPos);

  yPos += 7;
  doc.setFont("helvetica", "bold");
  doc.text("Date d'échéance:", margin, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(format(new Date(invoice.dueDate), "dd MMMM yyyy", { locale: fr }), margin + 40, yPos);

  yPos += 15;

  // Ligne de séparation
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;

  // Tableau des prestations
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Détail des prestations", margin, yPos);
  yPos += 8;

  // En-tête du tableau
  doc.setFontSize(9);
  doc.setFillColor(240, 240, 240);
  doc.rect(margin, yPos - 5, pageWidth - 2 * margin, 8, "F");

  // Positions des colonnes
  const colDescription = margin + 2;
  const colDate = pageWidth - margin - 80;
  const colDuration = pageWidth - margin - 45;
  const colAmount = pageWidth - margin - 2;

  doc.text("Description", colDescription, yPos);
  doc.text("Date", colDate, yPos);
  doc.text("Durée", colDuration, yPos);
  doc.text("Montant", colAmount, yPos, { align: "right" });

  yPos += 10;

  // Lignes du tableau
  doc.setFont("helvetica", "normal");
  invoice.courses.forEach((course, index) => {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.text(course.title, colDescription, yPos);
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(course.subject, colDescription, yPos + 4);
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);

    doc.text(format(new Date(course.date), "dd/MM/yyyy", { locale: fr }), colDate, yPos);
    doc.text(`${course.duration} min`, colDuration, yPos);
    doc.text(`${course.price.toFixed(2)} €`, colAmount, yPos, { align: "right" });

    yPos += 10;

    // Ligne de séparation légère
    if (index < invoice.courses.length - 1) {
      doc.setDrawColor(230, 230, 230);
      doc.line(margin, yPos - 3, pageWidth - margin, yPos - 3);
    }
  });

  yPos += 5;

  // Ligne de séparation avant les totaux
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;

  // Totaux
  const totalsX = pageWidth - margin - 60;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  doc.text("Montant HT:", totalsX, yPos);
  doc.text(`${invoice.amount.toFixed(2)} €`, pageWidth - margin - 2, yPos, { align: "right" });
  yPos += 7;

  doc.text(`TVA (${(invoice.taxRate * 100).toFixed(0)}%):`, totalsX, yPos);
  doc.text(`${invoice.taxAmount.toFixed(2)} €`, pageWidth - margin - 2, yPos, { align: "right" });
  yPos += 10;

  // Total TTC
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setFillColor(240, 240, 240);
  doc.rect(totalsX - 5, yPos - 6, 75, 10, "F");
  doc.text("Total TTC:", totalsX, yPos);
  doc.text(`${invoice.totalAmount.toFixed(2)} €`, pageWidth - margin - 2, yPos, { align: "right" });

  yPos += 15;

  // Notes
  if (invoice.notes) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Notes:", margin, yPos);
    yPos += 5;
    doc.text(invoice.notes, margin, yPos);
    yPos += 10;
  }

  // Pied de page
  const footerY = doc.internal.pageSize.height - 20;
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(
    "Merci de régler cette facture avant la date d'échéance.",
    pageWidth / 2,
    footerY,
    { align: "center" }
  );

  return doc;
}

export function downloadInvoicePDF(invoice: Invoice, professorInfo: any) {
  const doc = generateInvoicePDF(invoice, professorInfo);
  doc.save(`Facture_${invoice.invoiceNumber}.pdf`);
}

export function getInvoicePDFDataUrl(invoice: Invoice, professorInfo: any): string {
  const doc = generateInvoicePDF(invoice, professorInfo);
  return doc.output('dataurlstring');
}
