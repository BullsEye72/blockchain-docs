"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { FileText, Calendar, Hash, Timer, CheckCircle2, Loader2, ExternalLink, Copy } from "lucide-react";
import { checkIfFileExistsOnDatabase } from "@/app/api/files/route";

const ETHERSCAN_URL = process.env.NEXT_PUBLIC_ETHERSCAN_URL || "https://etherscan.io";

const formatHash = (hash, size = 10) => {
  if (!hash || hash.length <= size * 2 + 3) return hash;
  return `${hash.slice(0, size)}…${hash.slice(-size)}`;
};

const calculateHash = async (file) => {
  const buf = await file.arrayBuffer();
  const hashBuf = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hashBuf)).map((b) => b.toString(16).padStart(2, "0")).join("");
};

export default function FileInfoSegment({ state, fileInfo, setFileInfo, onSubmit }) {
  const [isHashing, setIsHashing] = useState(false);
  const [existingRecord, setExistingRecord] = useState(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!fileInfo.file || fileInfo.hash) return;
    const run = async () => {
      setIsHashing(true);
      setExistingRecord(null);
      const t0 = Date.now();
      const hash = await calculateHash(fileInfo.file);
      setFileInfo({ ...fileInfo, hash, processingTime: Date.now() - t0 });
      const existing = await checkIfFileExistsOnDatabase(hash);
      setExistingRecord(existing || false);
      setIsHashing(false);
    };
    run();
  }, [fileInfo]);

  const dateText = useMemo(() => {
    if (!fileInfo?.lastModified) return "";
    const d = new Date(fileInfo.lastModified);
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
  }, [fileInfo]);

  const alreadyRegistered = existingRecord && existingRecord.transaction_hash;

  if (!state) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[180px] border-2 border-dashed border-gray-200 rounded-xl text-gray-400 gap-2">
        <FileText size={32} strokeWidth={1} />
        <p className="text-sm">Veuillez choisir un fichier…</p>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-xl p-5 space-y-4">
      <h3 className="font-medium text-gray-900">Votre fichier</h3>

      {isHashing ? (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 size={16} className="animate-spin text-blue-500" />
          Calcul et vérification en cours…
        </div>
      ) : (
        <>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-center gap-2">
              <FileText size={14} className="text-gray-400 shrink-0" />
              <span>{fileInfo.name}</span>
            </li>
            <li className="flex items-center gap-2">
              <Calendar size={14} className="text-gray-400 shrink-0" />
              <span>{dateText}</span>
            </li>
            <li className="flex items-center gap-2">
              <Hash size={14} className="text-gray-400 shrink-0" />
              <span className="font-mono text-xs">{formatHash(fileInfo.hash)}</span>
              {fileInfo.hash && (
                <button onClick={() => navigator.clipboard.writeText(fileInfo.hash)} className="text-gray-400 hover:text-gray-600 ml-1">
                  <Copy size={12} />
                </button>
              )}
            </li>
            {fileInfo.processingTime && (
              <li className="flex items-center gap-2">
                <Timer size={14} className="text-gray-400 shrink-0" />
                <span>Calculé en {fileInfo.processingTime} ms</span>
              </li>
            )}
          </ul>

          {alreadyRegistered ? (
            <div className="flex items-start gap-2 bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
              <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
              <span>
                Ce fichier est déjà enregistré.{" "}
                <a
                  href={`${ETHERSCAN_URL}/tx/${existingRecord.transaction_hash}`}
                  target="_blank" rel="noopener noreferrer"
                  className="underline inline-flex items-center gap-1"
                >
                  Voir sur Etherscan <ExternalLink size={11} />
                </a>
              </span>
            </div>
          ) : (
            <button
              onClick={() => startTransition(onSubmit)}
              disabled={!fileInfo.hash || isPending}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              {isPending && <Loader2 size={14} className="animate-spin" />}
              Sauvegarder sur la blockchain
            </button>
          )}
        </>
      )}
    </div>
  );
}
