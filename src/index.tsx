import * as React from "react";
import Unlock from "./components/Unlock";
import Send from "./components/Send";
import AuthenticateComponent from "./components/Authenticate";
import Ledger from "./components/Ledger";
import { useWebWalletLogin } from "./components/Unlock/Login/Wallet";
import { useExtensionLogin } from "./components/Unlock/Login/Extension";
import WalletConnect from "./components/WalletConnect";
import { ContextProvider as Context, useContext, useDispatch } from "./context";
import useSendTransaction from "./helpers/useSend";
import calculateGasLimit from "./helpers/calculateGasLimit";
import useLogout from "./helpers/useLogout";
import {
  useRefreshAccount,
  useGetAccountShard,
  useSetNonce,
} from "./helpers/accountMethods";
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
  useGetAccountShard,
  useSendTransaction,
  useWebWalletLogin,
  useExtensionLogin,
  useSetNonce,
  Context,
  useContext,
  useDispatch,
  useLogout,
  calculateGasLimit,
};
