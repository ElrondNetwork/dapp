import * as React from "react";
import { Transaction } from "@elrondnetwork/erdjs";

export default function useSendTransactions() {
  const sendTransactions = ({
    transactions,
    callbackRoute,
  }: {
    transactions: Transaction[];
    callbackRoute: string;
  }) /*: Promise<string>*/ => {
    const newSignSession = Date.now();
    const customEvent = new CustomEvent("transactions", {
      detail: { transactions, callbackRoute },
    });
    document.dispatchEvent(customEvent);

    // return new Promise(function (resolve, reject) {
    //   function reqCallback(err, res, body) {
    //     if (err) reject(err);
    //     else resolve(body);
    //   }
    // });
  };

  return sendTransactions;
}
