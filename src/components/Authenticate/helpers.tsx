import { Address } from "@elrondnetwork/erdjs";
import { useContext } from "context";

export function useGetAccount() {
  const { dapp } = useContext();
  return (address: string) => dapp.proxy.getAccount(new Address(address));
}

export function useGetAddress() {
  const { dapp } = useContext();
  return () => dapp.provider.getAddress();
}

export function useGetNetworkConfig() {
  const { dapp } = useContext();
  return () => dapp.proxy.getNetworkConfig();
}
