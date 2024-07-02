import Form from "./form";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

export default async function RegisterPage() {
  const session = await getServerSession();

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
