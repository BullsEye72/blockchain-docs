"use client";

import { redirect } from "next/navigation";
import { useEffect, useState } from "react";

export default function StripeReturn() {
  const [status, setStatus] = useState(null);
  const [customerEmail, setCustomerEmail] = useState("");

  useEffect(() => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const sessionId = urlParams.get("session_id");

    fetch(`/api/stripe/${sessionId}/`, {
      method: "GET",
    })
      .then((res) => res.json())
      .then((data) => {
        setStatus(data.status);
        setCustomerEmail(data.customer_email);
      });
  }, []);

  if (status == "open") {
    return redirect("/stripe");
  }

  if (status === "complete") {
    return (
      <section id="success">
        <p>
          We appreciate your business! A confirmation email will be sent to {customerEmail}. If you have any questions,
          please email <a href="mailto:orders@example.com">orders@example.com</a>.
        </p>
      </section>
    );
  }

  return (
    <div>
      <h1>Stripe Return</h1>
    </div>
  );
}
