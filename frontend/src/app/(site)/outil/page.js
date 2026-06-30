"use client";

import { useEffect } from "react";
import { Shield } from "lucide-react";
import FileCardSelector from "@/app/components/FileChecker/FileChoice";

export default function OutilPage() {
  useEffect(() => {
    const prevent = (e) => e.preventDefault();
    window.addEventListener("dragover", prevent);
    window.addEventListener("drop", prevent);
    return () => { window.removeEventListener("dragover", prevent); window.removeEventListener("drop", prevent); };
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
          <Shield className="text-blue-600" size={22} strokeWidth={1.5} />
          Vérifier ou enregistrer un fichier
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Votre fichier est analysé localement — rien n'est envoyé sur nos serveurs.
        </p>
      </div>
      <FileCardSelector />
    </div>
  );
}
