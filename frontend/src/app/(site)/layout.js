import { Roboto } from "next/font/google";
import "../globals.css";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import SessionProvider from "../components/SessionProvider";
import HeaderMenu from "../components/layout/HeaderMenu";
import Footer from "../components/layout/Footer";

const roboto = Roboto({ weight: "400", subsets: ["latin"] });

export const metadata = {
  title: "DocuChain",
  description: "Certification de documents par la blockchain Ethereum",
};

export default async function RootLayout({ children }) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="fr">
      <body className={roboto.className}>
        <SessionProvider session={session}>
          <div className="min-h-screen flex flex-col">
            <HeaderMenu />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
