"use client";

import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useCallback, useMemo, useState } from "react";
import { Modal, ModalContent, ModalHeader } from "semantic-ui-react";

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
    setTimeout(() => {
      onComplete();
    }, 2000);
  };

  const embeddedCheckoutOptions = useMemo(
    () => ({ fetchClientSecret, onComplete: handleComplete }),
    [fetchClientSecret]
  );

  return (
    <Modal size="small" closeIcon open={open} onClose={onClose}>
      <ModalHeader>Paiement sécurisé</ModalHeader>
      <ModalContent scrolling>
        {isComplete ? (
          <p style={{ textAlign: "center", padding: "2em" }}>
            ✅ Paiement confirmé ! Enregistrement sur la blockchain en cours...
          </p>
        ) : (
          <EmbeddedCheckoutProvider stripe={stripePromise} options={embeddedCheckoutOptions}>
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        )}
      </ModalContent>
    </Modal>
  );
}
