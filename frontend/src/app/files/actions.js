"use server";

import { ethers, InfuraProvider, TransactionReceipt } from "ethers";
import FileStorageContract from "../../contracts/FileStorage";

const provider = new InfuraProvider("sepolia", process.env.INFURA_API_KEY);
// const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const storageContract = new ethers.Contract(
  process.env.FILES_STORAGE_CONTRACT_ADDRESS,
  FileStorageContract.abi,
  provider
);

// const contractWithSigner = storageContract.connect(signer);

async function getTransactionTimestamp(transactionAddress) {
  const transactionReceipt = await provider.getTransaction(transactionAddress);

  if (!transactionReceipt) {
    console.error("Transaction receipt not found");
    return;
  }

  const blockNumber = transactionReceipt.blockNumber;
  const block = await provider.getBlock(blockNumber);
  const timestamp = block.timestamp;
  return timestamp * 1000;
}

export async function checkIfFileExistsOnBlockchain(fileHash, transactionAddress) {
  const fileOwnerId = await storageContract.files(fileHash);

  let transactionTimestamp = null;
  if (transactionAddress.length === 66) {
    // Length of a transaction address = 66
    transactionTimestamp = await getTransactionTimestamp(transactionAddress);
  }

  return { fileOwnerId, transactionTimestamp };
}
