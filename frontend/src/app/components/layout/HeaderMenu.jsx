"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import Account from "../Account";

export default function HeaderMenu() {
  const { data: session } = useSession();

  return (
    <nav className="bg-slate-900 text-white">
      <div className="max-w-6xl mx-auto px-4 flex items-center h-14 gap-6">
        <Link href="/" className="font-semibold text-lg tracking-tight text-white hover:text-blue-300 transition-colors">
          DocuChain
        </Link>

        <div className="flex items-center gap-1 text-sm flex-1">
          <Link href="/outil" className="px-3 py-1.5 rounded hover:bg-slate-700 transition-colors">Outil</Link>
          <Link href="/comment-ca-marche" className="px-3 py-1.5 rounded hover:bg-slate-700 transition-colors">Comment ça marche</Link>
          <Link href="/blog" className="px-3 py-1.5 rounded hover:bg-slate-700 transition-colors">Blog</Link>
          {session && (
            <Link href="/files" className="px-3 py-1.5 rounded hover:bg-slate-700 transition-colors">Mes fichiers</Link>
          )}
        </div>

        <Account />
      </div>
    </nav>
  );
}
