import React from "react";
import { useContext } from "context";
import { setItem } from "helpers/session";

const WalletLogin = ({
  callbackRoute,
  webWalletButtonLabel,
}: {
  callbackRoute: string;
  webWalletButtonLabel: string;
}) => {
  const { dapp } = useContext();
  const handleOnClick = () => {
    dapp.provider
      .init()
      .then((initialised) => {
        if (initialised) {
          // Wallet provider will redirect, we can set a session information so we know when we are getting back
          //  that we initiated a wallet provider login
          setItem("walletLogin", {}, 60); // Set a 60s session only
          dapp.provider.login({
            callbackUrl: encodeURIComponent(
              `${window.location.origin}${callbackRoute}`
            ),
          });
        } else {
          console.warn(
            "Something went wrong trying to redirect to wallet login.."
          );
        }
      })
      .catch((err) => {
        console.warn(err);
      });
  };

  return (
    <button
      onClick={handleOnClick}
      className="btn btn-primary px-sm-4 m-1 mx-sm-3"
    >
      {webWalletButtonLabel}
    </button>
  );
};

export default WalletLogin;
