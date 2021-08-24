import * as React from "react";
import { Modal } from "react-bootstrap";
import { useHistory } from "react-router-dom";
import { Transaction } from "@elrondnetwork/erdjs";
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

  const { dapp } = context;
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
      provider
        .init()
        .then((initialised: boolean) => {
          if (!initialised) {
            return;
          }
          provider
            .signTransactions(transactions)
            .then((transactions: Transaction[]) => {
              setSignedTransactions(transactions);
            })
            .catch((e: any) => {
              setError(e.message);
            });
        })
        .catch((e: any) => {
          setError(e.message);
        });
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
