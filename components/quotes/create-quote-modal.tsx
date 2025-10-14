"use client";

import { useState, useEffect } from "react";
import { X, User, Check } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface CreateQuoteModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateQuoteModal({ onClose, onSuccess }: CreateQuoteModalProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  const [formData, setFormData] = useState({
    description: "",
    amount: 0,
    taxRate: 0.20,
    validityDays: 30,
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

  const selectedClient = clients.find((c) => c.id === selectedClientId);
  const taxAmount = formData.amount * formData.taxRate;
  const totalAmount = formData.amount + taxAmount;

  const handleCreate = async () => {
    if (!selectedClientId || !formData.description || formData.amount <= 0) return;

    setCreating(true);
    try {
      const response = await fetch("/api/professor/quotes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientId: selectedClientId,
          description: formData.description,
          amount: formData.amount,
          taxRate: formData.taxRate,
          validityDays: formData.validityDays,
          notes: formData.notes,
        }),
      });

      if (response.ok) {
        onSuccess();
        onClose();
      } else {
        alert("Erreur lors de la création du devis");
      }
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la création du devis");
    } finally {
      setCreating(false);
    }
  };

  const isValid = selectedClientId && formData.description && formData.amount > 0;

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
            <h2 className="text-2xl font-bold text-gray-900">Créer un nouveau devis</h2>
            <p className="text-sm text-gray-600 mt-1">
              Préparez un devis pour votre client
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
        <div className="p-6 space-y-6">
          {/* Client Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-3">
              Sélectionnez un client <span className="text-red-500">*</span>
            </label>
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
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
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Description du devis <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Cours de mathématiques - Forfait 10 heures"
              rows={4}
              required
            />
          </div>

          {/* Amount and Tax Rate */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Montant HT (€) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Taux de TVA (%)
              </label>
              <input
                type="number"
                value={formData.taxRate * 100}
                onChange={(e) => setFormData({ ...formData, taxRate: (parseFloat(e.target.value) || 0) / 100 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                max="100"
                step="0.1"
              />
            </div>
          </div>

          {/* Validity Days */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Validité du devis (jours)
            </label>
            <input
              type="number"
              value={formData.validityDays}
              onChange={(e) => setFormData({ ...formData, validityDays: parseInt(e.target.value) || 30 })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Notes additionnelles
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Informations complémentaires..."
              rows={2}
            />
          </div>

          {/* Summary */}
          {formData.amount > 0 && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Montant HT</span>
                <span className="font-medium text-gray-900">{formatCurrency(formData.amount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">TVA ({(formData.taxRate * 100).toFixed(1)}%)</span>
                <span className="font-medium text-gray-900">{formatCurrency(taxAmount)}</span>
              </div>
              <div className="border-t border-gray-200 pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-900">Total TTC</span>
                  <span className="text-xl font-bold text-blue-600">{formatCurrency(totalAmount)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={creating}
          >
            Annuler
          </button>

          <button
            onClick={handleCreate}
            disabled={!isValid || creating}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {creating ? (
              <>
                <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2"></div>
                Création...
              </>
            ) : (
              "Créer le devis"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
