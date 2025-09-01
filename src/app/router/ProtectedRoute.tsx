import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/auth";
import { saveIntendedRoute } from "../../lib/redirect";

export default function ProtectedRoute() {
  const isAuthed = useAuthStore(s => s.isAuthenticated);
  const location = useLocation();

  if (!isAuthed) {
    saveIntendedRoute(location.pathname + location.search + location.hash);
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}
