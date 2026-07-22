import type { Metadata } from "next";
import { CodexError } from "@/components/codex/CodexError";
import { getStory } from "@/lib/api/story";
import { prettifyId } from "@/lib/game/format";

export const metadata: Metadata = { title: "About" };
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export default async function AboutPage() {
  let story;
  try {
    story = await getStory();
  } catch {
    return <CodexError what="the story details" />;
  }

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
      <h1 className="mb-2 text-3xl text-text">{story.title}</h1>
      <p className="mb-6 text-sm italic text-text/60">by {story.author}</p>
      <div className="mb-8 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-2xl bg-surface p-4">
          <p className="text-2xl font-bold text-primary">{story.sceneCount}</p>
          <p className="text-xs text-text/70">scenes</p>
        </div>
        <div className="rounded-2xl bg-surface p-4">
          <p className="text-2xl font-bold text-primary">{story.endingCount}</p>
          <p className="text-xs text-text/70">endings</p>
        </div>
        <div className="rounded-2xl bg-surface p-4">
          <p className="text-2xl font-bold text-primary">
            {story.zones.length}
          </p>
          <p className="text-xs text-text/70">zones</p>
        </div>
      </div>
      <p className="mb-2 text-sm font-bold text-text/70">Zones</p>
      <p className="mb-8 text-sm text-text/80">
        {story.zones.map(prettifyId).join(" · ")}
      </p>

      <h2 className="mb-2 text-xl text-text">About this app</h2>
      <p className="mb-3 text-sm leading-relaxed text-text/80">
        A web rebuild of the Storybook mobile app for a Masters course. The
        story world is served by a shared Express API; the NPC endpoints are
        served by a standalone <strong>Python Flask microservice</strong> (the
        course&apos;s backend-change assignment) with an identical contract.
        The XP and bottle-cap economy, fog-of-war map, and endings collection
        are client-side mechanics layered on top of the live API.
      </p>
      <p className="text-sm leading-relaxed text-text/80">
        Everyone plays as a guest for now — progress lives in your browser.
      </p>
    </main>
  );
}
