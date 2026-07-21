import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CodexError } from "@/components/codex/CodexError";
import { getNpc } from "@/lib/api/npcs";
import { ApiError } from "@/lib/api/http";
import { prettifyId } from "@/lib/game/format";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return { title: prettifyId(id) };
}

export default async function NpcDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let npc;
  try {
    npc = await getNpc(id);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    return <CodexError what="this NPC" />;
  }

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
      <Link href="/npcs" className="text-sm text-text/60 hover:text-text">
        ← NPC Codex
      </Link>
      <h1 className="mb-2 mt-2 text-3xl text-text">{npc.name}</h1>
      <p className="mb-8 italic text-text/80">{npc.description}</p>

      <h2 className="mb-3 text-xl text-text">
        Dialogs · {npc.dialogs.length}
      </h2>
      {npc.dialogs.length === 0 ? (
        <p className="mb-8 text-sm text-text/60">
          They have nothing to say — yet.
        </p>
      ) : (
        <ul className="mb-8 flex flex-col gap-3">
          {npc.dialogs.map((d) => (
            <li key={d.sceneId} className="rounded-2xl bg-surface p-4">
              <p className="mb-1 text-xs font-bold uppercase tracking-wide text-accent">
                {prettifyId(d.sceneId)}
              </p>
              <p className="text-sm leading-relaxed text-text/90">
                &ldquo;{d.dialog}&rdquo;
              </p>
            </li>
          ))}
        </ul>
      )}

      <h2 className="mb-3 text-xl text-text">Carrying</h2>
      {npc.inventory.length === 0 ? (
        <p className="mb-8 text-sm text-text/60">Empty pockets.</p>
      ) : (
        <table className="mb-8 w-full max-w-sm text-left text-sm">
          <thead>
            <tr className="text-text/60">
              <th className="pb-1 font-normal">Item</th>
              <th className="pb-1 font-normal">Qty</th>
            </tr>
          </thead>
          <tbody>
            {npc.inventory.map((row) => (
              <tr key={row.itemName}>
                <td className="py-1">{row.itemName}</td>
                <td className="py-1">{row.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Editing is not exposed: the codex is read-only for players.
          components/codex/NpcEditForm.tsx remains available if it's ever
          wanted behind an admin surface. */}
    </main>
  );
}
