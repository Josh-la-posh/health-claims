import { RouterProvider } from "react-router-dom";
import { router } from "./app/router/routes";
import { useEffect } from "react";
import { useAuthStore } from "./store/auth";

const USE_REFRESH_TOKEN = import.meta.env.VITE_USE_REFRESH_TOKEN === "true";


export default function App() {
  const hydrateFromRefresh = useAuthStore((s) => s.hydrateFromRefresh);

  useEffect(() => {
    if (USE_REFRESH_TOKEN && hydrateFromRefresh) {
      hydrateFromRefresh();
    }
  }, [hydrateFromRefresh]);

  return <RouterProvider router={router} />;
}
