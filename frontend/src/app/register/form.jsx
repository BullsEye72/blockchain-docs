"use client";

import React from "react";
import { FormField, Button, Checkbox, Form, Card, CardContent } from "semantic-ui-react";

export default function RegisterForm() {
  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const response = await fetch("/api/register", {
      method: "POST",
      body: JSON.stringify({
        email: formData.get("email"),
        password: formData.get("password"),
      }),
    });
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
          <FormField>
            <Checkbox label="I agree to the Terms and Conditions" />
          </FormField>
          <Button type="submit">Register</Button>
        </Form>
      </CardContent>
    </Card>
  );
}
