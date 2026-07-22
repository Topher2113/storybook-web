import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BuyButton } from "@/components/codex/BuyButton";
import { CodexError } from "@/components/codex/CodexError";
import { getShop } from "@/lib/api/shops";
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

export default async function ShopDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let shop;
  try {
    shop = await getShop(id);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    return <CodexError what="this shop" />;
  }

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
      <Link href="/shops" className="text-sm text-text/60 hover:text-text">
        ← Shops
      </Link>
      <h1 className="mb-1 mt-2 text-3xl text-text">{shop.name}</h1>
      <p className="mb-1 text-text/80">{shop.description}</p>
      <p className="mb-8 text-xs text-text/60">
        Found in {prettifyId(shop.scene_id)}
      </p>

      <div className="flex flex-col gap-3">
        {shop.stock.map((row) => (
          <div
            key={row.item.id}
            className="flex items-center justify-between gap-4 rounded-2xl bg-surface p-4"
          >
            <div>
              <p className="font-bold text-text">{row.item.name}</p>
              <p className="text-sm text-text/70">{row.item.description}</p>
              <p className="mt-1 text-xs text-text/50">{row.qty} in stock</p>
            </div>
            <BuyButton itemId={row.item.id} price={row.price_caps} />
          </div>
        ))}
      </div>
    </main>
  );
}
