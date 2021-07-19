import * as React from "react";
import { Modal } from "react-bootstrap";
import { useHistory } from "react-router-dom";
import { Transaction, Address, Nonce } from "@elrondnetwork/erdjs";
import { Signature } from "@elrondnetwork/erdjs/out/signature";
import { faHourglass, faTimes } from "@fortawesome/free-solid-svg-icons";
import { useContext } from "context";
import { useSubmitTransactions, HandleCloseType } from "../helpers";
import PageState from "components/PageState";

export interface SignModalType {
  show: boolean;
  handleClose: (props?: HandleCloseType) => void;
  error: string;
  transactions: Transaction[];
  setError: (value: React.SetStateAction<string>) => void;
  callbackRoute: string;
  successDescription?: string;
  sequential?: boolean;
}

const SignWithWalletConnectModal = ({
  show,
  handleClose,
  error,
  setError,
  transactions,
  callbackRoute,
  successDescription,
  sequential = false,
}: SignModalType) => {
  const history = useHistory();
  const context = useContext();
  const submitTransactions = useSubmitTransactions();

  const { dapp, address } = context;
  const provider: any = dapp.provider;

  const [signedTransactions, setSignedTransactions] = React.useState<
    Record<number, Transaction>
  >();

  const description =
    transactions && transactions.length > 1
      ? "Check your phone to sign the transactions"
      : "Check your phone to sign the transaction";

  const close = (e: React.MouseEvent) => {
    e.preventDefault();
    handleClose();
    history.push(callbackRoute);
  };

  React.useEffect(() => {
    if (transactions && transactions.length) {
      if (transactions.length === 1) {
        const transaction = transactions[0];
        dapp.proxy
          .getAccount(new Address(address))
          .then((account) => {
            transaction.setNonce(new Nonce(account.nonce.valueOf()));
            provider.signTransaction(transaction).then((tx: Transaction) => {
              const newSignedTx = { [0]: tx };
              setSignedTransactions((existing) =>
                existing ? { ...existing, ...newSignedTx } : newSignedTx
              );
            });
          })
          .catch((e) => {
            setError(e.message);
          });
      } else {
        dapp.proxy
          .getAccount(new Address(address))
          .then((account) => {
            const transactionsDetails = transactions.map((transaction, key) => {
              transaction.setNonce(new Nonce(account.nonce.valueOf() + key));
              return {
                nonce: transaction.getNonce().valueOf(),
                from: address.toString(),
                to: transaction.getReceiver().toString(),
                amount: transaction.getValue().toString(),
                gasPrice: transaction.getGasPrice().valueOf().toString(),
                gasLimit: transaction.getGasLimit().valueOf().toString(),
                data: Buffer.from(
                  transaction.getData().toString().trim()
                ).toString(),
                chainId: transaction.getChainID().valueOf(),
                version: transaction.getVersion().valueOf(),
              };
            });

            provider
              .sendCustomMessage({
                method: "erd_batch_sign",
                params: transactionsDetails,
              })
              .then((signatures: any) => {
                signatures.forEach((signature: any, key: number) => {
                  const transaction = transactions[key];
                  transaction.applySignature(
                    new Signature(signature.signature),
                    new Address(address)
                  );
                  const newSignedTx = { [key]: transaction };
                  setSignedTransactions((existing) =>
                    existing ? { ...existing, ...newSignedTx } : newSignedTx
                  );
                });
              });
          })
          .catch((e) => {
            setError(e.message);
          });
      }
    }
  }, [transactions]);

  React.useEffect(() => {
    const signingDisabled =
      !signedTransactions ||
      (signedTransactions &&
        Object.keys(signedTransactions).length !== transactions.length);

    if (!signingDisabled && signedTransactions) {
      submitTransactions({
        transactions: Object.values(signedTransactions),
        successDescription,
        sequential,
        sessionId: Date.now().toString(),
      });
      handleClose({ updateBatchStatus: false });
      history.push(callbackRoute);
    }
  }, [signedTransactions, transactions]);

  return (
    <Modal
      show={show}
      backdrop="static"
      onHide={handleClose}
      className="modal-container"
      animation={false}
      centered
    >
      <PageState
        icon={error ? faTimes : faHourglass}
        iconClass="text-white"
        iconBgClass={error ? "bg-danger" : "bg-warning"}
        iconSize="3x"
        title="Confirm on Maiar"
        description={description}
        action={
          <a
            href="/"
            id="closeButton"
            data-testid="closeButton"
            onClick={close}
            className="mt-3"
          >
            Close
          </a>
        }
      />
    </Modal>
  );
};

export default SignWithWalletConnectModal;
