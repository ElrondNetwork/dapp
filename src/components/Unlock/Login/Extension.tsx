import React from "react";
import moment from "moment";
import { ExtensionProvider } from "@elrondnetwork/erdjs";
import { useHistory } from "react-router-dom";
import { useContext, useDispatch } from "context";
import storage from "helpers/storage";

export const useExtensionLogin = ({
  callbackRoute,
  token,
}: {
  callbackRoute: string;
  token?: string;
}) => {
  const { dapp } = useContext();
  const dispatch = useDispatch();
  const history = useHistory();

  return () => {
    dapp.provider = ExtensionProvider.getInstance();
    dapp.provider
      .init()
      .then(async (initialised) => {
        if (initialised) {
          storage.session.setItem({
            key: "extensionLogin",
            data: {},
            expires: moment().add(1, "minutes").unix(),
          });
          await dapp.provider.login({
            callbackUrl: encodeURIComponent(
              `${window.location.origin}${callbackRoute}`
            ),

            ...(token ? { token } : {}),
          });

          dispatch({ type: "setProvider", provider: dapp.provider });

          const address = await dapp.provider.getAddress();
          const account = (dapp.provider as ExtensionProvider).account;

          const addressParam = `address=${account.address}`;
          const signatureParam = `signature=${account.signature}`;
          const loginTokenParam = `loginToken=${token}`;
          history.push(
            `${callbackRoute}?${addressParam}&${signatureParam}&${loginTokenParam}`
          );
          dispatch({ type: "login", address });
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
