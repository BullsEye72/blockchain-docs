import { hashFile } from "@/app/hash";
import { useEffect, useMemo, useState, useTransition } from "react";
import { Button, List, ListItem, Segment, Header, Icon, Loader, Popup } from "semantic-ui-react";
import { checkCreditForFileUpload } from "../actions";

const formatHash = (hash, size) => {
  if (size * 2 + 3 > hash.length) return hash;
  if (size < 3) return hash;
  return hash.slice(0, size) + "..." + hash.slice(-size);
};

export default function FileInfoSegment({ state, fileInfo, setFileInfo, setStripeState }) {
  const [isHashing, setIsHashing] = useState(false);
  const [processMessage, setProcessMessage] = useState("Waiting for file upload...");
  const [isSubmitting, startSubmitting] = useTransition();

  function handleSubmit() {
    startSubmitting(async () => {
      const canSubmit = await checkCreditForFileUpload();
      if (canSubmit.success) {
        if (canSubmit.hasCredit) {
          console.log("🚀 Ready to upload the file to the blockchain!");
        } else {
          console.log("❌ Not enough credit to submit the file to the blockchain!");
          setStripeState(true);
        }
        setFileInfo({ ...fileInfo, status: "success", hasCredit: canSubmit.hasCredit });
      } else {
        console.log("❌ Error submitting the file to the blockchain!");
        setFileInfo({ ...fileInfo, status: "error", message: canSubmit.message });
      }
    });
  }

  useEffect(() => {
    if (!fileInfo.file) return;

    const hashFile = async (file) => {
      if (fileInfo.name === file.name && fileInfo.hash !== "") return;

      // Read the file and calculate the hash
      setIsHashing(true);

      const { hash, processingTime } = await calculateHash(fileInfo.file);
      console.log("🔐 Hash: ", hash);

      setFileInfo({ ...fileInfo, hash, processingTime });

      setIsHashing(false);
    };
    hashFile(fileInfo);
  }, [fileInfo]);

  /**
   * Calculates the hash of a file.
   *
   * @param {File} file - The file to calculate the hash for.
   * @returns {Promise<void>} - A promise that resolves when the hash calculation is complete.
   */
  const calculateHash = async function (file) {
    setProcessMessage("🛠️ Starting the hashing!");
    const startTime = Date.now();
    const fileReader = new FileReader();
    const fileArrayBuffer = await new Promise((resolve) => {
      fileReader.onload = () => resolve(fileReader.result);
      fileReader.readAsArrayBuffer(file);
    });
    const fileByteArray = new Uint8Array(fileArrayBuffer);
    console.log("🛠️ byte array created, sending to server !");
    const result = await hashFile(fileByteArray, file.name);

    const endTime = Date.now();
    const processingTime = endTime - startTime;
    console.log("⌚ Processing time: ", processingTime, "ms");

    return { hash: result.hash, processingTime };
  };

  const fileDateAndTimeText = useMemo(() => {
    if (fileInfo) {
      const date = new Date(fileInfo.lastModified);
      return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    }
    return "";
  }, [fileInfo]);

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
              <Loader active inline />{" "}
              <p>
                Envoi et calcul du code de vérification en cours! <br />
                Votre fichier ne sera pas conservé à la fin de ce processus.
              </p>
            </Segment>
          ) : (
            <Segment textAlign="left">
              <List>
                <ListItem icon="file text" content={fileInfo.name} />
                <ListItem icon="calendar" content={fileDateAndTimeText} />

                <Popup
                  flowing
                  position={"top center"}
                  trigger={
                    <ListItem
                      icon="hashtag"
                      style={{ wordWrap: "anywhere" }}
                      content={<span className="interactive-text">${formatHash(fileInfo.hash, 10)}</span>}
                    />
                  }
                >
                  <Header as="h4">Code de vérification</Header>
                  <p>{fileInfo.hash}</p>
                </Popup>

                <ListItem icon="time" content={`Calculé en ${fileInfo.processingTime}ms`} />
              </List>

              <Button onClick={handleSubmit} primary>
                Sauvegarder sur la blockchain !
              </Button>
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
