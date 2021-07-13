import * as React from "react";
import {
  Transaction,
  TransactionHash,
  TransactionStatus,
} from "@elrondnetwork/erdjs";
import { useContext, useDispatch } from "context";
import useSendTransactions, {
  updateSendStatus,
  SendStatusType,
} from "helpers/useSendTransactions";
import { setItem } from "helpers/localStorage";

const searchInteval = 2000;

export default function useSubmitTransactions() {
  const { dapp, account } = useContext();
  const dispatch = useDispatch();
  const { sendStatus } = useSendTransactions();
  const ref = React.useRef<any>();

  const getStatus = (
    hash: TransactionHash
  ): Promise<{ status: TransactionStatus; hash: TransactionHash }> =>
    new Promise((resolve, reject) => {
      ref.current = setInterval(() => {
        if (!document.hidden) {
          dapp.apiProvider
            .getTransaction(hash)
            .then(({ status }) => {
              if (!status.isPending()) {
                clearInterval(ref.current);
                resolve({ status, hash });
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
    sessionId,
  }: {
    transactions: Transaction[];
    successDescription?: string;
    sequential: boolean;
    sessionId: string;
  }) => {
    if (sequential) {
      const txEntries: any = transactions.entries();
      updateSendStatus({
        loading: false,
        status: "pending",
        transactions:
          sendStatus.transactions && sendStatus.transactions.length > 0
            ? [
                ...sendStatus.transactions,
                ...transactions.map((tx) => ({
                  hash: tx.getHash(),
                  status: new TransactionStatus("pending"),
                  sessionId,
                })),
              ]
            : [
                ...transactions.map((tx) => ({
                  hash: tx.getHash(),
                  status: new TransactionStatus("pending"),
                  sessionId,
                })),
              ],
        sessionId,
        successDescription,
      });
      for (let [index, transaction] of txEntries) {
        try {
          const hash = await dapp.proxy.sendTransaction(transaction);
          const { status } = await getStatus(hash);

          if (!status.isPending()) {
            updateSendStatus({
              loading: false,
              status: index === transactions.length - 1 ? "success" : "pending",
              transactions: [{ hash, status, sessionId }],
              sessionId,
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
          status: "pending",
          transactions: hashes.map((hash) => ({
            hash,
            status: new TransactionStatus("pending"),
            sessionId,
          })),
          sessionId,
          successDescription,
        });

        Promise.all(hashes.map((hash) => getStatus(hash))).then((statuses) => {
          updateSendStatus({
            loading: false,
            status: statuses.every(({ status }) => status.isSuccessful())
              ? "success"
              : "failed",
            transactions: statuses.map((status) => ({ ...status, sessionId })),
            successDescription,
          });
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
