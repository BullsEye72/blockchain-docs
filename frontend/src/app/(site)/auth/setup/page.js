"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Container, Header, Icon, Segment, Loader } from "semantic-ui-react";

export default function SetupPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [status, setStatus] = useState("loading"); // loading | success | error | missing

  useEffect(() => {
    if (!token) {
      setStatus("missing");
      return;
    }

    signIn("magic-link", { token, redirect: false }).then((result) => {
      if (result?.ok) {
        setStatus("success");
        setTimeout(() => router.push("/files"), 2000);
      } else {
        setStatus("error");
      }
    });
  }, [token]);

  return (
    <Container text style={{ marginTop: "4em" }}>
      <Segment padded="very" textAlign="center">
        {status === "loading" && (
          <>
            <Loader active inline />
            <Header as="h2" style={{ marginTop: "1em" }}>Vérification en cours...</Header>
          </>
        )}
        {status === "success" && (
          <>
            <Icon name="check circle" color="green" size="huge" />
            <Header as="h2">Compte activé !</Header>
            <p>Redirection vers vos fichiers...</p>
          </>
        )}
        {status === "error" && (
          <>
            <Icon name="times circle" color="red" size="huge" />
            <Header as="h2">Lien invalide ou expiré</Header>
            <p>Ce lien a déjà été utilisé ou a expiré (validité 24h). Effectuez un nouvel achat pour recevoir un nouveau lien.</p>
          </>
        )}
        {status === "missing" && (
          <>
            <Icon name="question circle" color="grey" size="huge" />
            <Header as="h2">Lien manquant</Header>
            <p>Aucun token trouvé dans l&apos;URL.</p>
          </>
        )}
      </Segment>
    </Container>
  );
}
