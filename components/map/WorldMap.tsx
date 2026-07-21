"use client";

// The scene graph as zone columns with an SVG edge overlay — no graph
// library. Node positions are measured from the DOM (refs +
// getBoundingClientRect relative to the container) after layout and
// re-measured on resize, then edges are drawn as soft quadratic curves.
//
// Fog of war: unvisited scenes render a literal "???" (the real title never
// enters the DOM), so the map only ever reveals where you've actually been.
import { useCallback, useEffect, useRef, useState } from "react";
import { getWorldMap } from "@/lib/api/story";
import type { WorldMap as WorldMapData } from "@/lib/api/types";
import { useGame } from "@/components/providers/GameProvider";
import { ErrorPanel } from "@/components/game/ErrorPanel";
import { prettifyId } from "@/lib/game/format";

interface EdgeLine {
  key: string;
  d: string;
  revealed: boolean;
}

export function WorldMap() {
  const { progress, hydrated } = useGame();
  const [map, setMap] = useState<WorldMapData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [waking, setWaking] = useState(false);
  const [edges, setEdges] = useState<EdgeLine[]>([]);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement | null>(null);
  const nodeRefs = useRef(new Map<string, HTMLDivElement>());

  const load = useCallback(() => {
    getWorldMap({ onWaking: () => setWaking(true) })
      .then(setMap)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Couldn't load the map."),
      );
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const retry = () => {
    setError(null);
    load();
  };

  const visited = hydrated ? progress.visitedScenes : [];

  const measure = useCallback(() => {
    const container = containerRef.current;
    if (!container || !map) return;
    const box = container.getBoundingClientRect();
    const centers = new Map<string, { x: number; y: number }>();
    for (const [id, el] of nodeRefs.current) {
      const r = el.getBoundingClientRect();
      centers.set(id, {
        x: r.left - box.left + r.width / 2,
        y: r.top - box.top + r.height / 2,
      });
    }
    const lines: EdgeLine[] = [];
    map.edges.forEach((edge, i) => {
      const from = centers.get(edge.from);
      const to = centers.get(edge.to);
      if (!from || !to) return;
      // Quadratic curve bowing sideways a little for readability.
      const midX = (from.x + to.x) / 2 + (from.x === to.x ? 24 : 0);
      const midY = (from.y + to.y) / 2;
      lines.push({
        key: `${edge.from}->${edge.to}-${i}`,
        d: `M ${from.x} ${from.y} Q ${midX} ${midY} ${to.x} ${to.y}`,
        revealed:
          visited.includes(edge.from) && visited.includes(edge.to),
      });
    });
    setEdges(lines);
    setSize({ width: container.scrollWidth, height: container.scrollHeight });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, visited.length]);

  useEffect(() => {
    measure();
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    return () => observer.disconnect();
  }, [measure]);

  if (error) return <ErrorPanel message={error} onRetry={retry} />;
  if (!map || !hydrated) {
    return (
      <div>
        <div className="animate-skeleton h-96 w-full rounded-2xl bg-surface" />
        {waking && (
          <p className="mt-4 text-center text-sm text-text/60">
            Waking the storybook server — this can take up to a minute…
          </p>
        )}
      </div>
    );
  }

  // Start zone first, the rest in the API's order.
  const zoneIds = Object.keys(map.zones).sort((a, b) => {
    const aStart = map.zones[a].includes(map.startNode) ? -1 : 0;
    const bStart = map.zones[b].includes(map.startNode) ? -1 : 0;
    return aStart - bStart;
  });
  const nodesById = new Map(map.nodes.map((n) => [n.id, n]));
  const visitedCount = map.nodes.filter((n) => visited.includes(n.id)).length;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-text/70">
        <span>
          Explored {visitedCount} / {map.nodes.length} scenes
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full bg-primary" />
          you are here
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded border-2 border-accent" />
          ending
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded bg-text/20" />
          unexplored
        </span>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-accent/20 bg-surface/40 p-4">
        <div
          ref={containerRef}
          className="relative grid min-w-[56rem] gap-6"
          style={{
            gridTemplateColumns: `repeat(${zoneIds.length}, minmax(0, 1fr))`,
          }}
        >
          <svg
            className="pointer-events-none absolute inset-0 z-0"
            width={size.width || "100%"}
            height={size.height || "100%"}
            aria-hidden
          >
            {edges.map((edge) => (
              <path
                key={edge.key}
                d={edge.d}
                fill="none"
                stroke="var(--accent)"
                strokeWidth={1.5}
                strokeOpacity={edge.revealed ? 0.4 : 0.12}
                strokeDasharray={edge.revealed ? undefined : "4 4"}
              />
            ))}
          </svg>

          {zoneIds.map((zoneId) => (
            <div key={zoneId} className="relative z-10">
              <h2 className="mb-3 text-center text-sm font-bold uppercase tracking-wider text-accent">
                {prettifyId(zoneId)}
              </h2>
              <div className="flex flex-col gap-3">
                {map.zones[zoneId].map((sceneId) => {
                  const node = nodesById.get(sceneId);
                  if (!node) return null;
                  const isVisited = visited.includes(sceneId);
                  const isCurrent = progress.currentScene === sceneId;
                  const isEnding = node.type === "ending";
                  return (
                    <div
                      key={sceneId}
                      ref={(el) => {
                        if (el) nodeRefs.current.set(sceneId, el);
                        else nodeRefs.current.delete(sceneId);
                      }}
                      className={`rounded-xl px-3 py-2 text-center text-xs transition ${
                        isCurrent
                          ? "bg-primary text-button-text ring-2 ring-primary/50 animate-pulse"
                          : isVisited
                            ? `bg-surface text-text ${isEnding ? "border-2 border-accent" : ""}`
                            : `bg-text/10 text-text/40 ${isEnding ? "border-2 border-dashed border-accent/40" : ""}`
                      }`}
                    >
                      {isVisited ? (
                        <>
                          {isEnding && <span aria-hidden>🏁 </span>}
                          {node.title}
                        </>
                      ) : (
                        <span className="select-none blur-[2px]">???</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
