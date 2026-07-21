import Link from "next/link";
import { HomeActions } from "@/components/shell/HomeActions";
import { getStory } from "@/lib/api/story";
import type { StoryMeta } from "@/lib/api/types";

export const dynamic = "force-dynamic";

const FALLBACK_STORY: StoryMeta = {
  id: "rat-adventure",
  title: "Rat Adventure: Sewers of the Pizza Kingdom",
  author: "Barrett Curry (enriched)",
  startNode: "the-nest",
  sceneCount: 51,
  endingCount: 8,
  zones: [],
};

const FEATURE_CARDS = [
  {
    href: "/map",
    title: "World Map",
    text: "Chart the sewers zone by zone — the fog lifts as you explore.",
  },
  {
    href: "/endings",
    title: "Endings Gallery",
    text: "Eight fates await. How many can you collect?",
  },
  {
    href: "/npcs",
    title: "NPC Codex",
    text: "Meet the eight residents of the sewers and their stories.",
  },
  {
    href: "/lore",
    title: "Lore Books",
    text: "Read the histories of the Pizza Kingdom.",
  },
] as const;

export default async function HomePage() {
  // A cold Render start shouldn't hold the landing page hostage — fall back
  // to the known story identity if the API naps through a short window.
  let story = FALLBACK_STORY;
  try {
    story = await getStory({ timeoutMs: 8_000 });
  } catch {
    // Fallback content covers it; the HomeActions warm-up pings are already
    // waking the server for the pages that truly need it.
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center px-4 py-16 text-center">
      <p className="mb-2 text-sm uppercase tracking-widest text-accent">
        A choose-your-own-adventure storybook
      </p>
      <h1 className="mb-3 text-4xl text-text sm:text-5xl">{story.title}</h1>
      <p className="mb-2 max-w-xl text-text/80">
        You are a rat. The colony is hungry, the tunnels are shifting, and
        somewhere above, a whole pizza is getting cold. Every choice writes the
        next chapter.
      </p>
      <p className="mb-8 text-sm text-text/60">
        by {story.author} · {story.sceneCount} scenes · {story.endingCount}{" "}
        endings
      </p>
      <HomeActions />

      <div className="mt-16 grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
        {FEATURE_CARDS.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded-2xl bg-surface p-5 text-left transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <h2 className="mb-1 text-lg text-primary">{card.title}</h2>
            <p className="text-sm text-text/80">{card.text}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
