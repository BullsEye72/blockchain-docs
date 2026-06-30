"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function FileError({ error, reset }) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      <AlertTriangle className="mx-auto mb-4 text-red-400" size={40} strokeWidth={1.5} />
      <h2 className="text-lg font-semibold text-gray-900 mb-2">Une erreur est survenue</h2>
      <p className="text-sm text-gray-500 mb-6">{error.message}</p>
      <button
        onClick={reset}
        className="bg-red-600 hover:bg-red-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
      >
        Réessayer
      </button>
    </div>
  );
}
