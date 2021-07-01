import * as React from "react";
import { Transaction } from "@elrondnetwork/erdjs";

interface StateType {
  loading?: boolean;
  error?: string;
  hashes?: string[];
  status?: "success" | "failed" | "cancelled";
}

export function updateSendStatus(sendStatus: StateType) {
  const customEvent = new CustomEvent("updateSendStatus", {
    detail: { sendStatus },
  });
  console.log("updateing with", sendStatus);

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
    console.log(
      "receiving",
      e.detail,
      e.detail &&
        "sendStatus" in e.detail &&
        typeof e.detail.sendStatus === "object" &&
        e.detail.sendStatus !== null
    );

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
  }: {
    transactions: Transaction[];
    callbackRoute: string;
  }) => {
    const customEvent = new CustomEvent("transactions", {
      detail: { transactions, callbackRoute },
    });
    document.dispatchEvent(customEvent);
  };

  return { sendTransactions, sendStatus };
}
