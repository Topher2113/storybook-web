import type { Metadata } from "next";
import { WorldMap } from "@/components/map/WorldMap";

export const metadata: Metadata = { title: "Map" };

export default function MapPage() {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
      <h1 className="mb-1 text-3xl text-text">World Map</h1>
      <p className="mb-6 text-sm text-text/70">
        The sewers reveal themselves only to those who walk them.
      </p>
      <WorldMap />
    </main>
  );
}
