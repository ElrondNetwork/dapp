import { Transaction, TransactionHash } from "@elrondnetwork/erdjs";
import { useContext } from "context";
import { updateSendStatus } from "helpers/useSendTransactions";

export default function useSubmitTransactions() {
  const { dapp } = useContext();

  return (transactions: Transaction[], successDescription?: string) => {
    Promise.all(
      transactions.map((transaction) => dapp.proxy.sendTransaction(transaction))
    )
      .then((txHashes) => {
        const hashes = txHashes.map((entry) => new TransactionHash(`${entry}`));
        updateSendStatus({
          loading: false,
          status: "success",
          hashes,
          successDescription,
        });
      })
      .catch((err) => {
        updateSendStatus({ loading: false, status: "failed" });
        console.error("Failed seding transaction", err);
      });
  };
}
