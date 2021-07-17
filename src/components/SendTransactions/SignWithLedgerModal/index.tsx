import * as React from "react";
import { Modal } from "react-bootstrap";
import { Transaction, TransactionHash } from "@elrondnetwork/erdjs";
import SignStep, { SignStepType } from "./SignStep";
import { useSubmitTransactions, HandleCloseType } from "../helpers";

export interface SignModalType {
  show: boolean;
  handleClose: (props?: HandleCloseType) => void;
  error: string;
  transactions: Transaction[];
  setError: (value: React.SetStateAction<string>) => void;
  callbackRoute: string;
  successDescription?: SignStepType["successDescription"];
  sequential?: SignStepType["sequential"];
}

const SignWithLedgerModal = ({
  show,
  handleClose,
  error,
  setError,
  transactions,
  callbackRoute,
  successDescription,
  sequential = false,
}: SignModalType) => {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [signedTransactions, setSignedTransactions] = React.useState<
    SignStepType["signedTransactions"]
  >();

  return (
    <Modal
      show={show}
      backdrop="static"
      onHide={handleClose}
      className="modal-container"
      animation={false}
      centered
    >
      <div className="card container">
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
                signedTransactions,
                currentStep,
                setCurrentStep,
                isLast: index === transactions.length - 1,
                successDescription,
                sequential,
              }}
            />
          ))}
        </div>
      </div>
    </Modal>
  );
};

export default SignWithLedgerModal;
