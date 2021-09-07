import moment from "moment";
import { Nonce } from "@elrondnetwork/erdjs";
import { createInitialState, StateType } from "./state";
import storage from "helpers/storage";

export type DispatchType = (action: ActionType) => void;

export type ActionType =
  | {
      type: "login";
      address: StateType["address"];
      loginMethod: StateType["loginMethod"];
    }
  | { type: "ledgerLogin"; ledgerLogin: StateType["ledgerLogin"] }
  | { type: "logout" }
  | { type: "setProvider"; provider: StateType["dapp"]["provider"] }
  | { type: "setAccount"; account: StateType["account"] }
  | { type: "setAccountNonce"; nonce: number }
  | { type: "setAccountShard"; shard: StateType["shard"] }
  | { type: "setChainId"; chainId: StateType["chainId"] }
  | { type: "setLedgerAccount"; ledgerAccount: StateType["ledgerAccount"] }
  | {
      type: "setWalletConnectLogin";
      walletConnectLogin: StateType["walletConnectLogin"];
    }
  | {
      type: "setTokenLogin";
      tokenLogin: StateType["tokenLogin"];
    };

export function reducer(state: StateType, action: ActionType): StateType {
  const in1hour = moment().add(1, "hours").unix();
  const in1day = moment().add(1, "day").unix();
  switch (action.type) {
    case "login": {
      storage.local.removeItem("nonce");
      const { address, loginMethod } = action;
      let loggedIn = address || address !== "" ? true : false;
      storage.local.setItem({
        key: "loginMethod",
        data: loginMethod,
        expires: in1day,
      });
      storage.local.setItem({
        key: "address",
        data: address,
        expires: in1day,
      });
      return {
        ...state,
        address,
        loggedIn,
        loginMethod,
      };
    }
    case "ledgerLogin": {
      storage.local.removeItem("nonce");
      if (action.ledgerLogin) {
        storage.session.setItem({
          key: "ledgerLogin",
          data: action.ledgerLogin,
          expires: in1hour,
        });
      }
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

    case "setAccountShard": {
      return {
        ...state,
        shard: action.shard,
      };
    }

    case "setChainId": {
      return { ...state, chainId: action.chainId };
    }

    case "setLedgerAccount": {
      return { ...state, ledgerAccount: action.ledgerAccount };
    }

    case "setWalletConnectLogin": {
      if (action.walletConnectLogin) {
        storage.session.setItem({
          key: "walletConnectLogin",
          data: action.walletConnectLogin,
          expires: in1hour,
        });
      }
      return { ...state, walletConnectLogin: action.walletConnectLogin };
    }

    case "setTokenLogin": {
      if (action.tokenLogin) {
        storage.session.setItem({
          key: "tokenLogin",
          data: action.tokenLogin,
          expires: in1hour,
        });
      }
      return { ...state, tokenLogin: action.tokenLogin };
    }

    case "logout": {
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
