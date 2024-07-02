"use server";

import { sql } from "@vercel/postgres";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function getFiles() {
  const session = await getServerSession();

  if (!session) {
    // If the user is not logged in, return an error
    return NextResponse.json({ error: "You need to be logged in" }, { status: 401 });
  }

  try {
    const { rows } = await sql`
    select file.name, users.email, file.hash, file.transaction_hash, file.lastmodified as "lastModified" from file
    left join users on users.id = file.id_user
    where users.email = ${session.user.email}
    `;

    return NextResponse.json(rows);
  } catch (error) {
    console.error(error); // Log the error for debugging
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function storeFile(data) {
  // const body = await request.json();
  // console.log("StoreFile: ", data);

  const { userId, hash, name } = data;
  // console.log("Id_user:", userId, "hash:", hash, "name:", name, "transaction_hash:", transaction_hash);

  if (!userId || !hash || !name) {
    return NextResponse.json({ error: "Missing arguments" }, { status: 400 });
  }

  try {
    const result =
      await sql`insert into file (name, hash, transaction_hash, id_user) values (${name}, ${hash}, 'replace_me' , ${userId})`;
    console.log({ result });

    console.log("Data inserted successfully");
    return NextResponse.json({ message: "Data inserted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Database error:", error.message);

    return NextResponse.json({ error: "this is a test " }, { status: 400 });

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function updateFile(data) {
  const { transaction_hash, hash } = data;

  if (!transaction_hash || !hash) {
    return NextResponse.json({ error: "Missing arguments" }, { status: 400 });
  }

  try {
    const result = await sql`update file set transaction_hash = ${transaction_hash} where hash = ${hash}`;
    console.log("Data updated successfully");
    return NextResponse.json({ message: "Data updated successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
