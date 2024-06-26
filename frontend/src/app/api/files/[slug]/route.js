import { NextResponse } from "next/server";
import pool from "@/app/lib/mysql";

export async function GET(request, { params }) {
  const slug = params.slug; // owner ID

  // Validate and sanitize input
  if (!slug || typeof slug !== "string") {
    return NextResponse.json({ error: "Invalid owner ID" }, { status: 400 });
  }

  let db;
  try {
    db = await pool.getConnection();
    const query = "select * from file where Id_owner = ?";
    const [rows] = await db.query(query, [slug]);

    return NextResponse.json(rows);
  } catch (error) {
    console.error(error); // Log the error for debugging
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  } finally {
    if (db) db.release();
  }
}

export async function POST(request, { params }) {
  const body = await request.json();

  const { Id_owner, hash, name, transaction_hash } = body;
  console.log("Id_owner:", Id_owner, "hash:", hash, "name:", name, "transaction_hash:", transaction_hash);

  if (!Id_owner || !hash || !name || !transaction_hash) {
    return NextResponse.json({ error: "Missing arguments" }, { status: 400 });
  }

  let db;
  try {
    db = await pool.getConnection();
    const query = "insert into file (name, hash, transaction_hash, Id_owner) values (?, ?, ? , ?)";
    const [rows] = await db.query(query, [name, hash, transaction_hash, Id_owner]);

    console.log("Data inserted successfully");
    return NextResponse.json({ message: "Data inserted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  } finally {
    if (db) db.release();
  }
}
