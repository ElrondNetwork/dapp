import { NetworkConfig } from "@elrondnetwork/erdjs";
import { waitFor } from "@testing-library/dom";
import { act, waitForElementToBeRemoved } from "@testing-library/react";
import { renderWithRouter, routeNames } from "testUtils";

jest.mock("../helpers", () => {
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
    useGetNetworkConfig: () => {
      const { NetworkConfig } = require("@elrondnetwork/erdjs");
      const networkConfig = new NetworkConfig();
      return () => Promise.resolve(networkConfig);
    },
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
});
