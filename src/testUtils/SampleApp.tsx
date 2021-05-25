import * as React from "react";
import { Switch, Route } from "react-router-dom";
import { ContextProvider } from "context";
import * as config from "./config";
import Authenticate from "components/Authenticate";
import routes, { routeNames } from "./routes";
import Unlock from "components/Unlock";
import Ledger from "components/Ledger";
import WalletConnect from "components/WalletConnect";

const SampleApp = () => {
  return (
    <ContextProvider config={config}>
      <Authenticate routes={routes} unlockRoute={routeNames.unlock}>
        <Switch>
          <Route
            path={routeNames.unlock}
            component={() => (
              <Unlock
                callbackRoute={routeNames.dashboard}
                title="Dapp Template"
                lead="Please select your login method:"
                ledgerRoute={routeNames.ledger}
                walletConnectRoute={routeNames.walletconnect}
              />
            )}
            exact={true}
          />
          <Route
            path={routeNames.ledger}
            component={() => <Ledger callbackRoute={routeNames.dashboard} />}
            exact={true}
          />
          <Route
            path={routeNames.walletconnect}
            component={() => (
              <WalletConnect
                callbackRoute={routeNames.dashboard}
                logoutRoute={routeNames.home}
                title="Maiar Login"
                lead="Scan the QR code using Maiar"
              />
            )}
            exact={true}
          />

          {routes.map((route, i) => (
            <Route
              path={route.path}
              key={route.path + i}
              component={route.component}
              exact={true}
            />
          ))}
        </Switch>
      </Authenticate>
    </ContextProvider>
  );
};

export default SampleApp;
