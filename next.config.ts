import type { NextConfig } from "next";

// The Express API sets no CORS headers, so the browser can never call it
// cross-origin. All client code fetches relative /api/* paths and these
// rewrites proxy them server-side. The NPC family routes to the standalone
// Flask NPC service (the class backend-change assignment); everything else
// goes to the main Express API. Order matters: the catch-all must come last.
const STORY_API_URL =
  process.env.STORY_API_URL ?? "https://storybook-api-f6bt.onrender.com";
const NPC_API_URL = process.env.NPC_API_URL ?? STORY_API_URL;

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: "/api/npcs", destination: `${NPC_API_URL}/api/npcs` },
      { source: "/api/npcs/:id", destination: `${NPC_API_URL}/api/npcs/:id` },
      {
        source: "/api/scenes/:sceneId/npcs",
        destination: `${NPC_API_URL}/api/scenes/:sceneId/npcs`,
      },
      {
        source: "/api/scenes/:sceneId/npcs/:npcId",
        destination: `${NPC_API_URL}/api/scenes/:sceneId/npcs/:npcId`,
      },
      { source: "/api/:path*", destination: `${STORY_API_URL}/api/:path*` },
    ];
  },
};

export default nextConfig;
