import type { Scene } from "@/lib/api/types";
import { Badge } from "@/components/ui/Badge";

export function SceneCard({ scene }: { scene: Scene }) {
  return (
    <article className="rounded-2xl bg-surface p-6 shadow-sm sm:p-8">
      <div className="mb-3 flex items-start justify-between gap-3">
        <h1 className="text-2xl text-text sm:text-3xl">{scene.title}</h1>
        {scene.type === "ending" && scene.ending_name && (
          <Badge className="mt-1 shrink-0">{scene.ending_name}</Badge>
        )}
      </div>
      <p className="whitespace-pre-line text-lg leading-relaxed text-text/90">
        {scene.text}
      </p>
    </article>
  );
}
