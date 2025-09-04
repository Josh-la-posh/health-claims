import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/auth";
import { saveIntendedRoute } from "../../lib/redirect";

export default function ProtectedRoute() {
  const token = useAuthStore((s) => s.accessToken);
  const loc = useLocation();
  if (!token) {
    // save intended route (pathname + search) to storage
    saveIntendedRoute(loc.pathname + loc.search);
    return <Navigate to={`/login?next=${encodeURIComponent(loc.pathname + loc.search)}`} replace />;
  }
  return <Outlet />;
}

export function UnauthOnly() {
  const token = useAuthStore((s) => s.accessToken);
  const next = new URLSearchParams(window.location.search).get("next");
  if (token) return <Navigate to={next || "/dashboard"} replace />;
  return <Outlet />;
}