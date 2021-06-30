import qs from "qs";
import { Transaction } from "@elrondnetwork/erdjs";
import * as ls from "helpers/localStorage";
import moment from "moment";

interface SignTransactionsType {
  transactions: Transaction[];
  callbackRoute: string;
}

const buildSearchString = (plainTransactions: Object[]) => {
  const response = {};

  const keys = plainTransactions
    .map((transaction) => Object.keys(transaction))
    .reduce((accumulator, current) => [...accumulator, ...current], [])
    .filter((value, index, array) => array.indexOf(value) === index);

  keys.forEach((key) => {
    response[key] = plainTransactions.map((transaction) => transaction[key]);
  });

  return response;
};

export default function walletSign({
  transactions,
  callbackRoute,
}: SignTransactionsType) {
  const plainTransactions = transactions
    .map((tx) => tx.toPlainObject())
    .map((tx) => ({
      ...tx,
      data: tx.data ? Buffer.from(tx.data, "base64").toString() : "",
      token: "",
    }));

  ls.setItem(moment().valueOf(), JSON.stringify(plainTransactions));
  const parsedTransactions = buildSearchString(plainTransactions);
  const search = qs.stringify({
    ...parsedTransactions,
    callbackUrl: `${window.location.origin}${callbackRoute}`,
  });
  window.location.href = `https://localhost:3000/hook/sign?${search}`;
}
