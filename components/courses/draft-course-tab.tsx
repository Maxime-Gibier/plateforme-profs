"use client";

import { X, FileEdit } from "lucide-react";

interface DraftCourseTabProps {
  onRestore: () => void;
  onDiscard: () => void;
  draft: any;
  clients?: any[];
}

export function DraftCourseTab({ onRestore, onDiscard, draft, clients }: DraftCourseTabProps) {
  // Determine what to display as title
  let displayTitle = "Nouveau cours";

  if (draft.title) {
    displayTitle = draft.title;
  } else if (draft.clientId && clients) {
    const client = clients.find(c => c.id === draft.clientId);
    if (client) {
      displayTitle = `Cours avec ${client.firstName} ${client.lastName}`;
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white rounded-lg shadow-2xl border-2 border-blue-600 p-4 flex items-center gap-3 min-w-[300px] max-w-[400px]">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
          <FileEdit className="h-5 w-5 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm truncate">
            {displayTitle}
          </p>
          <p className="text-xs text-gray-600">Brouillon de cours</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onRestore}
            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium whitespace-nowrap"
          >
            Reprendre
          </button>
          <button
            onClick={onDiscard}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
            title="Supprimer le brouillon"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>
      </div>
    </div>
  );
}
