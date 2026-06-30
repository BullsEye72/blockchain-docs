import Stripe from "stripe";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function GET(req, { params }) {
  const session_id = params.session_id;
  // console.log("STRIPE EVENTS: ", events);
  // console.log("STRIPE SESSION ID: ", session_id);

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);

    const customer = await stripe.customers.retrieve(session.customer);

    // const payment = await stripe.paymentIntents.retrieve("li_1Pafnj2NziXGBTyvvEX2m0HJ");
    // console.log({ payment });

    return NextResponse.json({
      status: session.status,
      customer_email: session.customer_details.email,
    });
  } catch (error) {
    console.log({ error });
    return NextResponse.error("oh no");
  }
}
