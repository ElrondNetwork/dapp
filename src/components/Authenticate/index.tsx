import * as React from "react";
import { Address } from "@elrondnetwork/erdjs";
import { getItem, removeItem } from "helpers/session";
import { RouteType } from "helpers/types";
import { useContext, useDispatch } from "context";
import { matchPath, Redirect, useLocation } from "react-router-dom";
import Loader from "components/Loader";

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
  const { loggedIn, dapp, address, ledgerAccount } = useContext();
  const [autehnitcatedRoutes] = React.useState(
    routes.filter((route) => Boolean(route.authenticatedRoute))
  );
  const { pathname } = useLocation();
  const [loading, setLoading] = React.useState(false);

  React.useMemo(() => {
    if (getItem("walletLogin")) {
      setLoading(true);
      dapp.provider.init().then((initialised) => {
        if (!initialised) {
          setLoading(false);
          return;
        }

        dapp.provider
          .getAddress()
          .then((address) => {
            removeItem("walletLogin");
            dispatch({ type: "login", address });
          })
          .then(() => {
            const address = getItem("address");

            return dapp.proxy
              .getAccount(new Address(address))
              .then((account) => {
                dispatch({
                  type: "setAccount",
                  account: {
                    balance: account.balance.toString(),
                    address,
                    nonce: account.nonce,
                  },
                });
                setLoading(false);
              });
          })
          .catch(() => {
            setLoading(false);
          });
      });
    }
  }, [dapp.provider, dapp.proxy]);

  const routeNeedsAuthentication = autehnitcatedRoutes.find(
    ({ path }) =>
      matchPath(pathname, {
        path,
        exact: true,
        strict: false,
      }) !== null
  );

  React.useEffect(() => {
    Promise.all([dapp.proxy.getNetworkConfig()])
      .then(([networkConfig]) => {
        dispatch({
          type: "setChainId",
          chainId: networkConfig.ChainID,
        });
      })
      .catch((e) => {
        console.error("To do ", e);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAccount = () => {
    if (address && loggedIn) {
      dapp.proxy.getAccount(new Address(address)).then((account) => {
        dispatch({
          type: "setAccount",
          account: {
            balance: account.balance.toString(),
            address,
            nonce: account.nonce,
          },
        });
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

  if (routeNeedsAuthentication && !loggedIn && !getItem("walletLogin")) {
    return <Redirect to={unlockRoute} />;
  }

  if (loading && getItem("walletLogin")) return <Loader />;

  return <React.Fragment>{children}</React.Fragment>;
};

export default Authenticate;
