import { apiFetch, type ApiFetchOptions } from "./http";
import type { Shop } from "./types";

// Note: /api/shops returns a bare array (no {count} envelope).
export function listShops(opts?: ApiFetchOptions) {
  return apiFetch<Shop[]>("/api/shops", opts);
}

export function getShop(shopId: string, opts?: ApiFetchOptions) {
  return apiFetch<Shop>(`/api/shops/${encodeURIComponent(shopId)}`, opts);
}
