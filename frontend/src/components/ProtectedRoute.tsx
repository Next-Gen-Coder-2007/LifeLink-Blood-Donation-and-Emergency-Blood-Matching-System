import { Navigate, useLocation } from "react-router-dom";
import { getSession } from "@/lib/api";

export function ProtectedRoute({ children }: { children: JSX.Element }) {
  const location = useLocation();
  const session = getSession();

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
