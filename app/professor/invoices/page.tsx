"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { InvoiceDetailsModal } from "@/components/invoices/invoice-details-modal";
import { CreateInvoiceModal } from "@/components/invoices/create-invoice-modal";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { FileText, Calendar, DollarSign, User, Search, Plus } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Invoice {
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
    duration: number;
    price: number;
  }>;
}

export default function InvoicesPage() {
  const [allInvoices, setAllInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const loadInvoices = () => {
    fetch("/api/professor/invoices")
      .then((res) => res.json())
      .then((data) => {
        setAllInvoices(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  // Filtrer les factures en fonction du statut sélectionné et de la recherche
  const filteredInvoices = allInvoices.filter((invoice) => {
    // Filtre par statut
    let statusMatch = true;
    if (selectedFilter === "paid") statusMatch = invoice.status === "PAID";
    else if (selectedFilter === "unpaid") statusMatch = invoice.status === "DRAFT";
    else if (selectedFilter === "sent") statusMatch = invoice.status === "SENT";
    else if (selectedFilter === "overdue") statusMatch = invoice.status === "OVERDUE";

    // Filtre par recherche (nom du client)
    let searchMatch = true;
    if (searchQuery.trim() !== "") {
      const clientName = `${invoice.client.firstName} ${invoice.client.lastName}`.toLowerCase();
      searchMatch = clientName.includes(searchQuery.toLowerCase());
    }

    return statusMatch && searchMatch;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      DRAFT: { label: "Brouillon", color: "bg-gray-100 text-gray-800" },
      SENT: { label: "Envoyée", color: "bg-blue-100 text-blue-800" },
      PAID: { label: "Payée", color: "bg-green-100 text-green-800" },
      OVERDUE: { label: "En retard", color: "bg-red-100 text-red-800" },
      CANCELLED: { label: "Annulée", color: "bg-orange-100 text-orange-800" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.DRAFT;
    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  const getInvoiceStats = () => {
    const stats = {
      total: allInvoices.length,
      paid: allInvoices.filter((inv) => inv.status === "PAID").length,
      unpaid: allInvoices.filter((inv) => inv.status === "DRAFT").length,
      sent: allInvoices.filter((inv) => inv.status === "SENT").length,
      overdue: allInvoices.filter((inv) => inv.status === "OVERDUE").length,
    };
    return stats;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Chargement des factures...</p>
        </div>
      </div>
    );
  }

  const stats = getInvoiceStats();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mes factures</h1>
          <p className="text-gray-600">
            Gérez vos {allInvoices.length} facture{allInvoices.length > 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Nouvelle facture
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <p className="text-xs text-gray-600">Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{stats.paid}</div>
            <p className="text-xs text-gray-600">Payées</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-600">{stats.unpaid}</div>
            <p className="text-xs text-gray-600">Brouillons</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{stats.sent}</div>
            <p className="text-xs text-gray-600">Envoyées</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
            <p className="text-xs text-gray-600">En retard</p>
          </CardContent>
        </Card>
      </div>

      {/* Invoices List with Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des factures</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedFilter} onValueChange={setSelectedFilter}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <TabsList>
                <TabsTrigger value="all">
                  Toutes ({stats.total})
                </TabsTrigger>
                <TabsTrigger value="paid">
                  Payées ({stats.paid})
                </TabsTrigger>
                <TabsTrigger value="unpaid">
                  Brouillons ({stats.unpaid})
                </TabsTrigger>
                <TabsTrigger value="sent">
                  Envoyées ({stats.sent})
                </TabsTrigger>
                <TabsTrigger value="overdue">
                  En retard ({stats.overdue})
                </TabsTrigger>
              </TabsList>

              {/* Search Bar */}
              <div className="relative flex-1 md:max-w-xs">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par nom de client..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <TabsContent value={selectedFilter} className="mt-0">
              {filteredInvoices.length === 0 ? (
                <div className="py-12 text-center">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-4 text-gray-500">
                    {searchQuery ? "Aucune facture trouvée pour cette recherche" : "Aucune facture"}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredInvoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setSelectedInvoice(invoice)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-blue-600" />
                          <h3 className="font-semibold text-gray-900">
                            {invoice.invoiceNumber}
                          </h3>
                          {getStatusBadge(invoice.status)}
                        </div>
                        <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>
                              {invoice.client.firstName} {invoice.client.lastName}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>
                              Émise le {format(new Date(invoice.issueDate), "d MMM yyyy", { locale: fr })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>
                              Échéance le {format(new Date(invoice.dueDate), "d MMM yyyy", { locale: fr })}
                            </span>
                          </div>
                        </div>
                        {invoice.courses.length > 0 && (
                          <div className="mt-2 text-sm text-gray-500">
                            {invoice.courses.length} cours inclus
                          </div>
                        )}
                      </div>
                      <div className="text-right ml-4">
                        <p className="font-semibold text-gray-900 text-lg">
                          {formatCurrency(invoice.totalAmount)}
                        </p>
                        {invoice.taxAmount > 0 && (
                          <p className="text-xs text-gray-500">
                            dont {formatCurrency(invoice.taxAmount)} de TVA
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Invoice Details Modal */}
      {selectedInvoice && (
        <InvoiceDetailsModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          onUpdate={loadInvoices}
        />
      )}

      {/* Create Invoice Modal */}
      {showCreateModal && (
        <CreateInvoiceModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={loadInvoices}
        />
      )}
    </div>
  );
}
