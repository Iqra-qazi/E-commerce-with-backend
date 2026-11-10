import { useEffect, useRef } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../hooks/useAuth";

export function AdminRoute() {
  const { loading, user } = useAuth();
  const hasNotified = useRef(false);

  useEffect(() => {
    if (!loading && user && user.role !== "admin" && !hasNotified.current) {
      hasNotified.current = true;
      toast.error("Access denied");
    }
  }, [loading, user]);

  if (loading) {
    return <div className="grid min-h-screen place-items-center text-sm text-stone-500">Restoring your session…</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return user.role === "admin" ? <Outlet /> : <Navigate to="/" replace />;
}
