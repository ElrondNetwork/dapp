import * as React from "react";
import { Modal } from "react-bootstrap";
import { useHistory } from "react-router-dom";
import { Transaction, Address, Nonce } from "@elrondnetwork/erdjs";
import { Signature } from "@elrondnetwork/erdjs/out/signature";
import { faHourglass, faTimes } from "@fortawesome/free-solid-svg-icons";
import { useContext } from "context";
import { HandleCloseType } from "../helpers";
import PageState from "components/PageState";
import { updateSignStatus } from "helpers/useSignTransactions";

export interface SignModalType {
  show: boolean;
  handleClose: (props?: HandleCloseType) => void;
  error: string;
  sessionId: string;
  transactions: Transaction[];
  setError: (value: React.SetStateAction<string>) => void;
  callbackRoute: string;
}

const SignWithWalletConnectModal = ({
  show,
  handleClose,
  error,
  sessionId,
  setError,
  transactions,
  callbackRoute,
}: SignModalType) => {
  const history = useHistory();
  const context = useContext();

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
            provider
              .init()
              .then((initialised: boolean) => {
                if (!initialised) {
                  return;
                }
                provider
                  .signTransaction(transaction)
                  .then((tx: Transaction) => {
                    const newSignedTx = { [0]: tx };
                    setSignedTransactions((existing) =>
                      existing ? { ...existing, ...newSignedTx } : newSignedTx
                    );
                  });
              })
              .catch((e: any) => {
                console.error("Failed initializing provider ", e);
              });
          })
          .catch((e) => {
            setError(e.message);
          });
      } else {
        const transactionsDetails = transactions.map((transaction) => {
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
          .init()
          .then((initialised: boolean) => {
            if (!initialised) {
              return;
            }
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
                  const newSignedTx = {
                    [key]: transaction,
                  };
                  setSignedTransactions((existing) =>
                    existing
                      ? {
                          ...existing,
                          ...newSignedTx,
                        }
                      : newSignedTx
                  );
                });
              })
              .catch(() => {
                handleClose();
              });
          })
          .catch((e: any) => {
            console.error("Failed initializing provider ", e);
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
      updateSignStatus({
        [sessionId]: {
          loading: false,
          status: "signed",
          transactions: Object.values(signedTransactions),
        },
      });
      setSignedTransactions(undefined);
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
