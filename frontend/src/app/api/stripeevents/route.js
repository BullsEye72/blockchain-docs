import { NextResponse } from "next/server";
import Stripe from "stripe";
import { incrementCredit } from "./actions";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

const app = require("express")();
const bodyParser = require("body-parser");

let listenerStarted = false;

const fulfillOrder = (session) => {
  // TODO: fill me in
  const lineItems = session.line_items;
  console.log("💲Fulfilling order", session.id);

  console.log("🛍️ Checkout session completed!", session.id);
  console.log("🛍️ Line items:", lineItems);

  incrementCredit(session);
};

export function GET(req) {
  if (listenerStarted) {
    return NextResponse.json({ status: true });
  }

  app.post("/webhook", bodyParser.raw({ type: "application/json" }), async (request, response) => {
    const payload = request.body;
    const sig = request.headers["stripe-signature"];

    let event;

    try {
      event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
    } catch (err) {
      return response.status(400).send(`Webhook Error: ${err.message}`);
    }

    debugger;

    //Handle the checkout.session.completed event
    if (event.type === "checkout.session.completed") {
      // Retrieve the session. If you require line items in the response, you may include them by expanding line_items.
      const sessionWithLineItems = await stripe.checkout.sessions.retrieve(event.data.object.id, {
        expand: ["line_items"],
      });

      // Fulfull the purchase...
      fulfillOrder(sessionWithLineItems);
    }

    response.status(200).end();
  });

  const PORT = 4242;
  const server = app.listen(PORT, () => console.log("🚀 Stripe Listener : Running on port 4242"));

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      console.error(`Port ${PORT} is already in use`);
    } else {
      console.error("Server error:", error.message);
    }
  });

  listenerStarted = true;

  return NextResponse.json({ status: "Listener Starting" });
}
