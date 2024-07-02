import { sql } from "@vercel/postgres";
import { hash } from "bcrypt";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function POST(request) {
  try {
    const { email, password, confirmPassword, agreeToTerms } = await request.json();

    try {
      await checkCredentials(email, password, confirmPassword, agreeToTerms);
    } catch (e) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }

    const hashedPassword = await hash(password, 10);

    const response = await sql`
            INSERT INTO users (email, password)
            VALUES (${email}, ${hashedPassword})
        `;
  } catch (error) {
    return NextResponse.json({ error: "Internal error on register" }, { status: 500 });
  }

  return NextResponse.json({ message: "User registered successfully" });
}

async function checkCredentials(email, password, confirmPassword, agreeToTerms) {
  // Check for empty credentials
  if (!email || !password) {
    throw new Error("Please enter your credentials");
  }

  //Validate email format
  const emailSchema = z.string().email({ message: "Please enter a valid email" });
  try {
    emailSchema.parse(email);
  } catch (e) {
    throw new Error("Please enter a valid email");
  }

  // Check if the user exists
  const response = await sql`SELECT * FROM users WHERE email=${email}`;
  if (response.rowCount > 0) {
    throw new Error("E-Mail already used !");
  }

  //Validate password
  const passwordSchema = z.string().min(8, { message: "Password must be at least 8 characters long" });
  try {
    passwordSchema.parse(password);
  } catch (e) {
    throw new Error("Password must be at least 8 characters long");
  }

  if (password !== confirmPassword) {
    throw new Error("Passwords do not match");
  }

  //Validate if user agrees to terms
  if (!agreeToTerms) {
    throw new Error("Please agree to the terms");
  }

  //All test passed !
  return true;
}
