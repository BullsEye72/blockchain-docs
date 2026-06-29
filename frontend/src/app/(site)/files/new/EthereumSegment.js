import { Header, Icon, Segment, Step, StepContent, StepDescription, StepGroup, StepTitle } from "semantic-ui-react";
import { connectToContract, broadcastToEthereum, checkReceipt, finalizeTransaction } from "./EthereumSend";
import { useEffect, useState, useRef } from "react";

const ETHERSCAN_URL = process.env.NEXT_PUBLIC_ETHERSCAN_URL || "https://etherscan.io";
const POLL_INTERVAL_MS = 5000;

/*
  stages:
  0 — idle
  1 — connecting to contract
  2 — signing & broadcasting
  3 — polling for confirmation (txHash available)
  4 — confirmed & finalized
 -1 — failed
*/

export default function EthereumSegment({ dispatch = () => {}, state, fileInfo, onSuccess }) {
  const [stage, setStage] = useState(0);
  const [txHash, setTxHash] = useState(null);
  const [error, setError] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);
  const pollRef = useRef(null);
  const attemptIdRef = useRef(null);

  const startTimer = () => {
    setElapsed(0);
    timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
  };

  const stopAll = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (pollRef.current) clearInterval(pollRef.current);
  };

  useEffect(() => () => stopAll(), []);

  const startPolling = (hash, fileHash) => {
    pollRef.current = setInterval(async () => {
      const result = await checkReceipt(hash);

      if (result.status === "pending") return; // keep polling

      clearInterval(pollRef.current);
      clearInterval(timerRef.current);

      if (result.status === "confirmed") {
        await finalizeTransaction(hash, fileHash, attemptIdRef.current);
        setStage(4);
        if (onSuccess) onSuccess();
      } else {
        setStage(-1);
        setError(result.message || "La transaction a échoué sur la blockchain.");
      }
    }, POLL_INTERVAL_MS);
  };

  const run = async () => {
    setStage(1);
    setError(null);
    setTxHash(null);

    const connection = await connectToContract();
    if (!connection.success) {
      setStage(-1);
      setError("Impossible de se connecter au contrat.");
      return;
    }

    setStage(2);
    const broadcast = await broadcastToEthereum({ hash: fileInfo.hash, name: fileInfo.name });

    if (!broadcast.success) {
      setStage(-1);
      setError(broadcast.existingAddress
        ? "Ce fichier est déjà enregistré sur la blockchain."
        : broadcast.message || "La transaction a échoué.");
      return;
    }

    attemptIdRef.current = broadcast.attemptId;
    setTxHash(broadcast.txHash);
    setStage(3);
    startTimer();
    startPolling(broadcast.txHash, fileInfo.hash);
  };

  useEffect(() => {
    if (state) run();
  }, [state]);

  const stepState = (targetStage) => {
    if (stage === -1) return {};
    if (stage > targetStage) return { completed: true };
    if (stage === targetStage) return { active: true };
    return { disabled: true };
  };

  return (
    <Segment disabled={!state}>
      <Header as="h2">
        <Icon name="ethereum" />
        Blockchain
      </Header>

      <StepGroup fluid vertical size="small">
        <Step {...stepState(1)}>
          <Icon name={stage === 1 ? "spinner" : "plug"} loading={stage === 1} />
          <StepContent>
            <StepTitle>Connexion</StepTitle>
            <StepDescription>Vérification du contrat</StepDescription>
          </StepContent>
        </Step>

        <Step {...stepState(2)}>
          <Icon name={stage === 2 ? "spinner" : "pencil"} loading={stage === 2} />
          <StepContent>
            <StepTitle>Signature</StepTitle>
            <StepDescription>Envoi de la transaction au réseau</StepDescription>
          </StepContent>
        </Step>

        <Step {...stepState(3)}>
          <Icon name={stage === 3 ? "spinner" : "clock outline"} loading={stage === 3} />
          <StepContent>
            <StepTitle>
              Confirmation
              {stage === 3 && (
                <span style={{ marginLeft: "0.5em", fontWeight: "normal", color: "#888" }}>
                  {elapsed}s
                </span>
              )}
            </StepTitle>
            <StepDescription>
              {stage >= 3 && txHash ? (
                <>
                  {stage === 3 && "En attente des mineurs — "}
                  <a href={`${ETHERSCAN_URL}/tx/${txHash}`} target="_blank" rel="noopener noreferrer">
                    Voir la transaction <Icon name="external alternate" size="small" />
                  </a>
                </>
              ) : (
                "En attente de la confirmation du réseau"
              )}
            </StepDescription>
          </StepContent>
        </Step>

        <Step {...stepState(4)}>
          <Icon
            name={stage === 4 ? "check circle" : "flag checkered"}
            color={stage === 4 ? "green" : undefined}
          />
          <StepContent>
            <StepTitle>Enregistré</StepTitle>
            <StepDescription>
              {stage === 4 ? (
                <a href={`${ETHERSCAN_URL}/tx/${txHash}`} target="_blank" rel="noopener noreferrer">
                  Voir sur la blockchain <Icon name="external alternate" size="small" />
                </a>
              ) : (
                "Votre fichier sera inscrit de façon permanente"
              )}
            </StepDescription>
          </StepContent>
        </Step>
      </StepGroup>

      {stage === -1 && (
        <div style={{ marginTop: "1em", color: "#db2828" }}>
          <Icon name="exclamation triangle" />
          {error}
          {txHash && (
            <div style={{ marginTop: "0.5em" }}>
              <a href={`${ETHERSCAN_URL}/tx/${txHash}`} target="_blank" rel="noopener noreferrer">
                Vérifier la transaction <Icon name="external alternate" size="small" />
              </a>
            </div>
          )}
        </div>
      )}
    </Segment>
  );
}
