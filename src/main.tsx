import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { QueryProvider } from "./app/providers/QueryProvider";
import ThemeProvider from "./app/providers/ThemeProvider";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryProvider>
      <ThemeProvider />
      <App />
    </QueryProvider>
  </React.StrictMode>
);
