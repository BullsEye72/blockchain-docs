"use server";

import { ethers, InfuraProvider, TransactionReceipt } from "ethers";
import FileStorageContract from "@/contracts/FileStorage";
import { sql } from "@vercel/postgres";
import { getServerSession } from "next-auth";

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

export async function checkCreditForFileUpload() {
  const userCredit = await getUserCredit();

  if (userCredit === -1) {
    return { success: true, hasCredit: false, message: "User not found" };
  } else if (userCredit === 0) {
    return { success: true, hasCredit: false, message: "Insufficient credit" };
  } else if (userCredit > 0) {
    console.log("User credit: ", userCredit);
    return { success: true, hasCredit: true, message: "Sufficient credit" };
  } else {
    return { success: false, message: "Error" };
  }
}

async function getUserCredit() {
  const session = await getServerSession();
  if (session) {
    const response = await sql`SELECT credit FROM user_account WHERE email = ${session.user.email}`;
    console.log("row count: ", response.rowCount);
    if (response.rowCount === 1) {
      return response.rows[0].credit;
    } else {
      console.error("❌ Session exists but user not found or too many users found!");
      return -1;
    }
  } else {
    return 0;
  }
}
