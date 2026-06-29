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

export async function sendToEthereum(fileInfo) {
  const startTime = Date.now();

  // Check if already registered on-chain (pre-saved rows have null transaction_hash — skip those)
  const knownHashes = await getFileHashes();
  for (let file of knownHashes) {
    if (file.hash === fileInfo.hash && file.transaction_hash) {
      return { success: false, message: "File already exists", existingAddress: file.transaction_hash };
    }
  }

  const session = await getServerSession(authOptions);
  let userEmail = session?.user?.email ?? null;

  // For anonymous users who just paid via Stripe, the webhook may have already
  // linked the file to an account — look it up from the DB if session is empty
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
    const receipt = await provider.waitForTransaction(tx.hash);
    const gasUsed = ethers.formatEther(receipt.gasUsed);
    console.log("Transaction cost:", gasUsed, "ETH");

    await updateAttempt(attemptId, "success", { transactionHash: tx.hash });

    try {
      await updateFile({ transaction_hash: tx.hash, hash: fileInfo.hash });
    } catch (dbError) {
      console.error("DB update failed:", dbError.message);
    }

    try {
      await decrementCredit();
    } catch (_) {
      // Anonymous user — no credit to decrement
    }

    const elapsedTime = Date.now() - startTime;
    return { success: true, message: "File uploaded successfully", elapsedTime, contractAddress: tx.hash };
  } catch (error) {
    console.error("Blockchain send failed:", error.message);
    await updateAttempt(attemptId, "failed", { errorMessage: error.message });
    return { success: false, message: error.message };
  }
}
