"use client";

import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import UserForm from "./UserForm";

export default function Account() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  if (session) {
    return (
      <div className="flex items-center gap-3 text-sm">
        <span className="text-slate-400 hidden sm:block truncate max-w-[160px]">{session.user?.email}</span>
        <button
          onClick={() => signOut()}
          className="px-3 py-1.5 rounded border border-slate-600 hover:bg-slate-700 transition-colors text-sm"
        >
          Déconnexion
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 transition-colors text-sm font-medium text-white"
      >
        Se connecter
      </button>
      <UserForm open={open} setOpen={setOpen} />
    </>
  );
}
