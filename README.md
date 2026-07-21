# Storybook Web — Rat Adventure: Sewers of the Pizza Kingdom

A Next.js web rebuild of the Storybook mobile app (React Native/Expo) for a
Masters course, grown into a full storybook game. You are a rat; the colony is
hungry; every choice writes the next chapter.

**Live backend:** the shared class Express API on Render. **NPC endpoints** are
served by my standalone [Python Flask NPC microservice](../../2026-summer-repo/npc-service/)
(the course's backend-change assignment) with a byte-identical contract.

## Features

Everything from the mobile app:

- Scene-by-scene story navigation with branching choices
- NPC dialogs ("Talk to Big Whiskers…") in a modal
- Endings with Play Again, skeleton loaders, error + retry states
- All six switchable themes (Parchment, Candlelight, Morning Mist, Midnight
  Tome, Forest Shadow, Gothic), each with its own storybook font pairing

Plus web-exclusive additions built on the full API surface:

- **XP & bottle-cap economy** — quests pay their `reward_xp` as XP *and* caps
  (1 XP = 1 cap); discovering a new ending pays a flat 15-cap exploration
  bounty. The API has no wallet, so the economy is a client-side layer.
- **Quests woven into the story** (dormant) — NPCs offer their quests inside
  dialog and arriving at the target scene auto-completes them, but the live
  database has no `quests` table yet, so the Quests tab is hidden and the
  machinery waits (the `/quests` page still exists, just unlisted).
- **Shops** — browse the three shops and buy stock with caps (adds to your
  satchel; synced to the server inventory when signed in).
- **Fog-of-war world map** — the 51-scene graph drawn as zone columns with an
  SVG edge overlay; unvisited scenes stay obscured (their titles never even
  reach the DOM), your position pulses, endings are flagged.
- **Endings gallery** — 8 collectible fates; undiscovered ones are
  silhouettes.
- **Lore library** — book-spread reader with page turns and arrow-key paging.
- **NPC codex** — all eight residents with their per-scene dialogs and
  carried items, read via the Flask service. (An edit form exists in
  `components/codex/NpcEditForm.tsx` but is deliberately not surfaced — the
  world is read-only for players; same for the item workshop panel.)
- **Guest-first auth** — play instantly; signing in (accounts are provisioned
  by the instructor) syncs current scene, satchel, and quest log to the cloud
  for cross-device resume, with a merge-on-login reconcile.

## Architecture notes

- **CORS/proxy:** the Express API sends no CORS headers, so the browser never
  calls it directly. All client fetches use relative `/api/*` paths and
  `next.config.ts` rewrites proxy them — the NPC family to `NPC_API_URL`
  (Flask), everything else to `STORY_API_URL` (Express). Server components
  call the Render URLs directly with the same routing rule.
- **Cold starts:** both upstreams sleep on free-tier Render. Every request has
  a 90s budget; GETs retry twice (3s/8s) with "waking the storybook server"
  messaging; the home page fires warm-up pings at both services.
- **State:** local-first. Progress lives in `localStorage`
  (`storybook.progress.v1`) behind a pure reducer
  ([lib/game/reducer.ts](lib/game/reducer.ts)); the caps balance is always
  derived (earned − spent) so it can't drift. When signed in, scene/inventory/
  quests also sync to the server (XP, caps, visited scenes, and endings are
  local-only — the API has no endpoints for them). Tokens are ~1h Supabase
  JWTs with no refresh endpoint: expiry silently downgrades to guest play with
  a re-login banner, losing nothing.
- **Themes:** six `[data-theme]` CSS-variable blocks bridged into Tailwind v4
  utilities via `@theme inline`; ten Google fonts self-hosted through
  `next/font`; a pre-hydration inline script prevents any flash of the wrong
  theme.

## Getting started

Requires Node ≥ 20.9 (Next.js 16).

```bash
npm install
cp .env.example .env.local   # defaults point at the live class API
npm run dev                  # http://localhost:3000
```

Env vars (read by `next.config.ts` and server components only):

| Var | Purpose | Default |
|---|---|---|
| `STORY_API_URL` | Main Express API | `https://storybook-api-f6bt.onrender.com` |
| `NPC_API_URL` | Flask NPC service (NPC routes) | falls back to `STORY_API_URL` |

## Scripts

```bash
npm run dev     # dev server
npm run build   # production build (also the type gate)
npm run lint    # eslint
npm test        # vitest — game reducer economy rules + API error normalization
```

## Deploying (Vercel)

Import the repo in Vercel (framework auto-detected), set `STORY_API_URL` and
`NPC_API_URL` in the project's environment variables, deploy. Verify the
proxy with `curl https://<app>.vercel.app/api/story`.

## Known limitations

- XP, caps, visited scenes, and discovered endings are per-browser (the API
  has no endpoints to store them).
- Sessions last ~1 hour (no refresh endpoint); the app degrades to guest play
  and invites re-login.
- First request after idle can take up to a minute (free-tier Render naps) —
  the UI says so instead of hanging silently.
- Some world data depends on the shared class database being migrated/seeded:
  as of writing, the live DB has no `quests` table and no shop stock, so quest
  offers and shop wares don't appear until the instructor applies the repo's
  migrations. Every screen degrades gracefully to an empty/notice state.
