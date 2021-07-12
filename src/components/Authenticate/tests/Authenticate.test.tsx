import moment from "moment";
import {
  renderWithRouter,
  routeNames,
  sessionStorageMock,
  testAddress,
} from "testUtils";

jest.mock("../helpers", () => {
  return {
    __esModule: true,
    useGetNetworkConfig: () => {
      const { NetworkConfig } = require("@elrondnetwork/erdjs");
      const networkConfig = new NetworkConfig();
      return () => Promise.resolve(networkConfig);
    },
  };
});

jest.mock("../../../helpers/accountMethods", () => {
  return {
    __esModule: true,
    useGetAccount: () => {
      const {
        AccountOnNetwork,
        Address,
        Balance,
        Nonce,
      } = require("@elrondnetwork/erdjs");

      const emptyAccount: typeof AccountOnNetwork = {
        balance: new Balance("0"),
        address: new Address(
          "erd1x5vaatpqp27v32ku9xk8rdkxxlnvp2nrltngq22z8ll30l894jwqhdzng8"
        ),
        nonce: new Nonce(0),
        code: "",
        userName: "",
      };
      return () => Promise.resolve(emptyAccount);
    },
    useGetAddress: () => () =>
      "erd1x5vaatpqp27v32ku9xk8rdkxxlnvp2nrltngq22z8ll30l894jwqhdzng8",
  };
});

describe("Authenticate Component", () => {
  it("allows viewing public routes", () => {
    const screen = renderWithRouter({ route: routeNames.home });
    const title = screen.getByTestId("title");
    expect(title.textContent).toBe("Home");
  });
  it("redirects to unlock if not logged in", async () => {
    const screen = renderWithRouter({ route: routeNames.dashboard });
    expect(screen.history.location.pathname).toBe(routeNames.unlock);
  });
  it("allows access to private routes", async () => {
    Object.defineProperty(window, "sessionStorage", {
      value: sessionStorageMock({
        walletLogin: JSON.stringify({
          data: {},
          expires: moment().add(60, "seconds").unix(),
        }),
      }),
    });

    const screen = renderWithRouter({
      route: `${routeNames.dashboard}?address=${testAddress}`,
    });

    const loader = await screen.findByTestId("loader");
    expect(loader).toBeDefined();

    expect(screen.history.location.pathname).toBe(routeNames.dashboard);
  });
});
