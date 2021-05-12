import * as React from "react";
import Unlock from "./components/Unlock";
import Send from "./components/Send";
import AuthenticateComponent from "./components/Authenticate";
import Ledger from "./components/Ledger";
import WalletConnect from "./components/WalletConnect";
import useSend from "./helpers/useSend";
import {
  ContextProvider,
  useContext as useDappContext,
  useDispatch as useDappDispatch,
} from "./context";
import {
  RouteType as RouteInterface,
  NetworkType as NetworkInterface,
} from "./helpers/types";

export type NetworkType = NetworkInterface;
export type RouteType = RouteInterface;
export const Context = ContextProvider;
export const useContext = useDappContext;
export const useDispatch = useDappDispatch;
export const useSendTransaction = useSend;

export const Authenticate = ({
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

export const Pages = { Unlock, Ledger, WalletConnect };
