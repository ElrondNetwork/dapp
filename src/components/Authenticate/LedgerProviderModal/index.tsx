import * as React from "react";
import { Modal } from "react-bootstrap";
import ConfirmAddress from "components/Ledger/ConfirmAddress";
import styles from "./ledgerProviderModal.module.css";

const LedgerProviderModal = () => {
  return (
    <Modal
      show
      backdrop="static"
      className="modal-container"
      animation={false}
      size="lg"
      centered
      dialogClassName="asd"
      contentClassName={styles.modalContent}
    >
      <ConfirmAddress noBorder />
    </Modal>
  );
};

export default LedgerProviderModal;
