import type { Metadata } from "next";
import Link from "next/link";
import { CodexError } from "@/components/codex/CodexError";
import { getLoreBook, KNOWN_LORE_BOOK_IDS } from "@/lib/api/lore";

export const metadata: Metadata = { title: "Lore" };
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export default async function LorePage() {
  // No list endpoint exists; fetch the seeded books by id and skip any that
  // fail individually.
  const results = await Promise.allSettled(
    KNOWN_LORE_BOOK_IDS.map((id) => getLoreBook(id)),
  );
  const books = results
    .filter((r) => r.status === "fulfilled")
    .map((r) => r.value);
  if (books.length === 0) return <CodexError what="the lore library" />;

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
      <h1 className="mb-1 text-3xl text-text">Lore Library</h1>
      <p className="mb-6 text-sm text-text/70">
        Histories and field guides of the Pizza Kingdom
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {books.map((book) => (
          <Link
            key={book.id}
            href={`/lore/${book.id}`}
            className="rounded-2xl bg-surface p-5 transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <h2 className="mb-1 text-xl text-primary">{book.title}</h2>
            <p className="mb-2 text-xs italic text-text/60">by {book.author}</p>
            <p className="mb-2 text-sm text-text/80">{book.synopsis}</p>
            <p className="text-xs text-text/50">{book.pages.length} pages</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
