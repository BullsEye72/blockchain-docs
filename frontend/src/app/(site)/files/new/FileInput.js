import { Button, Segment, Header, Icon, Form, FormField, Dimmer, Loader } from "semantic-ui-react";
import { useRef, useState } from "react";
import { hashFile } from "@/app/hash";

/**
 * Checks if the file size is within the limit (500mb limit)
 * @param {*} file
 * @returns
 */
const checkFileSize = function (file) {
  const fileSizeLimit = 512 * 1024 * 1024; // 500mb in bytes
  if (file.size > fileSizeLimit) {
    console.error("File size limit exceeded");
    // dispatch({
    //   type: "SET_MESSAGE",
    //   payload: {
    //     text: "The file size exceeds the limit of 1gb",
    //     title: "File size limit exceeded",
    //     type: "error",
    //   },
    // });
    return false;
  }

  return true;
};

export default function FileInput({ state, setFileInfo }) {
  const [buttonColor, setButtonColor] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);

  const [canUseFileInput, setCanUseFileInput] = useState(true);
  const dropRef = useRef();

  const handleDrop = (event) => {
    event.preventDefault();
    handleFileChange(event);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();

    if (dropRef.current.contains(event.relatedTarget)) return; // Prevent drag leave when hovering over children
    setButtonColor("");
    setIsDragOver(false);
  };

  const handleDragEnter = (event) => {
    event.preventDefault();
    setButtonColor("blue");
    setIsDragOver(true);
  };

  const handleFileChange = async (event) => {
    const selectedFile = event.target.files?.[0] || event.dataTransfer.files[0];
    const fileSizeIsCorrect = checkFileSize(selectedFile);

    if (fileSizeIsCorrect === false) {
      setFileInfo({ status: "error", message: "The file size exceeds the limit of 500mb" });
      return;
    }

    // Update the file info
    setFileInfo({
      status: "success",
      message: "File selected",
      name: selectedFile.name,
      lastModified: selectedFile.lastModified,
      hash: "",
      processingTime: "",
      file: selectedFile,
    });

    setButtonColor("green");
  };

  return (
    <Segment
      disabled={!state}
      ref={dropRef}
      onDrop={handleDrop}
      onDragLeave={handleDragLeave}
      onDragEnter={handleDragEnter}
    >
      <Form>
        <FormField>
          <Button className={buttonColor} size="huge" as="label" htmlFor="fileInput" disabled={!state}>
            <Icon name="cloud upload" />
            Glissez & Déposez ou <u>Cliquez ici</u> pour sélectionner un fichier
          </Button>
          <input
            type="file"
            id="fileInput"
            onChange={handleFileChange}
            name="fileInput"
            className="border border-gray-300 p-2"
            style={{ display: "none" }}
            disabled={!state}
          />
        </FormField>
      </Form>
    </Segment>
  );
}
