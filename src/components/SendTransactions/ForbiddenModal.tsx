import * as React from "react";
import { Modal } from "react-bootstrap";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import PageState from "components/PageState";

export interface SignModalType {
  show: boolean;
  handleClose: () => void;
}

const ForbiddenModal = ({ show, handleClose }: SignModalType) => {
  return (
    <Modal
      show={show}
      onHide={handleClose}
      className="modal-container"
      animation={false}
      centered
    >
      <PageState
        icon={faInfoCircle}
        iconSize="3x"
        title="Transactions in progress"
        description={
          <React.Fragment>
            <div className="text-center">
              <p>
                Please wait for the current transactions to be completed before
                proceeding.
              </p>
            </div>

            <div className="text-center mt-2">
              <button
                id="closeButton"
                className="btn btn-primary mx-2 "
                onClick={handleClose}
              >
                Close
              </button>
            </div>
          </React.Fragment>
        }
      />
    </Modal>
  );
};

export default ForbiddenModal;
