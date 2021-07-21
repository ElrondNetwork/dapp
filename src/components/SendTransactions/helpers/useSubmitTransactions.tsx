import * as React from "react";
import {
  Transaction,
  TransactionHash,
  TransactionStatus,
} from "@elrondnetwork/erdjs";
import { useContext, useDispatch } from "context";
import { SendStatusType, updateSendStatus } from "helpers/useSendTransactions";
import { setItem } from "helpers/localStorage";

const searchInteval = 2000;
const delayInterval = 12200;

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
    delayLast,
  }: {
    transactions: Transaction[];
    successDescription?: string;
    sequential: boolean;
    delayLast?: boolean;
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
              const oneHourInSeconds = 3600;
              setItem("nonce", nonce, oneHourInSeconds);
            }
          }
        } catch (err) {
          updateSendStatus({ loading: false, status: "failed", sessionId });
          console.error("Failed seding transaction", err);
        }
      }
    } else {
      try {
        let hashes: TransactionHash[] = [];
        if (delayLast) {
          const txEntries: any = transactions.entries();
          for (let [index, transaction] of txEntries) {
            if (index === transactions.length - 1) {
              const delayed = (): Promise<() => Promise<TransactionHash>> =>
                new Promise((resolve) => {
                  setTimeout(() => {
                    resolve(() => dapp.proxy.sendTransaction(transaction));
                  }, delayInterval);
                });
              const sendDelayedTransaction = await delayed();
              const hash = await sendDelayedTransaction();
              hashes.push(hash);
            } else {
              const hash = await dapp.proxy.sendTransaction(transaction);
              hashes.push(hash);
              updateSendStatus({
                loading: false,
                status: "pending",
                transactions: [
                  {
                    hash,
                    status: new TransactionStatus("pending"),
                    sessionId,
                    receiver: transaction.getReceiver(),
                  },
                ],
                sessionId,
                sequential,
                successDescription,
              });
            }
          }
        } else {
          hashes = await Promise.all(
            transactions.map((tx) => dapp.proxy.sendTransaction(tx))
          );
        }

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

        let resolvedTransactions: SendStatusType["transactions"] = [];
        const newInterval = setInterval(() => {
          if (!document.hidden) {
            hashes.forEach((hash, i) => {
              const txResolved = resolvedTransactions?.some(
                (tx) => tx.hash.toString() === hash.toString()
              );
              if (!txResolved) {
                dapp.apiProvider
                  .getTransaction(hash)
                  .then(({ status }) => {
                    if (!status.isPending()) {
                      const transaction = {
                        status,
                        hash,
                        receiver: transactions[i].getReceiver(),
                        sessionId,
                      };

                      resolvedTransactions?.push(transaction);
                      updateSendStatus({
                        loading: false,
                        status: "pending",
                        transactions: [transaction],
                        sessionId,
                        sequential,
                        successDescription,
                      });
                    }
                  })
                  .catch(() => {
                    const failedTransaction = {
                      status: new TransactionStatus("fail"),
                      hash,
                      receiver: transactions[i].getReceiver(),
                      sessionId,
                    };
                    resolvedTransactions?.push(failedTransaction);
                    updateSendStatus({
                      loading: false,
                      status: "pending",
                      transactions: [failedTransaction],
                      sessionId,
                      sequential,
                      successDescription,
                    });
                  });
              }
              if (resolvedTransactions?.length === transactions.length) {
                clearInterval(newInterval);
                updateSendStatus({
                  loading: false,
                  status: resolvedTransactions.every(({ status }) =>
                    status.isSuccessful()
                  )
                    ? "success"
                    : "failed",
                  transactions: resolvedTransactions,
                  sessionId,
                  sequential,
                  successDescription,
                });
                const nonce = account.nonce.valueOf() + transactions.length;

                const oneHourInSeconds = 3600;

                setItem("nonce", nonce, oneHourInSeconds);

                dispatch({ type: "setAccountNonce", nonce });
              }
            });
          }
        }, searchInteval);
      } catch (err) {
        updateSendStatus({ loading: false, status: "failed", sessionId });
        console.error("Failed seding transaction", err);
      }
    }
  };
}
