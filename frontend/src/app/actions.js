"use server";

import { sql } from "@vercel/postgres";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function getFiles() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "You need to be logged in" }, { status: 401 });
  }

  try {
    const { rows } = await sql`
      select file.name, user_account.email, file.hash, file.transaction_hash, file.lastmodified as "lastModified"
      from file
      left join user_account on user_account.user_account_id = file.id_user
      where user_account.email = ${session.user.email}
    `;
    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
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
