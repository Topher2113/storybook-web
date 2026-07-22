"use client";

import Link from "next/link";
import { useState } from "react";
import { useGame } from "@/components/providers/GameProvider";
import { useSession } from "@/components/providers/SessionProvider";
import { removeInventoryItem } from "@/lib/api/state";
import { prettifyId } from "@/lib/game/format";
import { capsBalance } from "@/lib/game/selectors";

// Compact status strip for the story screen: XP, bottle caps, satchel
// (inventory popover), and the first active quest as a hint chip.
export function GameHud() {
  const { progress, dispatch, hydrated, questCatalog } = useGame();
  const { token, handleAuthError } = useSession();
  const [satchelOpen, setSatchelOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);

  if (!hydrated) {
    return <div className="animate-skeleton h-8 w-40 rounded-full bg-surface" />;
  }

  const activeQuestId = Object.entries(progress.quests).find(
    ([, q]) => q.status === "active",
  )?.[0];
  const activeQuest = questCatalog.find((q) => q.id === activeQuestId);

  const dropItem = (itemId: string) => {
    dispatch({ type: "REMOVE_ITEM", itemId });
    if (token) {
      removeInventoryItem(token, itemId).catch((err) => handleAuthError(err));
    }
  };

  return (
    <div className="relative flex flex-wrap items-center justify-center gap-2 text-sm">
      <span className="rounded-full bg-surface px-3 py-1" title="Experience">
        ✨ {progress.xp} XP
      </span>
      <span className="rounded-full bg-surface px-3 py-1" title="Bottle caps">
        🧢 {capsBalance(progress)} caps
      </span>
      <button
        type="button"
        onClick={() => setSatchelOpen((o) => !o)}
        className="rounded-full bg-surface px-3 py-1 transition hover:brightness-95"
        aria-expanded={satchelOpen}
      >
        🎒 {progress.inventory.length}
      </button>
      <button
        type="button"
        onClick={() => setInfoOpen((o) => !o)}
        aria-label="How XP and caps work"
        aria-expanded={infoOpen}
        className="rounded-full bg-surface px-2.5 py-1 text-text/60 transition hover:text-text"
      >
        ⓘ
      </button>
      {activeQuest && (
        <Link
          href="/quests"
          className="max-w-[14rem] truncate rounded-full border border-primary/50 px-3 py-1 text-primary"
          title={`${activeQuest.title} — head to ${prettifyId(activeQuest.target_scene)}`}
        >
          📜 {activeQuest.title}
        </Link>
      )}

      {infoOpen && (
        <div className="absolute right-0 top-10 z-40 w-72 rounded-2xl bg-surface p-4 text-left text-sm shadow-xl">
          <p className="mb-2 font-bold">✨ XP &amp; 🧢 Bottle caps</p>
          <p className="mb-2 text-text/80">
            Both are earned the same way: reaching a new ending for the first
            time pays a flat +15 XP and +15 caps exploration bounty. Endings
            you&apos;ve already found don&apos;t pay out again.
          </p>
          <p className="text-text/60">
            Caps are the sewer economy&apos;s currency — the shops that
            accept them are still being stocked, so hang onto them for now.
          </p>
        </div>
      )}

      {satchelOpen && (
        <div className="absolute right-0 top-10 z-40 w-64 rounded-2xl bg-surface p-4 text-left shadow-xl">
          <p className="mb-2 font-bold">Satchel</p>
          {progress.inventory.length === 0 ? (
            <p className="text-sm text-text/60">
              Empty for now — the shops haven&apos;t opened yet.
            </p>
          ) : (
            <ul className="flex flex-col gap-1">
              {progress.inventory.map((itemId) => (
                <li
                  key={itemId}
                  className="flex items-center justify-between gap-2 text-sm"
                >
                  <span>{prettifyId(itemId)}</span>
                  <button
                    type="button"
                    onClick={() => dropItem(itemId)}
                    className="text-xs text-text/50 underline hover:text-text"
                  >
                    drop
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
