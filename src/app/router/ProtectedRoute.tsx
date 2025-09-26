import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/auth";
import { saveIntendedRoute } from "../../lib/redirect";
import FullPageLoader from "../../components/ui/full-page-loader";
import { useCan } from "../../store/rbac";
import type { Permission } from "../../store/permissions";

export default function ProtectedRoute({ roles, requiredPermission }: { roles?: string[]; requiredPermission?: Permission }) {
  const { accessToken, user, hydrating, isTokenExpired } = useAuthStore();
  const can = useCan();
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

  if (requiredPermission && !can(requiredPermission)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}

export function UnauthOnly() {
  const { accessToken, hydrating, isTokenExpired, user } = useAuthStore();
  const next = new URLSearchParams(window.location.search).get("next");

  if (hydrating) return <FullPageLoader />;

  const validSession = accessToken && !isTokenExpired();

  if (validSession) {
    if (next) return <Navigate to={next} replace />;
    const to = user?.isProvider ? "/provider/dashboard" : "/hmo/dashboard";
    return <Navigate to={to} replace />;
  }
  return <Outlet />;
}
