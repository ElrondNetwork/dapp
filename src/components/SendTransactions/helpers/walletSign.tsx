import qs from "qs";
import { Transaction } from "@elrondnetwork/erdjs";
import * as ls from "helpers/localStorage";
import { RawTransactionType } from "helpers/types";

interface SignTransactionsType {
  transactions: Transaction[];
  callbackRoute: string;
  walletAddress: string;
  successDescription?: string;
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

function buildUrlParams(
  search: string,
  urlParams: {
    [key: string]: string;
  }
) {
  const urlSearchParams = new URLSearchParams(search);
  const params = Object.fromEntries(urlSearchParams as any);

  const nextUrlParams = new URLSearchParams({
    ...params,
    ...urlParams,
  }).toString();

  return { nextUrlParams, params };
}

interface ReplyUrlType {
  callbackUrl: string;
  urlParams?: { [key: string]: string };
}

function replyUrl({ callbackUrl, urlParams = {} }: ReplyUrlType) {
  let url = callbackUrl;
  if (Object.entries(urlParams).length > 0) {
    const { search, origin, pathname } = new URL(callbackUrl);
    const { nextUrlParams } = buildUrlParams(search, urlParams);
    url = `${origin}${pathname}?${nextUrlParams}`;
  }
  return url;
}

export default function walletSign({
  walletAddress,
  transactions,
  callbackRoute,
  successDescription,
}: SignTransactionsType) {
  const plainTransactions = transactions
    .map((tx) => tx.toPlainObject())
    .map((tx) => ({
      ...tx,
      data: tx.data ? Buffer.from(tx.data, "base64").toString() : "",
    }));

  const signSessionId = Date.now();

  ls.setItem(signSessionId, JSON.stringify(plainTransactions));
  const parsedTransactions = buildSearchString(
    plainTransactions.map((tx) => ({
      ...tx,
      token: "",
    }))
  );

  const callbackUrl = replyUrl({
    callbackUrl: `${window.location.origin}${callbackRoute}`,
    urlParams: { [ls.signSession]: signSessionId.toString() },
  });

  const search = qs.stringify({
    ...parsedTransactions,
    successDescription,
    callbackUrl,
  });

  window.location.href = `${walletAddress}/hook/sign?${search}`;
}
