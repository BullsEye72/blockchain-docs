export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/(api(?!/register|/login|/stripe|/stripeevents|/magic-link|/test).*|files.*)"],
};
