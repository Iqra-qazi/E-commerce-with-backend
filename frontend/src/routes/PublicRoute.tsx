import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export function PublicRoute() {
  const { loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="grid min-h-screen place-items-center text-sm text-stone-500">Loading…</div>;
  }

  const state = location.state as {
    from?: { pathname?: string; search?: string; hash?: string };
  } | null;
  const from = state?.from;

  return user ? (
    <Navigate
      to={{
        pathname: from?.pathname || "/",
        search: from?.search || "",
        hash: from?.hash || "",
      }}
      replace
    />
  ) : (
    <Outlet />
  );
}
