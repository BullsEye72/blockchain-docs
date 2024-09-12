"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button, Header, Segment } from "semantic-ui-react";
import UserForm from "./UserForm";
import { useEffect, useState } from "react";

export default function AccountMenu() {
  const router = useRouter();
  const { data: session } = useSession();
  const [type, setType] = useState("");
  const [open, setOpen] = useState(false);

  const handleAccountClick = (type) => {
    setType(type);
    setOpen(true);
  };

  useEffect(() => {
    console.log({ open });
  }, [open]);

  if (session) {
    return (
      <>
        <p>
          Logged in as:
          <br /> {session.user?.email}
        </p>

        <Button as="a" onClick={() => signOut()}>
          Sign out
        </Button>
      </>
    );
  }

  return (
    <>
      <Button as="a" onClick={() => handleAccountClick("login")}>
        Log in
      </Button>
      <Button as="a" style={{ marginLeft: "0.5em" }} onClick={() => handleAccountClick("register")}>
        Sign Up
      </Button>
      <UserForm type={type} setOpen={setOpen} open={open} />
    </>
  );
}
