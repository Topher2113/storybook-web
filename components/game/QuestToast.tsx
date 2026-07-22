"use client";

import { useEffect } from "react";

export interface ToastMessage {
  id: number;
  text: string;
  tone: "celebrate" | "info" | "warn";
}

export function QuestToast({
  toast,
  onDone,
}: {
  toast: ToastMessage | null;
  onDone: () => void;
}) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(onDone, 5000);
    return () => clearTimeout(timer);
  }, [toast, onDone]);

  if (!toast) return null;
  return (
    <div
      role="status"
      className={`fixed bottom-6 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-2xl px-5 py-4 text-center shadow-xl ${
        toast.tone === "celebrate"
          ? "bg-primary text-button-text"
          : toast.tone === "warn"
            ? "bg-accent text-button-text"
            : "bg-surface text-text"
      }`}
    >
      {toast.tone === "celebrate" && <span aria-hidden>🎉 </span>}
      {toast.text}
    </div>
  );
}
