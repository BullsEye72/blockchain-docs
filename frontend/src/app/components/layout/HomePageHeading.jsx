"use client";

import { Container, Header, Icon } from "semantic-ui-react";
import FileCardSelector from "../FileChecker/FileChoice";

/* Heads up!
 * HomepageHeading uses inline styling, however it's not the best practice. Use CSS or styled
 * components for such things.
 */
export default function HomepageHeading({ mobile }) {
  return (
    <Container text>
      {" "}
      <Header
        as="h1"
        content="DocuChain"
        inverted
        style={{
          fontSize: mobile ? "2em" : "4em",
          fontWeight: "normal",
          marginBottom: 0,
          marginTop: mobile ? "1.5em" : "3em",
        }}
      />
      <Header
        as="h2"
        content="Sécurisez vos documents avec la blockchain !"
        inverted
        style={{
          fontSize: mobile ? "1.5em" : "1.7em",
          fontWeight: "normal",
          marginTop: mobile ? "0.5em" : "1.5em",
        }}
      />
      <FileCardSelector />
    </Container>
  );
}
