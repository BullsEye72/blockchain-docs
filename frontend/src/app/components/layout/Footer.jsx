import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-2">
          <p className="font-semibold text-white text-base mb-2">DocuChain</p>
          <p className="text-sm leading-relaxed">
            Certification de documents par la blockchain Ethereum. Immuable, vérifiable, décentralisé.
          </p>
        </div>

        <div>
          <p className="font-semibold text-white text-sm mb-3">Produit</p>
          <ul className="space-y-2 text-sm">
            <li><Link href="/outil" className="hover:text-white transition-colors">Outil de vérification</Link></li>
            <li><Link href="/comment-ca-marche" className="hover:text-white transition-colors">Comment ça marche</Link></li>
            <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
          </ul>
        </div>

        <div>
          <p className="font-semibold text-white text-sm mb-3">Compte</p>
          <ul className="space-y-2 text-sm">
            <li><Link href="/files" className="hover:text-white transition-colors">Mes fichiers</Link></li>
            <li><Link href="/outil" className="hover:text-white transition-colors">Enregistrer un document</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-800 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} DocuChain. Tous droits réservés.
      </div>
    </footer>
  );
}
