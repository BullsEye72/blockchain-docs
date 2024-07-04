"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button, Header, Segment } from "semantic-ui-react";

function AuthButton({ fixed }) {
  const router = useRouter();
  const { data: session } = useSession();

  if (session) {
    return (
      <>
        <p>
          Logged in as:
          <br /> {session.user?.email}
        </p>

        <Button as="a" inverted={!fixed} onClick={() => signOut()}>
          Sign out
        </Button>
      </>
    );
  }

  return (
    <>
      <Button as="a" inverted={!fixed} onClick={() => signIn()}>
        Log in
      </Button>
      <Button
        as="a"
        inverted={!fixed}
        primary={fixed}
        style={{ marginLeft: "0.5em" }}
        onClick={() => router.push("/register")}
      >
        Sign Up
      </Button>
    </>
  );
}

export default function NavMenu() {
  return (
    <>
      <AuthButton />
    </>
  );
}
