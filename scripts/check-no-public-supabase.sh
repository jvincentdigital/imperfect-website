#!/usr/bin/env bash
# Guard against accidental promotion of Supabase keys / SUPABASE_URL to the
# browser bundle. The server uses SUPABASE_SERVICE_ROLE_KEY, which bypasses
# RLS: if it ever got a NEXT_PUBLIC_ prefix, anyone on the internet would get
# full read/write to sponsors (PII), revenue, tournaments, etc. The database
# denies the anon key (migration 20261031120100_rls_lockdown.sql), but keep
# every Supabase variable server-only anyway.
#
# If you legitimately need client-side Supabase access, add real RLS policies
# for that table first. Do NOT silence this guard.
#
# Exits 0 if clean, 1 if any match is found.
set -euo pipefail

# Search with ripgrep if available (fast, respects .gitignore), else fall back.
if command -v rg >/dev/null 2>&1; then
  matches="$(rg --no-messages --hidden --glob '!node_modules' --glob '!.next' --glob '!.git' --glob "!$(basename "$0")" 'NEXT_PUBLIC_SUPABASE' || true)"
else
  matches="$(grep -rn --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=.git --exclude="$(basename "$0")" 'NEXT_PUBLIC_SUPABASE' . || true)"
fi

if [ -n "$matches" ]; then
  echo "ERROR: NEXT_PUBLIC_SUPABASE_* found in repo. The Supabase anon key must stay server-only." >&2
  echo "See scripts/check-no-public-supabase.sh for context." >&2
  echo "" >&2
  echo "$matches" >&2
  exit 1
fi

echo "OK: no NEXT_PUBLIC_SUPABASE_* references in repo."
