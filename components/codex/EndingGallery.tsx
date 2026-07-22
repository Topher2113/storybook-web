"use client";

import { useGame } from "@/components/providers/GameProvider";
import { Badge } from "@/components/ui/Badge";
import type { Ending } from "@/lib/api/types";
import { prettifyId } from "@/lib/game/format";

// Collectible-card gallery: discovered endings show their story; the rest
// stay silhouettes until found in play.
export function EndingGallery({ endings }: { endings: Ending[] }) {
  const { progress, hydrated } = useGame();
  const discovered = hydrated ? progress.discoveredEndings : [];

  return (
    <>
      <p className="mb-6 text-sm text-text/70">
        {hydrated
          ? `${discovered.filter((id) => endings.some((e) => e.id === id)).length} / ${endings.length} endings found`
          : `${endings.length} endings await`}{" "}
        · each new discovery pays a 15-cap exploration bounty
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {endings.map((ending) => {
          const found = discovered.includes(ending.id);
          return found ? (
            <div
              key={ending.id}
              className="rounded-2xl border-2 border-primary/40 bg-surface p-5"
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <h2 className="text-lg text-primary">{ending.name}</h2>
                <Badge>Found</Badge>
              </div>
              <p className="mb-2 text-sm font-bold text-text">{ending.title}</p>
              <p className="mb-3 line-clamp-4 text-sm text-text/80">
                {ending.text}
              </p>
              <p className="text-xs text-text/50">
                {prettifyId(ending.zone)} zone
              </p>
            </div>
          ) : (
            <div
              key={ending.id}
              className="flex min-h-40 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-text/20 bg-surface/50 p-5 text-center"
            >
              <p className="mb-1 text-3xl opacity-40" aria-hidden>
                🐀
              </p>
              <p className="text-lg font-bold text-text/40">???</p>
              <p className="text-xs text-text/40">
                An undiscovered fate — keep exploring
              </p>
            </div>
          );
        })}
      </div>
    </>
  );
}
