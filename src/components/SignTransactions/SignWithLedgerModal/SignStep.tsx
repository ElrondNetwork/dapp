import * as React from "react";
import {
  Address,
  Nonce,
  Transaction,
  IDappProvider,
} from "@elrondnetwork/erdjs";
import { faHourglass, faTimes } from "@fortawesome/free-solid-svg-icons";
import { useHistory } from "react-router-dom";
import PageState from "components/PageState";
import { useContext } from "context";
import { getLatestNonce } from "helpers/accountMethods";
import { HandleCloseType } from "../helpers";
import { updateSignStatus } from "helpers/useSignTransactions";

export interface SignStepType {
  handleClose: (props?: HandleCloseType) => void;
  error: string;
  transaction: Transaction;
  callbackRoute: string;
  sessionId: string;
  index: number;
  currentStep: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  isLast: boolean;
  signedTransactions?: Record<number, Transaction>;
  setSignedTransactions: React.Dispatch<
    React.SetStateAction<Record<number, Transaction>> | undefined
  >;
  setError: (value: React.SetStateAction<string>) => void;
}

const SignStep = ({
  handleClose,
  error,
  setError,
  transaction,
  index,
  sessionId,
  isLast,
  setSignedTransactions,
  signedTransactions,
  currentStep,
  setCurrentStep,
  callbackRoute,
}: SignStepType) => {
  const history = useHistory();
  const { dapp, address } = useContext();
  const [waitingForDevice, setWaitingForDevice] = React.useState(false);

  const provider: IDappProvider = dapp.provider;

  const reset = () => {
    setCurrentStep(0);
    setSignedTransactions(undefined);
    setWaitingForDevice(false);
    updateSignStatus({});
  };

  const sign = () => {
    dapp.proxy
      .getAccount(new Address(address))
      .then((account) => {
        const nonce = getLatestNonce(account);
        transaction.setNonce(new Nonce(nonce.valueOf() + index));
        setWaitingForDevice(true);
        provider
          .signTransaction(transaction)
          .then((tx) => {
            const newSignedTx = { [index]: tx };
            const newSignedTransactions = signedTransactions
              ? { ...signedTransactions, ...newSignedTx }
              : newSignedTx;
            setSignedTransactions(newSignedTransactions);
            if (!isLast) {
              setCurrentStep((exising) => exising + 1);
            } else if (newSignedTransactions) {
              handleClose({ updateBatchStatus: false });
              updateSignStatus({
                [sessionId]: {
                  loading: false,
                  status: "signed",
                  transactions: Object.values(newSignedTransactions),
                },
              });
              reset();
              history.push(callbackRoute);
            }
          })
          .catch(() => {
            reset();
            handleClose({ updateBatchStatus: false });
          });
      })
      .catch((e) => {
        reset();
        setError(e.message);
      });
  };

  let signBtnLabel = "Sign & Continue";
  signBtnLabel = waitingForDevice ? "Check your Ledger" : signBtnLabel;
  signBtnLabel = isLast && !waitingForDevice ? "Sign & Submit" : signBtnLabel;

  const isFirst = currentStep === 0;

  const close = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isFirst) {
      handleClose();
      history.push(callbackRoute);
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
                  disabled={waitingForDevice}
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
