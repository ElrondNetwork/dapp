import * as React from "react";
import {
  Transaction,
  IDappProvider,
  Address,
  Nonce,
} from "@elrondnetwork/erdjs";
import { useContext } from "context";
import SignWithLedgerModal from "./SignWithLedgerModal";
import ForbiddenModal from "./ForbiddenModal";
import SignWithWalletConnectModal from "./SignWithWalletConnectModal";
import {
  getProviderType,
  walletSign,
  useSearchTransactions,
  HandleCloseType,
} from "./helpers";
import useSendTransactions, {
  updateSendStatus,
  SendTransactionsType,
} from "helpers/useSendTransactions";
import { getLatestNonce } from "helpers/accountMethods";

export default function SendTransactions() {
  const [showSignModal, setShowSignModal] = React.useState(false);
  const [showForbiddenModal, setShowForbiddenModal] = React.useState(false);
  const [newTransactions, setNewTransactions] = React.useState<Transaction[]>();
  const [newCallbackRoute, setNewCallbackRoute] = React.useState("");
  const [newDelayLast, setNewDelayLast] = React.useState<boolean>();
  const [newSequential, setNewSequential] = React.useState<boolean>();
  const [newsuccessDescription, setNewSuccessDescription] = React.useState<
    string | undefined
  >();
  const [error, setError] = React.useState("");
  const context = useContext();
  const { dapp, address, network } = context;
  const { sendStatus } = useSendTransactions();

  useSearchTransactions();

  const provider: IDappProvider = dapp.provider;

  const providerType = getProviderType(provider);

  const handleClose = (props?: HandleCloseType) => {
    const updateBatchStatus = props ? props.updateBatchStatus : true;
    setNewTransactions(undefined);
    setNewCallbackRoute("");
    setNewSuccessDescription(undefined);
    setError("");
    setShowSignModal(false);
    if (updateBatchStatus) {
      updateSendStatus({
        loading: false,
        status: "cancelled",
        sessionId: Date.now().toString(),
      });
    }
  };

  const send = (e: CustomEvent) => {
    if (e.detail && "transactions" in e.detail && "callbackRoute" in e.detail) {
      const {
        transactions,
        callbackRoute,
        successDescription,
        sequential,
        delayLast,
      } = e.detail;
      if (sendStatus.sequential && sendStatus.status === "pending") {
        setShowForbiddenModal(true);
      } else {
        signTransactions({
          transactions,
          callbackRoute,
          successDescription,
          sequential,
          delayLast,
        });
      }
    }
  };

  React.useEffect(() => {
    document.addEventListener("transactions", send);
    return () => {
      document.removeEventListener("transactions", send);
    };
  }, [context, sendStatus]);

  const signTransactions = ({
    transactions,
    callbackRoute,
    successDescription,
    sequential,
    delayLast,
  }: SendTransactionsType) => {
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
                delayLast,
              });
              break;
            case "ledger":
              setNewSequential(sequential);
              setNewTransactions(transactions);
              setNewDelayLast(delayLast);
              setNewSuccessDescription(successDescription);
              setShowSignModal(true);
              break;
            case "walletconnect":
              setNewSequential(sequential);
              setNewTransactions(transactions);
              setNewSuccessDescription(successDescription);
              setNewDelayLast(delayLast);
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
    delayLast: newDelayLast,
  };

  return (
    <React.Fragment>
      {providerType === "ledger" && <SignWithLedgerModal {...sendProps} />}
      {providerType === "walletconnect" && (
        <SignWithWalletConnectModal {...sendProps} />
      )}
      <ForbiddenModal
        show={showForbiddenModal}
        handleClose={() => {
          setShowForbiddenModal(false);
        }}
      />
    </React.Fragment>
  );
}
