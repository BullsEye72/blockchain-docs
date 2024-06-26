import { getSession } from "next-auth/react";
import Form from "./form";
import { redirect } from "next/navigation";

export default async function RegisterPage() {
  const session = await getSession();

  if (session) {
    redirect("/");
  }

  return (
    <>
      <h1>Register</h1>
      <Form />
    </>
  );
}
