"use client";

import type { ReactNode } from "react";
import { GameProvider } from "./GameProvider";
import { SessionProvider } from "./SessionProvider";
import { ThemeProvider } from "./ThemeProvider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <SessionProvider>
        <GameProvider>{children}</GameProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}
