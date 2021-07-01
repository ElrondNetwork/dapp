import * as React from "react";
import { Modal } from "react-bootstrap";
import { Transaction, TransactionHash } from "@elrondnetwork/erdjs";
import { faHourglass, faTimes } from "@fortawesome/free-solid-svg-icons";
import PageState from "components/PageState";
import { useContext } from "context";

export interface SendWizardType {
  show: boolean;
  handleClose: () => void;
  error: string;
  transactions: Transaction[];
  callbackRoute: string;
}

const SendWizard = ({
  show,
  handleClose,
  error,
  transactions,

  callbackRoute,
}: SendWizardType) => {
  const { walletConnectLogin } = useContext();
  const fake: any = false;
  if (fake) {
    console.log(error, transactions, callbackRoute);
  }
  return (
    <Modal
      show={show}
      onHide={handleClose}
      className="modal-container"
      animation={false}
      centered
    >
      <div className="card">
        <div className="card-body">This is wizard</div>
      </div>
    </Modal>
  );
};

export default SendWizard;
