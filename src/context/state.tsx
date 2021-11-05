import {
  IDappProvider,
  ProxyProvider,
  ApiProvider,
  Nonce,
  ChainID,
} from "@elrondnetwork/erdjs";
import { NetworkType } from "helpers/types";
import storage from "helpers/storage";
import { emptyProvider } from "helpers/provider";

const defaultGatewayAddress = "https://gateway.elrond.com";
const defaultApiAddress = "https://gateway.elrond.com";
const defaultExplorerAddress = "https://gateway.elrond.com";

export const defaultNetwork: NetworkType = {
  id: "not-configured",
  name: "NOT CONFIGURED",
  egldLabel: "",
  walletAddress: "",
  apiAddress: "",
  gatewayAddress: "",
  explorerAddress: "",
};

interface AccountType {
  address: string;
  balance: string;
  nonce: Nonce;
  code?: string;
  username?: string;
}

export interface DappState {
  provider: IDappProvider;
  proxy: ProxyProvider;
  apiProvider: ApiProvider;
}

export type ProviderType =
  | "wallet"
  | "ledger"
  | "walletconnect"
  | "extension"
  | "";

export interface StateType {
  walletConnectBridge: string;
  walletConnectDeepLink: string;
  network: NetworkType;
  chainId: ChainID;
  dapp: DappState;
  error: string;
  loggedIn: boolean;
  loginMethod: ProviderType;
  ledgerLogin?: {
    index: number;
    loginType: string;
  };
  walletConnectLogin?: {
    loginType: string;
    callbackRoute: string;
    logoutRoute: string;
  };
  address: string;
  shard?: number;
  account: AccountType;
  accountLoading: boolean;
  accountError?: Error;
  explorerAddress: string;
  egldLabel: string;
  ledgerAccount?: {
    index: number;
    address: string;
  };
  walletConnectAccount?: string;
  apiAddress: string;
  tokenLogin?: {
    loginToken: string;
    signature?: string;
  };
}
export const emptyAccount: AccountType = {
  balance: "...",
  address: "...",
  nonce: new Nonce(0),
};

export const createInitialState = ({
  network,
  walletConnectBridge,
  walletConnectDeepLink,
}: {
  walletConnectBridge: string;
  walletConnectDeepLink: string;
  network: NetworkType;
}) => {
  const sessionNetwork = network || defaultNetwork;

  const apiAddress =
    sessionNetwork.apiAddress !== undefined
      ? sessionNetwork.apiAddress
      : defaultApiAddress;

  const gatewayAddress =
    sessionNetwork.gatewayAddress !== undefined
      ? sessionNetwork.gatewayAddress
      : defaultGatewayAddress;

  const { getItem } = storage.session;

  const state: StateType = {
    walletConnectBridge,
    walletConnectDeepLink,
    network: sessionNetwork,
    chainId: new ChainID("-1"),
    dapp: {
      provider: emptyProvider, // will be checked in useSetProvider
      proxy: new ProxyProvider(gatewayAddress, { timeout: 10000 }), // 4000
      apiProvider: new ApiProvider(apiAddress, { timeout: 10000 }), // 4000
    },
    error: "",
    loggedIn: !!storage.local.getItem("loginMethod"),
    loginMethod: storage.local.getItem("loginMethod"),
    ledgerLogin: storage.local.getItem("ledgerLogin"),
    walletConnectLogin: getItem("walletConnectLogin"),
    address: storage.local.getItem("address"),
    account: emptyAccount,
    accountLoading: false,
    accountError: undefined,
    shard: undefined,
    explorerAddress: sessionNetwork.explorerAddress || defaultExplorerAddress,
    egldLabel: network ? network.egldLabel : defaultNetwork.egldLabel,
    ledgerAccount:
      getItem("ledgerAccountIndex") && storage.local.getItem("address")
        ? {
            index: getItem("ledgerAccountIndex"),
            address: storage.local.getItem("address"),
          }
        : undefined,
    walletConnectAccount: storage.local.getItem("address"),
    apiAddress,
    tokenLogin: getItem("tokenLogin"),
  };

  return state;
};
