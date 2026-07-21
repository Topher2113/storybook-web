import type { Quest } from "@/lib/api/types";
import { capsBalance } from "./reducer";
import type { Progress } from "./types";

export { capsBalance };

export function canAfford(p: Progress, price: number): boolean {
  return capsBalance(p) >= price;
}

export function isVisited(p: Progress, sceneId: string): boolean {
  return p.visitedScenes.includes(sceneId);
}

export function ownsItem(p: Progress, itemId: string): boolean {
  return p.inventory.includes(itemId);
}

export function questStatus(p: Progress, questId: string) {
  return p.quests[questId]?.status;
}

// Active quests whose target is the scene the player just reached — the
// auto-completion hook in the scene-change pipeline.
export function questsCompletableAt(
  p: Progress,
  catalog: Quest[],
  sceneId: string,
): Quest[] {
  return catalog.filter(
    (q) => q.target_scene === sceneId && p.quests[q.id]?.status === "active",
  );
}

// The quest an NPC offers, if the player hasn't taken or finished it.
export function questOfferedBy(
  p: Progress,
  catalog: Quest[],
  npcId: string,
): Quest | undefined {
  return catalog.find((q) => {
    if (q.npc_slug !== npcId) return false;
    const status = p.quests[q.id]?.status;
    return status === undefined || status === "abandoned";
  });
}
