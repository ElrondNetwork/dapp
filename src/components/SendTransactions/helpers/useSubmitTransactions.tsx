import * as React from "react";
import {
  Transaction,
  TransactionHash,
  TransactionStatus,
} from "@elrondnetwork/erdjs";
import { useContext, useDispatch } from "context";
import useSendTransactions, {
  updateSendStatus,
} from "helpers/useSendTransactions";
import { setItem } from "helpers/localStorage";

const searchInteval = 2000;

export default function useSubmitTransactions() {
  const { dapp, account } = useContext();
  const dispatch = useDispatch();
  const { sendStatus } = useSendTransactions();
  const ref = React.useRef<any>();

  const getStatus = (hash: TransactionHash): Promise<TransactionStatus> =>
    new Promise((resolve, reject) => {
      ref.current = setInterval(() => {
        if (!document.hidden) {
          dapp.apiProvider
            .getTransaction(hash)
            .then(({ status }) => {
              if (!status.isPending()) {
                clearInterval(ref.current);
                resolve(status);
              }
            })
            .catch(() => {
              reject("Transaction not found");
            });
        }
      }, searchInteval);
    });

  return async ({
    transactions,
    successDescription,
    sequential,
  }: {
    transactions: Transaction[];
    successDescription?: string;
    sequential: boolean;
  }) => {
    if (sequential) {
      for (const transaction of transactions) {
        try {
          const hash = await dapp.proxy.sendTransaction(transaction);
          const status = await getStatus(hash);

          if (!status.isPending()) {
            updateSendStatus({
              loading: false,
              status:
                sendStatus.hashes &&
                sendStatus.hashes.length + 1 === transactions.length
                  ? "success"
                  : "pending",
              hashes: sendStatus.hashes ? [...sendStatus.hashes, hash] : [hash],
              successDescription,
            });
          }
        } catch (err) {
          updateSendStatus({ loading: false, status: "failed" });
          console.error("Failed seding transaction", err);
        }
      }
    } else {
      try {
        const txHashes = await Promise.all(
          transactions.map((transaction) =>
            dapp.proxy.sendTransaction(transaction)
          )
        );
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
      } catch (err) {
        updateSendStatus({ loading: false, status: "failed" });
        console.error("Failed seding transaction", err);
      }
    }
  };
}
