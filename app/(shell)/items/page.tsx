import type { Metadata } from "next";
import { CodexError } from "@/components/codex/CodexError";
import { listItems } from "@/lib/api/items";

export const metadata: Metadata = { title: "Items" };
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export default async function ItemsPage() {
  let items;
  try {
    items = (await listItems()).items;
  } catch {
    return <CodexError what="the item catalog" />;
  }

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
      <h1 className="mb-1 text-3xl text-text">Item Catalog</h1>
      <p className="mb-6 text-sm text-text/70">
        {items.length} treasures of the sewers — the shops that sell them
        aren&apos;t open yet, but you can browse the catalog and carry them
        in your satchel
      </p>
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {items.map((item) => (
          <div key={item.id} className="rounded-2xl bg-surface p-5">
            <h2 className="mb-1 text-lg text-primary">{item.name}</h2>
            <p className="mb-2 text-sm text-text/80">{item.description}</p>
            <p className="text-xs text-text/50">id: {item.id}</p>
          </div>
        ))}
      </div>
      {/* Creating/deleting items is not exposed: the catalog is read-only for
          players. components/codex/ItemAdminPanel.tsx remains available if
          it's ever wanted behind an admin surface. */}
    </main>
  );
}
