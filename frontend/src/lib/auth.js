import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { sql } from "@vercel/postgres";

export const authOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),

    CredentialsProvider({
      id: "magic-link",
      credentials: { token: {} },
      async authorize({ token }) {
        if (!token) return null;

        const response = await sql`
          SELECT user_account_id, email, magic_link_expires
          FROM user_account
          WHERE magic_link_token = ${token}
        `;

        if (response.rowCount === 0) return null;

        const user = response.rows[0];
        if (new Date(user.magic_link_expires) < new Date()) return null;

        await sql`
          UPDATE user_account
          SET magic_link_token = NULL, magic_link_expires = NULL, created = true
          WHERE user_account_id = ${user.user_account_id}
        `;

        return { id: user.user_account_id, email: user.email };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const response = await sql`SELECT user_account_id FROM user_account WHERE email = ${user.email}`;
        if (response.rowCount === 0) {
          await sql`INSERT INTO user_account (email, created, credit) VALUES (${user.email}, true, 0)`;
        } else {
          await sql`UPDATE user_account SET created = true WHERE email = ${user.email}`;
        }
      }
      return true;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.email = token.email;
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
  },
};
