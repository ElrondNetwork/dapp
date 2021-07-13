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
import { getLatestNonce } from "helpers/accountMethods";

interface SignTransactionsType {
  transactions: Transaction[];
  callbackRoute: string;
  successDescription?: string;
  sequential?: boolean;
}

export default function SendTransactions() {
  const [showSignModal, setShowSignModal] = React.useState(false);
  const [newTransactions, setNewTransactions] = React.useState<Transaction[]>();
  const [newCallbackRoute, setNewCallbackRoute] = React.useState("");
  const [newSequential, setNewSequential] = React.useState<boolean>();
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
      const {
        transactions,
        callbackRoute,
        successDescription,
        sequential,
      } = e.detail;
      signTransactions({
        transactions,
        callbackRoute,
        successDescription,
        sequential,
      });
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
    sequential,
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
          const nonce = getLatestNonce(account);

          transactions.forEach((tx, i) => {
            tx.setNonce(new Nonce(nonce.valueOf() + i));
          });
          switch (providerType) {
            case "wallet":
              walletSign({
                transactions,
                callbackRoute,
                walletAddress: `${network.walletAddress}`,
                successDescription,
                sequential,
              });
              break;
            case "ledger":
              setNewSequential(sequential);
              setNewTransactions(transactions);
              setNewSuccessDescription(successDescription);
              setShowSignModal(true);
              break;
            case "walletconnect":
              setNewSequential(sequential);
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
    sequential: newSequential,
  };

  return <SignWithDeviceModal {...sendProps} />;
}
