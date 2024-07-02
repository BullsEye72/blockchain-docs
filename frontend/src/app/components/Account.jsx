"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button, Header, Segment } from "semantic-ui-react";

function AuthButton() {
  const router = useRouter();
  const { data: session } = useSession();

  if (session) {
    return (
      <Segment textAlign="center">
        <Header as="h3">
          Logged in as:
          <br /> {session.user?.email}
        </Header>
        <Button color="red" onClick={() => signOut()}>
          Sign out
        </Button>
      </Segment>
    );
  }

  return (
    <Segment textAlign="center">
      <Header as="h3">Not signed in</Header>
      <Button primary onClick={() => signIn()}>
        Sign in
      </Button>
      <Button secondary onClick={() => router.push("/register")}>
        Register
      </Button>
    </Segment>
  );
}

export default function NavMenu() {
  return (
    <>
      <AuthButton />
    </>
  );
}
