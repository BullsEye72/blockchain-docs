"use client";

import React, { useEffect, useState } from "react";
import { Grid, GridRow, GridColumn, Message, Icon } from "semantic-ui-react";
import DismissibleMessage from "../../../components/DismissibleMessage";
import FileInfoSegment from "./FileInfoSegment";
import EthereumSegment from "./EthereumSegment";
import FileInput from "./FileInput";
import StripeForm from "@/app/stripe/Form";
import { checkCreditForFileUpload, getCreditCount, checkIfFileExistsOnBlockchain } from "@/app/(site)/files/actions";
import { connectToContract } from "@/app/(site)/files/new/EthereumSend";
import { storeFile } from "@/app/actions";
import { useSession } from "next-auth/react";

export default function FileSaver() {
  const { data: session } = useSession();
  const [fileInfo, setFileInfo] = useState({});
  const [errorMessage, setErrorMessage] = useState({ header: "", message: "", type: "" });
  const [stripeOpen, setStripeOpen] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(0);
  const [creditCount, setCreditCount] = useState(null);
  /*
    0 = waiting for file
    1 = file selected and hashed, ready to submit
    2 = ethereum process
  */

  useEffect(() => {
    if (session) {
      getCreditCount().then(setCreditCount);
    } else {
      setCreditCount(null);
    }
  }, [session]);

  useEffect(() => {
    if (fileInfo.status === "success" && fileInfo.hash === "") {
      setUploadStatus(1);
    } else if (fileInfo.status === "error") {
      setUploadStatus(0);
      setErrorMessage({ header: "Erreur", message: fileInfo.message, type: "error" });
    }
  }, [fileInfo]);

  const handleSubmit = async () => {
    // Step 1: verify the contract is reachable
    const connection = await connectToContract();
    if (!connection.success) {
      setErrorMessage({ header: "Erreur blockchain", message: "Impossible de se connecter au contrat. Réessayez dans quelques instants.", type: "error" });
      return;
    }

    // Step 2: check if already on-chain — free, no payment needed
    const { fileOwnerId } = await checkIfFileExistsOnBlockchain(fileInfo.hash, "");
    if (Number(fileOwnerId) !== 0) {
      setErrorMessage({ header: "Déjà enregistré", message: "Ce fichier est déjà présent sur la blockchain.", type: "warning" });
      return;
    }

    // Pre-save to DB so the Stripe webhook can link the file to the account
    try {
      await storeFile({ userId: session?.user?.id ?? null, hash: fileInfo.hash, name: fileInfo.name });
    } catch (e) {
      // Already in DB — fine, continue
    }

    if (session) {
      const creditCheck = await checkCreditForFileUpload();
      if (creditCheck.hasCredit) {
        setUploadStatus(2);
        return;
      }
    }
    setStripeOpen(true);
  };

  const handleStripeComplete = () => {
    setStripeOpen(false);
    setUploadStatus(2);
  };

  const handleBlockchainSuccess = () => {
    setCreditCount((c) => (c !== null && c > 0 ? c - 1 : c));
  };

  return (
    <>
      <StripeForm
        open={stripeOpen}
        onClose={() => setStripeOpen(false)}
        onComplete={handleStripeComplete}
        fileHash={fileInfo.hash}
        fileName={fileInfo.name}
      />

      {session && creditCount !== null && (
        <Message info style={{ marginTop: "1em" }}>
          <Icon name="database" />
          {creditCount > 0
            ? `${creditCount} enregistrement${creditCount > 1 ? "s" : ""} disponible${creditCount > 1 ? "s" : ""}`
            : "Aucun crédit disponible — un achat sera nécessaire"}
        </Message>
      )}

      <Grid columns={2} divided>
        {errorMessage.type !== "" && (
          <GridRow>
            <DismissibleMessage type={errorMessage.type} title={errorMessage.header} message={errorMessage.message} />
          </GridRow>
        )}

        <GridRow>
          <GridColumn>
            <FileInput state={uploadStatus === 0} setFileInfo={setFileInfo} />
            <FileInfoSegment
              state={uploadStatus >= 1}
              fileInfo={fileInfo}
              setFileInfo={setFileInfo}
              onSubmit={handleSubmit}
            />
          </GridColumn>
          <GridColumn>
            <EthereumSegment
              state={uploadStatus === 2}
              fileInfo={fileInfo}
              onSuccess={handleBlockchainSuccess}
            />
          </GridColumn>
        </GridRow>
      </Grid>
    </>
  );
}
