"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useGame } from "@/components/providers/GameProvider";

// Client-side slice of the home page: fires warm-up pings at both free-tier
// Render upstreams so the story screen finds warm servers, and renders the
// primary call-to-action — Continue when a run is saved, Begin otherwise.
export function HomeActions() {
  const { progress, dispatch, hydrated } = useGame();

  useEffect(() => {
    const controller = new AbortController();
    // Fire and forget — results don't matter, waking the dynos does.
    fetch("/api/startgame", { signal: controller.signal }).catch(() => {});
    fetch("/api/npcs", { signal: controller.signal }).catch(() => {});
    return () => controller.abort();
  }, []);

  const hasRun = hydrated && progress.currentScene !== null;

  return (
    <div className="flex flex-col items-center gap-3">
      <Link
        href="/story"
        className="inline-block rounded-xl bg-primary px-8 py-4 text-lg font-bold text-button-text transition hover:brightness-105 active:opacity-70"
      >
        {hasRun ? "Continue Adventure" : "Begin Adventure"}
      </Link>
      {hasRun && (
        <button
          type="button"
          onClick={() => dispatch({ type: "RESET_RUN" })}
          className="text-sm text-text/60 underline transition hover:text-text"
        >
          Start over from the Nest
        </button>
      )}
    </div>
  );
}
