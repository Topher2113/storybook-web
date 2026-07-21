import { apiFetch, type ApiFetchOptions } from "./http";
import type { Item, ItemList } from "./types";

export const ITEM_ID_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export function listItems(opts?: ApiFetchOptions) {
  return apiFetch<ItemList>("/api/items", opts);
}

export function getItem(itemId: string, opts?: ApiFetchOptions) {
  return apiFetch<Item>(`/api/items/${encodeURIComponent(itemId)}`, opts);
}

export function createItem(
  item: { id: string; name: string; description: string },
  opts?: ApiFetchOptions,
) {
  return apiFetch<Item>("/api/items", { ...opts, method: "POST", body: item });
}

export function deleteItem(itemId: string, opts?: ApiFetchOptions) {
  return apiFetch<{ message: string }>(
    `/api/items/${encodeURIComponent(itemId)}`,
    { ...opts, method: "DELETE" },
  );
}
