import axios from "axios";
import { useContext } from "context";

async function wrap(asyncRequest: () => Promise<any>) {
  try {
    const { data } = await asyncRequest();

    return {
      data,
      success: data !== undefined,
    };
  } catch (err) {
    return {
      success: false,
    };
  }
}

async function apiGet({
  url,
  params = {},
  timeout,
}: {
  url: string;
  params?: any;
  timeout: number;
}) {
  return axios.get(url, { params, timeout });
}

const useApiRequests = () => {
  const { apiAddress } = useContext();
  const timeout = 4000;

  return {
    getClaimableMex: ({ address }: { address: string }) =>
      wrap(() => apiGet({ url: `${apiAddress}/mex/${address}`, timeout })),
    getTokens: ({ address }: { address: string }) =>
      wrap(() =>
        apiGet({
          url: `${apiAddress}/accounts/${address}/tokens`,
          timeout: 20000,
        })
      ),
  };
};

export default useApiRequests;
