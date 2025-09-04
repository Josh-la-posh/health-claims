import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { QueryProvider } from "./app/providers/QueryProvider";
import ThemeProvider from "./app/providers/ThemeProvider";
import { ErrorBoundary } from "./components/system/ErrorBoundary";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryProvider>
      <ThemeProvider />
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </QueryProvider>
  </React.StrictMode>
);
