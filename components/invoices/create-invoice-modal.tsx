"use client";

import { useState, useEffect } from "react";
import { X, User, Calendar, Check } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Course {
  id: string;
  title: string;
  subject: string;
  date: string;
  duration: number;
  price: number;
}

interface CreateInvoiceModalProps {
  onClose: () => void;
  onSuccess: () => void;
  preselectedClientId?: string;
  preselectedCourseIds?: string[];
}

export function CreateInvoiceModal({ onClose, onSuccess, preselectedClientId, preselectedCourseIds }: CreateInvoiceModalProps) {
  const [step, setStep] = useState(preselectedClientId ? 2 : 1); // Skip to step 2 if client is preselected
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>(preselectedClientId || "");
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [selectedCourseIds, setSelectedCourseIds] = useState<Set<string>>(new Set(preselectedCourseIds || []));
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  // Load clients
  useEffect(() => {
    fetch("/api/professor/clients")
      .then((res) => res.json())
      .then((data) => setClients(data))
      .catch((err) => console.error(err));
  }, []);

  // Load available courses when client is selected
  useEffect(() => {
    if (selectedClientId && step === 2) {
      setLoading(true);
      fetch(`/api/professor/courses?clientId=${selectedClientId}&uninvoiced=true`)
        .then((res) => res.json())
        .then((data) => {
          setAvailableCourses(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [selectedClientId, step]);

  const selectedClient = clients.find((c) => c.id === selectedClientId);
  const selectedCourses = availableCourses.filter((c) => selectedCourseIds.has(c.id));

  const totalAmount = selectedCourses.reduce((sum, course) => sum + course.price, 0);
  const taxRate = 0.20;
  const taxAmount = totalAmount * taxRate;
  const totalWithTax = totalAmount + taxAmount;

  const toggleCourse = (courseId: string) => {
    const newSet = new Set(selectedCourseIds);
    if (newSet.has(courseId)) {
      newSet.delete(courseId);
    } else {
      newSet.add(courseId);
    }
    setSelectedCourseIds(newSet);
  };

  const handleCreate = async () => {
    if (selectedCourseIds.size === 0) return;

    setCreating(true);
    try {
      const response = await fetch("/api/professor/invoices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientId: selectedClientId,
          courseIds: Array.from(selectedCourseIds),
        }),
      });

      if (response.ok) {
        onSuccess();
        onClose();
      } else {
        alert("Erreur lors de la création de la facture");
      }
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la création de la facture");
    } finally {
      setCreating(false);
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
      <div className="relative z-10 w-full max-w-3xl mx-4 bg-white rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Créer une nouvelle facture</h2>
            <p className="text-sm text-gray-600 mt-1">
              Étape {step} sur 3: {step === 1 ? "Sélection du client" : step === 2 ? "Sélection des cours" : "Confirmation"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Select Client */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Choisissez un client</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {clients.map((client) => (
                  <div
                    key={client.id}
                    onClick={() => setSelectedClientId(client.id)}
                    className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedClientId === client.id
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        selectedClientId === client.id ? "bg-blue-600" : "bg-gray-200"
                      }`}>
                        <User className={`h-5 w-5 ${
                          selectedClientId === client.id ? "text-white" : "text-gray-600"
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {client.firstName} {client.lastName}
                        </p>
                        <p className="text-sm text-gray-600">{client.email}</p>
                      </div>
                    </div>
                    {selectedClientId === client.id && (
                      <Check className="h-5 w-5 text-blue-600" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Select Courses */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Sélectionnez les cours à facturer</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Client: {selectedClient?.firstName} {selectedClient?.lastName}
                </p>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                </div>
              ) : availableCourses.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">Aucun cours non facturé disponible pour ce client</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {availableCourses.map((course) => (
                    <div
                      key={course.id}
                      onClick={() => toggleCourse(course.id)}
                      className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedCourseIds.has(course.id)
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-200 hover:border-blue-300"
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                          selectedCourseIds.has(course.id)
                            ? "border-blue-600 bg-blue-600"
                            : "border-gray-300"
                        }`}>
                          {selectedCourseIds.has(course.id) && (
                            <Check className="h-4 w-4 text-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{course.title}</p>
                          <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                            <span>{course.subject}</span>
                            <span>•</span>
                            <span>{format(new Date(course.date), "d MMM yyyy", { locale: fr })}</span>
                            <span>•</span>
                            <span>{course.duration} min</span>
                          </div>
                        </div>
                      </div>
                      <p className="font-semibold text-gray-900 ml-4">
                        {formatCurrency(course.price)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Vérifiez et confirmez</h3>

              {/* Client Info */}
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Client</p>
                <p className="font-medium text-gray-900">
                  {selectedClient?.firstName} {selectedClient?.lastName}
                </p>
                <p className="text-sm text-gray-600">{selectedClient?.email}</p>
              </div>

              {/* Selected Courses */}
              <div>
                <p className="text-sm font-medium text-gray-900 mb-3">
                  Cours sélectionnés ({selectedCourses.length})
                </p>
                <div className="space-y-2">
                  {selectedCourses.map((course) => (
                    <div
                      key={course.id}
                      className="flex items-center justify-between bg-gray-50 rounded-lg p-3"
                    >
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{course.title}</p>
                        <p className="text-xs text-gray-600">
                          {format(new Date(course.date), "d MMM yyyy", { locale: fr })} • {course.duration} min
                        </p>
                      </div>
                      <p className="font-medium text-gray-900">{formatCurrency(course.price)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Amounts */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Montant HT</span>
                  <span className="font-medium text-gray-900">{formatCurrency(totalAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">TVA (20%)</span>
                  <span className="font-medium text-gray-900">{formatCurrency(taxAmount)}</span>
                </div>
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900">Total TTC</span>
                    <span className="text-xl font-bold text-blue-600">{formatCurrency(totalWithTax)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-between gap-3">
          <button
            onClick={() => {
              if (step === 1) {
                onClose();
              } else {
                setStep(step - 1);
              }
            }}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={creating}
          >
            {step === 1 ? "Annuler" : "Retour"}
          </button>

          <button
            onClick={() => {
              if (step < 3) {
                if (step === 1 && !selectedClientId) return;
                if (step === 2 && selectedCourseIds.size === 0) return;
                setStep(step + 1);
              } else {
                handleCreate();
              }
            }}
            disabled={
              (step === 1 && !selectedClientId) ||
              (step === 2 && selectedCourseIds.size === 0) ||
              creating
            }
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {creating ? (
              <>
                <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2"></div>
                Création...
              </>
            ) : step === 3 ? (
              "Créer la facture"
            ) : (
              "Suivant"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
