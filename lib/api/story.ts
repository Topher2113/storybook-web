import { apiFetch, type ApiFetchOptions } from "./http";
import type {
  EndingList,
  Scene,
  SceneList,
  StoryMeta,
  WorldMap,
  ZoneList,
} from "./types";

export function getStory(opts?: ApiFetchOptions) {
  return apiFetch<StoryMeta>("/api/story", opts);
}

export function getStartScene(opts?: ApiFetchOptions) {
  return apiFetch<Scene>("/api/startgame", opts);
}

export function getScene(sceneId: string, opts?: ApiFetchOptions) {
  return apiFetch<Scene>(`/api/scenes/${encodeURIComponent(sceneId)}`, opts);
}

export function listScenes(zone?: string, opts?: ApiFetchOptions) {
  const query = zone ? `?zone=${encodeURIComponent(zone)}` : "";
  return apiFetch<SceneList>(`/api/scenes${query}`, opts);
}

export function getWorldMap(opts?: ApiFetchOptions) {
  return apiFetch<WorldMap>("/api/map", opts);
}

export function listZones(opts?: ApiFetchOptions) {
  return apiFetch<ZoneList>("/api/zones", opts);
}

export function listEndings(opts?: ApiFetchOptions) {
  return apiFetch<EndingList>("/api/endings", opts);
}
