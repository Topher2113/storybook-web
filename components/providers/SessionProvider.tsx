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
import { getSupabaseAuthClient } from "@/lib/supabaseClient";

// Guest-first sessions. Tokens are Supabase JWTs (~1h) and the API has no
// refresh endpoint, so expiry means a silent downgrade to guest play plus a
// banner inviting re-login — never an interruption. Any ApiAuthError from a
// player-state call should be routed to handleAuthError.
//
// Sign-up talks to Supabase Auth directly (see lib/supabaseClient.ts) rather
// than the class API, which only exposes login. It returns "signed-in" when
// Supabase hands back a session immediately, or "confirm-email" when the
// project requires email confirmation first (no session yet).
export type SignUpResult = "signed-in" | "confirm-email";

interface SessionContextValue {
  status: "guest" | "authed";
  user: { id: string; email: string } | null;
  token: string | null;
  authExpired: boolean;
  signUpAvailable: boolean;
  login: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<SignUpResult>;
  logout: () => void;
  handleAuthError: (err: unknown) => boolean;
}

const SessionContext = createContext<SessionContextValue>({
  status: "guest",
  user: null,
  token: null,
  authExpired: false,
  signUpAvailable: false,
  login: async () => {},
  signUp: async () => "confirm-email",
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

  const signUp = useCallback(
    async (email: string, password: string): Promise<SignUpResult> => {
      const supabase = getSupabaseAuthClient();
      if (!supabase) {
        throw new Error(
          "Sign-up isn't configured on this deployment yet — ask the site owner to set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
        );
      }
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw new Error(error.message);
      if (!data.session || !data.user?.email) return "confirm-email";
      const signedUpUser = { id: data.user.id, email: data.user.email };
      setUser(signedUpUser);
      setToken(data.session.access_token);
      setAuthExpired(false);
      saveAuth({
        token: data.session.access_token,
        user: signedUpUser,
        savedAt: new Date().toISOString(),
      });
      return "signed-in";
    },
    [],
  );

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
        signUpAvailable: getSupabaseAuthClient() !== null,
        login,
        signUp,
        logout,
        handleAuthError,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}
