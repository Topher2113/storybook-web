"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useGame } from "@/components/providers/GameProvider";
import { useSession } from "@/components/providers/SessionProvider";
import { Button } from "@/components/ui/Button";
import { ApiError } from "@/lib/api/http";
import { reconcileOnLogin } from "@/lib/game/reconcile";
import { loadAuth } from "@/lib/game/storage";

type Mode = "sign-in" | "sign-up";
type Phase = "idle" | "working" | "syncing" | "confirm-email";

// Dormant for now — not rendered below. The API has no working
// create-account path yet, so sign-in/up is off site-wide (see AppShell,
// AuthBanner). Kept intact, `export`ed so it isn't flagged unused, for when
// it comes back: swap LoginPage's body back to <Suspense><LoginForm /></Suspense>.
export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, signUp, signUpAvailable, status, user, logout } =
    useSession();
  const { progress, dispatch } = useGame();
  const [mode, setMode] = useState<Mode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);

  const afterSignedIn = async () => {
    setPhase("syncing");
    const auth = loadAuth();
    if (auth) await reconcileOnLogin(auth.token, progress, dispatch);
    router.push(searchParams.get("from") ?? "/");
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === "sign-up" && password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setPhase("working");
    try {
      if (mode === "sign-in") {
        await login(email, password);
        await afterSignedIn();
      } else {
        const result = await signUp(email, password);
        if (result === "confirm-email") {
          setPhase("confirm-email");
        } else {
          await afterSignedIn();
        }
      }
    } catch (err) {
      setPhase("idle");
      setError(
        err instanceof ApiError && err.status === 401
          ? "Invalid email or password."
          : err instanceof Error
            ? err.message
            : mode === "sign-in"
              ? "Unable to sign in right now."
              : "Unable to create an account right now.",
      );
    }
  };

  if (status === "authed" && phase === "idle") {
    return (
      <div className="text-center">
        <p className="mb-4">
          Signed in as <strong>{user?.email}</strong>. Your scene, inventory,
          and quest log sync to the cloud.
        </p>
        <Button variant="outline" onClick={logout}>
          Log out
        </Button>
      </div>
    );
  }

  if (phase === "confirm-email") {
    return (
      <div className="text-center">
        <p className="mb-4">
          Almost there — we sent a confirmation link to{" "}
          <strong>{email}</strong>. Click it, then sign in below.
        </p>
        <Button
          variant="outline"
          onClick={() => {
            setMode("sign-in");
            setPhase("idle");
          }}
        >
          Back to sign in
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {signUpAvailable && (
        <div className="flex rounded-lg bg-surface p-1 text-sm">
          {(["sign-in", "sign-up"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMode(m);
                setError(null);
              }}
              className={`flex-1 rounded-md px-3 py-1.5 transition ${
                mode === m
                  ? "bg-primary text-button-text"
                  : "text-text/70 hover:text-text"
              }`}
            >
              {m === "sign-in" ? "Sign In" : "Create Account"}
            </button>
          ))}
        </div>
      )}
      <form onSubmit={(e) => void onSubmit(e)} className="flex flex-col gap-4">
        <p className="text-sm text-text/70">
          {mode === "sign-in"
            ? "Signing in saves your current scene, inventory, and quest log to the cloud so you can resume on any device. Guests keep everything in this browser."
            : "Creating an account saves your progress to the cloud so you can resume on any device — your current guest progress carries over automatically."}
          {!signUpAvailable &&
            " (Sign-up isn't set up on this deployment — accounts are provisioned by the instructor.)"}
        </p>
        <label className="flex flex-col gap-1 text-sm">
          Email
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg border border-accent/30 bg-background px-3 py-2 text-base text-text outline-none focus:border-primary"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Password
          <input
            type="password"
            required
            minLength={mode === "sign-up" ? 6 : undefined}
            autoComplete={
              mode === "sign-in" ? "current-password" : "new-password"
            }
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-lg border border-accent/30 bg-background px-3 py-2 text-base text-text outline-none focus:border-primary"
          />
        </label>
        {mode === "sign-up" && (
          <label className="flex flex-col gap-1 text-sm">
            Confirm password
            <input
              type="password"
              required
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="rounded-lg border border-accent/30 bg-background px-3 py-2 text-base text-text outline-none focus:border-primary"
            />
          </label>
        )}
        {error && <p className="text-sm text-accent">{error}</p>}
        <Button
          type="submit"
          disabled={phase !== "idle" || (mode === "sign-up" && !signUpAvailable)}
        >
          {phase === "working"
            ? mode === "sign-in"
              ? "Signing in…"
              : "Creating account…"
            : phase === "syncing"
              ? "Syncing your progress…"
              : mode === "sign-in"
                ? "Sign In"
                : "Create Account"}
        </Button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="mx-auto w-full max-w-sm flex-1 px-4 py-12 text-center">
      <h1 className="mb-4 text-3xl text-text">Account</h1>
      <p className="text-sm text-text/70">
        Accounts aren&apos;t available yet — play as a guest for now. Your
        progress stays safe in this browser.
      </p>
    </main>
  );
}
