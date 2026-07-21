import type { Metadata } from "next";
import Link from "next/link";
import { CodexError } from "@/components/codex/CodexError";
import { listShops } from "@/lib/api/shops";
import { prettifyId } from "@/lib/game/format";

export const metadata: Metadata = { title: "Shops" };
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export default async function ShopsPage() {
  let shops;
  try {
    shops = await listShops();
  } catch {
    return <CodexError what="the shops" />;
  }

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
      <h1 className="mb-1 text-3xl text-text">Shops</h1>
      <p className="mb-6 text-sm text-text/70">
        Spend your bottle caps — earned from quests and discovering endings
      </p>
      {shops.length === 0 && (
        <p className="rounded-2xl bg-surface p-6 text-sm text-text/70">
          The shopkeepers haven&apos;t set up their stalls yet — no shops are
          stocked in the story database right now. Check back after the next
          market day.
        </p>
      )}
      <div className="flex flex-col gap-4">
        {shops.map((shop) => (
          <Link
            key={shop.id}
            href={`/shops/${shop.id}`}
            className="rounded-2xl bg-surface p-5 transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <h2 className="mb-1 text-xl text-primary">{shop.name}</h2>
            <p className="mb-2 text-sm text-text/80">{shop.description}</p>
            <p className="text-xs text-text/60">
              Found in {prettifyId(shop.scene_id)} · {shop.stock.length} wares
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}
