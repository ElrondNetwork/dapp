import * as React from "react";
import {
  Transaction,
  IDappProvider,
  Address,
  Nonce,
} from "@elrondnetwork/erdjs";
import { useContext } from "context";
import SignWithLedgerModal from "./SignWithLedgerModal";
import SignWithWalletConnectModal from "./SignWithWalletConnectModal";
import getProviderType from "helpers/getProviderType";
import { walletSign, useSearchTransactions, HandleCloseType } from "./helpers";
import useSignTransactions, {
  updateSignStatus,
  SignTransactionsType,
} from "helpers/useSignTransactions";
import { getLatestNonce } from "helpers/accountMethods";

export default function SignTransactions() {
  const [showSignModal, setShowSignModal] = React.useState(false);
  const [newTransactions, setNewTransactions] = React.useState<Transaction[]>();
  const [newCallbackRoute, setNewCallbackRoute] = React.useState("");
  const [newSessionId, setNewSessionId] = React.useState("");
  const [error, setError] = React.useState("");
  const context = useContext();
  const { dapp, address, network } = context;
  const { signStatus } = useSignTransactions();

  useSearchTransactions();

  const provider: IDappProvider = dapp.provider;

  const providerType = getProviderType(provider);

  const handleClose = (props?: HandleCloseType) => {
    const updateBatchStatus = props ? props.updateBatchStatus : true;
    setNewTransactions(undefined);
    setNewCallbackRoute("");
    setError("");
    setShowSignModal(false);
    if (updateBatchStatus) {
      updateSignStatus({
        [newSessionId]: {
          loading: false,
          status: "cancelled",
        },
      });
    }
  };

  const sign = (e: CustomEvent) => {
    if (
      e.detail &&
      "transactions" in e.detail &&
      "callbackRoute" in e.detail &&
      "sessionId" in e.detail
    ) {
      const { transactions, callbackRoute, sessionId } = e.detail;
      signTransactions({
        transactions,
        sessionId,
        callbackRoute,
      });
    }
  };

  React.useEffect(() => {
    document.addEventListener("signTransactions", sign);
    return () => {
      document.removeEventListener("signTransactions", sign);
    };
  }, [context, signStatus]);

  const signTransactions = ({
    sessionId,
    transactions,
    callbackRoute,
  }: SignTransactionsType) => {
    const showError = (e: string) => {
      setShowSignModal(true);
      setError(e);
    };
    setNewCallbackRoute(callbackRoute);
    setNewSessionId(sessionId);
    updateSignStatus({
      [sessionId]: {
        loading: true,
      },
    });
    if (provider) {
      dapp.proxy
        .getAccount(new Address(address))
        .then((account) => {
          const latestNonce = getLatestNonce(account);
          transactions.forEach((tx, i) => {
            tx.setNonce(new Nonce(latestNonce.valueOf() + i));
          });
          switch (providerType) {
            case "wallet":
              walletSign({
                sessionId,
                transactions,
                callbackRoute,
                walletAddress: `${network.walletAddress}`,
              });
              break;
            case "ledger":
              setNewTransactions(transactions);
              setShowSignModal(true);
              break;
            case "walletconnect":
              setNewTransactions(transactions);
              setShowSignModal(true);
              break;
          }
        })
        .catch((e) => {
          updateSignStatus({
            [sessionId]: {
              loading: false,
              status: "cancelled",
            },
          });
          showError(e);
        });
    } else {
      setShowSignModal(true);
      setError(
        "You need a singer/valid signer to send a transaction, use either WalletProvider, LedgerProvider or WalletConnect"
      );
    }
  };

  const signProps = {
    handleClose,
    error,
    setError,
    sessionId: newSessionId,
    show: showSignModal,
    transactions: newTransactions || [],
    providerType,
    callbackRoute: newCallbackRoute,
  };

  return (
    <React.Fragment>
      {providerType === "ledger" && <SignWithLedgerModal {...signProps} />}
      {providerType === "walletconnect" && (
        <SignWithWalletConnectModal {...signProps} />
      )}
    </React.Fragment>
  );
}
