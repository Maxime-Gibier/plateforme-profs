"use client";

import { useState } from "react";
import { X, User, Mail, Phone, BookOpen, GraduationCap, Calendar, Clock, DollarSign, Edit2, Save, Trash2 } from "lucide-react";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface CourseDetailsModalProps {
  course: {
    id: string;
    title: string;
    subject: string;
    date: string | null;
    duration: number;
    price: number;
    status: string;
    location?: string;
    notes?: string;
    invoiceId?: string | null;
    client: {
      firstName: string;
      lastName: string;
      email: string;
      phone?: string;
      level?: string;
    };
  };
  onClose: () => void;
  onUpdate?: () => void;
}

export function CourseDetailsModal({ course, onClose, onUpdate }: CourseDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const courseHasDate = course.date && course.date.trim() !== "";
  const [editedDate, setEditedDate] = useState(courseHasDate ? format(new Date(course.date), "yyyy-MM-dd") : "");
  const [editedTime, setEditedTime] = useState(courseHasDate ? format(new Date(course.date), "HH:mm") : "09:00");
  const [editedStatus, setEditedStatus] = useState(course.status);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let dateToSave = null;
      if (editedDate && editedDate.trim() !== "") {
        dateToSave = new Date(`${editedDate}T${editedTime}`).toISOString();
      }

      const response = await fetch(`/api/professor/courses/${course.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: dateToSave,
          status: editedStatus,
        }),
      });

      if (response.ok) {
        setIsEditing(false);
        onUpdate?.();
        onClose();
      } else {
        alert("Erreur lors de la mise à jour du cours");
      }
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la mise à jour du cours");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/professor/courses/${course.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        onUpdate?.();
        onClose();
      } else {
        const error = await response.json();
        alert(error.error || "Erreur lors de la suppression du cours");
      }
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la suppression du cours");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // Determine if the course can be deleted (only SCHEDULED, not COMPLETED, and not invoiced)
  const canDelete = course.status === "SCHEDULED" && !course.invoiceId;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-2xl mx-4 bg-white rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Détails du cours</h2>
          <div className="flex items-center gap-2">
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-3 py-2 hover:bg-blue-50 rounded-lg transition-colors text-blue-600"
                title="Modifier le cours"
              >
                <Edit2 className="h-5 w-5" />
                <span className="text-sm font-medium">Modifier</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Course Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations du cours</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-3">
                <BookOpen className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Titre</p>
                  <p className="font-medium text-gray-900">{course.title}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <GraduationCap className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Matière</p>
                  <p className="font-medium text-gray-900">{course.subject}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Date et heure</p>
                  {isEditing ? (
                    <div className="flex gap-2 mt-1">
                      <input
                        type="date"
                        value={editedDate}
                        onChange={(e) => setEditedDate(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="time"
                        value={editedTime}
                        onChange={(e) => setEditedTime(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  ) : courseHasDate ? (
                    <p className="font-medium text-gray-900">
                      {format(new Date(course.date), "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr })}
                    </p>
                  ) : (
                    <div className="mt-2">
                      <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-orange-100 text-orange-700 text-sm font-medium mb-2">
                        À planifier
                      </span>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="mt-2 w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                      >
                        <Calendar className="h-4 w-4" />
                        Planifier ce cours
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Durée</p>
                  <p className="font-medium text-gray-900">{course.duration} minutes</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <DollarSign className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Prix</p>
                  <p className="font-medium text-gray-900">{formatCurrency(course.price)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-5 w-5 flex items-center justify-center mt-0.5">
                  <span className={`h-3 w-3 rounded-full ${
                    editedStatus === "SCHEDULED" ? "bg-blue-500" :
                    editedStatus === "COMPLETED" ? "bg-green-500" :
                    "bg-red-500"
                  }`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Statut</p>
                  {isEditing ? (
                    <select
                      value={editedStatus}
                      onChange={(e) => setEditedStatus(e.target.value)}
                      className="mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="SCHEDULED">Planifié</option>
                      <option value="COMPLETED">Terminé</option>
                      <option value="CANCELLED">Annulé</option>
                    </select>
                  ) : (
                    <p className="font-medium text-gray-900">
                      {course.status === "SCHEDULED" ? "Planifié" :
                       course.status === "COMPLETED" ? "Terminé" :
                       "Annulé"}
                    </p>
                  )}
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
                    {course.client.firstName} {course.client.lastName}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium text-gray-900">{course.client.email}</p>
                </div>
              </div>

              {course.client.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Téléphone</p>
                    <p className="font-medium text-gray-900">{course.client.phone}</p>
                  </div>
                </div>
              )}

              {course.client.level && (
                <div className="flex items-start gap-3">
                  <GraduationCap className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Niveau</p>
                    <p className="font-medium text-gray-900">{course.client.level}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Notes if any */}
          {course.notes && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Notes</h3>
              <p className="text-gray-700 bg-gray-50 rounded-lg p-4">{course.notes}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-between gap-3">
          {/* Delete button on the left (only for SCHEDULED courses) */}
          <div>
            {canDelete && !isEditing && !showDeleteConfirm && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Supprimer
              </button>
            )}
            {showDeleteConfirm && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700 font-medium">Confirmer la suppression ?</span>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-1 text-sm"
                >
                  {isDeleting ? (
                    <>
                      <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Suppression...
                    </>
                  ) : (
                    "Oui, supprimer"
                  )}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  Annuler
                </button>
              </div>
            )}
          </div>

          {/* Action buttons on the right */}
          <div className="flex gap-3">
            {isEditing ? (
              <>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditedDate(format(new Date(course.date), "yyyy-MM-dd"));
                    setEditedTime(format(new Date(course.date), "HH:mm"));
                    setEditedStatus(course.status);
                  }}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={isSaving}
                >
                  Annuler
                </button>
                <button
                  onClick={handleSave}
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
              </>
            ) : (
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Fermer
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
