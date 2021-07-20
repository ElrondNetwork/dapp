import * as React from "react";
import {
  Address,
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
    receiver: Address;
  }[];
  sessionId?: string;
  sequential?: boolean;
  delayLast?: boolean;
  status?: "success" | "failed" | "cancelled" | "pending";
  successDescription?: string;
}

export interface SendTransactionsType {
  transactions: Transaction[];
  callbackRoute: string;
  successDescription?: string;
  sequential?: boolean;
  delayLast?: boolean;
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
    delayLast: undefined,
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
        const existingTransactionHashes = existing.transactions
          ? existing.transactions.map((tx) => tx.hash.toString())
          : [];

        const newTxs =
          existing.transactions && existing.transactions.length > 0
            ? [
                ...existing.transactions.map((existingTx) => {
                  if (
                    updatedTransactionHashes.includes(
                      existingTx.hash.toString()
                    )
                  ) {
                    return updatedTransactions?.find(
                      (tx) => tx.hash.toString() === existingTx.hash.toString()
                    );
                  } else {
                    return existingTx;
                  }
                }),
                ...(updatedTransactions
                  ? [
                      ...updatedTransactions.filter(
                        ({ hash }: { hash: TransactionHash }) =>
                          !existingTransactionHashes.includes(hash.toString())
                      ),
                    ]
                  : []),
              ]
            : updatedTransactions;

        const newState = {
          ...existing,
          ...e.detail.sendStatus,
          transactions: newTxs,
        };
        return newState;
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
    delayLast,
  }: SendTransactionsType) => {
    const customEvent = new CustomEvent("transactions", {
      detail: {
        transactions,
        callbackRoute,
        successDescription,
        sequential,
        delayLast,
      },
    });
    document.dispatchEvent(customEvent);
  };

  return { sendTransactions, sendStatus };
}
