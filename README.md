# Storybook Web — Rat Adventure: Sewers of the Pizza Kingdom

## Features

Everything from the mobile app:

- Scene-by-scene story navigation with branching choices
- NPC dialogs ("Talk to Big Whiskers…") in a modal
- Endings with Play Again, skeleton loaders, error + retry states
- All six switchable themes (Parchment, Candlelight, Morning Mist, Midnight
  Tome, Forest Shadow, Gothic), each with its own storybook font pairing

Plus web-exclusive additions built on the full API surface:

- **XP & bottle-cap economy** — quests pay their `reward_xp` as XP *and* caps
  (1 XP = 1 cap); discovering a new ending pays a flat +15 XP/+15 caps
  exploration bounty — the *only* guaranteed source right now, since quests
  are dormant (see below). The API has no wallet, so the economy is a
  client-side layer; an ⓘ button on the story HUD explains the rules in-app.
- **Quests woven into the story** (dormant) — NPCs offer their quests inside
  dialog and arriving at the target scene auto-completes them, but the live
  database has no `quests` table yet, so the Quests tab is hidden and the
  machinery waits (the `/quests` page still exists, just unlisted).
- **Shops** (dormant) — browse the three shops and buy stock with caps, but
  the live database has no shop stock yet, so the Shops tab is hidden and the
  machinery (BuyButton, etc.) waits (the `/shops` pages still exist, just
  unlisted).
- **Fog-of-war world map** — the 51-scene graph drawn as zone columns with an
  SVG edge overlay; unvisited scenes stay obscured (their titles never even
  reach the DOM), your position pulses, endings are flagged.
- **Endings gallery** — 8 collectible fates; undiscovered ones are
  silhouettes.
- **Lore library** — book-spread reader with page turns and arrow-key paging.
- **NPC codex** — all eight residents with their per-scene dialogs and
  carried items, read via the Flask service. Dialogs are spoiler-gated to
  scenes you've actually visited (same reasoning as the map's fog-of-war),
  filtered client-side against local visited-scene history. (An edit form
  exists in `components/codex/NpcEditForm.tsx` but is deliberately not
  surfaced — the world is read-only for players; same for the item workshop
  panel.)
- **Accounts** (dormant) — sign-in and self-serve sign-up (the latter via
  Supabase Auth directly from the browser, bypassing the class API — see
  [Architecture notes](#architecture-notes)) are built but currently
  switched off site-wide: the class API has no working create-account path
  yet, so there was nothing consistent to offer. Everyone plays as a guest;
  `/login`, `AuthBanner`, and the account section on Settings stay in the
  code, dormant, ready to re-enable.

## Architecture notes

- **CORS/proxy:** the Express API sends no CORS headers, so the browser never
  calls it directly. All client fetches use relative `/api/*` paths and
  `next.config.ts` rewrites proxy them — the NPC family to `NPC_API_URL`
  (Flask), everything else to `STORY_API_URL` (Express). Server components
  call the Render URLs directly with the same routing rule.
- **Cold starts:** both upstreams sleep on free-tier Render. Every request has
  a 90s budget; GETs retry twice (3s/8s) with "waking the storybook server"
  messaging; the home page fires warm-up pings at both services.
- **Sign-up (dormant):** the class API only exposes `/api/auth/login` and is off-limits to
  change — it's shared with everyone else's deployment. The built sign-up
  flow calls Supabase Auth directly from the browser
  ([lib/supabaseClient.ts](lib/supabaseClient.ts)) with the project's
  publishable/anon key — the same kind of key the Express server itself uses
  server-side for its own auth client — so the session it returns is a
  normal Supabase JWT that every existing endpoint already accepts. It's
  currently switched off site-wide (no entry point in the nav, `/login`
  shows a placeholder) since account creation doesn't have a fully working
  path yet; re-enabling it is a matter of restoring the removed `<Link>`/
  `<AuthBanner>` renders and swapping `/login`'s page body back to
  `<LoginForm />` (still in the file, just unused).
- **State:** local-first. Progress lives in `localStorage`
  (`storybook.progress.v1`) behind a pure reducer
  ([lib/game/reducer.ts](lib/game/reducer.ts)); the caps balance is always
  derived (earned − spent) so it can't drift. The cloud-sync half of this
  (scene/inventory/quests to the server when signed in, ~1h Supabase JWTs
  with silent expiry-to-guest) is real code but currently unreachable since
  accounts are dormant (above) — everyone is a guest today, and XP, caps,
  visited scenes, and endings are local-only regardless (the API has no
  endpoints for them).
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
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL for sign-up | unused — sign-up is dormant, see above |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase publishable/anon key for sign-up | unused — sign-up is dormant, see above |

## Scripts

```bash
npm run dev     # dev server
npm run build   # production build (also the type gate)
npm run lint    # eslint
npm test        # vitest — game reducer economy rules + API error normalization
```

## CI

`.github/workflows/tests.yml` runs on every push to `main` and every pull
request: `npm ci`, `npm run lint`, `npm test` (vitest), then `npm run build`
as the type gate. No secrets or live API access needed — the vitest suite is
pure (reducer logic + error normalization) and the dynamic routes render at
request time, not build time.

## Known limitations

- Accounts are dormant — everyone plays as a guest, so progress is
  per-browser and doesn't follow you across devices.
- XP, caps, visited scenes, and discovered endings are per-browser regardless
  (the API has no endpoints to store them).
- First request after idle can take up to a minute (free-tier Render naps) —
  the UI says so instead of hanging silently.
- Some world data depends on the shared class database being migrated/seeded:
  as of writing, the live DB has no `quests` table and no shop stock, so the
  Quests and Shops tabs are hidden until the instructor applies the repo's
  migrations. The pages and their machinery stay in the code, dormant — every
  screen degrades gracefully to an empty/notice state if visited directly.
