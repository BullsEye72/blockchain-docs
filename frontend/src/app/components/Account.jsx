"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

function AuthButton() {
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    console.log("Session", session);
  }, [session]);

  if (session) {
    return (
      <>
        Logged in as : {session.user?.email}
        <br />
        <button onClick={() => signOut()}>Sign out</button>
      </>
    );
  }

  return (
    <>
      Not signed in <br />
      <button onClick={() => signIn()}>Sign in</button>
      <button onClick={() => router.push("/register")}>Register</button>
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
