import * as React from "react";
import { Address } from "@elrondnetwork/erdjs";
import { useContext, useDispatch } from "context";
import { matchPath, Redirect, useLocation } from "react-router-dom";
import Loader from "components/Loader";
import storage from "helpers/storage";
import { RouteType } from "helpers/types";
import { useGetNetworkConfig } from "./helpers";
import {
  useGetAccount,
  useGetAddress,
  getLatestNonce,
} from "helpers/accountMethods";
import useSetProvider from "./useSetProvider";
import addressIsValid from "helpers/addressIsValid";

const Authenticate = ({
  children,
  routes,
  unlockRoute,
}: {
  children: React.ReactNode;
  routes: RouteType[];
  unlockRoute: string;
}) => {
  const dispatch = useDispatch();
  const { loggedIn, dapp, address, ledgerAccount, chainId } = useContext();
  const [autehnitcatedRoutes] = React.useState(
    routes.filter((route) => Boolean(route.authenticatedRoute))
  );
  const { pathname, search } = useLocation();
  const [loading, setLoading] = React.useState(false);
  const getAccount = useGetAccount();
  const getAddress = useGetAddress();
  const getNetworkConfig = useGetNetworkConfig();
  useSetProvider();

  const { getItem, removeItem } = storage.session;

  React.useMemo(() => {
    if (getItem("walletLogin")) {
      setLoading(true);
      dapp.provider
        .init()
        .then((initialised) => {
          if (!initialised) {
            setLoading(false);
            return;
          }

          getAddress()
            .then((address) => {
              removeItem("walletLogin");
              dispatch({ type: "login", address });
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
                  setLoading(false);
                })
                .catch((e) => {
                  console.error("Failed getting account ", e);
                  setLoading(false);
                });
            })
            .catch((e) => {
              console.error("Failed getting address ", e);
              setLoading(false);
            });
        })
        .catch((e) => {
          console.error("Failed initializing provider ", e);
          setLoading(false);
        });
    }
  }, [dapp.provider, dapp.proxy]);

  const privateRoute = autehnitcatedRoutes.some(
    ({ path }) =>
      matchPath(pathname, {
        path,
        exact: true,
        strict: false,
      }) !== null
  );

  const redirect = privateRoute && !loggedIn && !getItem("walletLogin");

  React.useEffect(() => {
    if (chainId.valueOf() === "-1") {
      getNetworkConfig()
        .then((networkConfig) => {
          dispatch({
            type: "setChainId",
            chainId: networkConfig.ChainID,
          });
        })
        .catch((e) => {
          console.error("To do ", e);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId.valueOf()]);

  const fetchAccount = () => {
    if (address && loggedIn) {
      dapp.proxy
        .getAccount(new Address(address))
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
          setLoading(false);
        });

      if (getItem("ledgerLogin") && !ledgerAccount) {
        const ledgerLogin = getItem("ledgerLogin");
        dispatch({
          type: "setLedgerAccount",
          ledgerAccount: {
            index: ledgerLogin.index,
            address,
          },
        });
      }
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(fetchAccount, [address]);

  if (redirect) {
    return <Redirect to={unlockRoute} />;
  }

  if (loading && getItem("walletLogin")) {
    return <Loader />;
  }

  return <React.Fragment>{children}</React.Fragment>;
};

export default Authenticate;
