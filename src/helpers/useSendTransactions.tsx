import * as React from "react";
import {
  Transaction,
  TransactionHash,
  TransactionStatus,
} from "@elrondnetwork/erdjs";

export interface SendStatusType {
  loading?: boolean;
  error?: string;
  transactions?: {
    hash: TransactionHash;
    status: TransactionStatus;
    sessionId: string;
  }[];
  sessionId?: string;
  sequential?: boolean;
  status?: "success" | "failed" | "cancelled" | "pending" | "forbidden";
  successDescription?: string;
}

export function updateSendStatus(sendStatus: SendStatusType) {
  const customEvent = new CustomEvent("updateSendStatus", {
    detail: { sendStatus },
  });
  document.dispatchEvent(customEvent);
}

export default function useSendTransactions() {
  const [sendStatus, setSendStatus] = React.useState<SendStatusType>({
    loading: undefined,
    error: "",
    sessionId: "",
    transactions: [],
    status: undefined,
    sequential: undefined,
  });

  const updateState = (e: CustomEvent) => {
    if (
      e.detail &&
      "sendStatus" in e.detail &&
      typeof e.detail.sendStatus === "object" &&
      e.detail.sendStatus !== null
    ) {
      setSendStatus((existing) => {
        const updatedTransactions: SendStatusType["transactions"] =
          e.detail.sendStatus.transactions &&
          e.detail.sendStatus.transactions.length > 0
            ? e.detail.sendStatus.transactions
            : [];
        const updatedTransactionHashes = updatedTransactions
          ? updatedTransactions.map((tx) => tx.hash.toString())
          : [];

        const newTxs =
          existing.transactions && existing.transactions.length > 0
            ? existing.transactions.map((existingTx) => {
                if (
                  updatedTransactionHashes.includes(existingTx.hash.toString())
                ) {
                  return updatedTransactions?.find(
                    (tx) => tx.hash.toString() === existingTx.hash.toString()
                  );
                } else {
                  return existingTx;
                }
              })
            : updatedTransactions;

        return {
          ...existing,
          ...e.detail.sendStatus,
          transactions: newTxs,
        };
      });
    }
  };

  React.useEffect(() => {
    document.addEventListener("updateSendStatus", updateState);
    return () => {
      document.removeEventListener("updateSendStatus", updateState);
    };
  }, []);

  const sendTransactions = ({
    transactions,
    callbackRoute,
    successDescription,
    sequential,
  }: {
    transactions: Transaction[];
    callbackRoute: string;
    successDescription?: string;
    sequential?: boolean;
  }) => {
    const customEvent = new CustomEvent("transactions", {
      detail: { transactions, callbackRoute, successDescription, sequential },
    });
    document.dispatchEvent(customEvent);
  };

  return { sendTransactions, sendStatus };
}
