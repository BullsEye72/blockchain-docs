"use client";

import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useCallback, useMemo, useState } from "react";
import { X } from "lucide-react";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function StripeForm({ open, onClose, onComplete, fileHash, fileName, userEmail }) {
  const [isComplete, setIsComplete] = useState(false);

  const fetchClientSecret = useCallback(async () => {
    const res = await fetch("/api/stripe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileHash, fileName, userEmail }),
    });
    const data = await res.json();
    return data.clientSecret;
  }, [fileHash, fileName, userEmail]);

  const handleComplete = () => {
    setIsComplete(true);
    setTimeout(onComplete, 2000);
  };

  const options = useMemo(
    () => ({ fetchClientSecret, onComplete: handleComplete }),
    [fetchClientSecret]
  );

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="bg-white rounded-xl shadow-xl w-full max-w-md">
          <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100">
            <DialogTitle className="font-semibold text-gray-900">Paiement sécurisé</DialogTitle>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
          </div>
          <div className="p-5">
            {isComplete ? (
              <p className="text-center py-6 text-green-700 font-medium">
                ✅ Paiement confirmé ! Enregistrement sur la blockchain en cours…
              </p>
            ) : (
              <EmbeddedCheckoutProvider stripe={stripePromise} options={options}>
                <EmbeddedCheckout />
              </EmbeddedCheckoutProvider>
            )}
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
