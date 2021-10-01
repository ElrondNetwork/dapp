import React from "react";
import moment from "moment";
import { ExtensionProvider } from "@elrondnetwork/erdjs";
import { useHistory } from "react-router-dom";
import { useContext, useDispatch } from "context";
import storage from "helpers/storage";
import { buildUrlParams } from "helpers/buildUrlParams";

export const useExtensionLogin = ({
  callbackRoute,
  token,
}: {
  callbackRoute: string;
  token?: string;
}) => {
  const dispatch = useDispatch();
  const history = useHistory();

  return () => {
    const provider = ExtensionProvider.getInstance();
    provider
      .init()
      .then(async (initialised) => {
        if (initialised) {
          storage.session.setItem({
            key: "extensionLogin",
            data: {},
            expires: moment().add(1, "minutes").unix(),
          });
          await provider.login({
            callbackUrl: encodeURIComponent(
              `${window.location.origin}${callbackRoute}`
            ),

            ...(token ? { token } : {}),
          });

          dispatch({ type: "setProvider", provider });

          const address = await provider.getAddress();
          const account = provider.account;
          const url = new URL(`${window.location.origin}${callbackRoute}`);
          const routeParams = buildUrlParams(url.search, {
            address: account.address,
            signature: account.signature ? account.signature : "",
            loginToken: token ? token : "",
          });

          history.push(`${url.pathname}?${routeParams.nextUrlParams}`);
          dispatch({ type: "login", address, loginMethod: "extension" });
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
};

const ExtensionLogin = ({
  callbackRoute,
  token,
  extensionButtonLabel,
}: {
  callbackRoute: string;
  token?: string;
  extensionButtonLabel: string;
}) => {
  const extensionLogin = useExtensionLogin({ callbackRoute, token });

  return (
    <button
      onClick={extensionLogin}
      className="btn btn-primary px-sm-4 m-1 mx-sm-3"
      data-testid="walletLink"
    >
      {extensionButtonLabel}
    </button>
  );
};

export default ExtensionLogin;
