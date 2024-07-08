import {
  Card,
  CardContent,
  CardHeader,
  CardMeta,
  CardDescription,
  Icon,
  List,
  CardGroup,
  ListItem,
  ListHeader,
  Popup,
  Container,
  DimmerDimmable,
  Dimmer,
  Header,
  Segment,
} from "semantic-ui-react";
import { useState, useRef } from "react";
import { checkIfFileExistsOnDatabase } from "../../api/files/route";

const crypto = require("crypto");

export default function FileChecker() {
  const [checkStatus, setCheckStatus] = useState(0); // 0 = idle, 1 = checking, 2 = file found, 3 = file not found, -1 = error
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileData, setFileData] = useState(null);
  const [fileHash, setFileHash] = useState("");
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
    // console.log("CHECKING FILE");

    // Get the files from the event
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
      setFileHash(checksum);
      // console.log("Checksum:", checksum);

      // Check if the file exists
      //const data = await getData();

      const fileExistsInDatabase = await checkIfFileExistsOnDatabase(checksum);
      // console.log({ fileExistsInDatabase });

      if (fileExistsInDatabase) {
        setCheckStatus(2); // file found
        setFileData({
          transaction_hash: fileExistsInDatabase.transaction_hash,
          lastmodified: fileExistsInDatabase.lastmodified,
        });
      } else {
        setCheckStatus(3); // file not found
        setFileData(null);
        setFileHash("No Hash");
      }
    };

    fileReader.readAsArrayBuffer(selectedFile);

    return;
  };

  const truncateHash = (hash = "") => {
    if (hash.length <= 12) return hash;
    return `${hash.substring(0, 6)}...${hash.substring(hash.length - 6)}`;
  };

  console.log({ checkStatus });

  return (
    <Card.Group centered>
      <Card
        ref={dropRef}
        onDrop={handleDrop}
        onDragLeave={handleDragLeave}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
      >
        <CardContent>
          <CardHeader>Vérifier si le fichier est connu</CardHeader>
          <CardMeta>
            <span className="date">{`Déposez un fichier ici pour vérifier s'il est déjà connu`}</span>
          </CardMeta>

          {checkStatus === 0 && (
            <CardDescription>
              <Icon name="clock outline" />
              {`En attente d'un fichier...`}
            </CardDescription>
          )}
          {checkStatus === 1 && (
            <CardDescription>
              <Icon name="spinner" />
              Calcul et vérification...
            </CardDescription>
          )}
          {checkStatus === 2 && (
            <CardDescription>
              <Icon name="check green" size="huge" />
              Fichier identifié !
            </CardDescription>
          )}
          {checkStatus === 3 && (
            <CardDescription>
              <Icon name="exclamation triangle" color="orange" />
              Fichier non trouvé
            </CardDescription>
          )}
        </CardContent>
      </Card>

      <DimmerDimmable as={Card} blurring dimmed={checkStatus !== 2}>
        <Dimmer inverted active={checkStatus !== 2}>
          <Header as="h2" icon>
            <Icon name="file " color="grey" />
          </Header>
        </Dimmer>

        <CardContent>
          <CardHeader>
            <Icon name="file" />
            Informations
          </CardHeader>
          <CardDescription>
            <List>
              <ListItem>
                <ListHeader>Code de vérification :</ListHeader>
                <Popup
                  trigger={
                    <Container>
                      {truncateHash(fileHash)}
                      <Icon
                        name="copy outline"
                        style={{ cursor: "pointer" }}
                        onClick={() => navigator.clipboard.writeText(fileHash)}
                      />
                    </Container>
                  }
                  content={fileHash}
                />
              </ListItem>

              <ListItem>
                <ListHeader>Transaction hash :</ListHeader>

                <Popup
                  trigger={
                    <Container>
                      {truncateHash(fileData?.transaction_hash)}
                      <Icon
                        name="copy outline"
                        style={{ cursor: "pointer" }}
                        onClick={() => navigator.clipboard.writeText(fileData.transaction_hash)}
                      />
                    </Container>
                  }
                  content={fileData?.transaction_hash}
                />
              </ListItem>

              {checkStatus === 2 && (
                <ListItem>
                  <a
                    href={`https://etherscan.io/tx/${fileData.transaction_hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Icon name="ethereum" color="teal" />
                    Vérifier sur Etherscan <Icon name="external alternate" size="small" />
                  </a>
                </ListItem>
              )}
            </List>
          </CardDescription>
        </CardContent>
      </DimmerDimmable>
    </Card.Group>
  );
}
