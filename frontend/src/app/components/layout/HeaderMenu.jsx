"use client";
/* Heads up!
 * Neither Semantic UI nor Semantic UI React offer a responsive navbar, however, it can be implemented easily.
 * It can be more complicated, but you can create really flexible markup.
 */

import { useState } from "react";
import { Button, Container, Menu, Segment } from "semantic-ui-react";
import HomepageHeading from "./HomePageHeading";
import Account from "../Account";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function HeaderMenu() {
  const [fixed, setFixed] = useState(false);
  const session = useSession();

  return (
    <Segment inverted textAlign="center" style={{ minHeight: 700, padding: "1em 0em" }} vertical>
      <Menu fixed={fixed ? "top" : null} inverted={!fixed} pointing={!fixed} secondary={!fixed} size="large">
        <Container>
          <Menu.Item>
            <Link href="/">Accueil</Link>
          </Menu.Item>
          {session && (
            <Menu.Item>
              <Link href="/files">Fichiers</Link>
            </Menu.Item>
          )}
          <Menu.Item>
            <Link href="/blog">Blog</Link>
          </Menu.Item>

          <Menu.Item position="right">
            <Account />
          </Menu.Item>
        </Container>
      </Menu>
      <HomepageHeading mobile />
    </Segment>
  );
}
