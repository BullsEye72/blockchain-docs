export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/(api(?!/register|/login|/stripe|/test).*|files.*)"],
};
