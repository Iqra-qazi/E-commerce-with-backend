import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getCurrentUserRequest, loginRequest, registerRequest } from "../api/auth";
import { setUnauthorizedHandler } from "../api/client";
import { AuthContext } from "./auth-context";
import type { AuthResponse, AuthUser } from "../types/auth";
import { getErrorMessage } from "../utils/errors";

const TOKEN_KEY = "ecommerce_token";

function isValidSession(response: AuthResponse) {
  return Boolean(response.token && response.user?.id && response.user?.email);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState(true);

  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    navigate("/login", { replace: true });
  }, [clearSession, navigate]);

  const saveSession = useCallback((response: AuthResponse) => {
    if (!isValidSession(response)) {
      throw new Error("The server returned an invalid authentication response.");
    }

    localStorage.setItem(TOKEN_KEY, response.token);
    setToken(response.token);
    setUser(response.user);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(logout);

    return () => setUnauthorizedHandler(() => {
      localStorage.removeItem(TOKEN_KEY);
      window.location.assign("/login");
    });
  }, [logout]);

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await getCurrentUserRequest();
        if (active) setUser(response.user);
      } catch (error) {
        if (active) {
          clearSession();
          toast.error(getErrorMessage(error, "Your session could not be restored. Please sign in."));
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void restoreSession();
    return () => {
      active = false;
    };
  }, [clearSession, token]);

  const login = useCallback(async (email: string, password: string) => {
    const response = await loginRequest(email, password);
    saveSession(response);
  }, [saveSession]);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const response = await registerRequest(name, email, password);
    saveSession(response);
  }, [saveSession]);

  const value = useMemo(
    () => ({ user, token, loading, login, register, logout }),
    [user, token, loading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
