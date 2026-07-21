"use client";

import { Button } from "@/components/ui/Button";

export function ErrorPanel({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex w-full flex-col items-center rounded-2xl bg-surface p-8 text-center">
      <p className="mb-1 text-lg text-text">The page refuses to turn.</p>
      <p className="mb-6 text-sm text-text/70">{message}</p>
      <Button onClick={onRetry}>Try Again</Button>
    </div>
  );
}
