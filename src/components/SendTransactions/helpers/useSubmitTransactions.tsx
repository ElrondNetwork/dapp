import * as React from "react";
import {
  Transaction,
  TransactionHash,
  TransactionStatus,
} from "@elrondnetwork/erdjs";
import { useContext, useDispatch } from "context";
import { updateSendStatus } from "helpers/useSendTransactions";
import { setItem } from "helpers/localStorage";

const searchInteval = 2000;

export default function useSubmitTransactions() {
  const { dapp, account } = useContext();
  const dispatch = useDispatch();

  const getStatus = (
    hash: TransactionHash
  ): Promise<{ status: TransactionStatus; hash: TransactionHash }> =>
    new Promise((resolve, reject) => {
      const newInterval = setInterval(() => {
        if (!document.hidden) {
          dapp.apiProvider
            .getTransaction(hash)
            .then(({ status }) => {
              if (!status.isPending()) {
                clearInterval(newInterval);
                resolve({ status, hash });
              }
            })
            .catch(() => {
              clearInterval(newInterval);
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
        transactions: transactions.map((tx) => ({
          hash: tx.getHash(),
          status: new TransactionStatus("pending"),
          sessionId,
        })),
        sessionId,
        sequential,
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
              sequential,
              successDescription,
            });
          }
        } catch (err) {
          updateSendStatus({ loading: false, status: "failed", sessionId });
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
          sequential,
          successDescription,
        });

        Promise.all(hashes.map((hash) => getStatus(hash))).then((statuses) => {
          updateSendStatus({
            loading: false,
            status: statuses.every(({ status }) => status.isSuccessful())
              ? "success"
              : "failed",
            transactions: statuses.map((status) => ({ ...status, sessionId })),
            sessionId,
            sequential,
            successDescription,
          });
        });

        const nonce = account.nonce.valueOf() + transactions.length;

        const oneHour = 3600000;

        setItem("nonce", nonce, oneHour);

        dispatch({ type: "setAccountNonce", nonce });
      } catch (err) {
        updateSendStatus({ loading: false, status: "failed", sessionId });
        console.error("Failed seding transaction", err);
      }
    }
  };
}
