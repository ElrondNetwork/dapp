import { Transaction } from "@elrondnetwork/erdjs";
import { useDispatch } from "context";

export default function useSend() {
  const dispatch = useDispatch();

  return ({
    transaction,
    callbackRoute,
  }: {
    transaction: Transaction;
    callbackRoute: string;
  }) => {
    dispatch({
      type: "setNewTransaction",
      newTransaction: {
        transaction,
        callbackRoute,
      },
    });
  };
}
