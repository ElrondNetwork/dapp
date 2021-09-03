import * as React from "react";
import {
  ProxyProvider,
  HWProvider,
  ExtensionProvider,
} from "@elrondnetwork/erdjs";
import storage from "helpers/storage";
import { useContext, useDispatch } from "context";
import useInitWalletConnect from "helpers/useInitWalletConnect";
import { useGetAddress } from "helpers/accountMethods";
import { newWalletProvider } from "helpers/provider";

export default function useSetProvider() {
  const { network, dapp } = useContext();
  const dispatch = useDispatch();
  const { getItem } = storage.session;
  const getAddress = useGetAddress();

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
      case Boolean(getItem("loginMethod") === "ledger"):
      case Boolean(getItem("ledgerLogin")): {
        const hwWalletP = new HWProvider(dapp.proxy);
        hwWalletP
          .init()
          .then((success: any) => {
            if (!success) {
              console.warn("Could not initialise ledger app");
              return;
            }
            dispatch({ type: "setProvider", provider: hwWalletP });
          })
          .catch((err) => {
            console.error("Could not initialise ledger app", err);
          });
        break;
      }

      case Boolean(getItem("loginMethod") === "walletconnect"):
      case Boolean(walletConnectLogin): {
        walletConnectInit();
        break;
      }

      case Boolean(getItem("loginMethod") === "wallet"): {
        const provider = newWalletProvider(network);
        dispatch({ type: "setProvider", provider });
        break;
      }

      case Boolean(getItem("loginMethod") === "extension"):
      case Boolean(getItem("extensionLogin")): {
        getAddress()
          .then((address) => {
            const provider = ExtensionProvider.getInstance().setAddress(
              address
            );
            provider
              .init()
              .then((success: any) => {
                if (success) {
                  dispatch({ type: "setProvider", provider });
                } else {
                  console.error(
                    "Could not initialise extension, make sure Elrond wallet extension is installed."
                  );
                }
              })
              .catch((err) => {
                console.error("Unable to login to ExtensionProvider", err);
              });
          })
          .catch((e) => {
            console.log(e);
          });

        break;
      }
    }
  }, []);
}
