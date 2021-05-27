import * as React from "react";
import Unlock from "./components/Unlock";
import Send from "./components/Send";
import AuthenticateComponent from "./components/Authenticate";
import Ledger from "./components/Ledger";
import WalletConnect from "./components/WalletConnect";
import { ContextProvider as Context, useContext, useDispatch } from "./context";
import useSendTransaction from "./helpers/useSend";
import { useRefreshAccount } from "./helpers/accountMethods";
import {
  RouteType as RouteInterface,
  NetworkType as NetworkInterface,
} from "./helpers/types";

export type NetworkType = NetworkInterface;
export type RouteType = RouteInterface;

const Authenticate = ({
  children,
  routes,
  unlockRoute,
}: {
  children: React.ReactNode;
  routes: RouteType[];
  unlockRoute: string;
}) => {
  return (
    <AuthenticateComponent routes={routes} unlockRoute={unlockRoute}>
      {children}
      <Send />
    </AuthenticateComponent>
  );
};

const Pages = { Unlock, Ledger, WalletConnect };

export {
  Authenticate,
  Pages,
  useRefreshAccount,
  useSendTransaction,
  Context,
  useContext,
  useDispatch,
};
