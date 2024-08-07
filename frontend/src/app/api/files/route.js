"use server";

import { sql } from "@vercel/postgres";

export async function checkIfFileExistsOnDatabase(hash) {
  try {
    const { rows } = await sql`select hash, transaction_hash, lastmodified from file where hash = ${hash}`;

    if (rows.length == 0) {
      return false;
    }

    return { transaction_hash: rows[0].transaction_hash, lastmodified: rows[0].lastmodified };
  } catch (error) {
    console.error("Error in checkIfFileExistsOnDatabase:", error);
    return false;
  }
}

export async function getFileHashes() {
  try {
    const { rows } = await sql`select hash,transaction_hash from file`;

    return rows;
  } catch (error) {
    return [];
  }
}
