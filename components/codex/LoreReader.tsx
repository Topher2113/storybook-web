"use client";

// Book-spread reader with Prev/Next, arrow-key paging, and a soft page-turn
// fade. Receives the full book (server-fetched) and pages client-side.
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import type { LoreBook } from "@/lib/api/types";

export function LoreReader({ book }: { book: LoreBook }) {
  const [index, setIndex] = useState(0);
  const [turning, setTurning] = useState(false);
  const pages = book.pages;

  const turnTo = useCallback(
    (next: number) => {
      if (next < 0 || next >= pages.length) return;
      setTurning(true);
      setTimeout(() => {
        setIndex(next);
        setTurning(false);
      }, 150);
    },
    [pages.length],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") turnTo(index + 1);
      if (e.key === "ArrowLeft") turnTo(index - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, turnTo]);

  if (pages.length === 0) {
    return (
      <p className="rounded-2xl bg-surface p-6 text-sm text-text/70">
        The pages of this book are still blank.
      </p>
    );
  }

  const page = pages[index];

  return (
    <div>
      <div
        className={`min-h-72 rounded-2xl border border-accent/20 bg-surface p-6 shadow-inner transition-opacity duration-150 sm:p-10 ${
          turning ? "opacity-0" : "opacity-100"
        }`}
      >
        <h2 className="mb-4 text-xl text-primary">{page.heading}</h2>
        <p className="whitespace-pre-line leading-relaxed text-text/90">
          {page.content}
        </p>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => turnTo(index - 1)}
          disabled={index === 0}
        >
          ← Prev
        </Button>
        <span className="text-sm text-text/60">
          Page {page.page_number} of {pages.length}
        </span>
        <Button
          variant="outline"
          onClick={() => turnTo(index + 1)}
          disabled={index === pages.length - 1}
        >
          Next →
        </Button>
      </div>
      <p className="mt-2 text-center text-xs text-text/40">
        Tip: arrow keys turn the pages
      </p>
    </div>
  );
}
