import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { rows } = await sql`select * from file`;

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json(
      {
        error: error,
      },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
  const body = await request.json();

  const { id_user, hash, name, transaction_hash } = body;
  console.log("Id_user:", id_user, "hash:", hash, "name:", name, "transaction_hash:", transaction_hash);

  if (!id_user || !hash || !name || !transaction_hash) {
    return NextResponse.json({ error: "Missing arguments" }, { status: 400 });
  }

  try {
    const { rows } =
      await sql`INSERT INTO file (name, hash, transaction_hash, id_user) VALUES (${name}, ${hash}, ${transaction_hash}, ${id_user})`;

    console.log("Data inserted successfully");
    return NextResponse.json({ message: "Data inserted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
