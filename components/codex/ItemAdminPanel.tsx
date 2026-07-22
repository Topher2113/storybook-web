"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { createItem, deleteItem, ITEM_ID_PATTERN } from "@/lib/api/items";
import { ApiError } from "@/lib/api/http";

// The item catalog's public POST/DELETE endpoints, surfaced as a small
// workshop panel. Deletion asks for confirmation inline (no window.confirm).
export function ItemAdminPanel({ itemIds }: { itemIds: string[] }) {
  const router = useRouter();
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);

  const onCreate = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!ITEM_ID_PATTERN.test(id)) {
      setError(
        "id must be lowercase letters/numbers with single hyphens, e.g. fortune-cookie",
      );
      return;
    }
    setBusy(true);
    try {
      await createItem({ id, name, description });
      setId("");
      setName("");
      setDescription("");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof ApiError && err.code === "CONFLICT"
          ? `That id is taken — '${id}' already exists.`
          : err instanceof ApiError && err.details
            ? err.details.map((d) => d.message).join(" ")
            : err instanceof Error
              ? err.message
              : "Create failed.",
      );
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async (itemId: string) => {
    setBusy(true);
    setError(null);
    try {
      await deleteItem(itemId);
      setConfirmingDelete(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="rounded-2xl border border-accent/30 bg-surface p-5">
      <h2 className="mb-1 text-lg text-text">Tinker&apos;s Workshop</h2>
      <p className="mb-4 text-xs text-text/60">
        The item catalog is world-writable by design — forge a new trinket or
        scrap an old one. Changes are live for everyone.
      </p>

      <form
        onSubmit={(e) => void onCreate(e)}
        className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2"
      >
        <label className="flex flex-col gap-1 text-sm">
          id <span className="text-xs text-text/50">(kebab-case)</span>
          <input
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="rusty-thimble"
            required
            className="rounded-lg border border-accent/30 bg-background px-3 py-2 text-text outline-none focus:border-primary"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Rusty Thimble"
            required
            className="rounded-lg border border-accent/30 bg-background px-3 py-2 text-text outline-none focus:border-primary"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm sm:col-span-2">
          Description
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="A tiny helmet, or a huge cup. Depends on the rat."
            required
            className="rounded-lg border border-accent/30 bg-background px-3 py-2 text-text outline-none focus:border-primary"
          />
        </label>
        <div className="sm:col-span-2">
          <Button type="submit" disabled={busy}>
            Forge item
          </Button>
        </div>
      </form>

      {error && <p className="mb-3 text-sm text-accent">{error}</p>}

      <h3 className="mb-2 text-sm font-bold text-text/70">Scrap an item</h3>
      <ul className="flex flex-wrap gap-2">
        {itemIds.map((itemId) =>
          confirmingDelete === itemId ? (
            <li
              key={itemId}
              className="flex items-center gap-2 rounded-full border border-accent px-3 py-1 text-sm"
            >
              Delete {itemId}?
              <button
                type="button"
                disabled={busy}
                onClick={() => void onDelete(itemId)}
                className="font-bold text-accent underline"
              >
                yes
              </button>
              <button
                type="button"
                onClick={() => setConfirmingDelete(null)}
                className="text-text/60 underline"
              >
                no
              </button>
            </li>
          ) : (
            <li key={itemId}>
              <button
                type="button"
                onClick={() => setConfirmingDelete(itemId)}
                className="rounded-full border border-accent/30 px-3 py-1 text-sm text-text/70 transition hover:border-accent hover:text-text"
              >
                {itemId} ✕
              </button>
            </li>
          ),
        )}
      </ul>
    </section>
  );
}
