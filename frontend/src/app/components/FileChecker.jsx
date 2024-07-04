import {
  Card,
  CardContent,
  CardHeader,
  CardMeta,
  CardDescription,
  Icon,
  List,
  Segment,
  Container,
} from "semantic-ui-react";
import { useState, useRef, useEffect } from "react";
import { checkIfFileExistsOnDatabase } from "../api/files/route";
import { useSession } from "next-auth/react";

const crypto = require("crypto");

export default function FileChecker() {
  const { data: session, status } = useSession();
  console.log("Session:", session, "Status:", status);

  const [files, setFiles] = useState([]);
  const [checkStatus, setCheckStatus] = useState(0); // 0 = idle, 1 = checking, 2 = file found, 3 = file not found, -1 = error
  const [isDragOver, setIsDragOver] = useState(false);
  const dropRef = useRef();

  const handleDrop = (event) => {
    event.preventDefault();
    handleFileCheck(event);
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

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleFileCheck = async (event) => {
    console.log("CHECKING FILE");

    // Get the files from the event
    const files = event.dataTransfer.files;

    const selectedFile = event.target.files?.[0] || event.dataTransfer.files[0];

    // Calculate the hash of the file
    const fileReader = new FileReader();
    fileReader.onload = async () => {
      setCheckStatus(1); // checking
      const arrayBuffer = fileReader.result;
      const buffer = Buffer.from(new Uint8Array(arrayBuffer));
      const hash = crypto.createHash("sha256");
      hash.update(buffer);
      const checksum = hash.digest("hex");
      console.log("Checksum:", checksum);

      // Check if the file exists
      //const data = await getData();

      const fileExistsInDatabase = await checkIfFileExistsOnDatabase(checksum);

      if (fileExistsInDatabase) {
        setCheckStatus(2); // file found
      } else {
        setCheckStatus(3); // file not found
      }
    };

    fileReader.readAsArrayBuffer(selectedFile);

    return;
  };

  return (
    <Segment style={{ padding: "8em 0em" }} vertical>
      <Container text>
        <Card
          ref={dropRef}
          onDrop={handleDrop}
          onDragLeave={handleDragLeave}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
        >
          <CardContent>
            <CardHeader>Check if file exists</CardHeader>
            <CardMeta>
              <span className="date">Drop a file here to check if it is already known</span>
            </CardMeta>

            {checkStatus === 0 && (
              <CardDescription>
                <Icon name="clock outline" />
                Waiting for file...
              </CardDescription>
            )}
            {checkStatus === 1 && (
              <CardDescription>
                <Icon name="spinner" />
                Checking...
              </CardDescription>
            )}
            {checkStatus === 2 && (
              <CardDescription>
                <Icon name="check" color="green" />
                File found
              </CardDescription>
            )}
            {checkStatus === 3 && (
              <CardDescription>
                <Icon name="exclamation triangle" color="orange" />
                File not found
              </CardDescription>
            )}
          </CardContent>
          <CardContent extra>
            {checkStatus === 2 ? (
              <a>
                <Icon name="ethereum" color="teal" />
                Check on etherscan
              </a>
            ) : (
              <a>
                <Icon name="plus" color="blue" />
                Ajouter un nouveau fichier sur la blockchain !
              </a>
            )}
          </CardContent>
          {checkStatus === 2 && (
            <CardContent extra>
              <List>
                <List.Item>
                  <Icon name="file" />
                  <List.Header>File details</List.Header>
                  <List.Content>
                    <List.Description>File name: </List.Description>
                    <List.Description>Owner: </List.Description>
                    <List.Description>Transaction hash: </List.Description>
                  </List.Content>
                </List.Item>
              </List>
            </CardContent>
          )}
        </Card>
      </Container>
    </Segment>
  );
}
