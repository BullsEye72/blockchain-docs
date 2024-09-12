"use client";

import { Header } from "semantic-ui-react";
import { useEffect } from "react";

export default function Page() {
  // Prevent the default behavior of the browser when a file is dragged over the window
  useEffect(() => {
    const preventDefault = (event) => event.preventDefault();

    window.addEventListener("dragover", preventDefault);
    window.addEventListener("drop", preventDefault);

    return () => {
      window.removeEventListener("dragover", preventDefault);
      window.removeEventListener("drop", preventDefault);
    };
  });

  try {
    return <Header as="h2">Accueil</Header>;
  } catch (error) {
    console.error("Error in Page:", error);
    throw error;
  }
}
