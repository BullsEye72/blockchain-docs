"use client";

import { useEffect } from "react";
import { Button, Message, MessageHeader } from "semantic-ui-react";

export default function FileError({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Message negative>
      <MessageHeader>Something went wrong!</MessageHeader>
      <p>{error.message}</p>
      <Button onClick={() => reset()} color="red">
        Try again
      </Button>
    </Message>
  );
}
