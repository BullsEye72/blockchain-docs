import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Docu-Chain",
  description: "Outil de gestion de documents décentralisé",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <h1 className="text-3xl font-bold underline">Docu-Chain !</h1>
        {children}
      </body>
    </html>
  );
}
