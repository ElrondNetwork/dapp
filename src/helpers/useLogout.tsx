import { useContext, useDispatch } from "context";
import getProviderType from "./getProviderType";
import storage from "./storage";

export default function useLogout() {
  const { dapp } = useContext();
  const dispatch = useDispatch();
  const providerType = getProviderType(dapp.provider);

  return ({
    callbackUrl,
    callbackRoute,
  }:
    | {
        callbackUrl: string;
        callbackRoute?: never;
      }
    | {
        callbackUrl?: never;
        callbackRoute: string;
      }) => {
    storage.session.clear();
    storage.local.removeItem("nonce");
    storage.local.removeItem("address");
    storage.local.removeItem("loginMethod");
    storage.local.removeItem("ledgerLogin");

    const url = callbackRoute
      ? `${window.location.origin}${callbackRoute}`
      : callbackUrl;

    if (Boolean(providerType)) {
      dapp.provider
        .logout({ callbackUrl: url })
        .then(() => {
          dispatch({ type: "logout" });
        })
        .catch((e) => {
          console.error("Unable to perform logout", e);
        });
    } else {
      dispatch({ type: "logout" });
    }
  };
}
