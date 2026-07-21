"use client";

// The Flask-service showcase: edits an NPC's name/description through
// PATCH /api/npcs/:id (proxied to the Python backend) and surfaces its
// {error, code, details} validation envelope field-by-field.
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { updateNpc } from "@/lib/api/npcs";
import { ApiError } from "@/lib/api/http";
import type { Npc } from "@/lib/api/types";

export function NpcEditForm({ npc }: { npc: Npc }) {
  const router = useRouter();
  const [name, setName] = useState(npc.name);
  const [description, setDescription] = useState(npc.description);
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setFieldErrors({});
    setSaved(false);
    try {
      await updateNpc(npc.id, { name, description });
      setSaved(true);
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError && err.details) {
        setFieldErrors(
          Object.fromEntries(err.details.map((d) => [d.field, d.message])),
        );
      } else {
        setError(err instanceof Error ? err.message : "Update failed.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={(e) => void onSubmit(e)}
      className="rounded-2xl border border-accent/30 bg-surface p-5"
    >
      <h2 className="mb-1 text-lg text-text">Edit this NPC</h2>
      <p className="mb-4 text-xs text-text/60">
        Powered by the Python Flask NPC microservice — changes are live for
        every player, so be kind to the rats.
      </p>
      <label className="mb-3 flex flex-col gap-1 text-sm">
        Name <span className="text-xs text-text/50">(max 80 chars)</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-lg border border-accent/30 bg-background px-3 py-2 text-base text-text outline-none focus:border-primary"
        />
        {fieldErrors.name && (
          <span className="text-xs text-accent">{fieldErrors.name}</span>
        )}
      </label>
      <label className="mb-4 flex flex-col gap-1 text-sm">
        Description{" "}
        <span className="text-xs text-text/50">(max 500 chars)</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="rounded-lg border border-accent/30 bg-background px-3 py-2 text-base text-text outline-none focus:border-primary"
        />
        {fieldErrors.description && (
          <span className="text-xs text-accent">{fieldErrors.description}</span>
        )}
      </label>
      {fieldErrors.body && (
        <p className="mb-3 text-sm text-accent">{fieldErrors.body}</p>
      )}
      {error && <p className="mb-3 text-sm text-accent">{error}</p>}
      {saved && (
        <p className="mb-3 text-sm text-primary">Saved — the codex updated.</p>
      )}
      <Button type="submit" disabled={saving}>
        {saving ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}
