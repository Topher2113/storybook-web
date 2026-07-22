// The single choke point for localStorage. Guarded against SSR (no window)
// and storage failures (private mode); progress is never read during render —
// GameProvider hydrates in an effect and gates UI on its `hydrated` flag.
import { DEFAULT_PROGRESS, type Progress } from "./types";

export const PROGRESS_STORAGE_KEY = "storybook.progress.v1";
export const AUTH_STORAGE_KEY = "storybook.auth.v1";

export interface StoredAuth {
  token: string;
  user: { id: string; email: string };
  savedAt: string;
}

export function loadProgress(): Progress {
  if (typeof window === "undefined") return DEFAULT_PROGRESS;
  try {
    const raw = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    const parsed = JSON.parse(raw) as Partial<Progress>;
    // Merge over defaults so older saves survive shape additions.
    return { ...DEFAULT_PROGRESS, ...parsed };
  } catch {
    return DEFAULT_PROGRESS;
  }
}

export function saveProgress(progress: Progress): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Storage full/unavailable — play continues in memory.
  }
}

export function loadAuth(): StoredAuth | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredAuth;
    if (!parsed?.token || !parsed?.user?.id) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveAuth(auth: StoredAuth | null): void {
  if (typeof window === "undefined") return;
  try {
    if (auth === null) localStorage.removeItem(AUTH_STORAGE_KEY);
    else localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
  } catch {
    // Ignore — worst case the session doesn't persist across reloads.
  }
}
