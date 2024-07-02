"use client";

import {
  Card,
  CardHeader,
  CardContent,
  CardMeta,
  CardDescription,
  Icon,
  Dimmer,
  Loader,
  Segment,
  Image,
} from "semantic-ui-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function FileCard({ file, index, checkIfFileExistsOnBlockchain }) {
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
