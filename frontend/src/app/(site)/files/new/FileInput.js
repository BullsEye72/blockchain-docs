"use client";

import { useRef, useState } from "react";
import { UploadCloud } from "lucide-react";

const MAX_SIZE = 512 * 1024 * 1024; // 500 MB

export default function FileInput({ state, setFileInfo }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const dropRef = useRef();

  const process = (file) => {
    if (!file) return;
    if (file.size > MAX_SIZE) {
      setFileInfo({ status: "error", message: "Le fichier dépasse la limite de 500 Mo." });
      return;
    }
    setFileInfo({ status: "success", name: file.name, lastModified: file.lastModified, hash: "", file });
  };

  const onDrop = (e) => { e.preventDefault(); setIsDragOver(false); process(e.dataTransfer.files[0]); };
  const onDragOver = (e) => e.preventDefault();
  const onDragEnter = (e) => { e.preventDefault(); setIsDragOver(true); };
  const onDragLeave = (e) => { e.preventDefault(); if (!dropRef.current?.contains(e.relatedTarget)) setIsDragOver(false); };

  return (
    <label
      ref={dropRef}
      onDrop={onDrop} onDragOver={onDragOver} onDragEnter={onDragEnter} onDragLeave={onDragLeave}
      className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-xl p-10 cursor-pointer transition-colors ${
        !state ? "opacity-40 pointer-events-none" : ""
      } ${isDragOver ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300 bg-gray-50"}`}
    >
      <UploadCloud className={isDragOver ? "text-blue-400" : "text-gray-300"} size={36} strokeWidth={1} />
      <p className="text-sm text-gray-500 text-center">
        Glissez & déposez ou <span className="underline">cliquez pour sélectionner</span> un fichier
      </p>
      <input type="file" className="sr-only" onChange={(e) => process(e.target.files[0])} disabled={!state} />
    </label>
  );
}
