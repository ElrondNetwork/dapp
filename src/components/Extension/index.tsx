import { ExtensionProvider, WalletProvider } from "@elrondnetwork/erdjs";
import { useDispatch } from "context";
import * as React from "react";
import { Link, useHistory } from "react-router-dom";

const Extension = ({ label }: { label: string }) => {
  const dispatch = useDispatch();
  const history = useHistory();

  const connect = async (e: any) => {
    e.preventDefault();
    const extProvider = new ExtensionProvider(
      "pecdchfdfmkndoghjpdnfiafbmcmhkim"
    );

    extProvider.login().then((account: any) => {
      dispatch({ type: "setProvider", provider: extProvider });
      dispatch({ type: "login", address: account.address });
      history.push("/dashboard");
    });
  };

  return (
    <Link
      onClick={connect}
      className="btn btn-primary px-sm-4 m-1 mx-sm-3"
      to="/"
    >
      {label}
    </Link>
  );
};

export default Extension;
