import * as React from "react";
import qs from "qs";
import { Signature } from "@elrondnetwork/erdjs/out/signature";
import { Address, Balance, Nonce } from "@elrondnetwork/erdjs";
import { useLocation } from "react-router-dom";
import * as ls from "helpers/localStorage";
import { signSession } from "./walletSign";
import { useContext } from "context";
import newTransaction from "helpers/newTransaction";

export default function useSubmitTransactions() {
  const { search } = useLocation();
  const context = useContext();
  const { dapp, address, network } = context;

  React.useEffect(() => {
    if (search) {
      const searchData = qs.parse(search.replace("?", ""));

      if (
        searchData &&
        signSession in searchData &&
        "signature" in searchData &&
        Array.isArray(searchData.signature)
      ) {
        const signSessionId: number = (searchData as any)[signSession];
        const sessionTransactions = ls.getItem(signSessionId);

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

            transactions.forEach((tx, index) => {
              const transaction = newTransaction(tx);

              console.log(
                tx.signature,
                searchData.signature ? searchData.signature[index] : "missing"
              );

              const signature = new Signature(tx.signature);
              transaction.setNonce(new Nonce(tx.nonce));
              transaction.applySignature(signature, new Address(address));

              dapp.proxy
                .sendTransaction(transaction)
                .then((result) => {
                  console.log(result);
                })
                .catch((err) => {
                  console.error("Failed seding transaction", err);
                });
            });
          } catch (err) {
            console.log("Unable to parse session transactions");
          }
        }
      }
    }
  }, [search]);
}
