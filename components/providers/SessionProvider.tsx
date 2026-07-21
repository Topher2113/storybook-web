"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getMe, login as apiLogin } from "@/lib/api/auth";
import { ApiAuthError } from "@/lib/api/http";
import { loadAuth, saveAuth } from "@/lib/game/storage";

// Guest-first sessions. Tokens are Supabase JWTs (~1h) and the API has no
// refresh endpoint, so expiry means a silent downgrade to guest play plus a
// banner inviting re-login — never an interruption. Any ApiAuthError from a
// player-state call should be routed to handleAuthError.
interface SessionContextValue {
  status: "guest" | "authed";
  user: { id: string; email: string } | null;
  token: string | null;
  authExpired: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  handleAuthError: (err: unknown) => boolean;
}

const SessionContext = createContext<SessionContextValue>({
  status: "guest",
  user: null,
  token: null,
  authExpired: false,
  login: async () => {},
  logout: () => {},
  handleAuthError: () => false,
});

export function useSession() {
  return useContext(SessionContext);
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [authExpired, setAuthExpired] = useState(false);

  // Rehydrate a stored session and validate the token in the background;
  // an expired token is dropped silently (the user never logged in visibly).
  useEffect(() => {
    const stored = loadAuth();
    if (!stored) return;
    // One-time client rehydration of SSR-invisible session state — cannot
    // cascade (runs once, guarded by the early return).
    /* eslint-disable react-hooks/set-state-in-effect */
    setUser(stored.user);
    setToken(stored.token);
    /* eslint-enable react-hooks/set-state-in-effect */
    getMe(stored.token).catch((err) => {
      if (err instanceof ApiAuthError) {
        setUser(null);
        setToken(null);
        saveAuth(null);
      }
      // Other failures (cold start) keep the session — it may still be valid.
    });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiLogin(email, password);
    setUser(res.user);
    setToken(res.accessToken);
    setAuthExpired(false);
    saveAuth({
      token: res.accessToken,
      user: res.user,
      savedAt: new Date().toISOString(),
    });
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setAuthExpired(false);
    saveAuth(null);
  }, []);

  const handleAuthError = useCallback((err: unknown): boolean => {
    if (!(err instanceof ApiAuthError)) return false;
    setUser(null);
    setToken(null);
    setAuthExpired(true);
    saveAuth(null);
    return true;
  }, []);

  return (
    <SessionContext.Provider
      value={{
        status: token ? "authed" : "guest",
        user,
        token,
        authExpired,
        login,
        logout,
        handleAuthError,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}
