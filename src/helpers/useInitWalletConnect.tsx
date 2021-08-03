import React from "react";
import { WalletConnectProvider } from "@elrondnetwork/erdjs";
import { useHistory } from "react-router-dom";
import { useContext, useDispatch } from "context";

interface InitWalletConnectType {
  callbackRoute: string;
  logoutRoute: string;
}

export default function useInitWalletConnect({
  callbackRoute,
  logoutRoute,
}: InitWalletConnectType) {
  const { dapp, walletConnectBridge } = useContext();
  const dispatch = useDispatch();
  const history = useHistory();

  const [error, setError] = React.useState<string>("");
  const [
    walletConnect,
    setWalletConnect,
  ] = React.useState<WalletConnectProvider>();

  const handleOnLogin = () => {
    dapp.provider
      .getAddress()
      .then((address) => {
        dispatch({
          type: "setWalletConnectLogin",
          walletConnectLogin: {
            loginType: "walletConnect",
            callbackRoute,
            logoutRoute,
          },
        });
        dispatch({ type: "login", address });
        history.push(callbackRoute);
      })
      .catch((e) => {
        setError("Invalid address");
        console.log(e);
      });
  };

  const handleOnLogout = () => {
    dispatch({ type: "logout" });
    history.push(logoutRoute);
  };

  const walletConnectInit = () => {
    const provider = new WalletConnectProvider(
      dapp.proxy,
      walletConnectBridge,
      {
        onClientLogin: handleOnLogin,
        onClientLogout: handleOnLogout,
      }
    );
    dispatch({ type: "setProvider", provider });
    dapp.provider = provider;
    setWalletConnect(provider);
  };

  return {
    error,
    walletConnectInit,
    walletConnect,
  };
}
