"use client";

import React, { useReducer, useEffect, useState } from "react";
import { Grid, GridRow, GridColumn } from "semantic-ui-react";
import DismissibleMessage from "../../../components/DismissibleMessage";
import FileInfoSegment from "./FileInfoSegment";
import EthereumSegment from "./EthereumSegment";

import FileInput from "./FileInput";
import StripeForm from "@/app/stripe/Form";

import { useSession } from "next-auth/react";

const UPLOAD_SEGMENT_COLOR = "blue";

const initialState = {
  fileInputCanUpload: true,
  file: null,
  fileInfo: null,
  message: {
    text: "",
    title: "Empty message",
    type: null,
  },
  isProcessing: false,
  uploadSegmentColor: UPLOAD_SEGMENT_COLOR,
  ethereumTransactionStatus: null,
  ethereumContractStatus: null,
  stripeStatus: false,
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_FILE_INPUT_CAN_UPLOAD":
      return { ...state, fileInputCanUpload: action.payload };
    case "SET_FILE":
      return { ...state, file: action.payload };
    case "SET_FILE_INFO":
      return { ...state, fileInfo: action.payload };
    case "SET_MESSAGE":
      return { ...state, message: action.payload };
    case "SET_MESSAGE_TITLE":
      return { ...state, messageTitle: action.payload };
    case "SET_MESSAGE_TYPE":
      return { ...state, messageType: action.payload };
    case "SET_PROCESSING":
      return { ...state, isProcessing: action.payload };
    case "SET_UPLOAD_SEGMENT_COLOR":
      return { ...state, uploadSegmentColor: action.payload };
    case "SET_ETHEREUM_SEGMENT_STATUS":
      return { ...state, ethereumSegmentStatus: action.payload };
    case "SET_ETHEREUM_CONTRACT_STATUS":
      return { ...state, ethereumContractStatus: action.payload };
    case "SET_ETHEREUM_TRANSACTION_STATUS":
      return { ...state, ethereumTransactionStatus: action.payload };
    case "SET_STRIPE_STATUS":
      return { ...state, stripeStatus: action.payload };
    default:
      return state;
  }
}

export default function FileSaver({ params }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [fileInfo, setFileInfo] = useState({});
  const [errorMessage, setErrorMessage] = useState({ header: "", message: "", type: "" });
  const [stripeState, setStripeState] = useState(false);
  const [waitingForStripe, setWaitingForStripe] = useState(false); // State to track waiting status
  const [stripeTransactionReceived, setStripeTransactionReceived] = useState(false); // State to track Stripe transaction
  const [ethereumSegmentStatus, setEthereumSegmentStatus] = useState(false);

  const [uploadStatus, setUploadStatus] = useState(0);
  /*
    0 = waiting for file (show file upload)
    1 = file hashed (show file info and submit)
    2 = payment and credit checking
    3 = ethereum process
    -1 = error
  */

  const { data: session, status } = useSession();
  const [newValue, setNewValue] = useState("");

  const updateSession = async () => {
    const res = await fetch("/api/update-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ newValue }),
    });

    if (res.ok) {
      const updatedSession = await res.json();
      console.log("🔐 Updated session", updatedSession);
    } else {
      console.log("🔐 Error updating session", res.statusText);
    }
  };

  // Progress to the next step when the file info is available
  useEffect(() => {
    console.log("📁 File Info change : ", fileInfo);
    if (fileInfo.status === "success" && fileInfo.hash === "") {
      console.log("📁 File Info change : Starting File Info Segment!");
      setUploadStatus(1);
    } else if (fileInfo.status === "success" && fileInfo.hash !== "") {
      console.log("📁 File Info change : Enabling credit check and upload!");
      setErrorMessage({ header: "Stripe", message: "Attente de la confirmation de la transaction...", type: "info" });
      setWaitingForStripe(true); // Start waiting for Stripe transaction
      //setUploadStatus(2);
    } else if (fileInfo.status === "error") {
      console.log("📁 File Info change : Error?");
      setUploadStatus(0);
      setErrorMessage({ header: "File error", message: fileInfo.message, type: "error" });
    } else {
      console.log("📁 File Info change : Nothing is happening...", fileInfo);
    }
  }, [fileInfo]);

  // Simulate receiving a Stripe transaction event after 5 seconds
  // useEffect(() => {
  //   if (waitingForStripe) {
  //     const timer = setTimeout(() => {
  //       console.log("💳 Stripe transaction received!");
  //       setStripeTransactionReceived(true);
  //       setWaitingForStripe(false);
  //       setUploadStatus(3); // Move to the next step
  //     }, 5000); // Simulate a 5-second wait

  //     return () => clearTimeout(timer); // Cleanup the timer
  //   }
  // }, [waitingForStripe]);

  // Prevent the default behavior of the browser when a file is dragged over the window
  useEffect(() => {
    const preventDefault = (event) => event.preventDefault();

    window.addEventListener("dragover", preventDefault);
    window.addEventListener("drop", preventDefault);

    return () => {
      window.removeEventListener("dragover", preventDefault);
      window.removeEventListener("drop", preventDefault);
    };
  }, []);

  return (
    <>
      <p>Status : {uploadStatus}</p>
      <p>stripeState : {stripeState}</p>
      <p>Ethereum Status : {state.ethereumSegmentStatus}</p>

      <StripeForm state={stripeState} setFileInfo={setFileInfo} />
      <Grid columns={2} divided>
        <p>{errorMessage.type}</p>
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
              setStripeState={setStripeState}
            />
          </GridColumn>
          <GridColumn>
            <GridRow>
              {ethereumSegmentStatus ? (
                <EthereumSegment
                  params={params}
                  fileInfo={state.fileInfo}
                  dispatch={dispatch}
                  state={ethereumSegmentStatus}
                />
              ) : (
                <EthereumSegment state={false} />
              )}
            </GridRow>
          </GridColumn>
        </GridRow>
      </Grid>
    </>
  );
}
