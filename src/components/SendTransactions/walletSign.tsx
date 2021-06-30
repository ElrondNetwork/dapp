import qs from "qs";
import { Transaction } from "@elrondnetwork/erdjs";
import * as ls from "helpers/localStorage";
import moment from "moment";

interface SignTransactionsType {
  transactions: Transaction[];
  callbackRoute: string;
}

const buildSearchString = (transactions: Transaction[]) => {
  const response = {};

  const keys = transactions
    .map((tx) => tx.toPlainObject())
    .map((transaction) => Object.keys(transaction))
    .reduce((accumulator, current) => [...accumulator, ...current], [])
    .filter((value, index, array) => array.indexOf(value) === index);

  keys.forEach((key) => {
    response[key] = transactions.map((transaction) => transaction[key]);
  });

  return qs.stringify(response);
};

export default function walletSign({
  transactions,
  callbackRoute,
}: SignTransactionsType) {
  ls.setItem(moment().valueOf(), JSON.stringify(transactions));
  const url = buildSearchString(transactions);
  console.log(url, callbackRoute);
}
