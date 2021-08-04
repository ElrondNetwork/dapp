import * as React from "react";
import { ProxyProvider, HWProvider } from "@elrondnetwork/erdjs";
import storage from "helpers/storage";
import { useContext, useDispatch } from "context";
import useInitWalletConnect from "helpers/useInitWalletConnect";

export default function useSetProvider() {
  const { network } = useContext();
  const dispatch = useDispatch();
  const { getItem } = storage.session;

  const walletConnectLogin = getItem("walletConnectLogin");

  const { callbackRoute, logoutRoute } = walletConnectLogin
    ? walletConnectLogin
    : { callbackRoute: "", logoutRoute: "" };

  const { walletConnectInit } = useInitWalletConnect({
    callbackRoute,
    logoutRoute,
  });

  React.useEffect(() => {
    switch (true) {
      case Boolean(getItem("ledgerLogin")):
        const provider = new HWProvider(
          new ProxyProvider(`${network.gatewayAddress}`, { timeout: 4000 }),
          getItem("ledgerLogin").index
        );
        provider
          .init()
          .then((success: any) => {
            if (success) {
              dispatch({ type: "setProvider", provider });
            } else {
              console.error(
                "Could not initialise ledger app, make sure Elrond app is open"
              );
            }
          })
          .catch((err) => {
            console.error("error", err);
          });

        break;
      case Boolean(walletConnectLogin):
        walletConnectInit();
        break;
    }
  }, []);
}
