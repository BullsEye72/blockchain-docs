"use client";

import { Fingerprint, Coins, BadgeCheck, Clock, Lock, HelpCircle, Terminal } from "lucide-react";

export default function CommentCaMarchePage() {
  return (
    <>
      <section className="bg-slate-900 text-white text-center py-16 px-4">
        <h1 className="text-4xl font-light mb-3">Comment ça marche</h1>
        <p className="text-slate-400">La technologie derrière DocuChain, expliquée simplement.</p>
      </section>

      <div className="max-w-3xl mx-auto px-4 divide-y divide-gray-100">

        <section className="py-12">
          <div className="flex items-center gap-3 mb-4">
            <Fingerprint className="text-blue-600 shrink-0" size={28} strokeWidth={1.5} />
            <h2 className="text-2xl font-light">L'empreinte SHA-256</h2>
          </div>
          <p className="text-gray-700 leading-relaxed mb-4">
            Lorsque vous déposez un fichier, DocuChain calcule son <strong>empreinte numérique</strong> (aussi
            appelée <em>hash</em>) en utilisant l'algorithme SHA-256. Cette empreinte est une chaîne de 64
            caractères hexadécimaux, unique à ce fichier exact.
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
            Si vous modifiez un seul octet du fichier — même un espace invisible — l'empreinte sera
            complètement différente. À l'inverse, deux copies identiques produisent toujours la même empreinte.
          </p>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 font-mono text-xs text-gray-600 break-all mb-4">
            6272b9adbe6923c74c4073f4cc0a5ae83<br/>8cd0710f4ff67ddce896aa419768...
            <p className="font-sans text-gray-400 mt-2 text-xs">Exemple d'empreinte SHA-256 (64 caractères)</p>
          </div>
          <p className="text-gray-700 leading-relaxed">
            <strong>Votre fichier ne quitte jamais votre ordinateur.</strong> L'empreinte est calculée
            entièrement dans votre navigateur. Ce que nous transmettons à la blockchain, c'est uniquement
            cette empreinte — pas le fichier lui-même.
          </p>
        </section>

        <section className="py-12">
          <div className="flex items-center gap-3 mb-4">
            <Coins className="text-purple-600 shrink-0" size={28} strokeWidth={1.5} />
            <h2 className="text-2xl font-light">La blockchain Ethereum</h2>
          </div>
          <p className="text-gray-700 leading-relaxed mb-4">
            Ethereum est un réseau décentralisé de milliers de machines dans le monde entier. Chaque
            transaction est inscrite dans un <strong>bloc</strong>, ajouté à une chaîne immuable.
          </p>
          <p className="text-gray-700 leading-relaxed mb-6">
            Lorsque vous enregistrez un fichier, nous envoyons une transaction contenant votre empreinte
            à notre contrat intelligent (<em>smart contract</em>) déployé sur Ethereum.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="text-green-600" size={16} />
                <span className="font-medium text-sm">Horodatage certifié</span>
              </div>
              <p className="text-sm text-gray-600">
                Le bloc contient un <em>timestamp</em> validé par consensus. La date et l'heure
                sont certifiées par le réseau entier — personne ne peut les falsifier.
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="text-blue-600" size={16} />
                <span className="font-medium text-sm">Immuabilité</span>
              </div>
              <p className="text-sm text-gray-600">
                Une fois inscrit dans la blockchain, un enregistrement ne peut plus être modifié ni
                supprimé. La preuve est permanente et indépendante de tout serveur central.
              </p>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="flex items-center gap-3 mb-4">
            <BadgeCheck className="text-green-600 shrink-0" size={28} strokeWidth={1.5} />
            <h2 className="text-2xl font-light">Ce que prouve l'enregistrement</h2>
          </div>
          <p className="text-gray-700 leading-relaxed mb-4">
            Un enregistrement DocuChain apporte la preuve que <strong>ce fichier exact existait avant
            le timestamp de la transaction</strong>.
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 text-sm mb-6">
            <li>Le fichier existait avant la date de la transaction blockchain.</li>
            <li>Le contenu n'a pas été modifié depuis l'enregistrement.</li>
            <li>Cette preuve est vérifiable publiquement par n'importe qui, sans passer par DocuChain.</li>
          </ul>
          <h3 className="font-semibold mb-2 text-gray-800">Ce que ça ne prouve pas</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-500 text-sm">
            <li>L'identité de l'auteur (la transaction est signée par notre portefeuille applicatif).</li>
            <li>La propriété intellectuelle ou les droits associés au contenu.</li>
          </ul>
        </section>

        <section className="py-12">
          <div className="flex items-center gap-3 mb-4">
            <Terminal className="text-gray-600 shrink-0" size={28} strokeWidth={1.5} />
            <h2 className="text-2xl font-light">Vérifier l'empreinte localement</h2>
          </div>
          <p className="text-gray-700 leading-relaxed mb-6">
            Vous pouvez calculer l'empreinte SHA-256 de n'importe quel fichier avec les outils
            intégrés à votre système d'exploitation, sans installer quoi que ce soit. Le résultat
            doit correspondre exactement à celui affiché par DocuChain.
          </p>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1.5">Windows — PowerShell</p>
              <div className="bg-gray-900 rounded-lg px-4 py-3 font-mono text-sm text-green-400 overflow-x-auto whitespace-nowrap">
                Get-FileHash &quot;C:\chemin\vers\fichier.pdf&quot; -Algorithm SHA256
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1.5">Linux — Bash</p>
              <div className="bg-gray-900 rounded-lg px-4 py-3 font-mono text-sm text-green-400 overflow-x-auto whitespace-nowrap">
                sha256sum /chemin/vers/fichier.pdf
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1.5">macOS — Terminal</p>
              <div className="bg-gray-900 rounded-lg px-4 py-3 font-mono text-sm text-green-400 overflow-x-auto whitespace-nowrap">
                shasum -a 256 /chemin/vers/fichier.pdf
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-5">
            Comparez la valeur obtenue avec l'empreinte affichée dans DocuChain ou inscrite dans la
            transaction Ethereum. Si elles correspondent, l'intégrité du fichier est confirmée.
          </p>
        </section>

        <section className="py-12">
          <div className="flex items-center gap-3 mb-6">
            <HelpCircle className="text-gray-400 shrink-0" size={28} strokeWidth={1.5} />
            <h2 className="text-2xl font-light">Questions fréquentes</h2>
          </div>
          <div className="space-y-6">
            {[
              {
                q: "Mon fichier est-il stocké quelque part ?",
                a: "Non. Seule l'empreinte SHA-256 est transmise et enregistrée. Votre fichier ne quitte jamais votre navigateur.",
              },
              {
                q: "Comment vérifier l'enregistrement moi-même ?",
                a: "Chaque enregistrement produit une transaction Ethereum visible publiquement sur un explorateur comme Etherscan. Vous pouvez y accéder depuis votre tableau de bord.",
              },
              {
                q: "Que se passe-t-il si DocuChain disparaît ?",
                a: "La preuve reste sur la blockchain Ethereum indépendamment de DocuChain. Tant qu'Ethereum existe, votre enregistrement est accessible et vérifiable manuellement.",
              },
              {
                q: "Quelle est la valeur légale de cet enregistrement ?",
                a: "La valeur juridique varie selon les pays et les contextes. DocuChain fournit une preuve technique robuste d'antériorité. Pour une portée légale spécifique, consultez un professionnel du droit.",
              },
            ].map(({ q, a }) => (
              <div key={q}>
                <p className="font-medium text-gray-900 mb-1">{q}</p>
                <p className="text-sm text-gray-600 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </section>

      </div>
    </>
  );
}
