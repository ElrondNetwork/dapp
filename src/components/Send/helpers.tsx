import {
  WalletProvider,
  IDappProvider,
  HWProvider,
} from "@elrondnetwork/erdjs";

export type ProviderType = "wallet" | "ledger" | "walletconnect" | "";

export const getProviderType = (
  provider: IDappProvider | undefined
): ProviderType => {
  let providerType: ProviderType = "";

  providerType =
    provider && provider.constructor === WalletProvider
      ? "wallet"
      : providerType;

  providerType =
    provider && provider.constructor === HWProvider ? "ledger" : providerType;

  return providerType;
};
