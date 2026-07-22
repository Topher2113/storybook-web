import type { Metadata } from "next";
import { CodexError } from "@/components/codex/CodexError";
import { EndingGallery } from "@/components/codex/EndingGallery";
import { listEndings } from "@/lib/api/story";

export const metadata: Metadata = { title: "Endings" };
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export default async function EndingsPage() {
  let endings;
  try {
    endings = (await listEndings()).endings;
  } catch {
    return <CodexError what="the endings gallery" />;
  }

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
      <h1 className="mb-1 text-3xl text-text">Endings Gallery</h1>
      <EndingGallery endings={endings} />
    </main>
  );
}
