"use client";

import { useState } from "react";
import { Button, ButtonGroup, ButtonOr, Icon, Grid, GridRow, GridColumn } from "semantic-ui-react";
import FileChecker from "./FileChecker";
import FileUploaderCard from "./FileUploader";
import FileForm from "@/app/files/new/page";

export default function FileCardSelector() {
  const [cardType, setCardType] = useState("FileChecker");
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

      {checkFileMode ? (
        <FileChecker />
      ) : (
        <GridRow centered columns={1}>
          <FileForm />
        </GridRow>
      )}
    </Grid>
  );
}
