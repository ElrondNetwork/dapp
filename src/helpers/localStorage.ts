import moment from "moment";

export type LocalKeyType = number | "nonce";

export const setItem = (key: LocalKeyType, item: any, ttl: number = 120000) => {
  const expires = moment().unix() + ttl;
  localStorage.setItem(
    String(key),
    JSON.stringify({
      expires,
      data: item,
    })
  );
};

export const getItem = (key: LocalKeyType): any => {
  const item = localStorage.getItem(String(key));
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
    localStorage.removeItem(String(key));
    return null;
  }

  return deserializedItem.data;
};

export const removeItem = (key: LocalKeyType) =>
  localStorage.removeItem(String(key));

export const signSession = "signSession";

export const successDescription = "successDescription";
