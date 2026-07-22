"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

// The Quests tab is hidden until the live database gets the quests table —
// the /quests page and the quest machinery stay in the code, dormant.
// The Shops tab is hidden until shop stock is actually set up — the /shops
// pages and BuyButton stay in the code, dormant.
const NAV_LINKS = [
  { href: "/story", label: "Play" },
  { href: "/map", label: "Map" },
  { href: "/npcs", label: "NPCs" },
  { href: "/items", label: "Items" },
  { href: "/endings", label: "Endings" },
  { href: "/lore", label: "Lore" },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      <header className="sticky top-0 z-40 border-b border-accent/20 bg-background/95 backdrop-blur">
        <nav className="mx-auto flex w-full max-w-5xl items-center gap-1 overflow-x-auto px-4 py-3">
          <Link
            href="/"
            className="mr-4 shrink-0 font-heading text-xl text-primary"
          >
            Storybook
          </Link>
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-sm transition ${
                pathname === href || pathname.startsWith(href + "/")
                  ? "bg-primary text-button-text"
                  : "text-text/80 hover:bg-surface"
              }`}
            >
              {label}
            </Link>
          ))}
          <span className="flex-1" />
          {/* Sign in/up is dormant for now — the API has no working
              create-account path yet. Guests keep full local play; see
              lib/supabaseClient.ts and the /login page for the code this
              re-enables. */}
          <Link
            href="/settings"
            aria-label="Settings"
            className={`shrink-0 rounded-lg px-2 py-1.5 text-lg leading-none transition hover:bg-surface ${
              pathname === "/settings" ? "bg-surface" : ""
            }`}
          >
            ⚙
          </Link>
        </nav>
      </header>
      {/* AuthBanner is dormant along with sign-in/up — see components/shell/AuthBanner.tsx */}
      {children}
      <footer className="border-t border-accent/20 px-4 py-4 text-center text-xs text-text/50">
        Rat Adventure: Sewers of the Pizza Kingdom ·{" "}
        <Link href="/about" className="underline hover:text-text">
          About
        </Link>
      </footer>
    </div>
  );
}
