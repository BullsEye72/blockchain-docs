"use client";

import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Modal, ModalContent, ModalHeader } from "semantic-ui-react";

export default function StripeForm({ state, dispatch }) {
  const stripePromise = useMemo(() => loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY), []);

  useEffect(() => {
    console.log("🔎 StripeForm state: ", state);
    setOpen(state);
  }, [state]);

  const [open, setOpen] = useState(state);
  const [isComplete, setIsComplete] = useState(false);

  const fetchClientSecret = useCallback(async () => {
    const res = await fetch("/api/stripe", {
      method: "POST",
    });

    if (res.headers.get("Content-Type").includes("application/json")) {
      const data = await res.json();
      return data.clientSecret;
    } else {
      console.log("Error fetching client secret");
    }

    return "";
  }, [state]);

  const options = { fetchClientSecret };

  const handleClose = () => {
    console.log("Closing Stripe form");

    setOpen(false);

    dispatch({
      type: "SET_STRIPE_STATUS",
      payload: false,
    });
  };

  const handleOpen = () => {
    console.log("Opening Stripe form");
    setOpen(true);
  };

  const handleComplete = () => {
    console.log({ options });
    setIsComplete(true);

    setTimeout(() => {
      console.log("Closing Stripe form");
      state = false;
      setOpen(false);

      // dispatch({
      //   type: "SET_ETHEREUM_SEGMENT_STATUS",
      //   payload: true,
      // });
    }, 5000);
  };

  const embeddedCheckoutOptions = useMemo(
    () => ({
      ...options,
      onComplete: handleComplete,
    }),
    [options]
  );

  return (
    <Modal size="small" closeIcon open={open} onClose={handleClose} onOpen={handleOpen}>
      <ModalHeader>Stripe Payment</ModalHeader>
      <ModalContent scrolling>
        <EmbeddedCheckoutProvider stripe={stripePromise} options={embeddedCheckoutOptions}>
          <EmbeddedCheckout />
        </EmbeddedCheckoutProvider>
      </ModalContent>
    </Modal>
  );
}
