"use client";

import {
  Card,
  CardHeader,
  CardContent,
  CardMeta,
  CardDescription,
  Icon,
  TableRow,
  TableCell,
  Button,
  Popup,
  Header,
} from "semantic-ui-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function FileCard({ file, index, checkIfFileExistsOnBlockchain, table = false }) {
  const [ethStatus, setEthStatus] = useState(0);
  const [txTimestamp, setTxTimestamp] = useState(null);

  useEffect(() => {
    async function check() {
      setEthStatus(0);

      const { fileOwnerId: userIdFromBlockChain, transactionTimestamp } = await checkIfFileExistsOnBlockchain(
        file.hash,
        file.transactionHash
      );
      const userId = Number(userIdFromBlockChain);

      if (userId === 0) {
        setEthStatus(-1);
        return;
      } else {
        setEthStatus(1);
        setTxTimestamp(new Date(transactionTimestamp).toLocaleDateString());
      }
    }

    check();
  }, [file, checkIfFileExistsOnBlockchain]);

  const formatHash = (hash) => {
    return hash.slice(0, 5) + "..." + hash.slice(-5);
  };

  // Render a table row if table is true
  if (table) {
    return (
      <TableRow key={index}>
        <TableCell positive={ethStatus === 1} negative={ethStatus === -1}>
          <Icon name="file text" />
        </TableCell>
        <TableCell>
          <strong>{file.name}</strong>
        </TableCell>

        <Popup key={index} position={"right center"} trigger={<TableCell>{formatHash(file.hash)}</TableCell>}>
          <Header as="h4">Code de vérification</Header>
          <p>{file.hash}</p>
        </Popup>

        <TableCell>{file.lastModified}</TableCell>

        {ethStatus === 1 && (
          <>
            <TableCell>
              <Icon name="green checkmark" />
            </TableCell>
            <TableCell>{txTimestamp}</TableCell>
            <TableCell>
              <Button icon labelPosition="left">
                <Icon name="ethereum" />
                <Link href={file.transactionLink} target="_blank" rel="noopener noreferrer">
                  Voir sur etherscan
                </Link>
              </Button>
            </TableCell>
          </>
        )}
        {ethStatus === -1 && (
          <>
            <TableCell>
              <Icon name="close red" />
            </TableCell>
            <TableCell colSpan="2" negative>
              Pas trouvé sur la blockchain
            </TableCell>
          </>
        )}
        {ethStatus === 0 && (
          <>
            <TableCell>
              <Icon loading name="notched circle" />
            </TableCell>
            <TableCell>Recherche sur la blockchain</TableCell>
          </>
        )}
      </TableRow>
    );
  }

  // Render a standard semantic ui react card is table is false
  return (
    <Card color={file.cardColor} key={index} className="mb-4">
      <CardContent>
        <CardHeader>
          <Icon name="file text" />
          Name : {file.name}{" "}
        </CardHeader>
        <CardMeta style={{ wordWrap: "anywhere" }}>
          <Icon name="hashtag" />: {file.hash}
        </CardMeta>
        <CardDescription style={{ wordWrap: "break-word" }}>
          <Icon name="calendar" />
          <strong>Last Modified:</strong> {file.lastModified} <br />
        </CardDescription>
      </CardContent>
      <CardContent>
        {ethStatus === 1 && (
          <>
            <Icon name="calendar check outline" />
            <strong>Transaction Timestamp:</strong> {txTimestamp} <br />
            <Icon name="ethereum" />
            <Link href={file.transactionLink} target="_blank" rel="noopener noreferrer">
              View on etherscan
            </Link>
          </>
        )}
        {ethStatus === -1 && <>❌ Not found on blockchain</>}
        {ethStatus === 0 && (
          <>
            <Icon loading name="notched circle" />
            Checking on blockchain
          </>
        )}
      </CardContent>
    </Card>
  );
}
