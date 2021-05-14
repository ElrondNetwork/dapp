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

export { renderWithRouter, routeNames };
