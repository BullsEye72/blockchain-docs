"use server";

import { ethers, InfuraProvider, TransactionReceipt } from "ethers";
import FileStorageContract from "@/contracts/FileStorage";
import { sql } from "@vercel/postgres";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const provider = new InfuraProvider("sepolia", process.env.INFURA_API_KEY);
// const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const storageContract = new ethers.Contract(
  process.env.FILES_STORAGE_CONTRACT_ADDRESS,
  FileStorageContract.abi,
  provider
);

// const contractWithSigner = storageContract.connect(signer);

export async function checkIfFileExistsOnBlockchain(fileHash, transactionAddress) {
  // Verify via transaction receipt — works regardless of the userId stored in the contract
  if (transactionAddress && transactionAddress.length === 66) {
    try {
      const receipt = await provider.getTransactionReceipt(transactionAddress);
      if (!receipt || receipt.status !== 1) {
        return { fileOwnerId: 0, transactionTimestamp: null };
      }
      const block = await provider.getBlock(receipt.blockNumber);
      return { fileOwnerId: 1, transactionTimestamp: block.timestamp * 1000 };
    } catch {
      return { fileOwnerId: 0, transactionTimestamp: null };
    }
  }

  // No transaction hash — query FileAdded events and search by hash
  // (fileHash is not indexed in the event, so we fetch all and filter)
  const events = await storageContract.queryFilter(storageContract.filters.FileAdded());
  const match = events.find((e) => e.args[0] === fileHash);
  if (!match) return { fileOwnerId: 0, transactionTimestamp: null };
  return { fileOwnerId: 1, transactionTimestamp: Number(match.args[2]) * 1000 };
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
  const session = await getServerSession(authOptions);
  if (session) {
    const response = await sql`SELECT credit FROM user_account WHERE email = ${session.user.email}`;
    if (response.rowCount === 1) {
      return response.rows[0].credit;
    } else {
      return -1;
    }
  } else {
    return 0;
  }
}

export async function getCreditCount() {
  const session = await getServerSession(authOptions);
  if (!session) return null;
  const credit = await getUserCredit();
  return credit >= 0 ? credit : 0;
}

export async function decrementCredit() {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Not logged in");
  await sql`UPDATE user_account SET credit = credit - 1 WHERE email = ${session.user.email} AND credit > 0`;
}
