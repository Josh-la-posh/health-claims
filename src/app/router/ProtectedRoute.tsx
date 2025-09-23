import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/auth";
import { saveIntendedRoute } from "../../lib/redirect";
import FullPageLoader from "../../components/ui/full-page-loader";

export default function ProtectedRoute({ roles }: { roles?: string[] }) {
  const { accessToken, user, hydrating, isTokenExpired } = useAuthStore();
  const loc = useLocation();

  if (hydrating) return <FullPageLoader />;

  const validSession = accessToken && !isTokenExpired();

  if (!validSession) {
    // save route user tried to visit
    saveIntendedRoute(loc.pathname + loc.search);
    return (
      <Navigate
        to={`/login?next=${encodeURIComponent(loc.pathname + loc.search)}`}
        replace
      />
    );
  }

  if (roles && user?.role && !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}

export function UnauthOnly() {
  const { accessToken, hydrating, isTokenExpired } = useAuthStore();
  const next = new URLSearchParams(window.location.search).get("next");

  if (hydrating) return <FullPageLoader />;

  const validSession = accessToken && !isTokenExpired();

  if (validSession) {
    return <Navigate to={next || "/dashboard"} replace />;
  }
  return <Outlet />;
}
