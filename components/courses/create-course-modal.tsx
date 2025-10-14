"use client";

import { useState, useEffect } from "react";
import { X, User, Calendar, BookOpen } from "lucide-react";

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface CreateCourseModalProps {
  onClose: () => void;
  onSuccess: () => void;
  onCourseCreatedWithInvoice?: (courseId: string, clientId: string) => void;
  onMinimize?: (draft: any) => void;
  initialData?: any;
}

export function CreateCourseModal({ onClose, onSuccess, onCourseCreatedWithInvoice, onMinimize, initialData }: CreateCourseModalProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [creatingWithInvoice, setCreatingWithInvoice] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const [formData, setFormData] = useState(initialData || {
    clientId: "",
    title: "",
    description: "",
    subject: "",
    date: "",
    hour: "09",
    minute: "00",
    duration: 60,
    price: 0,
    location: "",
    notes: "",
  });

  // Load clients
  useEffect(() => {
    setLoading(true);
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
  }, []);

  const handleSubmit = async (e: React.FormEvent, createInvoice: boolean = false) => {
    e.preventDefault();

    // Combine date, hour, and minute only if date is provided and not empty
    let dateTime = null;
    if (formData.date && formData.date.trim() !== "") {
      const timeString = `${formData.hour}:${formData.minute}`;
      dateTime = new Date(`${formData.date}T${timeString}`);
    }

    if (createInvoice) {
      setCreatingWithInvoice(true);
    } else {
      setCreating(true);
    }

    try {
      // Create the course
      const response = await fetch("/api/professor/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientId: formData.clientId,
          title: formData.title,
          description: formData.description,
          subject: formData.subject,
          date: dateTime ? dateTime.toISOString() : null,
          duration: formData.duration,
          price: formData.price,
          location: formData.location,
          notes: formData.notes,
        }),
      });

      if (response.ok) {
        const course = await response.json();

        // If creating with invoice, call the callback to open invoice modal
        if (createInvoice && onCourseCreatedWithInvoice) {
          onCourseCreatedWithInvoice(course.id, formData.clientId);
        } else {
          onSuccess();
        }

        onClose();
      } else {
        alert("Erreur lors de la création du cours");
      }
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la création du cours");
    } finally {
      setCreating(false);
      setCreatingWithInvoice(false);
    }
  };

  const selectedClient = clients.find((c) => c.id === formData.clientId);

  const isValid = formData.clientId && formData.title && formData.subject && formData.price > 0;

  const handleBackdropClick = () => {
    // Check if form has any data
    const hasData = formData.clientId || formData.title || formData.subject || formData.description || formData.notes;

    if (hasData && onMinimize) {
      // Save to draft and minimize
      onMinimize(formData);
    } else {
      // No data, just close
      onClose();
    }
  };

  const handleCancel = () => {
    const hasData = formData.clientId || formData.title || formData.subject || formData.description || formData.notes;

    if (hasData) {
      setShowCancelConfirm(true);
    } else {
      onClose();
    }
  };

  const handleConfirmCancel = () => {
    setShowCancelConfirm(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleBackdropClick}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-2xl mx-4 bg-white rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Créer un nouveau cours</h2>
            <p className="text-sm text-gray-600 mt-1">
              Planifiez un nouveau cours avec un client
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
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Client Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Client <span className="text-red-500">*</span>
            </label>
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
              </div>
            ) : (
              <select
                value={formData.clientId}
                onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Sélectionnez un client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.firstName} {client.lastName}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Titre du cours <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Cours de mathématiques - Algèbre"
              required
            />
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Matière <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Mathématiques"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Description du cours..."
              rows={3}
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Laisser vide pour "À planifier"</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Heure
              </label>
              <select
                value={formData.hour}
                onChange={(e) => setFormData({ ...formData, hour: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!formData.date}
              >
                {Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0')).map((hour) => (
                  <option key={hour} value={hour}>
                    {hour}h
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Minutes
              </label>
              <select
                value={formData.minute}
                onChange={(e) => setFormData({ ...formData, minute: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!formData.date}
              >
                <option value="00">00</option>
                <option value="15">15</option>
                <option value="30">30</option>
                <option value="45">45</option>
              </select>
            </div>
          </div>

          {/* Duration and Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Durée (minutes) <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {[15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180].map((duration) => (
                  <option key={duration} value={duration}>
                    {duration} minutes
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Prix HT (€) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.price || ""}
                onChange={(e) => setFormData({ ...formData, price: e.target.value ? parseFloat(e.target.value) : 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                step="0.01"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Montant hors taxe</p>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Lieu
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: En ligne, Domicile, Bureau..."
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Notes additionnelles..."
              rows={2}
            />
          </div>
        </form>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-between gap-3">
          {showCancelConfirm ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700 font-medium">Annuler et supprimer le brouillon ?</span>
              <button
                onClick={handleConfirmCancel}
                className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                Oui, supprimer
              </button>
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                Annuler
              </button>
            </div>
          ) : (
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={creating || creatingWithInvoice}
            >
              Annuler
            </button>
          )}

          <div className="flex gap-3">
            <button
              onClick={(e) => handleSubmit(e, false)}
              disabled={!isValid || creating || creatingWithInvoice}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creating ? (
                <>
                  <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2"></div>
                  Création...
                </>
              ) : (
                "Créer le cours"
              )}
            </button>

            <button
              onClick={(e) => handleSubmit(e, true)}
              disabled={!isValid || creating || creatingWithInvoice}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creatingWithInvoice ? (
                <>
                  <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2"></div>
                  Création...
                </>
              ) : (
                "Créer le cours et la facture"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
