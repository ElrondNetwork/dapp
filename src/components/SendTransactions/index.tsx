import * as React from "react";
import {
  Transaction,
  IDappProvider,
  Address,
  TransactionHash,
  Nonce,
} from "@elrondnetwork/erdjs";
import { useContext } from "context";
import SignWithDeviceModal from "./SignWithDeviceModal";
import { getProviderType, walletSign, useSearchTransactions } from "./helpers";
import { updateSendStatus } from "helpers/useSendTransactions";

interface SignTransactionsType {
  transactions: Transaction[];
  callbackRoute: string;
  successDescription?: string;
}

export default function SendTransactions() {
  const [showSignModal, setShowSignModal] = React.useState(false);
  const [newTransactions, setNewTransactions] = React.useState<Transaction[]>();
  const [newCallbackRoute, setNewCallbackRoute] = React.useState("");
  const [newsuccessDescription, setNewSuccessDescription] = React.useState<
    string | undefined
  >();
  const [error, setError] = React.useState("");
  const context = useContext();
  const { dapp, address, network } = context;

  useSearchTransactions();

  const provider: IDappProvider = dapp.provider;

  const providerType = getProviderType(provider);

  const handleClose = () => {
    const callbackRoute = newCallbackRoute;
    setNewTransactions(undefined);
    setNewCallbackRoute("");
    setNewSuccessDescription(undefined);
    setError("");
    setShowSignModal(false);
    updateSendStatus({ loading: false, status: "cancelled" });
  };

  const send = (e: CustomEvent) => {
    if (e.detail && "transactions" in e.detail && "callbackRoute" in e.detail) {
      const { transactions, callbackRoute, successDescription } = e.detail;
      signTransactions({ transactions, callbackRoute, successDescription });
    }
  };

  React.useEffect(() => {
    document.addEventListener("transactions", send);
    return () => {
      document.removeEventListener("transactions", send);
    };
  }, [context]);

  const signTransactions = ({
    transactions,
    callbackRoute,
    successDescription,
  }: SignTransactionsType) => {
    const showError = (e: string) => {
      setShowSignModal(true);
      setError(e);
    };
    setNewCallbackRoute(callbackRoute);
    updateSendStatus({ loading: true });
    if (provider) {
      dapp.proxy
        .getAccount(new Address(address))
        .then((account) => {
          transactions.forEach((tx, i) => {
            tx.setNonce(new Nonce(account.nonce.valueOf() + i));
          });
          switch (providerType) {
            case "wallet":
              walletSign({
                transactions,
                callbackRoute,
                walletAddress: `${network.walletAddress}`,
                successDescription,
              });
              break;
            case "ledger":
              setNewTransactions(transactions);
              setNewSuccessDescription(successDescription);
              setShowSignModal(true);
              break;
            case "walletconnect":
              setNewTransactions(transactions);
              setNewSuccessDescription(successDescription);
              setShowSignModal(true);
              break;
          }
        })
        .catch((e) => {
          updateSendStatus({ loading: false, status: "cancelled" });
          showError(e);
        });
    } else {
      setShowSignModal(true);
      setError(
        "You need a singer/valid signer to send a transaction, use either WalletProvider, LedgerProvider or WalletConnect"
      );
    }
  };

  const sendProps = {
    handleClose,
    error,
    setError,
    show: showSignModal,
    transactions: newTransactions || [],
    providerType,
    callbackRoute: newCallbackRoute,
    successDescription: newsuccessDescription || "",
  };

  return <SignWithDeviceModal {...sendProps} />;
}
