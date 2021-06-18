import { StateType } from "./state";
import { setItem, removeItem } from "helpers/session";

export type DispatchType = (action: ActionType) => void;

export type ActionType =
  | { type: "login"; address: StateType["address"] }
  | { type: "ledgerLogin"; ledgerLogin: StateType["ledgerLogin"] }
  | { type: "logout" }
  | { type: "setProvider"; provider: StateType["dapp"]["provider"] }
  | { type: "setAccount"; account: StateType["account"] }
  | { type: "setChainId"; chainId: StateType["chainId"] }
  | { type: "setLedgerAccount"; ledgerAccount: StateType["ledgerAccount"] }
  | {
      type: "setWalletConnectLogin";
      walletConnectLogin: StateType["walletConnectLogin"];
    };

export function createReducer(initialState: StateType) {
  return function reducer(state: StateType, action: ActionType): StateType {
    switch (action.type) {
      case "login": {
        const { address } = action;
        let loggedIn = address || address !== "" ? true : false;
        setItem("loggedIn", loggedIn);
        setItem("address", address);
        return {
          ...state,
          address,
          loggedIn: loggedIn,
        };
      }
      case "ledgerLogin": {
        setItem("ledgerLogin", action.ledgerLogin);
        return { ...state, ledgerLogin: action.ledgerLogin };
      }

      case "setProvider": {
        return {
          ...state,
          dapp: { ...state.dapp, provider: action.provider },
        };
      }

      case "setAccount": {
        return { ...state, account: action.account };
      }

      case "setChainId": {
        return { ...state, chainId: action.chainId };
      }

      case "setLedgerAccount": {
        return { ...state, ledgerAccount: action.ledgerAccount };
      }

      case "setWalletConnectLogin": {
        setItem("walletConnectLogin", action.walletConnectLogin);
        return { ...state, walletConnectLogin: action.walletConnectLogin };
      }

      case "logout": {
        const { provider } = state.dapp;
        provider
          .logout()
          .then()
          .catch((e) => console.error("logout", e));
        removeItem("loggedIn");
        removeItem("address");
        removeItem("ledgerLogin");
        removeItem("walletConnectLogin");
        return initialState;
      }

      default: {
        throw new Error(
          `Unhandled action type: ${action ? (action as any).type : ""}`
        );
      }
    }
  };
}
