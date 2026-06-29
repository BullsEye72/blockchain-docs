import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";
import { compare } from "bcrypt";
import { sql } from "@vercel/postgres";
import { z } from "zod";

export const authOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
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

    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Veuillez entrer vos identifiants");
        }

        const emailSchema = z.string().email();
        try { emailSchema.parse(credentials.email); }
        catch { throw new Error("Adresse e-mail invalide"); }

        const response = await sql`SELECT * FROM user_account WHERE email = ${credentials.email} AND created = true`;
        if (response.rowCount === 0) throw new Error("Compte introuvable");

        const user = response.rows[0];
        if (!user.password) throw new Error("Connectez-vous via le lien reçu par e-mail");

        const passwordCorrect = await compare(credentials.password, user.password);
        if (!passwordCorrect) throw new Error("Mot de passe incorrect");

        return { id: user.user_account_id, email: user.email };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "github") {
        const response = await sql`SELECT user_account_id FROM user_account WHERE email = ${user.email}`;
        if (response.rowCount === 0) {
          await sql`INSERT INTO user_account (email, created, credit) VALUES (${user.email}, true, 0)`;
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
