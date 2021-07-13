import { Transaction, TransactionHash } from "@elrondnetwork/erdjs";
import { useContext, useDispatch } from "context";
import { updateSendStatus } from "helpers/useSendTransactions";
import { setItem } from "helpers/localStorage";

export default function useSubmitTransactions() {
  const { dapp, account } = useContext();
  const dispatch = useDispatch();

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

        const nonce = account.nonce.valueOf() + transactions.length;

        const oneHour = 3600000;

        setItem("nonce", nonce, oneHour);

        dispatch({ type: "setAccountNonce", nonce });
      })
      .catch((err) => {
        updateSendStatus({ loading: false, status: "failed" });
        console.error("Failed seding transaction", err);
      });
  };
}
