import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CodexError } from "@/components/codex/CodexError";
import { LoreReader } from "@/components/codex/LoreReader";
import { getLoreBook } from "@/lib/api/lore";
import { ApiError } from "@/lib/api/http";
import { prettifyId } from "@/lib/game/format";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ bookId: string }>;
}): Promise<Metadata> {
  const { bookId } = await params;
  return { title: prettifyId(bookId) };
}

export default async function LoreBookPage({
  params,
}: {
  params: Promise<{ bookId: string }>;
}) {
  const { bookId } = await params;
  let book;
  try {
    book = await getLoreBook(bookId);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    return <CodexError what="this lore book" />;
  }

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
      <Link href="/lore" className="text-sm text-text/60 hover:text-text">
        ← Lore Library
      </Link>
      <h1 className="mb-1 mt-2 text-3xl text-text">{book.title}</h1>
      <p className="mb-1 text-sm italic text-text/60">by {book.author}</p>
      <p className="mb-8 text-sm text-text/80">{book.synopsis}</p>
      <LoreReader book={book} />
    </main>
  );
}
