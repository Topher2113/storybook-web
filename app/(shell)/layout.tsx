import type { ReactNode } from "react";
import { AppShell } from "@/components/shell/AppShell";

// Chrome for every non-game page; the game route group stays immersive.
export default function ShellLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
