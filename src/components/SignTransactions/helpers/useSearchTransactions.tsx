import * as React from "react";
import moment from "moment";
import qs from "qs";
import { Signature } from "@elrondnetwork/erdjs/out/signature";
import { Address, Nonce } from "@elrondnetwork/erdjs";
import { useLocation } from "react-router-dom";
import storage from "helpers/storage";
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
        storage.local.signSession in searchData &&
        "signature" in searchData &&
        Array.isArray(searchData.signature)
      ) {
        const signSessionId: number = (searchData as any)[
          storage.local.signSession
        ];
        const sessions = storage.local.getItem("sessions");

        if (sessions) {
          try {
            let sessionTransactions = [];
            try {
              if (signSessionId in sessions) {
                sessionTransactions = sessions[signSessionId];
                const sessionsWithoutCurrent = { ...sessions };
                delete sessionsWithoutCurrent[signSessionId];
                storage.local.setItem({
                  key: "sessions",
                  data: sessionsWithoutCurrent,
                  expires: moment().add(10, "minutes").unix(),
                });
              }
            } catch (err) {
              console.log("Unable to parse sessions");
            }

            const parsedTansactions: any[] = Array.isArray(sessionTransactions)
              ? sessionTransactions
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
