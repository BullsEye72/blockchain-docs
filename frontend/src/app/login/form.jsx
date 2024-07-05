"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormField, Button, Checkbox, Form, Card, CardContent, Message, CardHeader } from "semantic-ui-react";

export default function LoginForm() {
  const router = useRouter();

  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");

    const formData = new FormData(event.currentTarget);

    const response = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });

    console.log({ response });

    if (response && !response.error) {
      router.push("/");
      router.refresh();
    } else {
      setErrorMessage(response.error || "An unknown error occurred");
    }
  };

  return (
    <Card>
      <CardContent>
        <CardHeader>Login</CardHeader>
        <Form onSubmit={handleSubmit}>
          <Message negative hidden={!errorMessage}>
            {errorMessage}
          </Message>
          <FormField>
            <label>E-Mail</label>
            <input placeholder="address e-mail" type="text" name="email" />
          </FormField>
          <FormField>
            <label>Mot de passe</label>
            <input type="password" placeholder="" name="password" />
          </FormField>

          <Button type="submit">Login</Button>
        </Form>
      </CardContent>
    </Card>
  );
}
