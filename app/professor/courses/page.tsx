"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CoursesCalendar } from "@/components/courses/courses-calendar";
import { CourseDetailsModal } from "@/components/courses/course-details-modal";
import { CreateCourseModal } from "@/components/courses/create-course-modal";
import { CreateInvoiceModal } from "@/components/invoices/create-invoice-modal";
import { DraftCourseTab } from "@/components/courses/draft-course-tab";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { List, Calendar as CalendarIcon, CalendarDays, Plus, User, BookOpen } from "lucide-react";

export default function CoursesPage() {
  const [allCourses, setAllCourses] = useState<any[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoicePreselection, setInvoicePreselection] = useState<{ clientId: string; courseId: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [courseDraft, setCourseDraft] = useState<any | null>(null);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [clients, setClients] = useState<any[]>([]);

  const loadCourses = () => {
    // Charger tous les cours (pas seulement à venir)
    fetch("/api/professor/courses?limit=100")
      .then((res) => res.json())
      .then((data) => {
        setAllCourses(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  const loadClients = () => {
    fetch("/api/professor/clients")
      .then((res) => res.json())
      .then((data) => setClients(data))
      .catch((err) => console.error(err));
  };

  const handleCourseCreatedWithInvoice = (courseId: string, clientId: string) => {
    // Set preselection data and open invoice modal
    setInvoicePreselection({ clientId, courseId });
    setShowInvoiceModal(true);
  };

  const handleInvoiceModalClose = () => {
    setShowInvoiceModal(false);
    setInvoicePreselection(null);
  };

  const handleInvoiceSuccess = () => {
    loadCourses();
    handleInvoiceModalClose();
  };

  const handleMinimizeCourse = (draft: any) => {
    setCourseDraft(draft);
    setShowCreateModal(false);
  };

  const handleRestoreDraft = () => {
    setShowCreateModal(true);
  };

  const handleDiscardDraft = () => {
    setShowDiscardConfirm(true);
  };

  const handleConfirmDiscard = () => {
    setCourseDraft(null);
    setShowDiscardConfirm(false);
  };

  useEffect(() => {
    loadCourses();
    loadClients();
  }, []);

  // Filtrer les cours en fonction du statut
  const filteredCourses = allCourses.filter((course) => {
    const now = new Date();
    const courseDate = course.date ? new Date(course.date) : null;

    if (selectedFilter === "toplan") {
      return !course.date; // Cours sans date
    } else if (selectedFilter === "upcoming") {
      return course.status === "SCHEDULED" && courseDate && courseDate >= now;
    } else if (selectedFilter === "completed") {
      return course.status === "COMPLETED";
    } else if (selectedFilter === "scheduled") {
      return course.status === "SCHEDULED" && course.date;
    }
    return true; // "all"
  });

  const getCourseStats = () => {
    const now = new Date();
    const stats = {
      total: allCourses.length,
      toplan: allCourses.filter((c) => !c.date).length,
      upcoming: allCourses.filter((c) => c.status === "SCHEDULED" && c.date && new Date(c.date) >= now).length,
      completed: allCourses.filter((c) => c.status === "COMPLETED").length,
      scheduled: allCourses.filter((c) => c.status === "SCHEDULED" && c.date).length,
    };
    return stats;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Chargement des cours...</p>
        </div>
      </div>
    );
  }

  const stats = getCourseStats();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">Mes cours</h1>
          <p className="text-lg text-muted-foreground">
            Gérez vos {allCourses.length} cours
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all hover:shadow-lg font-medium"
        >
          <Plus className="h-5 w-5" />
          Nouveau cours
        </button>
      </div>

      {/* Courses Section with Tabs */}
      <Card className="border-blue-100">
        <CardHeader>
          <CardTitle className="text-2xl">Tous mes cours</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="list" className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <TabsList className="w-full md:w-auto grid grid-cols-3">
                <TabsTrigger value="list" className="gap-2">
                  <List className="h-4 w-4" />
                  <span className="hidden sm:inline">Liste</span>
                </TabsTrigger>
                <TabsTrigger value="week" className="gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Semaine</span>
                </TabsTrigger>
                <TabsTrigger value="month" className="gap-2">
                  <CalendarDays className="h-4 w-4" />
                  <span className="hidden sm:inline">Mois</span>
                </TabsTrigger>
              </TabsList>

              {/* Status Filters */}
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setSelectedFilter("all")}
                  className={`px-4 py-2 text-sm rounded-lg transition-all font-medium ${
                    selectedFilter === "all"
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow"
                  }`}
                >
                  Tous ({stats.total})
                </button>
                <button
                  onClick={() => setSelectedFilter("toplan")}
                  className={`px-4 py-2 text-sm rounded-lg transition-all font-medium ${
                    selectedFilter === "toplan"
                      ? "bg-orange-600 text-white shadow-md"
                      : "bg-orange-100 text-orange-700 hover:bg-orange-200 hover:shadow"
                  }`}
                >
                  À planifier ({stats.toplan})
                </button>
                <button
                  onClick={() => setSelectedFilter("upcoming")}
                  className={`px-4 py-2 text-sm rounded-lg transition-all font-medium ${
                    selectedFilter === "upcoming"
                      ? "bg-green-600 text-white shadow-md"
                      : "bg-green-100 text-green-700 hover:bg-green-200 hover:shadow"
                  }`}
                >
                  À venir ({stats.upcoming})
                </button>
                <button
                  onClick={() => setSelectedFilter("completed")}
                  className={`px-4 py-2 text-sm rounded-lg transition-all font-medium ${
                    selectedFilter === "completed"
                      ? "bg-purple-600 text-white shadow-md"
                      : "bg-purple-100 text-purple-700 hover:bg-purple-200 hover:shadow"
                  }`}
                >
                  Terminés ({stats.completed})
                </button>
                <button
                  onClick={() => setSelectedFilter("scheduled")}
                  className={`px-4 py-2 text-sm rounded-lg transition-all font-medium ${
                    selectedFilter === "scheduled"
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-blue-100 text-blue-700 hover:bg-blue-200 hover:shadow"
                  }`}
                >
                  Planifiés ({stats.scheduled})
                </button>
              </div>
            </div>

            {/* List View */}
            <TabsContent value="list" className="space-y-4 mt-6">
              {filteredCourses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="rounded-full bg-blue-50 p-4 mb-4">
                    <CalendarIcon className="h-10 w-10 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun cours</h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Vous n'avez pas de cours pour ce filtre
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredCourses.map((course) => (
                    <Card
                      key={course.id}
                      className="hover:shadow-md transition-all cursor-pointer border-l-4 border-l-blue-500 hover:border-l-blue-600"
                      onClick={() => setSelectedCourse(course)}
                    >
                      <CardContent className="flex items-center justify-between p-5">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-gray-900 text-lg">{course.title}</h3>
                            <span
                              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                                course.status === "SCHEDULED"
                                  ? "bg-blue-100 text-blue-800"
                                  : course.status === "COMPLETED"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {course.status === "SCHEDULED"
                                ? "Planifié"
                                : course.status === "COMPLETED"
                                ? "Terminé"
                                : "Annulé"}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                            <span className="flex items-center gap-1.5">
                              <User className="h-4 w-4" />
                              {course.client?.firstName} {course.client?.lastName}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1.5">
                              <BookOpen className="h-4 w-4" />
                              {course.subject}
                            </span>
                            <span>•</span>
                            {course.date ? (
                              <span className="flex items-center gap-1.5">
                                <CalendarIcon className="h-4 w-4" />
                                {formatDateTime(course.date)}
                              </span>
                            ) : (
                              <span className="text-orange-600 font-medium flex items-center gap-1.5">
                                <CalendarIcon className="h-4 w-4" />
                                À planifier
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-2xl font-bold text-gray-900">
                              {formatCurrency(course.price)}
                            </p>
                            <p className="text-sm text-muted-foreground">{course.duration} min</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Week View */}
            <TabsContent value="week">
              <CoursesCalendar courses={allCourses} view="week" onCourseClick={setSelectedCourse} />
            </TabsContent>

            {/* Month View */}
            <TabsContent value="month">
              <CoursesCalendar courses={allCourses} view="month" onCourseClick={setSelectedCourse} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Course Details Modal */}
      {selectedCourse && (
        <CourseDetailsModal
          course={selectedCourse}
          onClose={() => setSelectedCourse(null)}
          onUpdate={loadCourses}
        />
      )}

      {/* Create Course Modal */}
      {showCreateModal && (
        <CreateCourseModal
          onClose={() => {
            setShowCreateModal(false);
            setCourseDraft(null);
          }}
          onSuccess={() => {
            loadCourses();
            setCourseDraft(null);
          }}
          onCourseCreatedWithInvoice={handleCourseCreatedWithInvoice}
          onMinimize={handleMinimizeCourse}
          initialData={courseDraft}
        />
      )}

      {/* Create Invoice Modal */}
      {showInvoiceModal && invoicePreselection && (
        <CreateInvoiceModal
          onClose={handleInvoiceModalClose}
          onSuccess={handleInvoiceSuccess}
          preselectedClientId={invoicePreselection.clientId}
          preselectedCourseIds={[invoicePreselection.courseId]}
        />
      )}

      {/* Draft Course Tab */}
      {courseDraft && !showCreateModal && (
        <DraftCourseTab
          onRestore={handleRestoreDraft}
          onDiscard={handleDiscardDraft}
          draft={courseDraft}
          clients={clients}
        />
      )}

      {/* Discard Draft Confirmation Modal */}
      {showDiscardConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative z-10 bg-white rounded-xl shadow-2xl p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Supprimer le brouillon ?</h3>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer ce brouillon de cours ? Cette action est irréversible.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDiscardConfirm(false)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmDiscard}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Oui, supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
