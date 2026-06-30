"use client";

import { useState, useRef } from "react";
import { CheckCircle2, AlertTriangle, Loader2, Copy, ExternalLink, File } from "lucide-react";
import { checkIfFileExistsOnDatabase } from "@/app/api/files/route";
import { checkIfFileExistsOnBlockchain } from "@/app/(site)/files/actions";

const ETHERSCAN_URL = process.env.NEXT_PUBLIC_ETHERSCAN_URL || "https://etherscan.io";

const truncate = (hash = "") =>
  hash.length <= 14 ? hash : `${hash.slice(0, 7)}…${hash.slice(-7)}`;

export default function FileChecker() {
  const [status, setStatus] = useState("idle"); // idle | checking | found | notfound
  const [fileHash, setFileHash] = useState("");
  const [fileData, setFileData] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const dropRef = useRef();

  const handleFile = async (file) => {
    setStatus("checking");
    setFileData(null);

    const buf = await file.arrayBuffer();
    const hashBuf = await crypto.subtle.digest("SHA-256", buf);
    const hash = Array.from(new Uint8Array(hashBuf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    setFileHash(hash);

    const dbResult = await checkIfFileExistsOnDatabase(hash);
    if (dbResult) {
      setStatus("found");
      setFileData({ transaction_hash: dbResult.transaction_hash, lastmodified: dbResult.lastmodified, source: "db" });
      return;
    }

    const { fileOwnerId, transactionTimestamp } = await checkIfFileExistsOnBlockchain(hash, "");
    if (Number(fileOwnerId) !== 0) {
      setStatus("found");
      setFileData({
        transaction_hash: null,
        lastmodified: transactionTimestamp ? new Date(transactionTimestamp).toISOString() : null,
        source: "blockchain",
      });
    } else {
      setStatus("notfound");
    }
  };

  const onDrop = (e) => { e.preventDefault(); setIsDragOver(false); handleFile(e.dataTransfer.files[0]); };
  const onDragOver = (e) => e.preventDefault();
  const onDragEnter = (e) => { e.preventDefault(); setIsDragOver(true); };
  const onDragLeave = (e) => { e.preventDefault(); if (!dropRef.current?.contains(e.relatedTarget)) setIsDragOver(false); };
  const onInput = (e) => handleFile(e.target.files[0]);

  return (
    <div className="max-w-xl mx-auto space-y-4">
      {/* Drop zone */}
      <label
        ref={dropRef}
        onDrop={onDrop} onDragOver={onDragOver} onDragEnter={onDragEnter} onDragLeave={onDragLeave}
        className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-xl p-10 cursor-pointer transition-colors ${
          isDragOver ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300 bg-gray-50"
        }`}
      >
        <File className="text-gray-300" size={36} strokeWidth={1} />
        <p className="text-sm text-gray-500">
          {status === "checking"
            ? "Vérification en cours…"
            : "Déposez un fichier ici pour vérifier s'il est connu"}
        </p>
        {status === "checking" && <Loader2 className="text-blue-500 animate-spin" size={20} />}
        <input type="file" className="sr-only" onChange={onInput} />
      </label>

      {/* Result */}
      {status === "found" && (
        <div className="border border-green-200 bg-green-50 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-green-700 font-medium">
            <CheckCircle2 size={18} /> Fichier identifié sur la blockchain
          </div>
          <div className="text-sm space-y-2 text-gray-700">
            <div className="flex items-center gap-2">
              <span className="text-gray-400 w-24 shrink-0">Empreinte</span>
              <span className="font-mono">{truncate(fileHash)}</span>
              <button onClick={() => navigator.clipboard.writeText(fileHash)} className="text-gray-400 hover:text-gray-600">
                <Copy size={13} />
              </button>
            </div>
            {fileData?.transaction_hash && (
              <div className="flex items-center gap-2">
                <span className="text-gray-400 w-24 shrink-0">Transaction</span>
                <span className="font-mono">{truncate(fileData.transaction_hash)}</span>
                <a
                  href={`${ETHERSCAN_URL}/tx/${fileData.transaction_hash}`}
                  target="_blank" rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-500"
                >
                  <ExternalLink size={13} />
                </a>
              </div>
            )}
            {fileData?.lastmodified && (
              <div className="flex items-center gap-2">
                <span className="text-gray-400 w-24 shrink-0">Date</span>
                <span>{new Date(fileData.lastmodified).toLocaleDateString()}</span>
              </div>
            )}
            {fileData?.source === "blockchain" && (
              <p className="text-xs text-gray-500">Trouvé directement sur la blockchain (non indexé localement).</p>
            )}
          </div>
        </div>
      )}

      {status === "notfound" && (
        <div className="border border-orange-200 bg-orange-50 rounded-xl p-4 flex items-center gap-3 text-orange-700 text-sm">
          <AlertTriangle size={18} className="shrink-0" />
          Ce fichier n'est pas enregistré sur la blockchain.
        </div>
      )}
    </div>
  );
}
