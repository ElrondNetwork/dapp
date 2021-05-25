import { RouteType } from "helpers/types";
import React from "react";

export const routeNames = {
  home: "/",
  dashboard: "/dashboard",
  transaction: "/transaction",
  unlock: "/unlock",
  ledger: "/ledger",
  walletconnect: "/walletconnect",
};

const routes: RouteType[] = [
  {
    path: routeNames.home,
    component: () => <h1 data-testid="title">Home</h1>,
  },
  {
    path: routeNames.dashboard,
    component: () => <h1 data-testid="title">Dashboard</h1>,
    authenticatedRoute: true,
  },
];

export default routes;
