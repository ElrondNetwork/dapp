import { useContext, useDispatch } from "context";
import getProviderType from "./getProviderType";
import storage from "./storage";

export default function useLogout() {
  const { dapp } = useContext();
  const dispatch = useDispatch();
  const providerType = getProviderType(dapp.provider);

  return ({ callbackUrl }: { callbackUrl: string }) => {
    storage.session.clear();
    storage.local.removeItem("nonce");
    storage.local.removeItem("address");
    storage.local.removeItem("loginMethod");
    if (Boolean(providerType)) {
      dapp.provider
        .logout({ callbackUrl })
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
