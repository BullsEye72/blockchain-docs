import { ethers, InfuraProvider } from "ethers";
import FileManagerFactorContract from "../../../contracts/FileManagerFactory";
import FileManagerContract from "../../../contracts/FileManager";
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

const factoryContract = new ethers.Contract(
  process.env.FILES_FACTORY_CONTRACT_ADDRESS,
  FileManagerFactorContract.abi,
  provider
);

const contractWithSigner = factoryContract.connect(signer);

async function FilesPage({ params }) {
  try {
    // Files info
    const filesByOwner = await contractWithSigner.getFilesByOwner(params.user);
    let files = [];

    // Get files data
    if (filesByOwner.length > 0) {
      for (let i = 0; i < filesByOwner.length; i++) {
        const fileAddress = filesByOwner[i][0];
        const fileContract = new ethers.Contract(fileAddress, FileManagerContract.abi, provider);
        const fileData = await fileContract.getFileContent();

        console.log("filesByOwner (page.js) : ", filesByOwner[i]);

        files.push({
          name: fileData[0], // ex: 'Test File'
          hash: fileData[1], // ex: 'ABDFSDGFS'
          ower: fileData[2], // BigInt owner ID from db, ex: 2n
          lastModified: new Date(Number(fileData[3])), // JS timestamp is in milliseconds , ex: 345346543576345687n
          transactionTimestamp: new Date(Number(fileData[4]) * 1000), // BigInt timestamp, Convert to milliseconds, ex: 1717415772n
          transactionLink: `https://sepolia.etherscan.io/address/${fileAddress}`,
        });
      }
    }

    return (
      <>
        <h2>Files for user ID : {params.user}</h2>

        <CardGroup itemsPerRow={4} stackable>
          {files.map((file, index) => (
            <Card key={index} className="mb-4">
              <CardContent>
                <CardHeader>File Details</CardHeader>
                <CardMeta style={{ wordWrap: "anywhere" }}>
                  <Icon name="hashtag" />: {file.hash}
                </CardMeta>
                <CardDescription style={{ wordWrap: "break-word" }}>
                  <Icon name="file text" />
                  <strong>Name :</strong> {file.name} <br />
                  <Icon name="calendar" />
                  <strong>Last Modified:</strong> {file.lastModified.toLocaleDateString()} <br />
                  <Icon name="calendar check outline" />
                  <strong>Transaction Timestamp:</strong> {file.transactionTimestamp.toLocaleDateString()} <br />
                  <Icon name="ethereum" />
                  <Link href={file.transactionLink} target="_blank" rel="noopener noreferrer">
                    View on etherscan
                  </Link>
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
  } catch (error) {
    console.error("Error in FilesPage : ", error);
    return <h3>An error has occured !</h3>;
  }
}

export default FilesPage;
