import * as React from "react";
import { render } from "@testing-library/react";
import { createMemoryHistory, History } from "history";
import { Router } from "react-router-dom";
import SampleApp from "./SampleApp";
import { routeNames } from "./routes";

const renderWithRouter = ({
  route = "/",
  history = createMemoryHistory({ initialEntries: ["/"] }),
}: {
  route: string;
  history?: History;
}) => {
  history = createMemoryHistory({ initialEntries: [route] });
  return {
    ...render(
      <Router history={history}>
        <SampleApp />
      </Router>
    ),
    // adding `history` to the returned utilities to allow us
    // to reference it in our tests (just try to avoid using
    // this to test implementation details).
    history,
  };
};

const sessionStorageMock = (customStore = {}) => {
  let store: any = {
    ...customStore,
  };
  return {
    getItem: function getItem(key: string) {
      return store[key];
    },
    setItem: function setItem(key: string, value: string) {
      store[key] = value;
    },
    clear: function clear() {
      store = {};
    },
    removeItem: function removeItem(key: string) {
      delete store[key];
    },
  };
};

const testAddress =
  "erd1x5vaatpqp27v32ku9xk8rdkxxlnvp2nrltngq22z8ll30l894jwqhdzng8";

export { renderWithRouter, routeNames, sessionStorageMock, testAddress };
