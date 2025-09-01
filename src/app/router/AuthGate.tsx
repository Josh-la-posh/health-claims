import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const isAuthed = useAuthStore(s => s.isAuthenticated);
  if (isAuthed) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}
