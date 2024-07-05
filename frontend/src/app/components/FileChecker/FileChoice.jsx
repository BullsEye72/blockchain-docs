"use client";

import { useState } from "react";
import { Button, Icon, Grid, GridRow, Container } from "semantic-ui-react";
import FileChecker from "./FileChecker";

import FileForm from "@/app/files/new/page";

export default function FileCardSelector() {
  const [checkFileMode, setCheckFileMode] = useState(true);

  const handleClick = (e) => {
    setCheckFileMode(!checkFileMode);
  };

  return (
    <Grid>
      <GridRow centered columns={2}>
        <Button toggle active={checkFileMode} onClick={handleClick} size="huge" attached="left">
          <Icon name="search" />
          Vérifier mon fichier
        </Button>

        <Button toggle active={!checkFileMode} onClick={handleClick} size="huge" attached="right">
          <Icon name="save" />
          Enregister mon fichier
        </Button>
      </GridRow>
      <Container text style={{ border: "1px solid red" }}>
        {checkFileMode ? <FileChecker /> : <FileForm />}
      </Container>
    </Grid>
  );
}
