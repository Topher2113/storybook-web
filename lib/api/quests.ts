import { apiFetch, type ApiFetchOptions } from "./http";
import type { Quest, QuestList } from "./types";

export function listQuests(opts?: ApiFetchOptions) {
  return apiFetch<QuestList>("/api/quests", opts);
}

export function getQuest(questId: string, opts?: ApiFetchOptions) {
  return apiFetch<Quest>(`/api/quests/${encodeURIComponent(questId)}`, opts);
}
