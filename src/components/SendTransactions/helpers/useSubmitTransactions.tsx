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
    new Promise((resolve) => {
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
              resolve({ status: new TransactionStatus("fail"), hash });
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
          receiver: tx.getReceiver(),
        })),
        sessionId,
        sequential,
        successDescription,
      });
      const statuses = [];
      for (let [index, transaction] of txEntries) {
        try {
          const hash = await dapp.proxy.sendTransaction(transaction);
          const { status } = await getStatus(hash);
          statuses.push(status);
          if (!status.isPending()) {
            const endStatus =
              statuses.length === transactions.length &&
              statuses.every((status) => status.isSuccessful())
                ? "success"
                : "failed";
            const batchStatus =
              index === transactions.length - 1 ? endStatus : "pending";

            updateSendStatus({
              loading: false,
              status: batchStatus,
              transactions: [
                {
                  hash,
                  status,
                  sessionId,
                  receiver: (transaction as Transaction).getReceiver(),
                },
              ],
              sessionId,
              sequential,
              successDescription,
            });

            if (batchStatus === "success") {
              const nonce = account.nonce.valueOf() + transactions.length;
              const oneHour = 3600000;
              setItem("nonce", nonce, oneHour);
            }
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
          transactions: hashes.map((hash, i) => ({
            hash,
            status: new TransactionStatus("pending"),
            sessionId,
            receiver: transactions[i].getReceiver(),
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
            transactions: statuses.map((status, i) => ({
              ...status,
              receiver: transactions[i].getReceiver(),
              sessionId,
            })),
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
