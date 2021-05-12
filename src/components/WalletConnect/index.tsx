import React from "react";
import QRCode from "qrcode";
// @ts-ignore
import platform from "platform";
import { WalletConnectProvider } from "@elrondnetwork/erdjs";
import { useHistory } from "react-router-dom";
import { useContext, useDispatch } from "context";
import { ReactComponent as Lightning } from "./lightning.svg";

const WalletConnect = ({
  title = "Maiar Login",
  lead = "Scan the QR code using Maiar",
  callbackRoute,
  logoutRoute,
}: {
  title?: string;
  lead?: string;
  callbackRoute: string;
  logoutRoute: string;
}) => {
  const { dapp, walletConnectBridge, walletConnectDeepLink } = useContext();
  const dispatch = useDispatch();
  const history = useHistory();
  const ref = React.useRef(null);
  const [qrSvg, setQrSvg] = React.useState<string>("");
  const [wcUri, setWcUri] = React.useState<string>("");
  const [error, setError] = React.useState<string>("");

  const isMobile =
    platform.os.family === "iOS" || platform.os.family === "Android";

  const svgQr: any = {
    dangerouslySetInnerHTML: {
      __html: qrSvg,
    },
    style: {
      width: "15rem",
      height: "15rem",
    },
  };

  const buildQrCode = () => {
    (async () => {
      if (wcUri) {
        const svg = await QRCode.toString(wcUri, {
          type: "svg",
        });
        setQrSvg(svg);
      }
    })();
  };

  const handleOnLogin = () => {
    dapp.provider
      .getAddress()
      .then((address) => {
        dispatch({
          type: "setWalletConnectLogin",
          walletConnectLogin: {
            loginType: "walletConnect",
          },
        });
        dispatch({ type: "login", address });
        history.push(callbackRoute);
      })
      .catch((e) => {
        setError("Invalid address");
        console.log(e);
      });
  };

  const handleOnLogout = () => {
    dispatch({ type: "logout" });
    history.push(logoutRoute);
  };

  const walletConnectInit = () => {
    const walletConnect = new WalletConnectProvider(
      dapp.proxy,
      walletConnectBridge
    );
    dapp.provider = walletConnect;
    walletConnect.addEventListener("onWalletConnectLogin", handleOnLogin);
    walletConnect.addEventListener("onWalletConnectDisconect", handleOnLogout);

    walletConnect.login().then((walletConectUri) => {
      if (ref.current !== null) {
        setWcUri(walletConectUri);
      }
    });
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(walletConnectInit, []);
  React.useEffect(buildQrCode, [wcUri]);

  return (
    <div className="m-auto login-container" ref={ref}>
      <div className="card my-3 text-center">
        <div className="card-body p-4 mx-lg-4">
          <div className="mx-auto mb-3" {...svgQr} />
          <h4 className="mb-3">{title}</h4>
          {isMobile ? (
            <React.Fragment>
              <p className="lead mb-0">
                Scan the QR code using Maiar or click the button below to open
                the App
              </p>
              <a
                id="accessWalletBtn"
                data-testid="accessWalletBtn"
                className="btn btn-primary px-4 mt-4"
                href={`${walletConnectDeepLink}?wallet-connect=${encodeURIComponent(
                  wcUri
                )}`}
                rel="noopener noreferrer nofollow"
                target="_blank"
              >
                <Lightning
                  className="mr-2"
                  style={{
                    width: "0.7rem",
                    height: "0.7rem",
                  }}
                />
                {title}
              </a>
            </React.Fragment>
          ) : (
            <p className="lead mb-0">{lead}</p>
          )}
          <div>
            {error && (
              <p className="text-danger d-flex justify-content-center align-items-center">
                {error}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletConnect;
