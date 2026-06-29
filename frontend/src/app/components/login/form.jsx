"use client";

import { signIn } from "next-auth/react";
import { useRef, useState } from "react";
import { Button, Form, FormField, Message, ModalContent, ModalActions, Divider } from "semantic-ui-react";

export default function LoginForm({ setOpen }) {
  const formRef = useRef(null);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleMagicLink = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/magic-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    setLoading(false);
    if (res.ok) {
      setSent(true);
    } else {
      setError("Une erreur est survenue. Réessayez.");
    }
  };

  return (
    <>
      <ModalContent>
        <Button
          fluid
          color="google plus"
          icon="google"
          content="Continuer avec Google"
          onClick={() => signIn("google", { callbackUrl: "/" })}
        />

        <Divider horizontal>ou</Divider>

        {sent ? (
          <Message positive>
            <Message.Header>Lien envoyé !</Message.Header>
            <p>Vérifiez votre boîte mail et cliquez sur le lien pour vous connecter.</p>
          </Message>
        ) : (
          <Form ref={formRef} onSubmit={handleMagicLink}>
            <Message negative hidden={!error}>{error}</Message>
            <FormField>
              <label>Adresse e-mail</label>
              <input
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </FormField>
            <Button fluid color="blue" loading={loading} disabled={loading}>
              Recevoir un lien de connexion
            </Button>
          </Form>
        )}
      </ModalContent>
      <ModalActions>
        <Button color="black" onClick={() => setOpen(false)}>
          Fermer
        </Button>
      </ModalActions>
    </>
  );
}
