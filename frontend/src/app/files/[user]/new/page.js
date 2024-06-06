"use client";

import React, { useReducer, useEffect, useRef } from "react";

import { FormInput, Button, Form, FormField, Segment, Header, Icon, Checkbox } from "semantic-ui-react";
import { Dimmer, Loader } from "semantic-ui-react";
import DismissibleMessage from "../../../../components/DismissibleMessage";
import FileInfoSegment from "./FileInfoSegment";
import EthereumSegment from "./EthereumSegment";

import FileInput from "./FileInput";

const UPLOAD_SEGMENT_COLOR = "blue";

const initialState = {
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
};

function reducer(state, action) {
  switch (action.type) {
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
    case "SET_ETHEREUM_TRANSACTION_STATUS":
      return { ...state, ethereumTransactionStatus: action.payload };
    default:
      return state;
  }
}

export default function FileForm() {
  const [state, dispatch] = useReducer(reducer, initialState);

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

  return (
    <>
      {state.message.type && (
        <DismissibleMessage type={state.message.type} title={state.message.title} message={state.message.text} />
      )}

      <FileInput state={state} dispatch={dispatch} />

      <Segment disabled={!state.fileInfo}>
        <Header as="h2">
          <Icon name="file text" />
          File Information
        </Header>

        {state.fileInfo ? (
          state.fileInfo.hash ? (
            <FileInfoSegment fileInfo={state.fileInfo} file={state.file} dispatch={dispatch} />
          ) : (
            <Dimmer active inverted>
              <Loader inverted>Loading</Loader>
            </Dimmer>
          )
        ) : (
          <FileInfoSegment fileInfo={null} />
        )}
      </Segment>

      {state.ethereumTransactionStatus ? (
        <EthereumSegment state={state.ethereumTransactionStatus} />
      ) : (
        <EthereumSegment state={false} />
      )}
    </>
  );
}
