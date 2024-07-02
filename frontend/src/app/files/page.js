import { Grid, GridColumn, Card, CardContent, CardGroup, Icon } from "semantic-ui-react";
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

// async function testEvents() {
//   console.log("adding file... ");
//   const newFile = await contractWithSigner.storeFile("ABCDEFGHIJKLMNOP", 23);
//   // console.log("new file : ", newFile);
//   console.log("file added at address : ", newFile.hash);

//   const listener = async (fileHash, blockNumber, timestamp, event) => {
//     console.log("FileAdded event : ", fileHash, blockNumber, timestamp);
//     console.log("Transaction Hash : ", event.log.transactionHash);
//     contractWithSigner.off("FileAdded", listener);

// try {
//   const url = `https://api-sepolia.etherscan.io/api?module=block&action=getblockcountdown&blockno=${blockNumber}&apikey=${process.env.ETHERSCAN_API_KEY}`;
//   const res = await fetch(url);
//   const data = await res.json();

//   if (data.status !== "1") {
//     console.log("Etherscan API response :", data.result);
//   } else {
//     console.log("EstimateTimeInSec:", data.result.EstimateTimeInSec);
//     const estimateTimeInSec = data.result.EstimateTimeInSec;
//     const convertedEstimateTime = new Date(Date.now() + estimateTimeInSec * 1000);
//     let countDownSeconds = estimateTimeInSec;

//     const countDown = setInterval(() => {
//       console.log("Countdown :", countDownSeconds);
//       countDownSeconds--;

//       if (countDownSeconds <= 0) {
//         clearInterval(countDown);
//       }
//     }, 1000);
//   }
// } catch (err) {
//   console.error(err);
// }
// };

//   contractWithSigner.on("FileAdded", listener);
// }

async function FilesPage({ params }) {
  const session = await getServerSession();

  // if (!session) {
  //   redirect("/");
  // }

  // File data from the database
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

      //Card Data
      // EthStatus: userId !== 0 ? 1 : 0,
      // cardColor: userId !== 0 ? "green" : "red",
    });
  }

  return (
    <>
      <h2>Files for user : {session?.user?.email}</h2>
      <p>Total Files: {files.length}</p>

      <CardGroup itemsPerRow={4} stackable>
        <Card as={Link} href={`/files/new`} className="add-new-file">
          <CardContent textAlign="center">
            <Grid centered columns={1} style={{ height: "100%" }}>
              <GridColumn verticalAlign="middle">
                <Icon name="add circle" size="huge" />
              </GridColumn>
            </Grid>
          </CardContent>
        </Card>
        {files.map((file, index) => (
          <FileCard checkIfFileExistsOnBlockchain={checkIfFileExistsOnBlockchain} file={file} key={index} />
        ))}
      </CardGroup>
    </>
  );
}

export default FilesPage;
