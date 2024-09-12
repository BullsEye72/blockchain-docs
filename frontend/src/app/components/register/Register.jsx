import Form from "./form";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { Segment } from "semantic-ui-react";

export default async function RegisterPage() {
  const session = await getServerSession();

  if (session) {
    redirect("/");
  }

  return (
    <Segment>
      <Form />
    </Segment>
  );
}
