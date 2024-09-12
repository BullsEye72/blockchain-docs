import { getServerSession } from "next-auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { optional } from "zod";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  let userEmail = "";
  try {
    const session = await getServerSession();

    if (session) {
      userEmail = session.user.email;
    }
  } catch (error) {
    NextResponse.error("Error getting session");
  }

  const headersList = headers();

  const sessionParams = {
    ui_mode: "embedded",
    line_items: [
      {
        // Provide the exact Price ID (for example, pr_1234) of
        // the product you want to sell
        price: "price_1PZCBH2NziXGBTyvFJ8SYFaf",
        quantity: 1,
      },
    ],
    mode: "payment",
    redirect_on_completion: "never",
    automatic_tax: { enabled: true },
    customer_creation: "always",
    metadata: {
      test: "test data",
    },
    consent_collection: {
      terms_of_service: "required",
    },
  };

  if (userEmail) {
    sessionParams.customer_email = userEmail;
  }
  // } else {
  //   sessionParams.custom_fields = [
  //     {
  //       key: "password",
  //       label: {
  //         custom: "Mot de passe",
  //         type: "custom",
  //       },
  //       type: "text",
  //       optional: false,
  //       text: {
  //         minimum_length: 8,
  //         maximum_length: 128,
  //       },
  //     },
  //   ];
  // }

  try {
    // Create Checkout Sessions from body params.
    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({ clientSecret: session.client_secret });
  } catch (err) {
    return NextResponse.json(err.message, { status: err.statusCode || 500 });
  }
}
