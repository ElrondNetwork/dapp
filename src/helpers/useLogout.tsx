import { useContext, useDispatch } from "context";
import storage from "./storage";

export default function useLogout() {
  const { dapp } = useContext();
  const dispatch = useDispatch();
  return ({ callbackUrl }: { callbackUrl: string }) => {
    storage.session.clear();
    storage.local.removeItem("nonce");
    storage.local.removeItem("address");
    storage.local.removeItem("loginMethod");
    dapp.provider
      .logout({ callbackUrl })
      .then(() => {
        dispatch({ type: "logout" });
      })
      .catch((e) => {
        console.error("Unable to perform logout", e);
      });
  };
}
