"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormField, Button, Checkbox, Form, Card, CardContent } from "semantic-ui-react";

export default function LoginForm() {
  const router = useRouter();

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const response = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });

    if (response && !response.error) {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <Card>
      <CardContent>
        <Form onSubmit={handleSubmit}>
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
