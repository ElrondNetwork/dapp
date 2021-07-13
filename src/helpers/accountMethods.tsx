import {
  AccountOnNetwork,
  Address,
  DAPP_DEFAULT_TIMEOUT,
  Nonce,
} from "@elrondnetwork/erdjs";
import { useContext, useDispatch } from "context";

export function useGetAccount() {
  const { dapp } = useContext();
  return (address: string) => dapp.proxy.getAccount(new Address(address));
}

export function useGetAddress() {
  const { dapp } = useContext();
  return () => dapp.provider.getAddress();
}

export function getLatestNonce(account: AccountOnNetwork) {
  const lsNonce = localStorage.getItem("nonce");
  const nonce =
    lsNonce && !isNaN(parseInt(lsNonce))
      ? new Nonce(Math.max(parseInt(lsNonce), account.nonce.valueOf()))
      : account.nonce;
  return nonce;
}

export function useRefreshAccount() {
  const { dapp } = useContext();
  const getAddress = useGetAddress();
  const getAccount = useGetAccount();
  const dispatch = useDispatch();

  const setAccount = () => {
    getAddress()
      .then((address) => {
        getAccount(address)
          .then((account) => {
            dispatch({
              type: "setAccount",
              account: {
                balance: account.balance.toString(),
                address,
                nonce: getLatestNonce(account),
              },
            });
          })
          .catch((e) => {
            console.error("Failed getting account ", e);
          });
      })
      .catch((e) => {
        console.error("Failed getting address ", e);
      });
  };

  return () =>
    dapp.provider.isInitialized()
      ? dapp.provider
          .init()
          .then((initialised) => {
            if (!initialised) {
              return;
            }
            setAccount();
          })
          .catch((e) => {
            console.error("Failed initializing provider ", e);
          })
      : setAccount();
}
