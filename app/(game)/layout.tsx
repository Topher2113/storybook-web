import Link from "next/link";
import type { ReactNode } from "react";
import { GameHud } from "@/components/game/GameHud";

// Immersive chrome for the story screen: no site nav, just a quiet way home
// and the settings gear (matching the RN story screen's header).
export default function GameLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      <header className="flex items-center justify-between px-4 py-3">
        <Link
          href="/"
          className="rounded-lg px-2 py-1 text-sm text-text/60 transition hover:bg-surface hover:text-text"
        >
          ← The Nest
        </Link>
        <Link
          href="/settings"
          aria-label="Settings"
          className="rounded-lg px-2 py-1 text-lg leading-none transition hover:bg-surface"
        >
          ⚙
        </Link>
      </header>
      {/* AuthBanner is dormant along with sign-in/up — see components/shell/AuthBanner.tsx */}
      <div className="mx-auto w-full max-w-2xl px-4 pb-2">
        <GameHud />
      </div>
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-16 pt-4">
        {children}
      </main>
    </div>
  );
}
