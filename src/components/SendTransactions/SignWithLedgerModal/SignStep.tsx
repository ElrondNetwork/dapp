import * as React from "react";
import { Modal } from "react-bootstrap";
import { Address, Nonce, Transaction } from "@elrondnetwork/erdjs";
import { faHourglass, faTimes } from "@fortawesome/free-solid-svg-icons";
import PageState from "components/PageState";
import { useContext } from "context";

export interface SignModalType {
  handleClose: () => void;
  error: string;
  transaction: Transaction;
  callbackRoute: string;
  index: number;
  currentStep: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  isLast: boolean;
  setSignedTransactions: React.Dispatch<
    React.SetStateAction<Record<number, Transaction>>
  >;
  setError: (value: React.SetStateAction<string>) => void;
}

const provider = {
  signTransaction: (tx: Transaction): Promise<Transaction> =>
    new Promise((resolve) => {
      setTimeout(() => {
        resolve(tx);
      }, 1000);
    }),
};

const SignStep = ({
  handleClose,
  error,
  setError,
  transaction,
  index,
  isLast,
  setSignedTransactions,
  currentStep,
  setCurrentStep,
}: SignModalType) => {
  const { dapp, address } = useContext();
  const [waitingForLedger, setWaitingForLedger] = React.useState(false);

  const sign = () => {
    dapp.proxy
      .getAccount(new Address(address))
      .then((account) => {
        transaction.setNonce(new Nonce(account.nonce.valueOf() + index));
        setWaitingForLedger(true);
        provider.signTransaction(transaction).then((tx) => {
          const newSignedTx = { [index]: tx };
          setSignedTransactions((existing) =>
            existing ? { ...existing, ...newSignedTx } : newSignedTx
          );
          if (!isLast) {
            setCurrentStep((exising) => exising + 1);
          }
        });
      })
      .catch((e) => {
        setWaitingForLedger(false);
        setError(e.message);
      });
  };

  let signBtnLabel = "Sign & Continue";
  signBtnLabel = waitingForLedger ? "Check your Ledger" : signBtnLabel;
  signBtnLabel = isLast && !waitingForLedger ? "Sign & Submit" : signBtnLabel;

  const isFirst = currentStep === 0;

  const close = (e: React.MouseEvent) => {
    e.preventDefault;
    if (isFirst) {
      handleClose();
    } else {
      setCurrentStep((existing) => existing - 1);
    }
  };

  const isVisible = currentStep === index;

  return isVisible ? (
    <PageState
      icon={error ? faTimes : faHourglass}
      iconClass="text-white"
      iconBgClass={error ? "bg-danger" : "bg-warning"}
      iconSize="3x"
      title="Confirm on Ledger"
      description={
        <React.Fragment>
          {transaction && (
            <React.Fragment>
              <div
                className="form-group text-left"
                data-testid="transactionTitle"
              >
                <span className="form-label">To: </span>
                {transaction.getReceiver().toString()}
              </div>
              <div className="form-group text-left">
                <span className="form-label">Data: </span>
                {transaction.getData() && (
                  <React.Fragment>
                    {transaction.getData().toString()}
                  </React.Fragment>
                )}
              </div>
              {error && (
                <p className="text-danger d-flex justify-content-center align-items-center">
                  {error}
                </p>
              )}

              <div className="d-flex align-items-center flex-column mt-spacer">
                {error && <p className="text-danger">{error}</p>}
                <button
                  type="button"
                  className="btn btn-primary px-spacer"
                  id="signBtn"
                  data-testid="signBtn"
                  onClick={sign}
                  disabled={waitingForLedger}
                >
                  {signBtnLabel}
                </button>
                <a
                  href="/"
                  id="closeButton"
                  data-testid="closeButton"
                  onClick={close}
                  className="mt-3"
                >
                  {isFirst ? "Cancel" : "Back"}
                </a>
              </div>
            </React.Fragment>
          )}
        </React.Fragment>
      }
    />
  ) : null;
};

export default SignStep;
