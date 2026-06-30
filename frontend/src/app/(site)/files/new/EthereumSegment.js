"use client";

import { connectToContract, broadcastToEthereum, checkReceipt, finalizeTransaction } from "./EthereumSend";
import { useEffect, useState, useRef } from "react";
import { Plug, PenLine, Clock, CheckCircle2, AlertTriangle, Loader2, ExternalLink } from "lucide-react";

const ETHERSCAN_URL = process.env.NEXT_PUBLIC_ETHERSCAN_URL || "https://etherscan.io";
const POLL_INTERVAL_MS = 12000;

/*
  stages: 0=idle, 1=connecting, 2=signing, 3=confirming, 4=done, -1=failed
*/

const steps = [
  { stage: 1, label: "Connexion", desc: "Vérification du contrat", Icon: Plug },
  { stage: 2, label: "Signature", desc: "Envoi au réseau", Icon: PenLine },
  { stage: 3, label: "Confirmation", desc: "En attente des mineurs", Icon: Clock },
  { stage: 4, label: "Enregistré", desc: "Inscrit sur la blockchain", Icon: CheckCircle2 },
];

function StepRow({ stepStage, currentStage, label, desc, Icon, txHash }) {
  const done = currentStage > stepStage && currentStage !== -1;
  const active = currentStage === stepStage;
  const failed = currentStage === -1 && stepStage === 1;

  return (
    <div className={`flex items-start gap-3 py-3 ${!done && !active ? "opacity-40" : ""}`}>
      <div className={`mt-0.5 shrink-0 ${done ? "text-green-500" : active ? "text-blue-500" : "text-gray-300"}`}>
        {active && stepStage < 4 ? <Loader2 size={18} className="animate-spin" /> : <Icon size={18} />}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${done ? "text-green-700" : active ? "text-blue-700" : "text-gray-500"}`}>
          {label}
          {stepStage === 3 && currentStage === 3 && <ElapsedTimer />}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          {stepStage === 3 && currentStage >= 3 && txHash ? (
            <a
              href={`${ETHERSCAN_URL}/tx/${txHash}`}
              target="_blank" rel="noopener noreferrer"
              className="text-blue-500 hover:underline inline-flex items-center gap-1"
            >
              Voir la transaction <ExternalLink size={10} />
            </a>
          ) : (
            desc
          )}
        </p>
      </div>
      {done && stepStage !== 4 && <CheckCircle2 size={16} className="text-green-500 shrink-0 mt-0.5" />}
    </div>
  );
}

function ElapsedTimer() {
  const [s, setS] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setS((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, []);
  return <span className="ml-2 text-xs font-normal text-gray-400">{s}s</span>;
}

export default function EthereumSegment({ state, fileInfo, userEmail, onSuccess }) {
  const [stage, setStage] = useState(0);
  const [txHash, setTxHash] = useState(null);
  const [error, setError] = useState(null);
  const pollRef = useRef(null);
  const attemptIdRef = useRef(null);

  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

  const startPolling = (hash, fileHash) => {
    pollRef.current = setInterval(async () => {
      const result = await checkReceipt(hash);
      if (result.status === "pending") return;
      clearInterval(pollRef.current);

      if (result.status === "confirmed") {
        const finalized = await finalizeTransaction(hash, fileHash, fileInfo.name, userEmail ?? null, attemptIdRef.current);
        if (!finalized.success) {
          setStage(-1);
          setError(finalized.message || "Enregistrement en base échoué après la blockchain.");
          return;
        }
        setStage(4);
        if (onSuccess) onSuccess();
      } else {
        setStage(-1);
        setError(result.message || "La transaction a échoué sur la blockchain.");
      }
    }, POLL_INTERVAL_MS);
  };

  const run = async () => {
    setStage(1);
    setError(null);
    setTxHash(null);

    const connection = await connectToContract();
    if (!connection.success) { setStage(-1); setError("Impossible de se connecter au contrat."); return; }

    setStage(2);
    const broadcast = await broadcastToEthereum({ hash: fileInfo.hash, name: fileInfo.name });
    if (!broadcast.success) {
      setStage(-1);
      setError(broadcast.existingAddress ? "Ce fichier est déjà enregistré sur la blockchain." : broadcast.message || "La transaction a échoué.");
      return;
    }

    attemptIdRef.current = broadcast.attemptId;
    setTxHash(broadcast.txHash);
    setStage(3);
    startPolling(broadcast.txHash, fileInfo.hash);
  };

  useEffect(() => { if (state) run(); }, [state]);

  if (!state && stage === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[180px] border-2 border-dashed border-gray-200 rounded-xl text-gray-400 gap-2">
        <div className="text-2xl font-light text-gray-300">Ξ</div>
        <p className="text-sm">En attente du paiement…</p>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-xl p-5">
      <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
        <span className="text-sm font-light text-gray-400">Ξ</span> Blockchain
      </h3>

      <div className="divide-y divide-gray-100">
        {steps.map((s) => (
          <StepRow key={s.stage} stepStage={s.stage} currentStage={stage} label={s.label} desc={s.desc} Icon={s.Icon} txHash={txHash} />
        ))}
      </div>

      {stage === 4 && txHash && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <a
            href={`${ETHERSCAN_URL}/tx/${txHash}`}
            target="_blank" rel="noopener noreferrer"
            className="text-sm text-green-600 hover:underline inline-flex items-center gap-1"
          >
            Voir sur la blockchain <ExternalLink size={13} />
          </a>
        </div>
      )}

      {stage === -1 && (
        <div className="mt-3 pt-3 border-t border-gray-100 flex items-start gap-2 text-sm text-red-600">
          <AlertTriangle size={16} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
