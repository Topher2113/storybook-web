"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "@/components/providers/SessionProvider";

// One quiet line under the header: an expired-session notice (priority) or a
// save-your-progress nudge for guests. Hidden on the login page itself.
//
// Not rendered anywhere right now — sign-in/up is dormant (see AppShell),
// so there's nothing to nudge guests toward. Kept intact for when /login
// comes back; just re-add <AuthBanner /> where it was removed.
export function AuthBanner() {
  const { status, authExpired } = useSession();
  const pathname = usePathname();
  if (pathname === "/login") return null;

  if (authExpired) {
    return (
      <div className="bg-accent/15 px-4 py-2 text-center text-sm text-text">
        Your session expired — playing as guest.{" "}
        <Link
          href={`/login?from=${encodeURIComponent(pathname)}`}
          className="font-bold underline"
        >
          Log in again
        </Link>{" "}
        to keep cloud saves.
      </div>
    );
  }

  if (status === "guest") {
    return (
      <div className="bg-surface px-4 py-2 text-center text-sm text-text/70">
        Playing as guest — progress stays in this browser.{" "}
        <Link
          href={`/login?from=${encodeURIComponent(pathname)}`}
          className="font-bold underline"
        >
          Log in
        </Link>{" "}
        to save to the cloud.
      </div>
    );
  }

  return null;
}
