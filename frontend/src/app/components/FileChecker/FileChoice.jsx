"use client";

import { useState } from "react";
import { Search, Save } from "lucide-react";
import FileChecker from "./FileChecker";
import FileSaver from "@/app/(site)/files/new/FileSaver";

export default function FileCardSelector() {
  const [mode, setMode] = useState("save");

  return (
    <div>
      <div className="flex rounded-lg overflow-hidden border border-gray-200 w-fit mx-auto mb-8">
        <button
          onClick={() => setMode("check")}
          className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium transition-colors ${
            mode === "check" ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
          }`}
        >
          <Search size={15} /> Vérifier un fichier
        </button>
        <button
          onClick={() => setMode("save")}
          className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium transition-colors ${
            mode === "save" ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
          }`}
        >
          <Save size={15} /> Enregistrer un fichier
        </button>
      </div>

      {mode === "check" ? <FileChecker /> : <FileSaver />}
    </div>
  );
}
