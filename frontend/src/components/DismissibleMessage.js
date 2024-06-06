import React, { useEffect, useState } from "react";
import { Message } from "semantic-ui-react";

export default function DismissibleMessage({ type, message, title }) {
  const [visibleState, setVisibleState] = useState(false);
  const [messageType, setMessageType] = useState("info");

  const handleDismiss = () => {
    setVisibleState(false);
  };

  useEffect(() => {
    setVisibleState(true);

    let newStatus;
    if (type === "success") {
      newStatus = "positive";
    } else if (type === "error") {
      newStatus = "negative";
    } else {
      newStatus = "info";
    }

    setMessageType(newStatus);
  }, [type, message, title]);

  if (visibleState) {
    return (
      <Message
        onDismiss={handleDismiss}
        header={title}
        content={message}
        positive={messageType === "positive"}
        negative={messageType === "negative"}
        info={messageType === "info"}
      />
    );
  }

  return <></>;
}
