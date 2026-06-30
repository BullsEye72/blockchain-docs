"use client";

import { useEffect, useState } from "react";
import { Database } from "lucide-react";
import DismissibleMessage from "../../../components/DismissibleMessage";
import FileInfoSegment from "./FileInfoSegment";
import EthereumSegment from "./EthereumSegment";
import FileInput from "./FileInput";
import StripeForm from "@/app/stripe/Form";
import { checkCreditForFileUpload, getCreditCount } from "@/app/(site)/files/actions";
import { storeFile } from "@/app/actions";
import { useSession } from "next-auth/react";

export default function FileSaver() {
  const { data: session } = useSession();
  const [fileInfo, setFileInfo] = useState({});
  const [error, setError] = useState({ header: "", message: "", type: "" });
  const [stripeOpen, setStripeOpen] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(0);
  const [creditCount, setCreditCount] = useState(null);
  /*
    0 = waiting for file
    1 = file selected and hashed, ready to submit
    2 = ethereum process
  */

  useEffect(() => {
    if (session) getCreditCount().then(setCreditCount);
    else setCreditCount(null);
  }, [session]);

  useEffect(() => {
    if (fileInfo.status === "success" && fileInfo.hash === "") setUploadStatus(1);
    else if (fileInfo.status === "error") {
      setUploadStatus(0);
      setError({ header: "Erreur", message: fileInfo.message, type: "error" });
    }
  }, [fileInfo]);

  const handleSubmit = async () => {
    try {
      await storeFile({ userId: session?.user?.id ?? null, hash: fileInfo.hash, name: fileInfo.name });
    } catch (_) {}

    if (session) {
      const check = await checkCreditForFileUpload();
      if (check.hasCredit) { setUploadStatus(2); return; }
    }
    setStripeOpen(true);
  };

  const handleStripeComplete = () => { setStripeOpen(false); setUploadStatus(2); };
  const handleBlockchainSuccess = () => setCreditCount((c) => (c !== null && c > 0 ? c - 1 : c));

  return (
    <>
      <StripeForm
        open={stripeOpen}
        onClose={() => setStripeOpen(false)}
        onComplete={handleStripeComplete}
        fileHash={fileInfo.hash}
        fileName={fileInfo.name}
        userEmail={session?.user?.email ?? null}
      />

      {session && creditCount !== null && (
        <div className="flex items-center gap-2 text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 mb-4">
          <Database size={14} />
          {creditCount > 0
            ? `${creditCount} enregistrement${creditCount > 1 ? "s" : ""} disponible${creditCount > 1 ? "s" : ""}`
            : "Aucun crédit — un achat sera nécessaire"}
        </div>
      )}

      {error.type && (
        <div className="mb-4">
          <DismissibleMessage type={error.type} title={error.header} message={error.message} />
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-4">
          <FileInput state={uploadStatus === 0} setFileInfo={setFileInfo} />
          <FileInfoSegment
            state={uploadStatus >= 1}
            fileInfo={fileInfo}
            setFileInfo={setFileInfo}
            onSubmit={handleSubmit}
          />
        </div>
        <div>
          <EthereumSegment
            state={uploadStatus === 2}
            fileInfo={fileInfo}
            userEmail={session?.user?.email ?? null}
            onSuccess={handleBlockchainSuccess}
          />
        </div>
      </div>
    </>
  );
}
