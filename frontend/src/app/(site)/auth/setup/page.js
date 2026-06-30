"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { CheckCircle2, XCircle, HelpCircle, Loader2 } from "lucide-react";

export default function SetupPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    if (!token) { setStatus("missing"); return; }
    signIn("magic-link", { token, redirect: false }).then((result) => {
      if (result?.ok) { setStatus("success"); setTimeout(() => router.push("/files"), 2000); }
      else setStatus("error");
    });
  }, [token]);

  const states = {
    loading: { Icon: Loader2, spin: true, color: "text-blue-500", title: "Vérification en cours…", msg: "" },
    success: { Icon: CheckCircle2, spin: false, color: "text-green-500", title: "Compte activé !", msg: "Redirection vers vos fichiers…" },
    error: { Icon: XCircle, spin: false, color: "text-red-500", title: "Lien invalide ou expiré", msg: "Ce lien a déjà été utilisé ou a expiré (validité 24h). Effectuez un nouvel achat pour recevoir un nouveau lien." },
    missing: { Icon: HelpCircle, spin: false, color: "text-gray-400", title: "Lien manquant", msg: "Aucun token trouvé dans l'URL." },
  };

  const { Icon, spin, color, title, msg } = states[status] ?? states.loading;

  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      <Icon className={`mx-auto mb-4 ${color} ${spin ? "animate-spin" : ""}`} size={48} strokeWidth={1.5} />
      <h2 className="text-xl font-semibold text-gray-900 mb-2">{title}</h2>
      {msg && <p className="text-sm text-gray-500">{msg}</p>}
    </div>
  );
}
