import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { initObservability } from "./lib/observability";
import { QueryProvider } from "./app/providers/QueryProvider";
import ThemeProvider from "./app/providers/ThemeProvider";
import { RouteResetBoundary } from "./components/system/ErrorBoundary";
import App from "./App";

initObservability();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryProvider>
      <ThemeProvider />
      <RouteResetBoundary>
        <App />
      </RouteResetBoundary>
    </QueryProvider>
  </React.StrictMode>
);
