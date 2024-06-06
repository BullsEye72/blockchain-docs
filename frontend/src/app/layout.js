import { Roboto } from "next/font/google";
import "./globals.css";
import "semantic-ui-css/semantic.min.css";
import { Menu, MenuItem, Container } from "semantic-ui-react";
import Link from "next/link";

const inter = Roboto({ weight: "400", subsets: ["latin"] });

export const metadata = {
  title: "Docu-Chain",
  description: "Outil de gestion de documents décentralisé",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <Container style={{ marginTop: "3em" }}>
          <Menu style={{ marginTop: "10px" }}>
            <MenuItem>
              <Link href="/">
                <img src="https://dummyimage.com/100x100/b6bfcc/1b27d1&text=Docu-Chain" alt="Logo de Docu-Chain" />
              </Link>
            </MenuItem>
            <MenuItem position="right">
              <Link href="/account">Account</Link>
            </MenuItem>
          </Menu>
          {children}
        </Container>
      </body>
    </html>
  );
}
