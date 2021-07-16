import moment from "moment";

export type SessionKeyType =
  | number
  | "loggedIn"
  | "walletLogin"
  | "address"
  | "ledgerLogin"
  | "walletConnectLogin"
  | "transactionIdentifier"
  | "ledgerAccountIndex";

export const setItem = (
  key: SessionKeyType,
  item: any,
  secondsToExipre: number = 3600
) => {
  const expires = moment().unix() + secondsToExipre;
  sessionStorage.setItem(
    String(key),
    JSON.stringify({
      expires,
      data: item,
    })
  );
};

export const getItem = (key: SessionKeyType): any => {
  const item = sessionStorage.getItem(String(key));
  if (!item) {
    return null;
  }

  const deserializedItem = JSON.parse(item);
  if (!deserializedItem) {
    return null;
  }

  if (
    !deserializedItem.hasOwnProperty("expires") ||
    !deserializedItem.hasOwnProperty("data")
  ) {
    return null;
  }

  const expired = moment().unix() >= deserializedItem.expires;
  if (expired) {
    sessionStorage.removeItem(String(key));
    return null;
  }

  return deserializedItem.data;
};

export const removeItem = (key: SessionKeyType) =>
  sessionStorage.removeItem(String(key));
