"use client";

import { signOut, useSession } from "next-auth/react";
import { Button } from "semantic-ui-react";
import UserForm from "./UserForm";
import { useState } from "react";

export default function AccountMenu() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  if (session) {
    return (
      <>
        <p>
          Connecté en tant que :
          <br /> {session.user?.email}
        </p>
        <Button as="a" onClick={() => signOut()}>
          Se déconnecter
        </Button>
      </>
    );
  }

  return (
    <>
      <Button as="a" onClick={() => setOpen(true)}>
        Se connecter
      </Button>
      <UserForm setOpen={setOpen} open={open} />
    </>
  );
}
