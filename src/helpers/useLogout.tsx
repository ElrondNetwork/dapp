import { useContext, useDispatch } from "context";

export default function useLogout() {
  const { dapp } = useContext();
  const dispatch = useDispatch();
  return () => {
    dapp.provider
      .logout()
      .then(() => {
        dispatch({ type: "logout" });
      })
      .catch((e) => console.error("logout", e));
  };
}
