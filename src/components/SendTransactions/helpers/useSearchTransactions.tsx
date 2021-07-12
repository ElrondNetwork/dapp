import * as React from "react";
import qs from "qs";
import { Signature } from "@elrondnetwork/erdjs/out/signature";
import { Address, Nonce } from "@elrondnetwork/erdjs";
import { useLocation } from "react-router-dom";
import * as ls from "helpers/localStorage";
import { useContext } from "context";
import { updateSendStatus } from "helpers/useSendTransactions";
import useSubmitTransactions from "./useSubmitTransactions";
import newTransaction from "./newTransaction";

export default function useSearchTransactions() {
  const { search } = useLocation();
  const { address } = useContext();
  const submitTransactions = useSubmitTransactions();

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
        const sessionTransactions = ls.getItem(signSessionId);
        const successDescription = searchData.successDescription?.toString();

        if (sessionTransactions) {
          try {
            const parsedTansactions: any[] = JSON.parse(sessionTransactions);
            ls.removeItem(signSessionId);

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

            submitTransactions(signedTransactions, successDescription);
          } catch (err) {
            updateSendStatus({ loading: false, status: "failed" });
          }
        }
      }
    }
  }, [search]);
}
