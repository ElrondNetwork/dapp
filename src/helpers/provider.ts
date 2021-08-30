import {
  WalletProvider,
  IDappProvider,
  HWProvider,
  WalletConnectProvider,
  ExtensionProvider,
} from "@elrondnetwork/erdjs";
import { ProviderType } from "context/state";
import { DAPP_INIT_ROUTE } from "dappConfig";
import { NetworkType } from "./types";

const getProviderType = (provider: IDappProvider | undefined): ProviderType => {
  let providerType: ProviderType = "";

  providerType =
    provider && provider.constructor === WalletProvider
      ? "wallet"
      : providerType;

  providerType =
    provider && provider.constructor === WalletConnectProvider
      ? "walletconnect"
      : providerType;

  providerType =
    provider && provider.constructor === HWProvider ? "ledger" : providerType;

  providerType =
    provider && provider.constructor === ExtensionProvider
      ? "extension"
      : providerType;

  return providerType;
};

export const newWalletProvider = (network: NetworkType) =>
  new WalletProvider(`${network.walletAddress}${DAPP_INIT_ROUTE}`);

const notInitializedError = (caller: string) => () => {
  throw new Error(`Unable to perform ${caller}, Provider not initialized`);
};

export const emptyProvider: IDappProvider = {
  init: async () => false,
  login: notInitializedError("login"),
  logout: notInitializedError("logout"),
  getAddress: notInitializedError("getAddress"),
  isInitialized: () => false,
  isConnected: async () => false,
  sendTransaction: notInitializedError("sendTransaction"),
  signTransaction: notInitializedError("signTransaction"),
  signTransactions: notInitializedError("signTransactions"),
  signMessage: notInitializedError("signMessage"),
};

export default getProviderType;
