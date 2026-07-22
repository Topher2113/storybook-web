// Client-side Supabase Auth for self-serve sign-up. The shared class API
// only exposes /api/auth/login (accounts were meant to be instructor-
// provisioned), and it's off-limits to change — it's the class's server,
// shared with everyone else's deployment. Sign-up instead talks straight to
// Supabase Auth from the browser with the *publishable* (anon) key, the same
// key the Express server itself uses for its own auth client
// (routes/shared.js's SUPABASE_PUBLISHABLE_KEY) — safe to expose, and the
// session it returns is a normal Supabase JWT that /api/auth/me and every
// player-state endpoint already accept.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null | undefined;

// null = checked and unconfigured; undefined = not checked yet.
export function getSupabaseAuthClient(): SupabaseClient | null {
  if (client !== undefined) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  client =
    url && key
      ? createClient(url, key, {
          auth: { autoRefreshToken: false, persistSession: false },
        })
      : null;
  return client;
}
