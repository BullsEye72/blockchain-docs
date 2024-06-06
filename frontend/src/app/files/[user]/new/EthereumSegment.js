import { Header, Icon, Segment } from "semantic-ui-react";
import { sendToEthereum } from "./EthereumSend";
import { useEffect } from "react";

export default function EthereumSegment({ state }) {
  useEffect(() => {
    sendToEthereum();
  }, []);

  return (
    <Segment disabled={!state}>
      <Header as="h2">
        <Icon name="ethereum" />
        Transaction result
      </Header>

      <p>ETH Status : {state ? "OK" : "NOK"}</p>
    </Segment>
  );
}
