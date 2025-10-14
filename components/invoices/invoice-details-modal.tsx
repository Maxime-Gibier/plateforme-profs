"use client";

import { useState, useEffect } from "react";
import { X, User, Mail, FileText, Calendar, DollarSign, BookOpen, Download, Send } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { downloadInvoicePDF, getInvoicePDFDataUrl } from "@/lib/pdf-generator";

interface InvoiceDetailsModalProps {
  invoice: {
    id: string;
    invoiceNumber: string;
    status: string;
    issueDate: string;
    dueDate: string;
    amount: number;
    taxRate: number;
    taxAmount: number;
    totalAmount: number;
    notes?: string;
    client: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
    courses: Array<{
      id: string;
      title: string;
      subject: string;
      date: string;
    }>;
  };
  onClose: () => void;
  onUpdate?: () => void;
}

export function InvoiceDetailsModal({ invoice, onClose, onUpdate }: InvoiceDetailsModalProps) {
  const [professorInfo, setProfessorInfo] = useState<any>(null);
  const [pdfDataUrl, setPdfDataUrl] = useState<string>("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    // Récupérer les informations du professeur pour le PDF
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (data?.user) {
          setProfessorInfo(data.user);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    // Générer le PDF quand on a les infos du professeur
    if (professorInfo) {
      try {
        const dataUrl = getInvoicePDFDataUrl(invoice, professorInfo);
        setPdfDataUrl(dataUrl);
      } catch (error) {
        console.error("Erreur lors de la génération du PDF:", error);
      }
    }
  }, [professorInfo, invoice]);

  const getStatusInfo = (status: string) => {
    const statusConfig = {
      DRAFT: { label: "Brouillon", color: "bg-gray-100 text-gray-800" },
      SENT: { label: "Envoyée", color: "bg-blue-100 text-blue-800" },
      PAID: { label: "Payée", color: "bg-green-100 text-green-800" },
      OVERDUE: { label: "En retard", color: "bg-red-100 text-red-800" },
      CANCELLED: { label: "Annulée", color: "bg-orange-100 text-orange-800" },
    };
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.DRAFT;
  };

  const statusInfo = getStatusInfo(invoice.status);

  const handleDownloadPDF = () => {
    if (professorInfo) {
      downloadInvoicePDF(invoice, professorInfo);
    }
  };

  const handleSendInvoice = async () => {
    setSending(true);
    try {
      const response = await fetch(`/api/professor/invoices/${invoice.id}/send`, {
        method: "POST",
      });

      if (response.ok) {
        alert(`Facture envoyée avec succès à ${invoice.client.email}`);
        if (onUpdate) {
          onUpdate();
        }
        onClose();
      } else {
        const error = await response.json();
        alert(error.error || "Erreur lors de l'envoi de la facture");
      }
    } catch (error) {
      console.error(error);
      alert("Erreur lors de l'envoi de la facture");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-7xl mx-4 bg-white rounded-xl shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Facture {invoice.invoiceNumber}
            </h2>
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium mt-2 ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* PDF Preview - Left Side */}
          <div className="w-1/2 border-r border-gray-200 overflow-y-auto bg-gray-100 p-4">
            {pdfDataUrl ? (
              <iframe
                src={`${pdfDataUrl}#zoom=50`}
                className="w-full h-full border-0 rounded-lg shadow-lg bg-white"
                title="Aperçu de la facture"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                  <p className="mt-4 text-gray-600">Génération du PDF...</p>
                </div>
              </div>
            )}
          </div>

          {/* Details - Right Side */}
          <div className="w-1/2 overflow-y-auto p-6 space-y-6">
          {/* Invoice Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations de la facture</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Numéro de facture</p>
                  <p className="font-medium text-gray-900">{invoice.invoiceNumber}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Date d'émission</p>
                  <p className="font-medium text-gray-900">
                    {format(new Date(invoice.issueDate), "EEEE d MMMM yyyy", { locale: fr })}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Date d'échéance</p>
                  <p className="font-medium text-gray-900">
                    {format(new Date(invoice.dueDate), "EEEE d MMMM yyyy", { locale: fr })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Client Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations du client</h3>
            <div className="bg-blue-50 rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Nom complet</p>
                  <p className="font-medium text-gray-900">
                    {invoice.client.firstName} {invoice.client.lastName}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium text-gray-900">{invoice.client.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Courses */}
          {invoice.courses.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Cours facturés ({invoice.courses.length})
              </h3>
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="divide-y divide-gray-200">
                  {invoice.courses.map((course, index) => (
                    <div
                      key={course.id}
                      className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 text-sm font-semibold">
                          {index + 1}
                        </div>
                        <div className="flex items-center gap-3 flex-1">
                          <BookOpen className="h-5 w-5 text-blue-600 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{course.title}</p>
                            <p className="text-sm text-gray-600">{course.subject}</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-sm font-medium text-gray-900">
                          {format(new Date(course.date), "d MMM yyyy", { locale: fr })}
                        </p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(course.date), "HH:mm", { locale: fr })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Amounts */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Montants</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">Montant HT</p>
                <p className="font-medium text-gray-900">{formatCurrency(invoice.amount)}</p>
              </div>

              {invoice.taxAmount > 0 && (
                <>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">TVA ({invoice.taxRate}%)</p>
                    <p className="font-medium text-gray-900">{formatCurrency(invoice.taxAmount)}</p>
                  </div>
                  <div className="border-t border-gray-200 pt-3"></div>
                </>
              )}

              <div className="flex items-center justify-between">
                <p className="text-base font-semibold text-gray-900">Montant total TTC</p>
                <p className="text-xl font-bold text-blue-600">
                  {formatCurrency(invoice.totalAmount)}
                </p>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Notes</h3>
              <p className="text-gray-700 bg-gray-50 rounded-lg p-4">{invoice.notes}</p>
            </div>
          )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-between gap-3">
          <div className="flex gap-3">
            <button
              onClick={handleDownloadPDF}
              disabled={!professorInfo}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="h-4 w-4" />
              Télécharger PDF
            </button>

            {invoice.status === "DRAFT" && (
              <button
                onClick={handleSendInvoice}
                disabled={sending || !professorInfo}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? (
                  <>
                    <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Envoyer au client
                  </>
                )}
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
