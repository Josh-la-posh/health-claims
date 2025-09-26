import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../../store/auth";

interface TenantGuardProps {
  tenant: "hmo" | "provider";
}

// Ensures a user cannot access routes belonging to the other tenant type.
// Assumes parent ProtectedRoute already validated authentication.
export default function TenantGuard({ tenant }: TenantGuardProps) {
  const user = useAuthStore((s) => s.user);
  if (!user) {
    return <Navigate to="/login" replace />; // Fallback safety
  }
  const userTenant = user.isProvider ? "provider" : "hmo";
  if (userTenant !== tenant) {
    return <Navigate to={"/unauthorized?reason=tenant"} replace />;
  }
  return <Outlet />;
}
