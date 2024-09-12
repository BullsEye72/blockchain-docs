import { loadStripe } from "@stripe/stripe-js";
import StripeForm from "./Form";

export default async function StripePage() {
  return <StripeForm />;
}
