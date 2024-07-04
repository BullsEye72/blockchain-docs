import { Roboto } from "next/font/google";
import "./globals.css";
import "semantic-ui-css/semantic.min.css";
import { Container, Divider, Segment, Header, Button } from "semantic-ui-react";

import { getServerSession } from "next-auth";
import SessionProvider from "./components/SessionProvider";

import HeaderMenu from "./components/layout/HeaderMenu";
import Footer from "./components/layout/Footer";

const inter = Roboto({ weight: "400", subsets: ["latin"] });

export const metadata = {
  title: "Docu-Chain",
  description: "Outil de gestion de documents décentralisé",
};

export default async function RootLayout({ children }) {
  const session = await getServerSession();
  return (
    <html lang="fr">
      <body className={inter.className}>
        <SessionProvider session={session}>
          <HeaderMenu />

          {children}

          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}
