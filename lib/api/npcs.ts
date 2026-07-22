// NPC endpoints — proxied to the standalone Flask NPC service (see
// next.config.ts). Same contract as the Express originals.
import { apiFetch, type ApiFetchOptions } from "./http";
import type { Npc, NpcDialog, NpcList, SceneNpcs } from "./types";

export function listNpcs(opts?: ApiFetchOptions) {
  return apiFetch<NpcList>("/api/npcs", opts);
}

export function getNpc(npcId: string, opts?: ApiFetchOptions) {
  return apiFetch<Npc>(`/api/npcs/${encodeURIComponent(npcId)}`, opts);
}

export function updateNpc(
  npcId: string,
  patch: { name?: string; description?: string },
  opts?: ApiFetchOptions,
) {
  return apiFetch<Npc>(`/api/npcs/${encodeURIComponent(npcId)}`, {
    ...opts,
    method: "PATCH",
    body: patch,
  });
}

export function getSceneNpcs(sceneId: string, opts?: ApiFetchOptions) {
  return apiFetch<SceneNpcs>(
    `/api/scenes/${encodeURIComponent(sceneId)}/npcs`,
    opts,
  );
}

export function getNpcDialog(
  sceneId: string,
  npcId: string,
  opts?: ApiFetchOptions,
) {
  return apiFetch<NpcDialog>(
    `/api/scenes/${encodeURIComponent(sceneId)}/npcs/${encodeURIComponent(npcId)}`,
    opts,
  );
}
