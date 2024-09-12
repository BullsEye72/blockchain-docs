"use server";
import { sql } from "@vercel/postgres";
import { revalidatePath } from "next/cache";

export async function incrementCredit(stripeSession) {
  //Remove server action cache (or else the sql query will not be executed again)
  revalidatePath("/api/stripeevents");

  const order_id = stripeSession.id;
  const customer_id = stripeSession.customer;
  const customer_email = stripeSession.customer_details.email;
  const metadata = stripeSession.metadata;
  const paymentStatus = stripeSession.payment_status;
  const orderStatus = stripeSession.status;

  if (orderStatus !== "complete") {
    console.error("Order not complete : " + orderStatus, "Order ID : " + order_id);
    return;
  }

  //Check if user known in database
  console.log("📨 Customer Mail:", customer_email);
  let user_account_id = null;
  const userResponse = await sql`SELECT user_account_id, email FROM user_account WHERE email = ${customer_email}`;
  if (userResponse.rowCount === 0) {
    console.info("User not found in database, creating new account : " + customer_email);
    const newUserResponse =
      await sql`INSERT INTO user_account (email, created) VALUES (${customer_email}, false) RETURNING user_account_id`;

    //User ID
    user_account_id = newUserResponse.rows[0].user_account_id;
  } else {
    console.info("User found in database, using account : " + customer_email);
    user_account_id = userResponse.rows[0].user_account_id;
  }

  //User ID
  console.log("User ID : " + user_account_id);

  //Get user credit
  const creditResponse = await sql`SELECT credit FROM user_account WHERE user_account_id = ${user_account_id}`;

  if (creditResponse.rowCount !== 0) {
    const credit = creditResponse.rows[0].credit;
    console.log("User found : " + customer_email, "Credit : " + credit);

    //Increment credit
    const newCredit = credit + 1;
    const responseUpdate =
      await sql`UPDATE user_account SET credit = ${newCredit} WHERE user_account_id = ${user_account_id}`;
    if (responseUpdate.rowCount === 0) {
      console.error("Error updating user credit : " + customer_email);
      return;
    } else {
      console.log("User credit updated : " + customer_email, "New credit : " + newCredit);
    }
  } else {
    console.error("User credit not found : " + customer_email);
    return;
  }
}
