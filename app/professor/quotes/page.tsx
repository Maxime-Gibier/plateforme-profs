"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { QuoteDetailsModal } from "@/components/quotes/quote-details-modal";
import { CreateQuoteModal } from "@/components/quotes/create-quote-modal";
import { formatCurrency } from "@/lib/utils";
import { FileText, Calendar, User, Search, Plus } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Quote {
  id: string;
  quoteNumber: string;
  issueDate: string;
  validUntil: string;
  amount: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  description: string;
  notes?: string;
  accepted: boolean;
  client: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export default function QuotesPage() {
  const [allQuotes, setAllQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const loadQuotes = () => {
    fetch("/api/professor/quotes")
      .then((res) => res.json())
      .then((data) => {
        setAllQuotes(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadQuotes();
  }, []);

  // Filtrer les devis en fonction du statut et de la recherche
  const filteredQuotes = allQuotes.filter((quote) => {
    const isExpired = new Date(quote.validUntil) < new Date();

    // Filtre par statut
    let statusMatch = true;
    if (selectedFilter === "accepted") statusMatch = quote.accepted;
    else if (selectedFilter === "pending") statusMatch = !quote.accepted && !isExpired;
    else if (selectedFilter === "expired") statusMatch = !quote.accepted && isExpired;

    // Filtre par recherche (nom du client)
    let searchMatch = true;
    if (searchQuery.trim() !== "") {
      const clientName = `${quote.client.firstName} ${quote.client.lastName}`.toLowerCase();
      searchMatch = clientName.includes(searchQuery.toLowerCase());
    }

    return statusMatch && searchMatch;
  });

  const getStatusBadge = (quote: Quote) => {
    const isExpired = new Date(quote.validUntil) < new Date();

    if (quote.accepted) {
      return (
        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800">
          Accepté
        </span>
      );
    } else if (isExpired) {
      return (
        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-red-100 text-red-800">
          Expiré
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800">
          En attente
        </span>
      );
    }
  };

  const getQuoteStats = () => {
    const now = new Date();
    const stats = {
      total: allQuotes.length,
      accepted: allQuotes.filter((q) => q.accepted).length,
      pending: allQuotes.filter((q) => !q.accepted && new Date(q.validUntil) >= now).length,
      expired: allQuotes.filter((q) => !q.accepted && new Date(q.validUntil) < now).length,
    };
    return stats;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Chargement des devis...</p>
        </div>
      </div>
    );
  }

  const stats = getQuoteStats();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mes devis</h1>
          <p className="text-gray-600">
            Gérez vos {allQuotes.length} devis
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Nouveau devis
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <p className="text-xs text-gray-600">Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{stats.accepted}</div>
            <p className="text-xs text-gray-600">Acceptés</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{stats.pending}</div>
            <p className="text-xs text-gray-600">En attente</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">{stats.expired}</div>
            <p className="text-xs text-gray-600">Expirés</p>
          </CardContent>
        </Card>
      </div>

      {/* Quotes List with Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des devis</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedFilter} onValueChange={setSelectedFilter}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <TabsList>
                <TabsTrigger value="all">
                  Tous ({stats.total})
                </TabsTrigger>
                <TabsTrigger value="accepted">
                  Acceptés ({stats.accepted})
                </TabsTrigger>
                <TabsTrigger value="pending">
                  En attente ({stats.pending})
                </TabsTrigger>
                <TabsTrigger value="expired">
                  Expirés ({stats.expired})
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
              {filteredQuotes.length === 0 ? (
                <div className="py-12 text-center">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-4 text-gray-500">
                    {searchQuery ? "Aucun devis trouvé pour cette recherche" : "Aucun devis"}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredQuotes.map((quote) => (
                    <div
                      key={quote.id}
                      className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setSelectedQuote(quote)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-blue-600" />
                          <h3 className="font-semibold text-gray-900">
                            {quote.quoteNumber}
                          </h3>
                          {getStatusBadge(quote)}
                        </div>
                        <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>
                              {quote.client.firstName} {quote.client.lastName}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>
                              Émis le {format(new Date(quote.issueDate), "d MMM yyyy", { locale: fr })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>
                              Valide jusqu'au {format(new Date(quote.validUntil), "d MMM yyyy", { locale: fr })}
                            </span>
                          </div>
                        </div>
                        <div className="mt-2 text-sm text-gray-500 line-clamp-2">
                          {quote.description}
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className="font-semibold text-gray-900 text-lg">
                          {formatCurrency(quote.totalAmount)}
                        </p>
                        {quote.taxAmount > 0 && (
                          <p className="text-xs text-gray-500">
                            dont {formatCurrency(quote.taxAmount)} de TVA
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

      {/* Quote Details Modal */}
      {selectedQuote && (
        <QuoteDetailsModal
          quote={selectedQuote}
          onClose={() => setSelectedQuote(null)}
          onUpdate={loadQuotes}
        />
      )}

      {/* Create Quote Modal */}
      {showCreateModal && (
        <CreateQuoteModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={loadQuotes}
        />
      )}
    </div>
  );
}
