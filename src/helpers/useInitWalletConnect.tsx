import React from "react";
import { WalletConnectProvider } from "@elrondnetwork/erdjs";
import { useHistory } from "react-router-dom";
import { useContext, useDispatch } from "context";
import { getItem } from "helpers/session";

interface InitWalletConnectType {
  callbackRoute: string;
  logoutRoute: string;
}

export default function useInitWalletConnect({
  callbackRoute,
  logoutRoute,
}: InitWalletConnectType) {
  const heartbeatInterval = 30000;
  const { dapp, walletConnectBridge } = useContext();
  const dispatch = useDispatch();
  const history = useHistory();

  const [error, setError] = React.useState<string>("");
  const [
    walletConnect,
    setWalletConnect,
  ] = React.useState<WalletConnectProvider>();

  const provider: any = dapp.provider;

  React.useEffect(() => {
    const interval = setInterval(() => {
      heartbeat();
    }, heartbeatInterval);

    return () => clearInterval(interval);
  }, [provider]);

  React.useEffect(() => {
    return () => {
      if (provider.walletConnector?.connected) {
        window.addEventListener("storage", (e) => {
          if (e.key === "walletconnect") {
            handleOnLogout();
          }
        });
      }
    };
  });

  const heartbeat = () => {
    if (provider?.walletConnector?.connected) {
      provider
        .sendCustomMessage({
          method: "heartbeat",
          params: {},
        })
        .then(() => {})
        .catch((e: any) => {
          console.error("Connection lost", e);
          handleOnLogout();
        });
    }
  };

  const handleOnLogin = () => {
    dapp.provider
      .getAddress()
      .then((address: string) => {
        const loggedIn = !!getItem("loggedIn");
        if (!loggedIn) {
          history.push(callbackRoute);
        }
        dispatch({
          type: "setWalletConnectLogin",
          walletConnectLogin: {
            loginType: "walletConnect",
            callbackRoute,
            logoutRoute,
          },
        });
        dispatch({ type: "login", address });
      })
      .catch((e) => {
        setError("Invalid address");
        console.log(e);
      });
  };

  const handleOnLogout = () => {
    if (!!getItem("loggedIn")) {
      history.push(logoutRoute);
    }
    dispatch({ type: "logout" });
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
