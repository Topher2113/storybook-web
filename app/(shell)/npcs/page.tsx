import type { Metadata } from "next";
import Link from "next/link";
import { CodexError } from "@/components/codex/CodexError";
import { listNpcs } from "@/lib/api/npcs";

export const metadata: Metadata = { title: "NPCs" };
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export default async function NpcsPage() {
  let npcs;
  try {
    npcs = (await listNpcs()).npcs;
  } catch {
    return <CodexError what="the NPC codex" />;
  }

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
      <h1 className="mb-1 text-3xl text-text">NPC Codex</h1>
      <p className="mb-6 text-sm text-text/70">
        {npcs.length} residents of the Pizza Kingdom · served by the Flask NPC
        microservice
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {npcs.map((npc) => (
          <Link
            key={npc.id}
            href={`/npcs/${npc.id}`}
            className="rounded-2xl bg-surface p-5 transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <h2 className="mb-1 text-xl text-primary">{npc.name}</h2>
            <p className="mb-3 line-clamp-2 text-sm text-text/80">
              {npc.description}
            </p>
            <p className="text-xs text-text/60">
              {npc.dialogs.length} dialog
              {npc.dialogs.length === 1 ? "" : "s"} ·{" "}
              {npc.inventory.length === 0
                ? "carries nothing"
                : `carries ${npc.inventory.length} item${npc.inventory.length === 1 ? "" : "s"}`}
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}
