import {
  Transaction,
  GasLimit,
  GasPrice,
  Address,
  TransactionPayload,
  Balance,
  ChainID,
  TransactionVersion,
} from "@elrondnetwork/erdjs";

interface RawTransactionType {
  value: string;
  receiver: string;
  gasPrice: number;
  gasLimit: number;
  data: string;
  chainID: string;
  version: number;
}

export default function newTransaction(rawTransaction: RawTransactionType) {
  return new Transaction({
    value: Balance.fromString(rawTransaction.value),
    data: new TransactionPayload(rawTransaction.data),
    receiver: new Address(rawTransaction.receiver),
    gasLimit: new GasLimit(rawTransaction.gasLimit),
    gasPrice: new GasPrice(rawTransaction.gasPrice),
    chainID: new ChainID(rawTransaction.chainID),
    version: new TransactionVersion(rawTransaction.version),
  });
}
