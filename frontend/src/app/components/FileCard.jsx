"use client";

import { useEffect, useState } from "react";
import { FileText, CheckCircle2, XCircle, Loader2, ExternalLink } from "lucide-react";
import Link from "next/link";

const ETHERSCAN_URL = process.env.NEXT_PUBLIC_ETHERSCAN_URL || "https://etherscan.io";

const truncate = (hash = "") => (hash.length <= 12 ? hash : `${hash.slice(0, 6)}…${hash.slice(-6)}`);

export default function FileCard({ file, checkIfFileExistsOnBlockchain }) {
  const [ethStatus, setEthStatus] = useState(0); // 0=loading, 1=found, -1=notfound
  const [txTimestamp, setTxTimestamp] = useState(null);

  useEffect(() => {
    async function check() {
      setEthStatus(0);
      const { fileOwnerId, transactionTimestamp } = await checkIfFileExistsOnBlockchain(file.hash, file.transactionHash);
      if (Number(fileOwnerId) === 0) { setEthStatus(-1); return; }
      setEthStatus(1);
      setTxTimestamp(new Date(transactionTimestamp).toLocaleDateString());
    }
    check();
  }, [file, checkIfFileExistsOnBlockchain]);

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 text-sm">
      <td className="py-3 px-4">
        <FileText size={16} className={ethStatus === 1 ? "text-green-500" : ethStatus === -1 ? "text-red-400" : "text-gray-300"} />
      </td>
      <td className="py-3 px-4 font-medium text-gray-900 max-w-[200px] truncate">{file.name}</td>
      <td className="py-3 px-4 font-mono text-xs text-gray-400" title={file.hash}>{truncate(file.hash)}</td>
      <td className="py-3 px-4 text-gray-500">{file.lastModified}</td>

      {ethStatus === 0 && (
        <>
          <td className="py-3 px-4"><Loader2 size={14} className="animate-spin text-gray-400" /></td>
          <td className="py-3 px-4 text-gray-400 text-xs">Vérification…</td>
          <td />
        </>
      )}
      {ethStatus === 1 && (
        <>
          <td className="py-3 px-4"><CheckCircle2 size={16} className="text-green-500" /></td>
          <td className="py-3 px-4 text-gray-500">{txTimestamp}</td>
          <td className="py-3 px-4">
            <Link
              href={file.transactionLink}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-600 hover:underline text-xs"
            >
              Etherscan <ExternalLink size={11} />
            </Link>
          </td>
        </>
      )}
      {ethStatus === -1 && (
        <>
          <td className="py-3 px-4"><XCircle size={16} className="text-red-400" /></td>
          <td className="py-3 px-4 text-red-400 text-xs" colSpan={2}>Non trouvé sur la blockchain</td>
        </>
      )}
    </tr>
  );
}
