"use server";

import { sql } from "@vercel/postgres";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getFiles() {
  const session = await getServerSession(authOptions);
  if (!session) return [];

  const { rows } = await sql`
    SELECT file.name, user_account.email, file.hash, file.transaction_hash, file.lastmodified AS "lastModified"
    FROM file
    LEFT JOIN user_account ON user_account.user_account_id = file.id_user
    WHERE user_account.email = ${session.user.email}
  `;
  return rows;
}

export async function storeFile(data) {
  const { userId, hash, name } = data;

  if (!hash || !name) {
    throw new Error("Missing arguments: hash and name are required");
  }

  await sql`insert into file (name, hash, id_user, lastmodified) values (${name}, ${hash}, ${userId ?? null}, NOW())`;
  console.log("File stored in DB:", name, hash);
}

export async function updateFile(data) {
  const { transaction_hash, hash } = data;

  if (!transaction_hash || !hash) {
    throw new Error("Missing arguments: transaction_hash and hash are required");
  }

  await sql`update file set transaction_hash = ${transaction_hash} where hash = ${hash}`;
  console.log("File transaction hash updated:", hash, "→", transaction_hash);
}
