"use server";

import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export async function checkIfFileExistsOnDatabase(hash) {
  try {
    const { rows } = await sql`select hash from file where hash = ${hash}`;

    return rows.length > 0;
  } catch (error) {
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
