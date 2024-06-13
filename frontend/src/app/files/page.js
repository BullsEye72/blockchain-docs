"use client";

import { useEffect, useState } from "react";
import { Grid, GridColumn, GridRow } from "semantic-ui-react";
import FileChecker from "./FileChecker";

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
    return (
      <>
        <h1>Accueil</h1>
        <Grid>
          <GridRow centered columns={3}>
            <GridColumn>
              <FileChecker />
            </GridColumn>
          </GridRow>
        </Grid>
      </>
    );
  } catch (error) {
    console.error("Error in Page:", error);
    throw error;
  }
}
