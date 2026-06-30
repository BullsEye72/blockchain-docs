import { getFiles } from "../../actions";
import FileCard from "../../components/FileCard";
import { checkIfFileExistsOnBlockchain } from "./actions";
import Link from "next/link";

async function getData() {
  try { return await getFiles(); }
  catch { return []; }
}

export default async function FilesPage() {
  const filesData = await getData();

  const files = filesData.map((f) => ({
    name: f.name,
    hash: f.hash,
    lastModified: f.lastModified ? new Date(f.lastModified).toLocaleDateString() : "—",
    transactionHash: f.transaction_hash,
    transactionLink: `${process.env.NEXT_PUBLIC_ETHERSCAN_URL || "https://etherscan.io"}/tx/${f.transaction_hash}`,
  }));

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Vos documents</h1>
          <p className="text-sm text-gray-500 mt-1">{files.length} document{files.length !== 1 ? "s" : ""} enregistré{files.length !== 1 ? "s" : ""}</p>
        </div>
        <Link
          href="/outil"
          className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Nouveau document
        </Link>
      </div>

      {files.length === 0 ? (
        <div className="text-center py-20 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
          <p className="mb-2">Aucun document enregistré.</p>
          <Link href="/outil" className="text-blue-600 hover:underline text-sm">Enregistrer mon premier document →</Link>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="py-3 px-4 text-left w-8" />
                <th className="py-3 px-4 text-left">Fichier</th>
                <th className="py-3 px-4 text-left">Empreinte</th>
                <th className="py-3 px-4 text-left">Déposé le</th>
                <th className="py-3 px-4 text-left">État</th>
                <th className="py-3 px-4 text-left">Date blockchain</th>
                <th className="py-3 px-4 text-left">Lien</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file, i) => (
                <FileCard
                  key={i}
                  file={file}
                  checkIfFileExistsOnBlockchain={checkIfFileExistsOnBlockchain}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
