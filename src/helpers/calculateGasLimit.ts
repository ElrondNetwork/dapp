import BigNumber from "bignumber.js";
import { GasLimit } from "@elrondnetwork/erdjs";

interface CalculateGasLimitType {
  data: string;
  gasLimit: number;
  gasPerDataByte: number;
}

export default function calculateGasLimit({
  data,
  gasLimit: configGasLimit,
  gasPerDataByte,
}: CalculateGasLimitType) {
  const bNconfigGasLimit = new BigNumber(configGasLimit);
  const bNgasPerDataByte = new BigNumber(gasPerDataByte);
  const bNgasValue = data
    ? bNgasPerDataByte.times(Buffer.from(data).length)
    : 0;
  const bNgasLimit = bNconfigGasLimit.plus(bNgasValue);
  return new GasLimit(parseInt(bNgasLimit.toString(10)));
}
