import { sql } from "@vercel/postgres";
import { hash } from "bcrypt";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    console.log({ email, password });

    const hashedPassword = await hash(password, 10);

    const response = await sql`
            INSERT INTO users (email, password)
            VALUES (${email}, ${hashedPassword})
        `;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal error on register" }, { status: 500 });
  }

  return NextResponse.json({ message: "User registered successfully" });
}
