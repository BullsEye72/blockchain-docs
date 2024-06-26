import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcrypt";
import { sql } from "@vercel/postgres";

const handler = NextAuth({
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    register: "/register",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      // `credentials` is used to generate a form on the sign in page.
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials, req) {
        // TODO: Validate the credentials

        const response = await sql`SELECT * FROM users WHERE email=${credentials?.email}`;
        const user = response.rows[0];

        const passwordCorrect = await compare(credentials?.password || "", user.password);

        console.log({ passwordCorrect });

        if (passwordCorrect) {
          return {
            id: user.id,
            email: user.email,
          };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async session({ session, token, user }) {
      // Send properties to the client, like an access_token and user id from a provider.
      console.log({ token });
      console.log({ user });

      return session;
    },
  },
});

export { handler as GET, handler as POST };
