"use client";

import Link from "next/link";
import { useSession } from "@/components/providers/SessionProvider";
import { useTheme } from "@/components/providers/ThemeProvider";
import { ThemePreviewCard } from "@/components/theme/ThemePreviewCard";
import { Button } from "@/components/ui/Button";
import { THEMES } from "@/lib/themes";

export default function SettingsPage() {
  const { themeId, setTheme } = useTheme();
  const { status, user, logout } = useSession();
  const lightCount = THEMES.filter((t) => !t.dark).length;
  const darkCount = THEMES.length - lightCount;

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
      <h1 className="mb-1 text-3xl text-text">Themes</h1>
      <p className="mb-6 text-sm text-text/70">
        {lightCount} light · {darkCount} dark
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {THEMES.map((t) => (
          <ThemePreviewCard
            key={t.id}
            theme={t}
            active={t.id === themeId}
            onSelect={() => setTheme(t.id)}
          />
        ))}
      </div>

      <h2 className="mb-2 mt-10 text-2xl text-text">Account</h2>
      {status === "authed" ? (
        <div className="flex items-center justify-between rounded-2xl bg-surface p-4">
          <p className="text-sm">
            Signed in as <strong>{user?.email}</strong> — scene, inventory, and
            quests sync to the cloud.
          </p>
          <Button variant="outline" onClick={logout}>
            Log out
          </Button>
        </div>
      ) : (
        <p className="rounded-2xl bg-surface p-4 text-sm text-text/80">
          Playing as guest — progress lives in this browser.{" "}
          <Link href="/login?from=/settings" className="font-bold underline">
            Sign in
          </Link>{" "}
          to sync across devices.
        </p>
      )}
    </main>
  );
}
