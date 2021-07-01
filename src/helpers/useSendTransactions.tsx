import { Transaction } from "@elrondnetwork/erdjs";
import { RawTransactionType } from "./types";

export default function useSendTransactions() {
  return ({
    transactions,
    callbackRoute,
  }: {
    transactions: RawTransactionType[];
    callbackRoute: string;
  }) => {
    const customEvent = new CustomEvent("transactions", {
      detail: { transactions, callbackRoute },
    });
    document.dispatchEvent(customEvent);
  };
}
