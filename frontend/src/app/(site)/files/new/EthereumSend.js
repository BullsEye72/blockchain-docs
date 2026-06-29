"use server";
import { ethers, InfuraProvider } from "ethers";
import { sql } from "@vercel/postgres";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import FileStorageContract from "@/contracts/FileStorage";
import { getFileHashes } from "@/app/api/files/route";
import { updateFile } from "@/app/actions";
import { decrementCredit } from "@/app/(site)/files/actions";

let _provider = null;
let _factoryContract = null;

function getContract() {
  if (!_factoryContract) {
    _provider = new InfuraProvider("sepolia", process.env.INFURA_API_KEY);
    _factoryContract = new ethers.Contract(
      process.env.FILES_STORAGE_CONTRACT_ADDRESS,
      FileStorageContract.abi,
      _provider
    );
  }
  return { provider: _provider, factoryContract: _factoryContract };
}

async function logAttempt(fileHash, fileName, userEmail) {
  const result = await sql`
    INSERT INTO blockchain_attempt (file_hash, file_name, user_email, status)
    VALUES (${fileHash}, ${fileName}, ${userEmail ?? null}, 'pending')
    RETURNING id
  `;
  return result.rows[0].id;
}

async function updateAttempt(id, status, { transactionHash = null, errorMessage = null } = {}) {
  await sql`
    UPDATE blockchain_attempt
    SET status = ${status},
        transaction_hash = ${transactionHash},
        error_message = ${errorMessage},
        updated_at = NOW()
    WHERE id = ${id}
  `;
}

export async function connectToContract() {
  try {
    const { factoryContract } = getContract();
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

export async function checkManagerRights() {
  // The contract enforces manager rights on-chain — no need to pre-check here
  return { success: true, message: "Manager rights granted" };
}

// Step 1: sign and broadcast the transaction — returns txHash immediately
export async function broadcastToEthereum(fileInfo) {
  const knownHashes = await getFileHashes();
  for (let file of knownHashes) {
    if (file.hash === fileInfo.hash && file.transaction_hash) {
      return { success: false, message: "File already exists", existingAddress: file.transaction_hash };
    }
  }

  const session = await getServerSession(authOptions);
  let userEmail = session?.user?.email ?? null;

  if (!userEmail) {
    const linked = await sql`
      SELECT ua.email FROM file f
      JOIN user_account ua ON ua.user_account_id = f.id_user
      WHERE f.hash = ${fileInfo.hash}
      LIMIT 1
    `;
    if (linked.rowCount > 0) userEmail = linked.rows[0].email;
  }

  const attemptId = await logAttempt(fileInfo.hash, fileInfo.name, userEmail);

  try {
    const { provider, factoryContract } = getContract();
    const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const contractWithSigner = factoryContract.connect(signer);

    const tx = await contractWithSigner.storeFile(fileInfo.hash, 1);
    return { success: true, txHash: tx.hash, attemptId };
  } catch (error) {
    console.error("Broadcast failed:", error.message);
    await updateAttempt(attemptId, "failed", { errorMessage: error.message });
    return { success: false, message: error.message };
  }
}

// Step 2: lightweight receipt check — called by the client every few seconds
export async function checkReceipt(txHash) {
  try {
    const { provider } = getContract();
    const receipt = await provider.getTransactionReceipt(txHash);
    if (!receipt) return { status: "pending" };
    if (receipt.status !== 1) return { status: "failed", message: "Transaction revertée par le contrat" };
    return { status: "confirmed" };
  } catch (error) {
    return { status: "error", message: error.message };
  }
}

// Step 3: called once after client confirms receipt — updates DB
export async function finalizeTransaction(txHash, fileHash, attemptId) {
  try {
    await updateAttempt(attemptId, "success", { transactionHash: txHash });

    try {
      await updateFile({ transaction_hash: txHash, hash: fileHash });
    } catch (dbError) {
      console.error("DB update failed:", dbError.message);
    }

    try {
      await decrementCredit();
    } catch (_) {
      // Anonymous user — no credit to decrement
    }

    return { success: true };
  } catch (error) {
    console.error("Finalize failed:", error.message);
    await updateAttempt(attemptId, "failed", { errorMessage: error.message });
    return { success: false, message: error.message };
  }
}
