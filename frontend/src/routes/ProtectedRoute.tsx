import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export function ProtectedRoute() {
  const { loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="grid min-h-screen place-items-center text-sm text-stone-500">Restoring your session…</div>;
  }

  return user ? <Outlet /> : <Navigate to="/login" replace state={{ from: location }} />;
}
