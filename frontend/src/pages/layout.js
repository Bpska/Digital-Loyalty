import { Outlet } from "react-router-dom";
import React from 'react';

import ClientProviders from "./providers";

export default function RootLayout() {
  return (
    React.createElement(ClientProviders, null,
      React.createElement(Outlet, null)
    )
  );
}
