import { Container, Table, TableHeader, TableHeaderCell, TableRow, TableBody, Header } from "semantic-ui-react";
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
    <Container text>
      <Header as="h2">Vos Documents</Header>
      <p>Nombre total de documents : {files.length}</p>

      <Table celled striped>
        <TableHeader>
          <TableRow>
            <TableHeaderCell rowSpan="2" colSpan="3">
              Files
            </TableHeaderCell>
            <TableHeaderCell rowSpan="2" colSpan="1">
              Enregistrement DocuChain
            </TableHeaderCell>
            <TableHeaderCell colSpan="3">Enregistrement BlockChain</TableHeaderCell>
          </TableRow>
          <TableRow>
            <TableHeaderCell>Etat</TableHeaderCell>
            <TableHeaderCell>Date</TableHeaderCell>
            <TableHeaderCell>Etherscan</TableHeaderCell>
          </TableRow>
        </TableHeader>

        <TableBody>
          {files.map((file, index) => (
            <FileCard
              checkIfFileExistsOnBlockchain={checkIfFileExistsOnBlockchain}
              file={file}
              key={index}
              table={true}
            />
          ))}
        </TableBody>
      </Table>
    </Container>
  );
}

export default FilesPage;
