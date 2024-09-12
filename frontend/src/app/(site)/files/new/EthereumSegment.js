import { Header, Icon, Segment, List } from "semantic-ui-react";
import { connectToContract, checkManagerRights, sendToEthereum } from "./EthereumSend";
import { useCallback, useEffect, useState } from "react";

export default function EthereumSegment({ dispatch, state, fileInfo }) {
  const [isConnected, setIsConnected] = useState(null);
  const [isManager, setIsManager] = useState(null);
  const [transactionStatus, setTransactionStatus] = useState(null);
  const [transactionAddress, setTransactionAddress] = useState(null);

  const statusMapping = {
    null: { name: "question", color: "grey" }, // Initial state
    0: { name: "clock", color: "yellow" }, // 0 = pending
    1: { name: "check", color: "green" }, // 1 = success
    2: { name: "exclamation triangle", color: "orange" }, // 2 = file already exists
    default: { name: "exclamation triangle", color: "red" }, // -1 and everything else = fail
  };
  const status = statusMapping[transactionStatus] || statusMapping.default;

  const connect = async () => {
    console.log("Connecting to Ethereum");
    let result = await connectToContract();
    setIsConnected(result.success);
    dispatch({
      type: "SET_ETHEREUM_CONTRACT_STATUS",
      payload: result.success,
    });

    if (result.success === false) {
      console.warn(result.message);
      return false;
    }

    console.log("Checking manager rights");
    result = await checkManagerRights();
    setIsManager(result.success);
    dispatch({
      type: "SET_ETHEREUM_MANAGER_STATUS",
      payload: result.success,
    });

    if (result.success === false) {
      console.warn(result.message);
      return false;
    }

    setTransactionStatus(0); // 0 = pending

    console.log("Sending file to Ethereum");
    result = await sendToEthereum(fileInfo);
    // console.log({ result });

    if (result.success) {
      console.log("Transaction finished in : ", result.elapsedTime);
      // The transaction was successful
      setTransactionAddress(result.contractAddress);
      setTransactionStatus(1); // 1 = success, -1 = fail
    } else {
      if (result.existingAddress) {
        // The file already exists in the blockchain
        setTransactionAddress(result.existingAddress);
        setTransactionStatus(2); // 2 = file already exists
      } else {
        // The transaction failed
        setTransactionStatus(-1); // 1 = success, -1 = fail
      }
    }

    dispatch({
      type: "SET_ETHEREUM_TRANSACTION_STATUS",
      payload: transactionStatus,
    });
  };

  useEffect(() => {
    console.log("EthereumSegment state changed: ", state);
    if (state) {
      connect();
    }
  }, [state]);

  return (
    <Segment disabled={!state}>
      <Header as="h2">
        <Icon name="ethereum" />
        Ethereum BlockChain
      </Header>
      <List divided relaxed>
        <List.Item>
          <Icon
            name={isConnected === null ? "question" : isConnected ? "check" : "exclamation triangle"}
            color={isConnected === null ? "grey" : isConnected ? "green" : "red"}
          />
          <List.Header>Connection au blockchain</List.Header>
          <List.Content>
            {isConnected === null ? (
              <List.Description>La connection au manager de fichiers est en attente</List.Description>
            ) : isConnected ? (
              <List.Description>La connection au manager de fichiers à été réussie</List.Description>
            ) : (
              <List.Description>La connection au manager de fichiers à échoué</List.Description>
            )}
          </List.Content>
        </List.Item>

        <List.Item>
          <Icon
            name={isManager === null ? "question" : isManager ? "check" : "exclamation triangle"}
            color={isManager === null ? "grey" : isManager ? "green" : "red"}
          />
          <List.Header>{"Droits d'accès"}</List.Header>
          <List.Content>
            <List.Description>
              {isManager == null ? (
                <p>{`Les droits d'accès vont être vérifiés`}</p>
              ) : isManager ? (
                <p>{`Les droits d'accès ont été accordés`}</p>
              ) : (
                <p>{`Les droits d'accès ont été rejeté...`}</p>
              )}
            </List.Description>
          </List.Content>
        </List.Item>

        <List.Item>
          <Icon name={status.name} color={status.color} />
          <List.Header>Enregistrement de la signature du fichier dans le blockchain</List.Header>
          <List.Content>
            {transactionStatus === null ? (
              // Initial state
              <List.Description>{`Pas d'enregistrement en cours`}</List.Description>
            ) : transactionStatus === 0 ? (
              // 0 = pending
              <List.Description className={transactionStatus === 0 ? "pulse" : ""}>
                Enregistrement en cours !
              </List.Description>
            ) : transactionStatus === 1 ? (
              // 1 = success
              <>
                <List.Description>Votre fichier à bien été enregistré dans la blockchain !</List.Description>
                <a
                  href={`https://sepolia.etherscan.io/tx/${transactionAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Voir sur etherscan
                </a>
              </>
            ) : transactionStatus === 2 ? (
              // 2 = file already exists
              <>
                <List.Description>
                  Votre fichier existe déjà dans la block-chain, enregistrement annulé.
                </List.Description>
                <a
                  href={`https://sepolia.etherscan.io/tx/${transactionAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Voir sur etherscan
                </a>
              </>
            ) : (
              // -1 and everything else = fail
              <List.Description>Enregistrement échoué... Veuillez contracter l&apos;administrateur.</List.Description>
            )}
          </List.Content>
        </List.Item>
      </List>
    </Segment>
  );
}
