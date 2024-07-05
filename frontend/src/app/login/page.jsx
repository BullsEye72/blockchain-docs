import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Form from "./form";
import { Container, Header, Segment } from "semantic-ui-react";

export default async function LoginPage() {
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
