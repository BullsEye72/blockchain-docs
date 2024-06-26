import { NextResponse } from "next/server";
import pool from "@/app/lib/mysql";

export async function GET() {
  try {
    const db = await pool.getConnection();
    const query = "select * from account";
    const [rows] = await db.query(query);
    db.release();

    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json(
      {
        error: error,
      },
      { status: 500 }
    );
  }
}
