import { Grid, GridColumn, Card, CardContent, CardGroup, Icon, Segment, Container } from "semantic-ui-react";
import Link from "next/link";
import { getFiles } from "../actions";
import FileCard from "../components/FileCard";
import { getServerSession } from "next-auth";
import { checkIfFileExistsOnBlockchain } from "./actions";

// function waitForEvent() {
//   return new Promise((resolve, reject) => {
//     storageContract.on("FileAdded", (fileHash, blockNumber, timestamp, event) => {
//       console.log("FileAdded event : ", fileHash, blockNumber, timestamp);
//       resolve({ fileHash, blockNumber, timestamp });
//     });
//   });
// }

async function getData() {
  try {
    const res = await getFiles();

    if (!res.ok) {
      throw new Error("Failed to fetch data", res.status, res.statusText);
    }
    return res.json();
  } catch (error) {
    console.error("Error fetching data:", error);
    throw new Error("Failed to fetch data", error.message);
    return [];
  }
}

async function FilesPage() {
  const session = await getServerSession();

  const filesData = await getData();

  let files = [];

  for (let fileData of filesData) {
    files.push({
      //File Data
      name: fileData.name,
      hash: fileData.hash,
      owner: fileData.id_user,
      lastModified: new Date(fileData.lastModified).toLocaleDateString(),
      transactionHash: fileData.transaction_hash,
      transactionTimestamp: new Date(Date.now()).toLocaleDateString(),
      transactionLink: `https://sepolia.etherscan.io/tx/${fileData.transaction_hash}`,
      cardColor: "gray",
    });
  }

  return (
    <Segment style={{ padding: "4em 0em" }} vertical>
      <Container text>
        <h2>Files for user : {session?.user?.email}</h2>
        <p>Total Files: {files.length}</p>

        <CardGroup itemsPerRow={3} stackable>
          {/* <Card as={Link} href={`/files/new`} className="add-new-file">
            <CardContent textAlign="center">
              <Grid centered columns={1} style={{ height: "100%" }}>
                <GridColumn verticalAlign="middle">
                  <Icon name="add circle" size="huge" />
                </GridColumn>
              </Grid>
            </CardContent>
          </Card> */}
          {files.map((file, index) => (
            <FileCard checkIfFileExistsOnBlockchain={checkIfFileExistsOnBlockchain} file={file} key={index} />
          ))}
        </CardGroup>
      </Container>
    </Segment>
  );
}

export default FilesPage;
