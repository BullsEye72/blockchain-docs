import { sql } from "@vercel/postgres";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function GET(req) {
  revalidatePath("/api/test");

  let returnStatus = "Default status.";
  const response = await sql`SELECT * FROM user_account WHERE email = 'anthony.jaspers@letsgocoding.dev'`;

  if (response.rowCount > 0) {
    const row = response.rows[0];
    console.log("old credit:", row.credit);

    const response2 = await sql`UPDATE user_account SET credit = ${row.credit + 1} WHERE email = ${row.email}`;

    if (response2.rowCount > 0) {
      returnStatus = "update done!";

      const response3 = await sql`SELECT * FROM user_account WHERE email = 'anthony.jaspers@letsgocoding.dev'`;
      console.log("new credit:", response3.rows[0].credit);
    } else {
      returnStatus = "Update failed!";
    }
  } else {
    returnStatus = "User not found";
  }

  return NextResponse.json({ status: returnStatus });
}
