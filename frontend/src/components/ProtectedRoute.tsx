import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { getCurrentSession } from "@/lib/mockAuth";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();
  const session = getCurrentSession();

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
