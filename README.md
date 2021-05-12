# @elrondnetwork/dapp
The npm package of the __Elrond Dapp__ core components, built using [React.js](https://reactjs.org/) and [Typescript](https://www.typescriptlang.org/).
This library will help you authenticate users and provide a straight foreward way to execute transactions on the Elrond blockchain.

## Requirements
* Node.js version 12.16.2+
* Npm version 6.14.4+

## Dependencies
* [@elrondnetwork/erdjs](https://www.npmjs.com/package/@elrondnetwork/erdjs) version 4.2.2+
* [react](https://reactjs.org/) version 17.0.2+
* [react-router-dom](https://www.npmjs.com/package/react-router-dom) version 5.2.0+
* [react-bootstrap](https://www.npmjs.com/package/react-bootstrap) version 1.5.2+
* [axios](https://www.npmjs.com/package/axios) version 0.21.1+
* [moment](https://www.npmjs.com/package/moment) version 2.29.1+

## Installation

npm:
```bash
npm install @elrondnetwork/dapp
```

## Usage
The main component that has to wrap your application is the  `Dapp.Context`. Use it like:
```javascript
import * as Dapp from "@elrondnetwork/dapp";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

function App() {
  return (
    <Router basename={process.env.PUBLIC_URL}>
      <ContextProvider>
        <Dapp.Context
          config={{
            network, // provide connection information
            walletConnectBridge, // the server used to relay data between the Dapp and the Wallet
            walletConnectDeepLink, // link used to open the Maiar app with the connection details
          }}
        >
          <Layout /* optional custom app layout */>
            <Switch>
              <Route /* main unlock route */
                path="/unlock" /* main unlock route */
                component={() => (
                  <Dapp.Pages.Unlock
                    callbackRoute="/dashboard" /* route after successfull login */
                    title="App Title"
                    lead="Please select your login method:"
                    ledgerRoute="/ledger" /* route after choosing ledger login */
                    walletConnectRoute="/walletconnect" /* route after choosing Maiar login */
                  />
                )}
                exact={true}
              />
              <Route
                path="/ledger" /* must correspond to ledgerRoute */
                component={() => (
                  <Dapp.Pages.Ledger callbackRoute="/dashboard" />
                )}
                exact={true}
              />
              <Route
                path="/walletconnect" /* must correspond to walletConnectRoute */
                component={() => (
                  <Dapp.Pages.WalletConnect
                    callbackRoute="/dashboard"
                    logoutRoute="/home" /* redirect after logout */
                    title="Maiar Login"
                    lead="Scan the QR code using Maiar"
                  />
                )}
                exact={true}
              />

              {routes.map((route, i /* rest of routes */) => (
                <Route
                  path={route.path}
                  key={route.path + i}
                  component={route.component}
                  exact={true}
                />
              ))}
              <Route component={PageNotFoud} />
            </Switch>
          </Layout>
        </Dapp.Context>
      </ContextProvider>
    </Router>
  );
}
```
#### Config sample
```typescript
import * as Dapp from "@elrondnetwork/dapp";

export const walletConnectBridge: string =
  "https://bridge.walletconnect.org";
export const walletConnectDeepLink: string =
  "https://maiar.page.link/?apn=com.elrond.maiar.wallet&isi=1519405832&ibi=com.elrond.maiar.wallet&link=https://maiar.com/";


export const network: Dapp.NetworkType = {
  id: "testnet",
  name: "Testnet",
  egldLabel: "xEGLD",
  walletAddress: "https://testnet-wallet.elrond.com/dapp/init",
  apiAddress: "https://testnet-api.elrond.com",
  gatewayAddress: "https://testnet-gateway.elrond.com",
  explorerAddress: "http://testnet-explorer.elrond.com/",
};
```
#### Authenticating your app
Wrap your routes inside `Dapp.Authenticate`. Example usage inside `Layout`:
```javascript
        <>
          <Navbar />
          <main>
            <Dapp.Authenticate 
              routes={routes} 
              unlockRoute="/unlock" /* redirect here if user is not authenticated */>
              {children}
            </Dapp.Authenticate>
          </main>
          <Footer />
        </>
```

#### Logging out from the Dapp
```javascript
  const { loggedIn, address } = Dapp.useContext();
  const dappDispatch = Dapp.useDispatch();
  const logOut = () => {
    dappDispatch({ type: "logout" });
    history.push("/home");
  };
```

#### Sending a transaction
```javascript
import {
  Transaction,
  GasLimit,
  GasPrice,
  Address,
  TransactionPayload,
  Balance,
  ChainID,
  TransactionVersion,
} from "@elrondnetwork/erdjs";

function createTransactionFromRaw(
  rawTransaction: {
    value: string;
    receiver: string;
    gasPrice: number;
    gasLimit: number;
    data: string;
    chainID: string;
    version: number;
  }
) {
  return new Transaction({
    value: Balance.egld(rawTransaction.value),
    data: TransactionPayload.fromEncoded(rawTransaction.data),
    receiver: new Address(rawTransaction.receiver),
    gasLimit: new GasLimit(rawTransaction.gasLimit),
    gasPrice: new GasPrice(rawTransaction.gasPrice),
    chainID: new ChainID(rawTransaction.chainID),
    version: new TransactionVersion(rawTransaction.version),
  });
}
    // then, inside the component
    const sendTransaction = Dapp.useSendTransaction();
    const transaction = createTransactionFromRaw(rawTransaction);
    const onClick = () => {
        sendTransaction({
          transaction,
          callbackRoute: "/outcome",
        });
    }

```