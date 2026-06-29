import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  const body = await req.json();
  const { fileHash, fileName, userEmail } = body || {};

  const sessionParams = {
    ...(userEmail ? { customer_email: userEmail } : {}),
    ui_mode: "embedded",
    line_items: [
      {
        price: process.env.STRIPE_PRICE_ID, // set in .env
        quantity: 1,
      },
    ],
    mode: "payment",
    redirect_on_completion: "never",
    automatic_tax: { enabled: true },
    customer_creation: "always",
    consent_collection: {
      terms_of_service: "required",
    },
    metadata: {
      fileHash: fileHash || "",
      fileName: fileName || "",
    },
  };

  try {
    const session = await stripe.checkout.sessions.create(sessionParams);
    return NextResponse.json({ clientSecret: session.client_secret });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: err.statusCode || 500 });
  }
}
