"use client";

import { Button } from "@/components/ui/Button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center text-text">
      <h1 className="mb-2 text-3xl">The sewers flooded</h1>
      <p className="mb-6 max-w-md text-text/70">
        Something went wrong turning the page. {error.message}
      </p>
      <Button onClick={reset}>Try Again</Button>
    </main>
  );
}
