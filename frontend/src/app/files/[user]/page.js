import { ethers, InfuraProvider } from "ethers";
import FileStorageContract from "../../../contracts/FileStorage";
import {
  Grid,
  GridColumn,
  Card,
  CardHeader,
  CardContent,
  CardMeta,
  CardDescription,
  CardGroup,
  Icon,
} from "semantic-ui-react";
import Link from "next/link";

const provider = new InfuraProvider("sepolia", process.env.INFURA_API_KEY);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const storageContract = new ethers.Contract(
  process.env.FILES_STORAGE_CONTRACT_ADDRESS,
  FileStorageContract.abi,
  provider
);

const contractWithSigner = storageContract.connect(signer);

// function waitForEvent() {
//   return new Promise((resolve, reject) => {
//     storageContract.on("FileAdded", (fileHash, blockNumber, timestamp, event) => {
//       console.log("FileAdded event : ", fileHash, blockNumber, timestamp);
//       resolve({ fileHash, blockNumber, timestamp });
//     });
//   });
// }

async function getData(userId) {
  if (!userId) {
    throw new Error("No user ID provided");
  }

  try {
    const res = await fetch(`http://localhost:3000/api/files/${userId}`);

    if (!res.ok) {
      throw new Error("Failed to fetch data");
    }
    return res.json();
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
}

async function testEvents() {
  console.log("adding file... ");
  const newFile = await contractWithSigner.storeFile("ABCDEFGHIJKLMNOP", 23);
  // console.log("new file : ", newFile);
  console.log("file added at address : ", newFile.hash);

  const listener = async (fileHash, blockNumber, timestamp, event) => {
    console.log("FileAdded event : ", fileHash, blockNumber, timestamp);
    console.log("Transaction Hash : ", event.log.transactionHash);
    contractWithSigner.off("FileAdded", listener);

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
  };

  contractWithSigner.on("FileAdded", listener);
}

async function checkIfFileExistsOnBlockchain(fileHash) {
  const fileAddress = await storageContract.files(fileHash);
  return fileAddress;
}

async function FilesPage({ params }) {
  // testEvents();

  const userId = params.user;

  // File data from the database
  const filesData = await getData(userId);

  let files = [];
  for (let fileData of filesData) {
    const userIdFromBlockChain = await checkIfFileExistsOnBlockchain(fileData.hash);
    const userId = Number(userIdFromBlockChain);

    files.push({
      //File Data
      name: fileData.name,
      hash: fileData.hash,
      owner: fileData.id_user,
      lastModified: new Date(fileData.lastModified).toLocaleDateString(),
      transactionTimestamp: new Date(Date.now()).toLocaleDateString(),
      transactionLink: `https://sepolia.etherscan.io/address/${fileData.transaction_hash}`,

      //Card Data
      EthStatus: userId !== 0 ? 1 : 0,
      cardColor: userId !== 0 ? "green" : "red",
    });
  }

  return (
    <>
      <h2>Files for user ID : {params.user}</h2>

      <CardGroup itemsPerRow={4} stackable>
        {files.map((file, index) => (
          <Card color={file.cardColor} key={index} className="mb-4">
            <CardContent>
              <CardHeader>File Details</CardHeader>
              <CardMeta style={{ wordWrap: "anywhere" }}>
                <Icon name="hashtag" />: {file.hash}
              </CardMeta>
              <CardDescription style={{ wordWrap: "break-word" }}>
                <Icon name="file text" />
                <strong>Name :</strong> {file.name} <br />
                <Icon name="calendar" />
                <strong>Last Modified:</strong> {file.lastModified} <br />
                <Icon name="calendar check outline" />
                <strong>Transaction Timestamp:</strong> {file.transactionTimestamp} <br />
                {file.EthStatus === 1 ? (
                  <>
                    <Icon name="ethereum" />
                    <Link href={file.transactionLink} target="_blank" rel="noopener noreferrer">
                      View on etherscan
                    </Link>
                  </>
                ) : (
                  <CardDescription>❌ Not found on blockchain</CardDescription>
                )}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
        <Card as={Link} href={`./${params.user}/new`}>
          <CardContent textAlign="center">
            <Grid centered columns={1} style={{ height: "100%" }}>
              <GridColumn verticalAlign="middle">
                <Icon name="add circle" size="huge" />
              </GridColumn>
            </Grid>
          </CardContent>
        </Card>
      </CardGroup>

      <p>Total Files: {files.length}</p>
    </>
  );
}

export default FilesPage;
