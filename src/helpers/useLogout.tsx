import { useContext, useDispatch } from "context";

export default function useLogout() {
  const { dapp } = useContext();
  const dispatch = useDispatch();
  return ({ callbackUrl }: { callbackUrl: string }) => {
    dapp.provider
      .logout({ callbackUrl })
      .then(() => {
        dispatch({ type: "logout" });
      })
      .catch((e) => console.error("logout", e));
  };
}
