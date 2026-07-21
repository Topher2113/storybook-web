"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useSession } from "@/components/providers/SessionProvider";
import { AuthBanner } from "./AuthBanner";

const NAV_LINKS = [
  { href: "/story", label: "Play" },
  { href: "/map", label: "Map" },
  { href: "/quests", label: "Quests" },
  { href: "/npcs", label: "NPCs" },
  { href: "/shops", label: "Shops" },
  { href: "/items", label: "Items" },
  { href: "/endings", label: "Endings" },
  { href: "/lore", label: "Lore" },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { status, user } = useSession();

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
          <Link
            href={status === "authed" ? "/settings" : "/login"}
            className="shrink-0 rounded-lg px-3 py-1.5 text-sm text-text/80 transition hover:bg-surface"
          >
            {status === "authed" ? (user?.email ?? "Account") : "Sign In"}
          </Link>
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
      <AuthBanner />
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
