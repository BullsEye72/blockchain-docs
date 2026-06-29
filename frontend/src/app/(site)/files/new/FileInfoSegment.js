import { useEffect, useMemo, useState, useTransition } from "react";
import { Button, List, ListItem, Segment, Header, Icon, Loader, Popup, Message } from "semantic-ui-react";
import { checkIfFileExistsOnDatabase } from "@/app/api/files/route";

const formatHash = (hash, size) => {
  if (!hash) return "";
  if (size * 2 + 3 > hash.length) return hash;
  if (size < 3) return hash;
  return hash.slice(0, size) + "..." + hash.slice(-size);
};

const calculateHash = async (file) => {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
};

export default function FileInfoSegment({ state, fileInfo, setFileInfo, onSubmit }) {
  const [isHashing, setIsHashing] = useState(false);
  const [existingRecord, setExistingRecord] = useState(null); // null = unknown, false = not found, object = found
  const [isSubmitting, startSubmitting] = useTransition();

  function handleSubmit() {
    startSubmitting(() => {
      onSubmit();
    });
  }

  useEffect(() => {
    if (!fileInfo.file || fileInfo.hash) return;

    const process = async () => {
      setIsHashing(true);
      setExistingRecord(null);

      const startTime = Date.now();
      const hash = await calculateHash(fileInfo.file);
      const processingTime = Date.now() - startTime;
      setFileInfo({ ...fileInfo, hash, processingTime });

      const existing = await checkIfFileExistsOnDatabase(hash);
      setExistingRecord(existing || false);

      setIsHashing(false);
    };

    process();
  }, [fileInfo]);

  const fileDateAndTimeText = useMemo(() => {
    if (fileInfo?.lastModified) {
      const date = new Date(fileInfo.lastModified);
      return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    }
    return "";
  }, [fileInfo]);

  const alreadyRegistered = existingRecord && existingRecord.transaction_hash;

  return (
    <Segment placeholder={!state}>
      {state ? (
        <>
          <Header>
            <Icon name="unlock alternate" />
            Votre fichier :
          </Header>
          {isHashing ? (
            <Segment>
              <Loader active inline />
              <p>Calcul et vérification en cours...</p>
            </Segment>
          ) : (
            <Segment textAlign="left">
              <List>
                <ListItem icon="file text" content={fileInfo.name} />
                <ListItem icon="calendar" content={fileDateAndTimeText} />
                <Popup
                  flowing
                  position="top center"
                  trigger={
                    <ListItem
                      icon="hashtag"
                      style={{ wordWrap: "anywhere" }}
                      content={<span className="interactive-text">{formatHash(fileInfo.hash, 10)}</span>}
                    />
                  }
                >
                  <Header as="h4">Code de vérification</Header>
                  <p>{fileInfo.hash}</p>
                </Popup>
                <ListItem icon="time" content={`Calculé en ${fileInfo.processingTime}ms`} />
              </List>

              {alreadyRegistered ? (
                <Message positive>
                  <Icon name="check circle" />
                  Ce fichier est déjà enregistré sur la blockchain.{" "}
                  <a
                    href={`https://sepolia.etherscan.io/tx/${existingRecord.transaction_hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Voir sur Etherscan
                  </a>
                </Message>
              ) : (
                <Button onClick={handleSubmit} primary loading={isSubmitting} disabled={!fileInfo.hash || isSubmitting}>
                  Sauvegarder sur la blockchain !
                </Button>
              )}
            </Segment>
          )}
        </>
      ) : (
        <Header icon>
          <Icon name="file text" />
          {"Veuillez choisir un fichier..."}
        </Header>
      )}
    </Segment>
  );
}
