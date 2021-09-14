import * as React from "react";
import { Modal } from "react-bootstrap";
import { Transaction, TransactionHash } from "@elrondnetwork/erdjs";
import { faHourglass, faTimes } from "@fortawesome/free-solid-svg-icons";
import PageState from "components/PageState";
import { ProviderType } from "helpers/getProviderType";
import ConfirmAddress from "components/Ledger/ConfirmAddress";

export interface LedgerProviderModalType {
  show: boolean;
}

const LedgerProviderModal = ({ show }: LedgerProviderModalType) => {
  return (
    <Modal
      show={show}
      backdrop="static"
      className="modal-container"
      animation={false}
      centered
    >
      <ConfirmAddress />
    </Modal>
  );
};

export default LedgerProviderModal;
