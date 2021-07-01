import { Transaction, TransactionHash } from "@elrondnetwork/erdjs";
import { useContext } from "context";

export default function useSubmitTransactions() {
  const context = useContext();
  const { dapp } = context;

  return (transactions: Transaction[]) => {
    transactions.forEach((transaction) => {
      dapp.proxy
        .sendTransaction(transaction)
        .then((result) => {
          const hash = new TransactionHash(`${result}`);
          console.log(hash.toString());
        })
        .catch((err) => {
          console.error("Failed seding transaction", err);
        });
    });
  };
}
