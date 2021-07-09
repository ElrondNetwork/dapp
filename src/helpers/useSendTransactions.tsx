import * as React from "react";
import { Transaction, TransactionHash } from "@elrondnetwork/erdjs";

interface StateType {
  loading?: boolean;
  error?: string;
  hashes?: TransactionHash[];
  status?: "success" | "failed" | "cancelled";
  successDescription?: string;
}

export function updateSendStatus(sendStatus: StateType) {
  const customEvent = new CustomEvent("updateSendStatus", {
    detail: { sendStatus },
  });
  document.dispatchEvent(customEvent);
}

export default function useSendTransactions() {
  const [sendStatus, setSendStatus] = React.useState<StateType>({
    loading: undefined,
    error: "",
    hashes: [],
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
  }: {
    transactions: Transaction[];
    callbackRoute: string;
    successDescription?: string;
  }) => {
    const customEvent = new CustomEvent("transactions", {
      detail: { transactions, callbackRoute, successDescription },
    });
    document.dispatchEvent(customEvent);
  };

  return { sendTransactions, sendStatus };
}
