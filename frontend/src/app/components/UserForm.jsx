"use client";

import { Modal, ModalHeader, Icon } from "semantic-ui-react";
import LoginForm from "./login/form";

export default function UserForm({ setOpen, open }) {
  return (
    <Modal size="tiny" onClose={() => setOpen(false)} onOpen={() => setOpen(true)} open={open}>
      <ModalHeader>
        <Icon name="user" />
        Connexion
      </ModalHeader>
      <LoginForm setOpen={setOpen} />
    </Modal>
  );
}
