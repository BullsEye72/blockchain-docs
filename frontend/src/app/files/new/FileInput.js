import { Button, Segment, Header, Icon, Form, FormField } from "semantic-ui-react";
import { useRef, useState } from "react";
import { hashFile } from "@/app/hash";

export default function FileInput({ state, dispatch }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const dropRef = useRef();

  const handleDrop = (event) => {
    event.preventDefault();
    handleFileChange(event);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    if (dropRef.current.contains(event.relatedTarget)) return;
    setIsDragOver(false);
  };

  const handleDragEnter = (event) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleFileChange = async (event) => {
    if (state.fileInputStatus == false) return;
    const selectedFile = event.target.files?.[0] || event.dataTransfer.files[0];

    dispatch({ type: "SET_FILE_INFO", payload: null });
    dispatch({ type: "SET_MESSAGE", payload: { text: "", title: "", type: null } });

    // Check file size (500mb limit)
    const fileSizeLimit = 512 * 1024 * 1024; // 500mb in bytes
    if (selectedFile.size > fileSizeLimit) {
      console.error("File size limit exceeded");
      dispatch({
        type: "SET_MESSAGE",
        payload: {
          text: "The file size exceeds the limit of 1gb",
          title: "File size limit exceeded",
          type: "error",
        },
      });
      return;
    }

    dispatch({ type: "SET_PROCESSING", payload: true });
    dispatch({ type: "SET_UPLOAD_SEGMENT_COLOR", payload: "blue" });
    dispatch({ type: "SET_FILE", payload: selectedFile });

    let fileInfo = {
      name: selectedFile.name,
      lastModified: selectedFile.lastModified,
      hash: null,
    };
    dispatch({ type: "SET_FILE_INFO", payload: fileInfo });

    // Read the file and calculate the hash
    const startTime = Date.now();
    const fileReader = new FileReader();
    const fileArrayBuffer = await new Promise((resolve) => {
      fileReader.onload = () => resolve(fileReader.result);
      fileReader.readAsArrayBuffer(selectedFile);
    });
    const fileByteArray = new Uint8Array(fileArrayBuffer);
    const endTime = Date.now();
    const processingTime = endTime - startTime;
    console.log("Processing time: ", processingTime, "ms");

    hashFile(fileByteArray, selectedFile.name)
      .then((result) => {
        fileInfo.hash = result.hash;
        fileInfo.processingTime = result.processingTime;
        dispatch({ type: "SET_FILE_INFO", payload: fileInfo });
      })
      .finally(() => {
        dispatch({ type: "SET_PROCESSING", payload: false });
      });
  };

  return (
    <Segment
      disabled={!state.fileInputCanUpload}
      ref={dropRef}
      onDrop={handleDrop}
      onDragLeave={handleDragLeave}
      onDragEnter={handleDragEnter}
    >
      <Header as="h2">
        <Icon name="upload" />
        Upload your file here
      </Header>
      <Form>
        <FormField>
          <Button
            className={isDragOver ? state.uploadSegmentColor : ""}
            size="huge"
            as="label"
            htmlFor="fileInput"
            content="Choose File"
            disabled={state.isProcessing}
          />
          <input
            type="file"
            id="fileInput"
            onChange={handleFileChange}
            name="fileInput"
            className="border border-gray-300 p-2"
            style={{ display: "none" }}
            disabled={!state.fileInputCanUpload}
          />
        </FormField>
      </Form>
    </Segment>
  );
}
