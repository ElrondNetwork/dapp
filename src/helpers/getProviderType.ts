import {
  WalletProvider,
  IDappProvider,
  HWProvider,
  WalletConnectProvider,
  ExtensionProvider,
} from "@elrondnetwork/erdjs";

export type ProviderType =
  | "wallet"
  | "ledger"
  | "walletconnect"
  | "extension"
  | "";

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

export default getProviderType;
