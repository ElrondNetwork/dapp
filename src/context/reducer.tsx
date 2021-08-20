import moment from "moment";
import { Nonce } from "@elrondnetwork/erdjs";
import { createInitialState, StateType } from "./state";
import storage from "helpers/storage";
import { dappInitRoute, iframeId } from "dappConfig";

export type DispatchType = (action: ActionType) => void;

export type ActionType =
  | { type: "login"; address: StateType["address"] }
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
  switch (action.type) {
    case "login": {
      storage.local.removeItem("nonce");
      storage.local.removeItem("sessions");
      const { address } = action;
      let loggedIn = address || address !== "" ? true : false;
      storage.session.setItem({
        key: "loggedIn",
        data: loggedIn,
        expires: in1hour,
      });
      storage.session.setItem({
        key: "address",
        data: address,
        expires: in1hour,
      });
      return {
        ...state,
        address,
        loggedIn: loggedIn,
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
      storage.session.clear();
      storage.local.removeItem("nonce");
      storage.local.removeItem("sessions");
      const { network, walletConnectBridge, walletConnectDeepLink } = state;
      const initialState = createInitialState({
        network,
        walletConnectBridge,
        walletConnectDeepLink,
      });
      const iframe: any = document.getElementById(iframeId);
      if (iframe && iframe.src.includes("#")) {
        iframe.src = `${network.walletAddress}${dappInitRoute}`;
      }

      return initialState;
    }

    default: {
      throw new Error(
        `Unhandled action type: ${action ? (action as any).type : ""}`
      );
    }
  }
}
