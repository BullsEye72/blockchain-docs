"use client";

import Link from "next/link";
import { Fingerprint, Coins, BadgeCheck, Scale, Paintbrush, Building, Search, Save, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-slate-900 text-white text-center py-24 px-4">
        <h1 className="text-5xl font-light tracking-tight mb-4">DocuChain</h1>
        <p className="text-xl text-slate-300 mb-3">La preuve d'existence immuable pour vos documents</p>
        <p className="text-slate-400 mb-8">Vérifiez gratuitement. Enregistrez pour 1&nbsp;€.</p>
        <Link href="/outil">
          <button className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-medium text-base transition-colors">
            Essayer maintenant <ArrowRight size={16} />
          </button>
        </Link>
      </section>

      {/* How it works */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-light text-center mb-12">Comment ça marche</h2>
          <div className="grid sm:grid-cols-3 gap-10 text-center">
            <div>
              <Fingerprint className="mx-auto mb-4 text-blue-600" size={48} strokeWidth={1.5} />
              <h3 className="font-semibold mb-2">1. Empreinte numérique</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Déposez votre fichier. Une empreinte SHA-256 unique est calculée dans votre navigateur —
                votre fichier ne quitte jamais votre ordinateur.
              </p>
            </div>
            <div>
              <Coins className="mx-auto mb-4 text-purple-600" size={48} strokeWidth={1.5} />
              <h3 className="font-semibold mb-2">2. Inscription blockchain</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Pour 1&nbsp;€, l'empreinte est inscrite de façon permanente sur Ethereum. La date et
                l'heure sont certifiées par le réseau décentralisé.
              </p>
            </div>
            <div>
              <BadgeCheck className="mx-auto mb-4 text-green-600" size={48} strokeWidth={1.5} />
              <h3 className="font-semibold mb-2">3. Preuve immuable</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Vous disposez d'une preuve publiquement vérifiable, à tout moment et par n'importe qui,
                sans dépendre d'un intermédiaire.
              </p>
            </div>
          </div>
          <div className="text-center mt-10">
            <Link href="/comment-ca-marche" className="text-sm text-blue-600 hover:underline inline-flex items-center gap-1">
              En savoir plus <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="bg-gray-50 py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-light text-center mb-12">Pour qui ?</h2>
          <div className="grid sm:grid-cols-3 gap-8">
            <div>
              <Scale className="text-gray-400 mb-3" size={28} strokeWidth={1.5} />
              <h4 className="font-semibold mb-1">Professions juridiques</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                Datez vos contrats, actes et correspondances importantes sans dépendre d'un huissier ou d'un service tiers.
              </p>
            </div>
            <div>
              <Paintbrush className="text-gray-400 mb-3" size={28} strokeWidth={1.5} />
              <h4 className="font-semibold mb-1">Créateurs</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                Prouvez l'antériorité de vos œuvres : code source, photographies, compositions musicales, designs.
              </p>
            </div>
            <div>
              <Building className="text-gray-400 mb-3" size={28} strokeWidth={1.5} />
              <h4 className="font-semibold mb-1">Entreprises</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                Certifiez vos devis, cahiers des charges et livrables pour sécuriser vos relations commerciales.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-light mb-10">Tarifs simples</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-xl p-6">
              <Search className="mx-auto mb-3 text-gray-400" size={28} strokeWidth={1.5} />
              <h3 className="font-semibold mb-1">Vérification</h3>
              <p className="text-3xl font-bold my-3">Gratuit</p>
              <p className="text-sm text-gray-500">Vérifiez si un fichier est déjà enregistré sur la blockchain.</p>
            </div>
            <div className="border-2 border-blue-600 rounded-xl p-6 bg-blue-50">
              <Save className="mx-auto mb-3 text-blue-600" size={28} strokeWidth={1.5} />
              <h3 className="font-semibold mb-1 text-blue-900">Enregistrement</h3>
              <p className="text-3xl font-bold my-3 text-blue-700">1&nbsp;€</p>
              <p className="text-sm text-blue-700/70">Inscrivez l'empreinte de votre fichier sur Ethereum pour toujours.</p>
            </div>
          </div>
          <div className="mt-8">
            <Link href="/outil">
              <button className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg font-medium transition-colors">
                Commencer <ArrowRight size={15} />
              </button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
