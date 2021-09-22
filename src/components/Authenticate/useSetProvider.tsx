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
import getProviderType, { newWalletProvider } from "helpers/provider";
import useLogout from "helpers/useLogout";

export default function useSetProvider() {
  const { network, dapp, address } = useContext();
  const dispatch = useDispatch();
  const { getItem } = storage.session;
  const getAddress = useGetAddress();
  const [showLedgerProviderModal, setShowLedgerProviderModal] = React.useState(
    false
  );
  const logout = useLogout();

  const walletConnectLogin = getItem("walletConnectLogin");

  const { callbackRoute, logoutRoute } = walletConnectLogin
    ? walletConnectLogin
    : { callbackRoute: "", logoutRoute: "" };

  const { walletConnectInit } = useInitWalletConnect({
    callbackRoute,
    logoutRoute,
  });

  React.useEffect(() => {
    const loginMethod = storage.local.getItem("loginMethod");
    const ledgerLogin = storage.local.getItem("ledgerLogin");
    const providerType = getProviderType(dapp.provider);

    if (!providerType) {
      switch (true) {
        case Boolean(loginMethod === "ledger"):
        case Boolean(ledgerLogin): {
          const hwWalletP = new HWProvider(dapp.proxy);

          const onError = (message: string, err?: any) => {
            setShowLedgerProviderModal(false);
            dispatch({ type: "setProvider", provider: hwWalletP });
            logout({ callbackUrl: window.location.href });
            console.error(message, err);
            return;
          };

          hwWalletP.init().then((success: any) => {
            if (!success || !ledgerLogin) {
              onError("Could not initialise ledger app");
            }

            const storageIndex = parseInt(ledgerLogin.index);
            hwWalletP.hwApp
              ?.getAddress(0, storageIndex)
              .then((config) => {
                if (config.address !== address) {
                  setShowLedgerProviderModal(true);
                  hwWalletP
                    .login({ addressIndex: storageIndex })
                    .then((resultingAddress) => {
                      if (resultingAddress === address) {
                        dispatch({
                          type: "setProvider",
                          provider: hwWalletP,
                        });
                        setShowLedgerProviderModal(false);
                      }
                    })
                    .catch((err) => {
                      onError("Could not log into ledger provider", err);
                    });
                } else {
                  dispatch({ type: "setProvider", provider: hwWalletP });
                }
              })
              .catch((err) => {
                onError("Could not get ledger configuration", err);
              });
          });

          break;
        }

        case Boolean(loginMethod === "walletconnect"):
        case Boolean(walletConnectLogin): {
          walletConnectInit();
          break;
        }

        case Boolean(loginMethod === "wallet"): {
          const provider = newWalletProvider(network);
          dispatch({ type: "setProvider", provider });
          break;
        }

        case Boolean(loginMethod === "extension"):
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
    }
  }, []);
  return showLedgerProviderModal;
}
