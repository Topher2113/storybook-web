"use client";

import { useTheme } from "@/components/providers/ThemeProvider";
import { ThemePreviewCard } from "@/components/theme/ThemePreviewCard";
import { THEMES } from "@/lib/themes";

export default function SettingsPage() {
  const { themeId, setTheme } = useTheme();
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
      <p className="rounded-2xl bg-surface p-4 text-sm text-text/80">
        Playing as guest — progress lives in this browser. Accounts and
        cross-device sync aren&apos;t available yet.
      </p>
    </main>
  );
}
