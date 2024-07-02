"use client";

import { signIn } from "next-auth/react";
import React, { useState } from "react";
import { FormField, Button, Checkbox, Form, Card, CardContent, Message } from "semantic-ui-react";

export default function RegisterForm() {
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    const formData = new FormData(event.target);

    const response = await fetch("/api/register", {
      method: "POST",
      body: JSON.stringify({
        email: formData.get("email"),
        password: formData.get("password"),
        confirmPassword: formData.get("confirmPassword"),
        agreeToTerms: agreeToTerms,
      }),
    });

    if (!response.ok) {
      // Registration failed
      const errorData = await response.json();

      setErrorMessage(errorData.error || "An unknown error occurred");
    } else {
      // Registration successful
      await signIn("credentials", {
        email: formData.get("email"),
        password: formData.get("password"),
        redirect: true,
        callbackUrl: "/",
      });
    }

    setIsSubmitting(false);
  };

  return (
    <Card>
      <CardContent>
        <Form onSubmit={handleSubmit}>
          <Message negative hidden={!errorMessage}>
            {errorMessage}
          </Message>
          <FormField>
            <label>E-Mail</label>
            <input aria-label="Mot de passe" placeholder="address e-mail" type="text" name="email" />
          </FormField>
          <FormField>
            <label>Mot de passe</label>
            <input type="password" placeholder="" name="password" />
          </FormField>
          <FormField>
            <label>Confirmation du mot de passe</label>
            <input type="password" placeholder="" name="confirmPassword" />
          </FormField>
          <FormField>
            <Checkbox
              label="I agree to the Terms and Conditions"
              checked={agreeToTerms}
              onChange={(e, { checked }) => setAgreeToTerms(checked)}
            />
          </FormField>
          <Button type="submit" disabled={isSubmitting}>
            Register
          </Button>
        </Form>
      </CardContent>
    </Card>
  );
}
