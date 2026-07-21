import { apiFetch, type ApiFetchOptions } from "./http";
import type { LoreBook } from "./types";

// The API has no list endpoint for lore books; these are the seeded ids.
export const KNOWN_LORE_BOOK_IDS = [
  "big-whiskers-first-run",
  "neon-market-field-guide",
] as const;

export function getLoreBook(bookId: string, opts?: ApiFetchOptions) {
  return apiFetch<LoreBook>(
    `/api/lore-books/${encodeURIComponent(bookId)}`,
    opts,
  );
}
