import * as React from "react";
import Unlock from "./components/Unlock";
import Send from "./components/Send";
import AuthenticateComponent from "./components/Authenticate";
import Ledger from "./components/Ledger";
import { useWebWalletLogin } from "./components/Unlock/Login/Wallet";
import WalletConnect from "./components/WalletConnect";
import { ContextProvider as Context, useContext, useDispatch } from "./context";
import useSendTransaction from "./helpers/useSend";
import useSignTransactions from "./helpers/useSignTransactions";
import {
  useRefreshAccount,
  useGetAccountShard,
} from "./helpers/accountMethods";
import {
  RouteType as RouteInterface,
  NetworkType as NetworkInterface,
} from "./helpers/types";
import SignTransactions from "components/SignTransactions";

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
      <SignTransactions />
    </AuthenticateComponent>
  );
};

const Pages = { Unlock, Ledger, WalletConnect };

export {
  Authenticate,
  Pages,
  useRefreshAccount,
  useGetAccountShard,
  useSendTransaction,
  useSignTransactions,
  useWebWalletLogin,
  Context,
  useContext,
  useDispatch,
};
