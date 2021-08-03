import { AccountOnNetwork, Address, Nonce } from "@elrondnetwork/erdjs";
import { useContext, useDispatch } from "context";
import { setItem } from "helpers/localStorage";

export function useGetAccount() {
  const { dapp } = useContext();
  return (address: string) => dapp.proxy.getAccount(new Address(address));
}

export function useGetAddress() {
  const { dapp } = useContext();
  return () => dapp.provider.getAddress();
}

export const useSetNonce = () => {
  const dispatch = useDispatch();
  const { account, address } = useContext();
  const oneHourInSeconds = 3600;
  return (nonce: number) => {
    setItem("nonce", nonce, oneHourInSeconds);
    dispatch({
      type: "setAccount",
      account: {
        balance: account.balance.toString(),
        address,
        nonce: new Nonce(nonce),
      },
    });
  };
};

export function getLatestNonce(account: AccountOnNetwork) {
  const lsNonce = localStorage.getItem("nonce");
  const nonce =
    lsNonce && !isNaN(parseInt(lsNonce))
      ? new Nonce(Math.max(parseInt(lsNonce), account.nonce.valueOf()))
      : account.nonce;
  return nonce;
}

export function useGetAccountShard() {
  const { network, address, shard } = useContext();
  const dispatch = useDispatch();

  return () =>
    new Promise((resolve) => {
      if (shard === undefined) {
        fetch(`${network.apiAddress}/accounts/${address}`)
          .then((response) => response.json())
          .then(({ shard }) => {
            dispatch({ type: "setAccountShard", shard });
            resolve(shard);
          })
          .catch((err) => {
            console.error(err);
            resolve(undefined);
          });
      } else {
        resolve(shard);
      }
    });
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
      ? setAccount()
      : dapp.provider
          .init()
          .then((initialised) => {
            if (!initialised) {
              return;
            }
            setAccount();
          })
          .catch((e) => {
            console.error("Failed initializing provider ", e);
          });
}
