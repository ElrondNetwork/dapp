import { Nonce } from "@elrondnetwork/erdjs";
import { createInitialState, StateType } from "./state";
import { setItem, removeItem } from "helpers/session";
import * as localStorage from "helpers/localStorage";

export type DispatchType = (action: ActionType) => void;

export type ActionType =
  | { type: "login"; address: StateType["address"] }
  | { type: "ledgerLogin"; ledgerLogin: StateType["ledgerLogin"] }
  | { type: "logout" }
  | { type: "setProvider"; provider: StateType["dapp"]["provider"] }
  | { type: "setAccount"; account: StateType["account"] }
  | { type: "setAccountNonce"; nonce: StateType["nonce"] }
  | { type: "setChainId"; chainId: StateType["chainId"] }
  | { type: "setLedgerAccount"; ledgerAccount: StateType["ledgerAccount"] }
  | {
      type: "setWalletConnectLogin";
      walletConnectLogin: StateType["walletConnectLogin"];
    };

export function reducer(state: StateType, action: ActionType): StateType {
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

    case "setAccountNonce": {
      return {
        ...state,
        account: {
          ...state.account,
          nonce: new Nonce(action.nonce),
        },
      };
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
      localStorage.removeItem("nonce");
      const { network, walletConnectBridge, walletConnectDeepLink } = state;
      const initialState = createInitialState({
        network,
        walletConnectBridge,
        walletConnectDeepLink,
      });

      return initialState;
    }

    default: {
      throw new Error(
        `Unhandled action type: ${action ? (action as any).type : ""}`
      );
    }
  }
}
