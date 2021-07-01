import * as React from "react";
import { Modal } from "react-bootstrap";
import { Transaction, TransactionHash } from "@elrondnetwork/erdjs";
import SignStep from "./SignStep";
import { useSubmitTransactions } from "../helpers";

export interface SignModalType {
  show: boolean;
  handleClose: () => void;
  error: string;
  transactions: Transaction[];
  setError: (value: React.SetStateAction<string>) => void;
  callbackRoute: string;
}

const SignWithLedgerModal = ({
  show,
  handleClose,
  error,
  setError,
  transactions,
  callbackRoute,
}: SignModalType) => {
  const submitTransactions = useSubmitTransactions();

  const [currentStep, setCurrentStep] = React.useState(0);
  const [signedTransactions, setSignedTransactions] = React.useState<
    Record<number, Transaction>
  >();

  React.useEffect(() => {
    const signingDisabled =
      !signedTransactions ||
      (signedTransactions &&
        Object.keys(signedTransactions).length !== transactions.length);
    if (!signingDisabled && signedTransactions) {
      submitTransactions(Object.values(signedTransactions));
    }
  }, [signedTransactions, transactions]);

  return (
    <Modal
      show={show}
      onHide={handleClose}
      className="modal-container"
      animation={false}
      centered
    >
      <div className="card">
        <div className="card-body">
          {transactions.map((transaction, index) => (
            <SignStep
              key={transaction.getData().toString() + index}
              {...{
                index,
                transaction,
                handleClose,
                error,
                setError,
                callbackRoute,
                setSignedTransactions,
                currentStep,
                setCurrentStep,
                isLast: index === transactions.length - 1,
              }}
            />
          ))}
        </div>
      </div>
    </Modal>
  );
};

export default SignWithLedgerModal;
