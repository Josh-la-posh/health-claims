import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth";

export default function RootRedirect() {
  const token = useAuthStore((s) => s.accessToken);
  const isProvider = useAuthStore((s) => s.user?.isProvider);
  const next = new URLSearchParams(window.location.search).get("next");

  if (token) {
    // If a next param is provided (deep link) honor it first
    if (next) return <Navigate to={next} replace />;
    // Otherwise send user to their tenant dashboard
    return <Navigate to={isProvider ? "/provider/dashboard" : "/hmo/dashboard"} replace />;
  }
  return <Navigate to={next || "/login"} replace />;
}
