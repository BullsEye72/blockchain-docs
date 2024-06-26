"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useEffect } from "react";

function AuthButton() {
  const { data: session } = useSession();

  useEffect(() => {
    console.log("Session", session);
  }, [session]);

  if (session) {
    return (
      <>
        {session.user?.name}
        <br />
        <button onClick={() => signOut()}>Sign out</button>
      </>
    );
  }

  return (
    <>
      Not signed in <br />
      <button onClick={() => signIn()}>Sign in</button>
      <button onClick={() => signIn()}>Register</button>
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
