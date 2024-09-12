"use client";

import { signIn } from "next-auth/react";
import React, { useRef, useState } from "react";
import {
  FormField,
  Button,
  Checkbox,
  Form,
  Card,
  CardContent,
  Message,
  CardHeader,
  ModalContent,
  ModalActions,
} from "semantic-ui-react";

export default function RegisterForm({ setOpen }) {
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const formRef = useRef(null);

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
    <>
      <ModalContent>
        <Form ref={formRef} onSubmit={handleSubmit}>
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
        </Form>
      </ModalContent>
      <ModalActions>
        <Button color="black" onClick={() => setOpen(false)}>
          Annuler
        </Button>
        <Button
          color="blue"
          onClick={() =>
            formRef.current && formRef.current.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }))
          }
        >
          Register
        </Button>
      </ModalActions>
    </>
  );
}
