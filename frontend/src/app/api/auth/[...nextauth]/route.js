import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcrypt";
import { sql } from "@vercel/postgres";
import { z } from "zod";

export const authOptions = {
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
        // Check for empty credentials
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter your credentials");
        }

        //Validate email format
        const emailSchema = z.string().email({ message: "Please enter a valid email" });
        try {
          emailSchema.parse(credentials.email);
        } catch (e) {
          throw new Error("Please enter a valid email");
        }

        //Validate password
        const passwordSchema = z.string().min(8, { message: "Password must be at least 8 characters long" });
        try {
          passwordSchema.parse(credentials.password);
        } catch (e) {
          throw new Error("Password must be at least 8 characters long");
        }

        const response = await sql`SELECT * FROM users WHERE email=${credentials?.email}`;

        // Check if the user exists
        if (response.rowCount === 0) {
          throw new Error("E-Mail not found");
        }

        const user = response.rows[0];

        // Check if the password is correct
        const passwordCorrect = await compare(credentials?.password || "", user.password);

        if (passwordCorrect) {
          return {
            id: user.id,
            email: user.email,
          };
        } else {
          throw new Error("Password incorrect");
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async session({ session, token, user }) {
      // Send properties to the client, like an access_token and user id from a provider.
      session.user.id = token.sub;
      // console.log("Session:", session);

      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
