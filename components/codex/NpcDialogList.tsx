"use client";

// Dialogs are spoilers — showing every line an NPC ever says (including ones
// tied to scenes the player hasn't reached) would reveal the story ahead of
// time, the same reasoning behind the world map's fog-of-war. This filters
// the full dialog list down to scenes in the player's local visited-scenes
// history, client-side, since that history only lives in localStorage.
import { useGame } from "@/components/providers/GameProvider";
import { prettifyId } from "@/lib/game/format";

interface DialogEntry {
  sceneId: string;
  dialog: string;
}

export function NpcDialogList({ dialogs }: { dialogs: DialogEntry[] }) {
  const { progress, hydrated } = useGame();

  if (!hydrated) {
    return (
      <div className="mb-8 flex flex-col gap-3">
        {[0, 1].map((i) => (
          <div key={i} className="animate-skeleton h-16 rounded-2xl bg-surface" />
        ))}
      </div>
    );
  }

  const seen = dialogs.filter((d) => progress.visitedScenes.includes(d.sceneId));
  const unseenCount = dialogs.length - seen.length;

  if (seen.length === 0) {
    return (
      <p className="mb-8 text-sm text-text/60">
        You haven&apos;t crossed paths with them yet — dialogue appears here
        once you&apos;ve visited a scene where they speak.
      </p>
    );
  }

  return (
    <div className="mb-8">
      <ul className="mb-3 flex flex-col gap-3">
        {seen.map((d) => (
          <li key={d.sceneId} className="rounded-2xl bg-surface p-4">
            <p className="mb-1 text-xs font-bold uppercase tracking-wide text-accent">
              {prettifyId(d.sceneId)}
            </p>
            <p className="text-sm leading-relaxed text-text/90">
              &ldquo;{d.dialog}&rdquo;
            </p>
          </li>
        ))}
      </ul>
      {unseenCount > 0 && (
        <p className="text-xs text-text/50">
          {unseenCount} more line{unseenCount === 1 ? "" : "s"} waiting in
          scenes you haven&apos;t reached yet.
        </p>
      )}
    </div>
  );
}
