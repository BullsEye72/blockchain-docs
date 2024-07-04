"use server";
import { ethers, InfuraProvider } from "ethers";
import FileStorageContract from "../../../contracts/FileStorage";
import { getServerSession } from "next-auth";
import { sql } from "@vercel/postgres";
import { storeFile } from "@/app/actions";
import { getFileHashes } from "@/app/api/files/route";

const provider = new InfuraProvider("sepolia", process.env.INFURA_API_KEY);
const factoryContract = new ethers.Contract(
  process.env.FILES_STORAGE_CONTRACT_ADDRESS,
  FileStorageContract.abi,
  provider
);

export async function handleSubmit(formData) {
  // handle form submission on the server
  const result = { success: true, message: "File uploaded successfully" };

  return result;
}

async function getUserId() {
  //TODO: ADD VALIDATION AND ERROR HANDLING
  const session = await getServerSession();
  const response = await sql`SELECT id FROM users WHERE email = ${session.user.email}`;
  const userId = response.rows[0].id;
  return userId;
}

export async function connectToContract() {
  try {
    const defaultFile = await factoryContract.files("");

    if (Number(defaultFile) === 0) {
      return { success: true, message: "Connected to contract successfully" };
    } else {
      return { success: false, message: "Failed to connect to contract" };
    }
  } catch (error) {
    return { success: false, message: "Error while trying to connect to contract" };
  }
}

export async function checkManagerRights(user) {
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  const contractWithSigner = factoryContract.connect(signer);
  const manager = await contractWithSigner.manager();

  if (manager === process.env.MANAGER_ADDRESS) {
    return { success: true, message: "Manager rights granted" };
  } else {
    return { success: false, message: "Manager rights denied" };
  }
}

export async function sendToEthereum(fileInfo) {
  // const session = await getServerSession(authOptions);
  // console.log({ session });
  const startTime = Date.now();

  // Connect to the contract
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  const contractWithSigner = factoryContract.connect(signer);

  // Check if the file hash is already knowns in the database
  const knownHashes = await getFileHashes();

  for (let file of knownHashes) {
    if (file.hash === fileInfo.hash) {
      console.log("File already exists:", file.transaction_hash);
      //console.log({ file });
      return { success: false, message: "File already exists", existingAddress: file.transaction_hash };
    }
  }

  const userId = await getUserId();
  //Store the new file data in the database
  const storeResult = await storeFile({
    userId: userId,
    hash: fileInfo.hash,
    txHash: "", //Empty for now, will be updated after the transaction is mined
    name: fileInfo.name,
  });

  if (storeResult.status !== 200) {
    console.log({ storeResult });
    return { success: false, message: "Database error" };
  }

  // Send the file hash to the contract
  const result = await contractWithSigner.storeFile(fileInfo.hash, userId);
  // console.log("Transaction: ", result);

  // Wait for the transaction to be mined
  const receipt = await provider.waitForTransaction(result.hash);
  const gasUsed = ethers.formatEther(receipt.gasUsed);
  console.log("Transaction cost: ", gasUsed, "ETH");

  // Get the address of the new file
  const newContractAddress = result.hash;

  const endTime = Date.now();
  const elapsedTime = endTime - startTime;

  return { success: true, message: "File uploaded successfully", elapsedTime, contractAddress: newContractAddress };
}
