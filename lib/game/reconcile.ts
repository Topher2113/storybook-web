// Merge rules for logging in mid-game, run once right after login:
//
// 1. Current scene: a non-null server scene wins (cross-device resume);
//    otherwise the local scene is pushed up.
// 2. Inventory: union — local-only items are POSTed up, then the server
//    list is adopted wholesale (server wins).
// 3. Quests: server statuses overwrite local overlaps; local *active*
//    quests unknown to the server are accepted up. Local completions stay
//    local — replaying them against the server would fail its location
//    gate, and the XP is already banked locally.
//
// Every step is individually fault-tolerant: a napping server degrades the
// merge, never the game.
import type { Dispatch } from "react";
import {
  acceptQuest,
  addInventoryItem,
  getPlayerInventory,
  getPlayerState,
  getQuestLog,
  savePlayerScene,
} from "@/lib/api/state";
import type { GameAction } from "./reducer";
import type { Progress, QuestProgress } from "./types";

export async function reconcileOnLogin(
  token: string,
  local: Progress,
  dispatch: Dispatch<GameAction>,
): Promise<void> {
  try {
    const server = await getPlayerState(token);
    if (server.currentScene) {
      dispatch({ type: "APPLY_SERVER_STATE", currentScene: server.currentScene });
    } else if (local.currentScene) {
      await savePlayerScene(token, local.currentScene);
    }
  } catch {
    // Scene sync can wait for the next scene change.
  }

  try {
    const server = await getPlayerInventory(token);
    const serverIds = server.items.map((i) => i.item_id);
    const localOnly = local.inventory.filter((id) => !serverIds.includes(id));
    for (const itemId of localOnly) {
      try {
        await addInventoryItem(token, itemId);
        serverIds.push(itemId);
      } catch {
        // Unknown/mutated item id — drop it from the merged view.
      }
    }
    dispatch({ type: "APPLY_SERVER_STATE", inventory: serverIds });
  } catch {
    // Keep the local inventory.
  }

  try {
    const log = await getQuestLog(token);
    const serverQuests: Record<string, QuestProgress> = {};
    for (const q of log.quests) {
      serverQuests[q.quest_id] = {
        status: q.status,
        acceptedAt: q.accepted_at,
        completedAt: q.completed_at,
      };
    }
    for (const [questId, quest] of Object.entries(local.quests)) {
      if (quest.status === "active" && !serverQuests[questId]) {
        try {
          await acceptQuest(token, questId);
          serverQuests[questId] = quest;
        } catch {
          // Leave it local-only.
        }
      }
    }
    dispatch({ type: "APPLY_SERVER_STATE", quests: serverQuests });
  } catch {
    // Keep the local quest log.
  }
}
