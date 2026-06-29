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

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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
  // No RPC call — just verify config and initialize the provider locally
  try {
    if (!process.env.FILES_STORAGE_CONTRACT_ADDRESS) {
      return { success: false, message: "Contract address not configured" };
    }
    getContract();
    return { success: true };
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

  const { provider, factoryContract } = getContract();
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  const contractWithSigner = factoryContract.connect(signer);

  const MAX_RETRIES = 3;
  let lastError;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const tx = await contractWithSigner.storeFile(fileInfo.hash, 1);
      return { success: true, txHash: tx.hash, attemptId };
    } catch (error) {
      lastError = error;
      const isRateLimit = error.message?.includes("Too Many Requests") || error.code === "BAD_DATA";
      if (isRateLimit && attempt < MAX_RETRIES - 1) {
        console.warn(`Broadcast rate-limited (attempt ${attempt + 1}), retrying in ${(attempt + 1) * 3}s…`);
        await sleep((attempt + 1) * 3000);
        continue;
      }
      break;
    }
  }

  const isRateLimit = lastError?.message?.includes("Too Many Requests") || lastError?.code === "BAD_DATA";
  console.error("Broadcast failed:", lastError?.message);
  await updateAttempt(attemptId, "failed", { errorMessage: lastError?.message });
  return {
    success: false,
    message: isRateLimit
      ? "Le réseau Ethereum est surchargé, veuillez réessayer dans quelques secondes."
      : lastError?.message,
  };
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

// Step 3: called once after client confirms receipt — upserts file in DB
// userEmail is passed from the client session to avoid relying solely on getServerSession in a server action
export async function finalizeTransaction(txHash, fileHash, fileName, userEmail, attemptId) {
  try {
    await updateAttempt(attemptId, "success", { transactionHash: txHash });

    // Resolve DB user ID — prefer client-passed email, fall back to server session
    let resolvedEmail = userEmail ?? null;
    if (!resolvedEmail) {
      const session = await getServerSession(authOptions);
      resolvedEmail = session?.user?.email ?? null;
    }

    let userId = null;
    if (resolvedEmail) {
      const userResponse = await sql`SELECT user_account_id FROM user_account WHERE email = ${resolvedEmail}`;
      if (userResponse.rowCount > 0) userId = userResponse.rows[0].user_account_id;
    }

    console.log("finalizeTransaction: email=", resolvedEmail, "userId=", userId, "hash=", fileHash);

    // Upsert — insert if storeFile never ran (e.g. credits flow), update tx hash if it did
    const existing = await sql`SELECT id_user FROM file WHERE hash = ${fileHash}`;
    console.log("finalizeTransaction: existing rows=", existing.rowCount);
    if (existing.rowCount === 0) {
      const inserted = await sql`INSERT INTO file (hash, name, transaction_hash, id_user, lastmodified) VALUES (${fileHash}, ${fileName}, ${txHash}, ${userId}, NOW()) RETURNING hash`;
      console.log("finalizeTransaction: inserted", inserted.rowCount, "row(s)");
    } else {
      const updated = await sql`UPDATE file SET transaction_hash = ${txHash}, id_user = COALESCE(id_user, ${userId}) WHERE hash = ${fileHash} RETURNING hash`;
      console.log("finalizeTransaction: updated", updated.rowCount, "row(s)");
    }

    try {
      await decrementCredit();
    } catch (_) {
      // Anonymous user — no credit to decrement
    }

    return { success: true };
  } catch (error) {
    console.error("finalizeTransaction FAILED:", error.message);
    await updateAttempt(attemptId, "failed", { errorMessage: error.message });
    return { success: false, message: error.message };
  }
}
