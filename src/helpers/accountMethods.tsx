import { Address } from "@elrondnetwork/erdjs";
import { useContext, useDispatch } from "context";

export function useGetAccount() {
  const { dapp } = useContext();
  return (address: string) => dapp.proxy.getAccount(new Address(address));
}

export function useGetAddress() {
  const { dapp } = useContext();
  return () => dapp.provider.getAddress();
}

export function useRefreshAccount() {
  const getAddress = useGetAddress();
  const getAccount = useGetAccount();
  const dispatch = useDispatch();

  return () =>
    getAddress().then((address) => {
      getAccount(address)
        .then((account) => {
          dispatch({
            type: "setAccount",
            account: {
              balance: account.balance.toString(),
              address,
              nonce: account.nonce,
            },
          });
        })
        .catch((e) => {
          console.error("Failed getting account ", e);
        });
    });
}
