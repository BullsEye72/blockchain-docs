"use server";
import { ethers, InfuraProvider } from "ethers";
import FileManagerFactorContract from "../../../../contracts/FileManagerFactory";

const provider = new InfuraProvider("sepolia", process.env.INFURA_API_KEY);
const factoryContract = new ethers.Contract(
  process.env.FILES_FACTORY_CONTRACT_ADDRESS,
  FileManagerFactorContract.abi,
  provider
);

export async function handleSubmit(formData) {
  // handle form submission on the server
  const result = { success: true, message: "File uploaded successfully" };

  return result;
}

export async function connectToContract() {
  const manager = await factoryContract.getManager();

  if (manager === process.env.MANAGER_ADDRESS) {
    return { success: true, message: "Connected to contract successfully" };
  } else {
    return { success: false, message: "Failed to connect to contract" };
  }
}

export async function checkManagerRights(user) {
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  const contractWithSigner = factoryContract.connect(signer);
  const filesByOwner = await contractWithSigner.getFilesByOwner(user);

  if (filesByOwner) {
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

  const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  const contractWithSigner = factoryContract.connect(signer);
  const filesByOwner = await contractWithSigner.getFilesByOwner(user);

  const fileHashes = filesByOwner.map((file) => file[1]); // 0 = addr , 1 = hash

  if (fileHashes.includes(fileInfo.hash)) {
    return { success: false, message: "File already exists", existingAddress: fileInfo.hash };
  }

  const result = await contractWithSigner.createFile(fileInfo.name, fileInfo.hash, user, fileInfo.lastModified);
  console.log("Result: ", result);

  // simulate a 4 second pause
  //await new Promise((resolve) => setTimeout(resolve, 4000));

  const endTime = Date.now();
  const elapsedTime = endTime - startTime;

  return { success: true, message: "File uploaded successfully", elapsedTime };
}
