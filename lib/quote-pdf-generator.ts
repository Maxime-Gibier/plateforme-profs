import jsPDF from "jspdf";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Quote {
  quoteNumber: string;
  issueDate: string;
  validUntil: string;
  amount: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  description: string;
  notes?: string;
  client: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export function generateQuotePDF(quote: Quote, professorInfo: any) {
  const doc = new jsPDF();

  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;
  let yPos = 20;

  // En-tête - DEVIS
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.text("DEVIS", margin, yPos);

  // Numéro de devis
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  yPos += 10;
  doc.text(`N° ${quote.quoteNumber}`, margin, yPos);

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
  doc.text(`${quote.client.firstName} ${quote.client.lastName}`, clientX, clientY);
  clientY += 5;
  doc.text(quote.client.email, clientX, clientY);

  yPos = Math.max(yPos, clientY) + 15;

  // Dates
  doc.setFont("helvetica", "bold");
  doc.text("Date d'émission:", margin, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(format(new Date(quote.issueDate), "dd MMMM yyyy", { locale: fr }), margin + 40, yPos);

  yPos += 7;
  doc.setFont("helvetica", "bold");
  doc.text("Valide jusqu'au:", margin, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(format(new Date(quote.validUntil), "dd MMMM yyyy", { locale: fr }), margin + 40, yPos);

  yPos += 15;

  // Ligne de séparation
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;

  // Description
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Description", margin, yPos);
  yPos += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  // Split description into lines to fit page width
  const maxWidth = pageWidth - 2 * margin;
  const descriptionLines = doc.splitTextToSize(quote.description, maxWidth);

  descriptionLines.forEach((line: string) => {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    doc.text(line, margin, yPos);
    yPos += 6;
  });

  yPos += 10;

  // Ligne de séparation avant les totaux
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;

  // Totaux
  const totalsX = pageWidth - margin - 60;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  doc.text("Montant HT:", totalsX, yPos);
  doc.text(`${quote.amount.toFixed(2)} €`, pageWidth - margin - 2, yPos, { align: "right" });
  yPos += 7;

  doc.text(`TVA (${(quote.taxRate * 100).toFixed(0)}%):`, totalsX, yPos);
  doc.text(`${quote.taxAmount.toFixed(2)} €`, pageWidth - margin - 2, yPos, { align: "right" });
  yPos += 10;

  // Total TTC
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setFillColor(240, 240, 240);
  doc.rect(totalsX - 5, yPos - 6, 75, 10, "F");
  doc.text("Total TTC:", totalsX, yPos);
  doc.text(`${quote.totalAmount.toFixed(2)} €`, pageWidth - margin - 2, yPos, { align: "right" });

  yPos += 15;

  // Notes
  if (quote.notes) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Notes:", margin, yPos);
    yPos += 5;

    const notesLines = doc.splitTextToSize(quote.notes, maxWidth);
    notesLines.forEach((line: string) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      doc.text(line, margin, yPos);
      yPos += 5;
    });
    yPos += 10;
  }

  // Pied de page
  const footerY = doc.internal.pageSize.height - 20;
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(
    "Ce devis est valable jusqu'à la date indiquée ci-dessus.",
    pageWidth / 2,
    footerY,
    { align: "center" }
  );

  return doc;
}

export function downloadQuotePDF(quote: Quote, professorInfo: any) {
  const doc = generateQuotePDF(quote, professorInfo);
  doc.save(`Devis_${quote.quoteNumber}.pdf`);
}

export function getQuotePDFDataUrl(quote: Quote, professorInfo: any): string {
  const doc = generateQuotePDF(quote, professorInfo);
  return doc.output('dataurlstring');
}
