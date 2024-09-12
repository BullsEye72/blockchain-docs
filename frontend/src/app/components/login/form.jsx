"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { FormField, Button, Form, Message, ModalContent, ModalActions } from "semantic-ui-react";

export default function LoginForm({ setOpen }) {
  const router = useRouter();
  const formRef = useRef(null);

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
      setOpen(false);
      router.push("/");
      router.refresh();
    } else {
      setErrorMessage(response.error || "An unknown error occurred");
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      formRef.current.requestSubmit();
    }
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
            <input placeholder="address e-mail" type="text" name="email" onKeyDown={handleKeyDown} />
          </FormField>
          <FormField>
            <label>Mot de passe</label>
            <input type="password" placeholder="" name="password" onKeyDown={handleKeyDown} />
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
          Login
        </Button>
      </ModalActions>
    </>
  );
}
