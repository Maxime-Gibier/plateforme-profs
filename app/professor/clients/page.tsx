"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { User, Mail, Phone, BookOpen, Calendar, DollarSign, GraduationCap, Plus, X, Edit2, Save, CalendarPlus } from "lucide-react";
import { CreateCourseModal } from "@/components/courses/create-course-modal";

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  totalCourses: number;
  upcomingCourses: number;
  completedCourses: number;
  totalRevenue: number;
  lastCourseDate: string | null;
  nextCourse: {
    id: string;
    title: string;
    subject: string;
    date: string;
    duration: number;
  } | null;
  subjects: string[];
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isAddingClient, setIsAddingClient] = useState(false);
  const [isEditingClient, setIsEditingClient] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateCourseModal, setShowCreateCourseModal] = useState(false);
  const [courseClientId, setCourseClientId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
  });

  const loadClients = () => {
    fetch("/api/professor/clients")
      .then((res) => res.json())
      .then((data) => {
        setClients(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadClients();
  }, []);

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          role: "CLIENT",
        }),
      });

      if (response.ok) {
        setIsAddingClient(false);
        setFormData({
          email: "",
          password: "",
          firstName: "",
          lastName: "",
          phone: "",
        });
        loadClients();
      } else {
        const data = await response.json();
        alert(data.error || "Erreur lors de l'ajout du client");
      }
    } catch (error) {
      console.error(error);
      alert("Erreur lors de l'ajout du client");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;

    setIsSaving(true);

    try {
      const response = await fetch(`/api/professor/clients/${selectedClient.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsEditingClient(false);
        setSelectedClient(null);
        loadClients();
      } else {
        const data = await response.json();
        alert(data.error || "Erreur lors de la modification du client");
      }
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la modification du client");
    } finally {
      setIsSaving(false);
    }
  };

  // Filtrer les clients selon la recherche
  const filteredClients = clients.filter((client) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const fullName = `${client.firstName} ${client.lastName}`.toLowerCase();
    const email = client.email.toLowerCase();
    return fullName.includes(query) || email.includes(query);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Chargement des clients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">Mes clients</h1>
          <p className="text-lg text-muted-foreground">
            Gérez vos {clients.length} client{clients.length > 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => setIsAddingClient(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all hover:shadow-lg font-medium"
        >
          <Plus className="h-5 w-5" />
          Ajouter un client
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow border-blue-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total clients
            </CardTitle>
            <User className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{clients.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Clients enregistrés</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-green-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cours totaux
            </CardTitle>
            <BookOpen className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {clients.reduce((sum, client) => sum + client.totalCourses, 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Cours dispensés</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-purple-100 bg-gradient-to-br from-purple-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Revenus totaux
            </CardTitle>
            <DollarSign className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {formatCurrency(
                clients.reduce((sum, client) => sum + client.totalRevenue, 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Chiffre d'affaires</p>
          </CardContent>
        </Card>
      </div>

      {/* Clients List */}
      <Card className="border-blue-100">
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="text-2xl">Liste des clients</CardTitle>
            <div className="relative w-full max-w-sm">
              <input
                type="text"
                placeholder="Rechercher un client..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredClients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="rounded-full bg-blue-50 p-4 mb-4">
                <User className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchQuery ? "Aucun client trouvé" : "Aucun client"}
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                {searchQuery
                  ? "Essayez une autre recherche"
                  : "Commencez par ajouter votre premier client"
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredClients.map((client) => (
                <Card
                  key={client.id}
                  className="hover:shadow-md transition-all cursor-pointer border-l-4 border-l-blue-500 hover:border-l-blue-600 relative"
                  onClick={() => setSelectedClient(client)}
                >
                  {/* Edit Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setFormData({
                        email: client.email,
                        password: "",
                        firstName: client.firstName,
                        lastName: client.lastName,
                        phone: client.phone || "",
                      });
                      setIsEditingClient(true);
                      setSelectedClient(client);
                    }}
                    className="absolute top-5 right-5 p-2 hover:bg-blue-50 rounded-lg transition-colors text-blue-600 z-10"
                    title="Modifier le client"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>

                  <CardContent className="flex items-start justify-between p-6">
                    {/* Client Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                          <User className="h-7 w-7 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {client.firstName} {client.lastName}
                            </h3>
                            {client.subjects.slice(0, 2).map((subject) => (
                              <span
                                key={subject}
                                className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800"
                              >
                                {subject}
                              </span>
                            ))}
                            {client.subjects.length > 2 && (
                              <span className="text-xs text-gray-500">
                                +{client.subjects.length - 2}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 mt-1.5 text-sm text-muted-foreground flex-wrap">
                            <span className="flex items-center gap-1.5">
                              <Mail className="h-4 w-4" />
                              {client.email}
                            </span>
                            {client.phone && (
                              <span className="flex items-center gap-1.5">
                                <Phone className="h-4 w-4" />
                                {client.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Next Course */}
                      {client.nextCourse ? (
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-blue-600" />
                          <span className="text-blue-600 font-medium">
                            Prochain cours:{" "}
                            {format(new Date(client.nextCourse.date), "d MMMM yyyy 'à' HH:mm", {
                              locale: fr,
                            })}
                            {" - "}
                            {client.nextCourse.subject}
                          </span>
                        </div>
                      ) : client.lastCourseDate ? (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>
                            Dernier cours:{" "}
                            {format(new Date(client.lastCourseDate), "d MMMM yyyy", {
                              locale: fr,
                            })}
                          </span>
                        </div>
                      ) : null}
                    </div>

                    {/* Stats */}
                    <div className="flex gap-8 ml-6 pr-12">
                      <div className="text-center min-w-[80px]">
                        <div className="text-2xl font-bold text-gray-900">
                          {client.totalCourses}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 whitespace-nowrap">Cours total</div>
                      </div>
                      <div className="text-center min-w-[80px] border-l border-gray-200 pl-8">
                        <div className="text-2xl font-bold text-blue-600">
                          {client.upcomingCourses}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 whitespace-nowrap">À venir</div>
                      </div>
                      <div className="text-center min-w-[80px] border-l border-gray-200 pl-8">
                        <div className="text-2xl font-bold text-green-600">
                          {client.completedCourses}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 whitespace-nowrap">Terminés</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Client Modal */}
      {isAddingClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsAddingClient(false)}
          />

          {/* Modal */}
          <div className="relative z-10 w-full max-w-md mx-4 bg-white rounded-xl shadow-2xl">
            {/* Header */}
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Ajouter un client</h2>
              <button
                onClick={() => setIsAddingClient(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <form onSubmit={handleAddClient} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prénom *
                </label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom *
                </label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mot de passe *
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Minimum 8 caractères</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddingClient(false)}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={isSaving}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Ajout...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Ajouter
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Client Modal */}
      {isEditingClient && selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              setIsEditingClient(false);
              setSelectedClient(null);
            }}
          />

          {/* Modal */}
          <div className="relative z-10 w-full max-w-md mx-4 bg-white rounded-xl shadow-2xl">
            {/* Header */}
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Modifier le client</h2>
              <button
                onClick={() => {
                  setIsEditingClient(false);
                  setSelectedClient(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <form onSubmit={handleEditClient} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prénom *
                </label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom *
                </label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingClient(false);
                    setSelectedClient(null);
                  }}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={isSaving}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Enregistrer
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Client Details Modal */}
      {selectedClient && !isEditingClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedClient(null)}
          />

          {/* Modal */}
          <div className="relative z-10 w-full max-w-2xl mx-4 bg-white rounded-xl shadow-2xl">
            {/* Header */}
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Détails du client</h2>
              <button
                onClick={() => setSelectedClient(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <span className="text-2xl text-gray-500">&times;</span>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {selectedClient.firstName} {selectedClient.lastName}
                  </h3>
                  <p className="text-gray-600">{selectedClient.email}</p>
                  {selectedClient.phone && (
                    <p className="text-gray-600">{selectedClient.phone}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    <span className="text-sm text-gray-600">Cours totaux</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">
                    {selectedClient.totalCourses}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <span className="text-sm text-gray-600">Cours à venir</span>
                  </div>
                  <p className="text-3xl font-bold text-blue-600">
                    {selectedClient.upcomingCourses}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-gray-600">Cours terminés</span>
                  </div>
                  <p className="text-3xl font-bold text-green-600">
                    {selectedClient.completedCourses}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                    <span className="text-sm text-gray-600">Revenus générés</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">
                    {formatCurrency(selectedClient.totalRevenue)}
                  </p>
                </div>
              </div>

              {selectedClient.subjects.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Matières</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedClient.subjects.map((subject) => (
                      <span
                        key={subject}
                        className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700"
                      >
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedClient.nextCourse && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Prochain cours</h4>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="font-medium text-blue-900">{selectedClient.nextCourse.title}</p>
                    <p className="text-sm text-blue-700 mt-1">
                      {format(
                        new Date(selectedClient.nextCourse.date),
                        "EEEE d MMMM yyyy 'à' HH:mm",
                        { locale: fr }
                      )}
                    </p>
                    <p className="text-sm text-blue-600 mt-1">
                      Durée: {selectedClient.nextCourse.duration} minutes
                    </p>
                  </div>
                </div>
              )}

              {selectedClient.lastCourseDate && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Dernier cours</h4>
                  <p className="text-gray-700">
                    {format(
                      new Date(selectedClient.lastCourseDate),
                      "EEEE d MMMM yyyy",
                      { locale: fr }
                    )}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-between">
              <button
                onClick={() => {
                  setCourseClientId(selectedClient.id);
                  setShowCreateCourseModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <CalendarPlus className="h-4 w-4" />
                Créer un cours
              </button>
              <button
                onClick={() => setSelectedClient(null)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Course Modal */}
      {showCreateCourseModal && (
        <CreateCourseModal
          onClose={() => {
            setShowCreateCourseModal(false);
            setCourseClientId(null);
          }}
          onSuccess={() => {
            setShowCreateCourseModal(false);
            setCourseClientId(null);
            loadClients();
          }}
          preselectedClientId={courseClientId}
        />
      )}
    </div>
  );
}
