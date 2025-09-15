import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth";

export default function RootRedirect() {
  const token = useAuthStore((s) => s.accessToken);
  const next = new URLSearchParams(window.location.search).get("next");
  if (token) return <Navigate to={next || "/dashboard"} replace />;
  return <Navigate to={next || "/login"} replace />;
}
