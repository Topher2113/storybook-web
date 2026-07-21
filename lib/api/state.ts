// Authenticated player-state endpoints. Every function takes the bearer
// token explicitly; 401s surface as ApiAuthError (see http.ts), which the
// SessionProvider turns into a "session expired" downgrade to guest play.
import { apiFetch, type ApiFetchOptions } from "./http";
import type { PlayerInventory, PlayerQuest, PlayerState } from "./types";

export function getPlayerState(token: string, opts?: ApiFetchOptions) {
  return apiFetch<PlayerState>("/api/state", { ...opts, token });
}

export function savePlayerScene(
  token: string,
  scene: string,
  opts?: ApiFetchOptions,
) {
  return apiFetch<PlayerState>("/api/state", {
    ...opts,
    token,
    method: "PUT",
    body: { scene },
  });
}

export function getPlayerInventory(token: string, opts?: ApiFetchOptions) {
  return apiFetch<PlayerInventory>("/api/state/inventory", { ...opts, token });
}

export function addInventoryItem(
  token: string,
  item: string,
  opts?: ApiFetchOptions,
) {
  return apiFetch<{ userId: string; item: { item_id: string; picked_up_at: string } }>(
    "/api/state/inventory",
    { ...opts, token, method: "POST", body: { item } },
  );
}

export function removeInventoryItem(
  token: string,
  itemId: string,
  opts?: ApiFetchOptions,
) {
  return apiFetch<{ userId: string; removed: string }>(
    `/api/state/inventory/${encodeURIComponent(itemId)}`,
    { ...opts, token, method: "DELETE" },
  );
}

export function getQuestLog(token: string, opts?: ApiFetchOptions) {
  return apiFetch<{ userId: string; count: number; quests: PlayerQuest[] }>(
    "/api/state/quests",
    { ...opts, token },
  );
}

export function acceptQuest(
  token: string,
  questId: string,
  opts?: ApiFetchOptions,
) {
  return apiFetch<{ userId: string; quest: PlayerQuest }>(
    `/api/state/quests/${encodeURIComponent(questId)}/accept`,
    { ...opts, token, method: "POST" },
  );
}

export function completeQuest(
  token: string,
  questId: string,
  opts?: ApiFetchOptions,
) {
  return apiFetch<{ userId: string; quest: PlayerQuest; rewardXp: number }>(
    `/api/state/quests/${encodeURIComponent(questId)}/complete`,
    { ...opts, token, method: "PUT" },
  );
}

export function abandonQuest(
  token: string,
  questId: string,
  opts?: ApiFetchOptions,
) {
  return apiFetch<{ userId: string; questId: string; status: "abandoned" }>(
    `/api/state/quests/${encodeURIComponent(questId)}`,
    { ...opts, token, method: "PATCH", body: { status: "abandoned" } },
  );
}
