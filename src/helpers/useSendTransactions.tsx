import { Transaction } from "@elrondnetwork/erdjs";

export default function useSendTransactions() {
  return ({
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
}
