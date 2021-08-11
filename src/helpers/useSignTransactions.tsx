import * as React from "react";
import { Transaction } from "@elrondnetwork/erdjs";

export interface SignStatusType {
  [sessionId: string]: {
    transactions?: Transaction[];
    status?: "signed" | "failed" | "cancelled" | "pending";
    loading?: boolean;
  };
}

export interface SignTransactionsType {
  transactions: Transaction[];
  callbackRoute: string;
  sessionId: string;
}

export function updateSignStatus(signStatus: SignStatusType) {
  const customEvent = new CustomEvent("updateSignStatus", {
    detail: { signStatus },
  });
  document.dispatchEvent(customEvent);
}

export default function useSendTransactions() {
  const [signStatus, setSignStatus] = React.useState<SignStatusType>();

  const updateState = (e: CustomEvent) => {
    if (
      e.detail &&
      "signStatus" in e.detail &&
      typeof e.detail.signStatus === "object" &&
      e.detail.signStatus !== null
    ) {
      setSignStatus(e.detail.signStatus);
    }
  };

  React.useEffect(() => {
    document.addEventListener("updateSignStatus", updateState);
    return () => {
      document.removeEventListener("updateSignStatus", updateState);
    };
  }, []);

  const signTransactions = ({
    transactions,
    callbackRoute,
    sessionId,
  }: SignTransactionsType) => {
    const customEvent = new CustomEvent("signTransactions", {
      detail: {
        transactions,
        callbackRoute,
        sessionId,
      },
    });
    document.dispatchEvent(customEvent);
  };

  return { signTransactions, signStatus };
}
