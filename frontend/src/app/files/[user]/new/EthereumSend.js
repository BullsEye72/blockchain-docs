"use server";
import { ethers, InfuraProvider } from "ethers";
import FileStorageContract from "../../../../contracts/FileStorage";

const provider = new InfuraProvider("sepolia", process.env.INFURA_API_KEY);
const factoryContract = new ethers.Contract(
  process.env.FILES_STORAGE_CONTRACT_ADDRESS,
  FileStorageContract.abi,
  provider
);

async function getFileHashes() {
  const res = await fetch("http://localhost:3000/api/files/process");

  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }

  const hashesJson = await res.json();

  return hashesJson;
}

async function sendNewHash({ userId, hash, txHash, name }) {
  try {
    const request = await fetch("http://localhost:3000/api/files/" + userId, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ hash: hash, id_user: userId, name: name, transaction_hash: txHash }),
    });

    if (!request.ok) {
      const responseBody = await request.text();
      throw new Error(`HTTP error! status: ${request.status}, body: ${responseBody}`);
    }

    // If the request was successful, parse the response data and return it
    const data = await request.json();
    return data;
  } catch (error) {
    console.error("Error sending data:", error);
    // You might want to re-throw the error so the calling code knows that the request failed
    throw error;
  }
}

export async function handleSubmit(formData) {
  // handle form submission on the server
  const result = { success: true, message: "File uploaded successfully" };

  return result;
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

export async function sendToEthereum(user, fileInfo) {
  console.log("I SHOULD BE ON THE SERVER SIDE!");
  // string memory _name,
  // string memory _hash,
  // uint _owner,
  // uint _lastModified

  const startTime = Date.now();

  // Connect to the contract
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  const contractWithSigner = factoryContract.connect(signer);

  // Check if the file hash is already knowns in the database
  const knownHashes = await getFileHashes();

  for (let file of knownHashes) {
    if (file.hash === fileInfo.hash) {
      console.log("File already exists:", file.transaction_hash);
      return { success: false, message: "File already exists", existingAddress: file.transaction_hash };
    }
  }

  const result = await contractWithSigner.storeFile(fileInfo.hash, user);
  // console.log("Transaction: ", result);

  // Wait for the transaction to be mined
  const receipt = await provider.waitForTransaction(result.hash);
  const gasUsed = ethers.formatEther(receipt.gasUsed);
  console.log("Transaction cost: ", gasUsed, "ETH");

  //Store the new file data in the database
  const sendResult = await sendNewHash({
    userId: user,
    hash: fileInfo.hash,
    txHash: result.hash,
    name: fileInfo.name,
  });

  // Get the address of the new file
  const newContractAddress = result.hash;

  const endTime = Date.now();
  const elapsedTime = endTime - startTime;

  return { success: true, message: "File uploaded successfully", elapsedTime, contractAddress: newContractAddress };
}
