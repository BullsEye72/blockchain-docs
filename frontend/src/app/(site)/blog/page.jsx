"use client";

import { Fingerprint, Coins, Scale } from "lucide-react";

const articles = [
  {
    title: "Qu'est-ce qu'une empreinte SHA-256 ?",
    date: "Juin 2025",
    description:
      "L'algorithme SHA-256 produit une empreinte unique de 64 caractères pour n'importe quel fichier. Comprendre son fonctionnement, c'est comprendre pourquoi il est impossible de falsifier une preuve DocuChain.",
    Icon: Fingerprint,
    iconColor: "text-blue-500",
  },
  {
    title: "Blockchain et preuve d'existence : comment ça marche vraiment ?",
    date: "Mai 2025",
    description:
      "La blockchain n'est pas qu'un buzzword : c'est un registre distribué où chaque entrée est vérifiable et immuable. On vous explique ce que cela signifie concrètement pour la certification de vos documents.",
    Icon: Coins,
    iconColor: "text-purple-500",
  },
  {
    title: "5 cas d'usage concrets pour les professions juridiques",
    date: "Avril 2025",
    description:
      "Des contrats aux correspondances importantes, la preuve d'antériorité a de nombreuses applications pour les avocats, notaires et juristes d'entreprise. Tour d'horizon des situations où DocuChain peut faire la différence.",
    Icon: Scale,
    iconColor: "text-gray-400",
  },
];

export default function BlogPage() {
  return (
    <>
      <section className="bg-slate-900 text-white text-center py-16 px-4">
        <h1 className="text-4xl font-light mb-3">Blog</h1>
        <p className="text-slate-400">Blockchain, certification de documents et cas d'usage.</p>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto grid sm:grid-cols-3 gap-6">
          {articles.map((article) => (
            <div key={article.title} className="border border-gray-200 rounded-xl p-6 flex flex-col hover:shadow-md transition-shadow">
              <article.Icon className={`mb-4 ${article.iconColor}`} size={28} strokeWidth={1.5} />
              <p className="text-xs text-gray-400 mb-2">{article.date}</p>
              <h2 className="font-semibold text-gray-900 mb-3 leading-snug">{article.title}</h2>
              <p className="text-sm text-gray-600 leading-relaxed flex-1">{article.description}</p>
              <p className="text-xs text-gray-400 mt-4">Bientôt disponible</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
