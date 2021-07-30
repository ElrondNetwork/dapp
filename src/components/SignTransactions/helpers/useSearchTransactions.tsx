import * as React from "react";
import qs from "qs";
import { Signature } from "@elrondnetwork/erdjs/out/signature";
import { Address, Nonce } from "@elrondnetwork/erdjs";
import { useLocation } from "react-router-dom";
import * as ls from "helpers/localStorage";
import { useContext } from "context";
import { updateSignStatus } from "helpers/useSignTransactions";
import newTransaction from "./newTransaction";

export default function useSearchTransactions() {
  const { search } = useLocation();
  const { address } = useContext();

  React.useEffect(() => {
    if (search) {
      const searchData = qs.parse(search.replace("?", ""));

      if (
        searchData &&
        ls.signSession in searchData &&
        "signature" in searchData &&
        Array.isArray(searchData.signature)
      ) {
        const signSessionId: number = (searchData as any)[ls.signSession];
        const sessionData = ls.getItem(signSessionId);

        if (sessionData) {
          try {
            const sessionObject = JSON.parse(sessionData);
            ls.removeItem(signSessionId);

            const parsedTansactions: any[] = Array.isArray(
              sessionObject.transactions
            )
              ? sessionObject.transactions
              : [];

            const transactions = parsedTansactions.map(
              (transaction, index) => ({
                ...transaction,
                signature: searchData.signature
                  ? searchData.signature[index]
                  : "",
                sender: address,
              })
            );

            const signedTransactions = transactions.map((tx) => {
              const transaction = newTransaction(tx);
              const signature = new Signature(tx.signature);
              transaction.setNonce(new Nonce(tx.nonce));
              transaction.applySignature(signature, new Address(address));
              return transaction;
            });

            updateSignStatus({
              [signSessionId.toString()]: {
                loading: false,
                status: "signed",
                transactions: signedTransactions,
              },
            });
          } catch (err) {
            updateSignStatus({
              [signSessionId.toString()]: {
                loading: false,
                status: "failed",
              },
            });
          }
        }
      }
    }
  }, [search]);
}
