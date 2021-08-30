import React from "react";
import moment from "moment";
import { useContext } from "context";
import storage from "helpers/storage";
import { newWalletProvider } from "helpers/provider";

export const useWebWalletLogin = ({
  callbackRoute,
  token,
}: {
  callbackRoute: string;
  token?: string;
}) => {
  const { network } = useContext();
  return () => {
    const provider = newWalletProvider(network);
    storage.session.setItem({
      key: "walletLogin",
      data: {},
      expires: moment().add(1, "minutes").unix(),
    });
    provider.login({
      callbackUrl: encodeURIComponent(
        `${window.location.origin}${callbackRoute}`
      ),
      ...(token ? { token } : {}),
    });
  };
};

const WalletLogin = ({
  callbackRoute,
  token,
  webWalletButtonLabel,
}: {
  callbackRoute: string;
  token?: string;
  webWalletButtonLabel: string;
}) => {
  const webWalletLogin = useWebWalletLogin({ callbackRoute, token });

  return (
    <button
      onClick={webWalletLogin}
      className="btn btn-primary px-sm-4 m-1 mx-sm-3"
      data-testid="walletLink"
    >
      {webWalletButtonLabel}
    </button>
  );
};

export default WalletLogin;
