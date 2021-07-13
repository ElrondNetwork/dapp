import * as React from "react";
import {
  Transaction,
  TransactionHash,
  TransactionStatus,
} from "@elrondnetwork/erdjs";

export interface SendStatusType {
  loading?: boolean;
  error?: string;
  transactions?: { hash: TransactionHash; status: TransactionStatus }[];
  status?: "success" | "failed" | "cancelled" | "pending";
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
    transactions: [],
    status: undefined,
  });

  const updateState = (e: CustomEvent) => {
    if (
      e.detail &&
      "sendStatus" in e.detail &&
      typeof e.detail.sendStatus === "object" &&
      e.detail.sendStatus !== null
    ) {
      setSendStatus((existing) => ({
        ...existing,
        ...e.detail.sendStatus,
      }));
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
