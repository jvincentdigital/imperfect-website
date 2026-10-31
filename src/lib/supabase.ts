import { createClient } from "@supabase/supabase-js";
import { logger } from "./logger";

// SERVER-ONLY. This module must never be imported from a "use client" file,
// and the key must never get a NEXT_PUBLIC_ prefix (scripts/check-no-public-supabase.sh
// enforces the prefix rule in CI).
//
// The app talks to Supabase only from the server, with the service role key,
// which bypasses RLS. The database itself denies anon and authenticated
// (migration 20261031120100_rls_lockdown.sql), so a leaked anon key reads nothing.
//
// The anon fallback exists only so local dev and the rollout window keep
// working; after the lockdown migration the anon key gets no rows.
const url = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const key = serviceRoleKey ?? process.env.SUPABASE_ANON_KEY;

export const supabaseKeyRole: "service_role" | "anon" | "none" = serviceRoleKey
  ? "service_role"
  : key
    ? "anon"
    : "none";

if (url && supabaseKeyRole === "anon" && process.env.NODE_ENV === "production") {
  logger.warn(
    "[supabase] SUPABASE_SERVICE_ROLE_KEY is not set; using the anon key. " +
      "Once the RLS lockdown migration runs, every query will return nothing.",
  );
}

export const supabase =
  url && key
    ? createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
    : null;

export function isSupabaseConfigured() {
  return Boolean(url && key);
}
