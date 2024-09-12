"use client";

import { useEffect, useState } from "react";
import { Button, Icon, Modal, ModalActions, ModalContent, ModalHeader } from "semantic-ui-react";
import RegisterForm from "./register/form";
import LoginForm from "./login/form";

/**
 * A component that allows the user to enter their information, for login or registration.
 * Uses a semantic ui modal to display the form.
 */
export default function UserForm({ type, setOpen, open }) {
  useEffect(() => {
    console.log({ type });
    setOpen(true);
  }, [type]);

  return (
    <Modal size="tiny" onClose={() => setOpen(false)} onOpen={() => setOpen(true)} open={open}>
      <ModalHeader>
        <Icon name="user" />
        Entrez vos informations
      </ModalHeader>
      {type === "login" ? <LoginForm setOpen={setOpen} /> : <RegisterForm setOpen={setOpen} />}
    </Modal>
  );
}
