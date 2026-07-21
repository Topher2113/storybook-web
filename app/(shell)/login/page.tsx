"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";
import { useGame } from "@/components/providers/GameProvider";
import { useSession } from "@/components/providers/SessionProvider";
import { Button } from "@/components/ui/Button";
import { ApiError } from "@/lib/api/http";
import { reconcileOnLogin } from "@/lib/game/reconcile";
import { loadAuth } from "@/lib/game/storage";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, status, user, logout } = useSession();
  const { progress, dispatch } = useGame();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phase, setPhase] = useState<"idle" | "signing-in" | "syncing">("idle");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setPhase("signing-in");
    try {
      await login(email, password);
      setPhase("syncing");
      const auth = loadAuth();
      if (auth) await reconcileOnLogin(auth.token, progress, dispatch);
      router.push(searchParams.get("from") ?? "/");
    } catch (err) {
      setPhase("idle");
      setError(
        err instanceof ApiError && err.status === 401
          ? "Invalid email or password."
          : err instanceof Error
            ? err.message
            : "Unable to sign in right now.",
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

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="flex flex-col gap-4">
      <p className="text-sm text-text/70">
        Logging in saves your current scene, inventory, and quest log to the
        cloud so you can resume on any device. Guests keep everything in this
        browser. (Accounts are provisioned by the instructor — there is no
        sign-up.)
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
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-lg border border-accent/30 bg-background px-3 py-2 text-base text-text outline-none focus:border-primary"
        />
      </label>
      {error && <p className="text-sm text-accent">{error}</p>}
      <Button type="submit" disabled={phase !== "idle"}>
        {phase === "signing-in"
          ? "Signing in…"
          : phase === "syncing"
            ? "Syncing your progress…"
            : "Sign In"}
      </Button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <main className="mx-auto w-full max-w-sm flex-1 px-4 py-12">
      <h1 className="mb-6 text-3xl text-text">Sign In</h1>
      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  );
}
