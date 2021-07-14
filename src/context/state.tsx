import {
  IDappProvider,
  ProxyProvider,
  ApiProvider,
  WalletProvider,
  Nonce,
  ChainID,
} from "@elrondnetwork/erdjs";
import { AccountType, NetworkType } from "helpers/types";
import { getItem } from "helpers/session";

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

export interface DappState {
  provider: IDappProvider;
  proxy: ProxyProvider;
  apiProvider: ApiProvider;
}

export interface StateType {
  walletConnectBridge: string;
  walletConnectDeepLink: string;
  network: NetworkType;
  chainId: ChainID;
  dapp: DappState;
  error: string;
  loggedIn: boolean;
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
  nonce: number;
  account: AccountType;
  explorerAddress: string;
  egldLabel: string;
  ledgerAccount?: {
    index: number;
    address: string;
  };
  walletConnectAccount?: string;
  apiAddress: string;
}
export const emptyAccount: AccountType = {
  balance: "...",
  address: "...",
  nonce: new Nonce(0),
};

export const newWalletProvider = (network: NetworkType) =>
  new WalletProvider(`${network.walletAddress}/dapp/init`);

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

  const defaultProvider = newWalletProvider(sessionNetwork);

  const state: StateType = {
    walletConnectBridge,
    walletConnectDeepLink,
    network: sessionNetwork,
    chainId: new ChainID("-1"),
    dapp: {
      provider: defaultProvider, // will be checked in useSetProvider
      proxy: new ProxyProvider(gatewayAddress, { timeout: 4000 }),
      apiProvider: new ApiProvider(apiAddress, { timeout: 4000 }),
    },
    error: "",
    loggedIn: !!getItem("loggedIn"),
    ledgerLogin: getItem("ledgerLogin"),
    walletConnectLogin: getItem("walletConnectLogin"),
    address: getItem("address"),
    nonce: 0,
    account: emptyAccount,
    explorerAddress: sessionNetwork.explorerAddress || defaultExplorerAddress,
    egldLabel: network ? network.egldLabel : defaultNetwork.egldLabel,
    ledgerAccount:
      getItem("ledgerAccountIndex") && getItem("address")
        ? {
            index: getItem("ledgerAccountIndex"),
            address: getItem("address"),
          }
        : undefined,
    walletConnectAccount: getItem("address"),
    apiAddress,
  };

  return state;
};
