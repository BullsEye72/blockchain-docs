"use server";
import { sql } from "@vercel/postgres";
import { Resend } from "resend";
import crypto from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY);
const CREDITS_PER_PURCHASE = 3;

export async function incrementCredit(stripeSession) {
  const customer_email = stripeSession.customer_details?.email;
  const orderStatus = stripeSession.status;

  if (orderStatus !== "complete") {
    console.error("Order not complete:", orderStatus);
    return;
  }

  if (!customer_email) {
    console.error("No customer email in session");
    return;
  }

  console.log("📨 Processing payment for:", customer_email);

  // Upsert user account
  let user_account_id;
  let isExistingAccount = false;
  const userResponse = await sql`SELECT user_account_id, credit, created FROM user_account WHERE email = ${customer_email}`;

  if (userResponse.rowCount === 0) {
    const newUserResponse = await sql`
      INSERT INTO user_account (email, created, credit)
      VALUES (${customer_email}, false, ${CREDITS_PER_PURCHASE})
      RETURNING user_account_id
    `;
    user_account_id = newUserResponse.rows[0].user_account_id;
    console.log("✅ New account created for:", customer_email);
  } else {
    user_account_id = userResponse.rows[0].user_account_id;
    isExistingAccount = userResponse.rows[0].created === true;
    const newCredit = userResponse.rows[0].credit + CREDITS_PER_PURCHASE;
    await sql`UPDATE user_account SET credit = ${newCredit} WHERE user_account_id = ${user_account_id}`;
    console.log("✅ Credit updated for:", customer_email, "→", newCredit);
  }

  // Link any anonymous file registrations from this session to the account
  const fileHash = stripeSession.metadata?.fileHash;
  if (fileHash) {
    await sql`UPDATE file SET id_user = ${user_account_id} WHERE hash = ${fileHash} AND id_user IS NULL`;
    console.log("🔗 File linked to account:", fileHash);
  }

  // Send magic link only for new/unactivated accounts — existing users are already logged in
  if (!isExistingAccount) {
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await sql`
      UPDATE user_account
      SET magic_link_token = ${token}, magic_link_expires = ${expires.toISOString()}
      WHERE user_account_id = ${user_account_id}
    `;

    try {
      const magicLink = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/setup?token=${token}`;
      await resend.emails.send({
        from: "DocuChain <onboarding@resend.dev>",
        to: customer_email,
        subject: "Accédez à votre compte DocuChain",
        html: `
          <h2>Merci pour votre achat !</h2>
          <p>Vous avez reçu <strong>${CREDITS_PER_PURCHASE} enregistrements</strong> sur la blockchain.</p>
          <p>Cliquez sur le lien ci-dessous pour accéder à votre compte et suivre vos fichiers :</p>
          <a href="${magicLink}" style="display:inline-block;padding:12px 24px;background:#2185d0;color:white;text-decoration:none;border-radius:4px;">
            Accéder à mon compte
          </a>
          <p style="color:#666;font-size:12px;">Ce lien expire dans 24h.</p>
        `,
      });
      console.log("📧 Magic link sent to:", customer_email);
    } catch (emailError) {
      console.error("📧 Failed to send magic link email:", emailError.message);
    }
  } else {
    console.log("ℹ️ Existing account — no magic link needed for:", customer_email);
  }
}
