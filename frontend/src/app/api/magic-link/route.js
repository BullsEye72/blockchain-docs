import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { Resend } from "resend";
import crypto from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "Email requis" }, { status: 400 });

  const response = await sql`SELECT user_account_id FROM user_account WHERE email = ${email} AND created = true`;
  if (response.rowCount === 0) {
    // Don't reveal whether the account exists
    return NextResponse.json({ ok: true });
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await sql`
    UPDATE user_account
    SET magic_link_token = ${token}, magic_link_expires = ${expires.toISOString()}
    WHERE user_account_id = ${response.rows[0].user_account_id}
  `;

  const magicLink = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/setup?token=${token}`;

  await resend.emails.send({
    from: "DocuChain <onboarding@resend.dev>",
    to: email,
    subject: "Votre lien de connexion DocuChain",
    html: `
      <h2>Connexion à DocuChain</h2>
      <p>Cliquez sur le lien ci-dessous pour vous connecter :</p>
      <a href="${magicLink}" style="display:inline-block;padding:12px 24px;background:#2185d0;color:white;text-decoration:none;border-radius:4px;">
        Se connecter
      </a>
      <p style="color:#666;font-size:12px;">Ce lien expire dans 24h. Si vous n'avez pas demandé ce lien, ignorez cet e-mail.</p>
    `,
  });

  return NextResponse.json({ ok: true });
}
