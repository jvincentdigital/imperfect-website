---
paths:
  - "src/lib/db.ts"
  - "src/lib/supabase.ts"
  - "src/lib/management-db.ts"
  - "src/lib/__tests__/**/*"
  - "supabase/**/*"
  - "supabase-schema.sql"
  - "data/**/*"
---

# Data Layer Domain

Database access (Supabase PostgreSQL), migrations, JSON fallback for local dev, and all data model types.

## Conventions

- `src/lib/db.ts` is the single data access layer for team/player data. All queries go through exported functions — never import `supabase` directly in routes or components.
- `src/lib/management-db.ts` is a separate module for management tables (tournaments, sponsors, revenue, checklists). It has no JSON fallback — requires Supabase.
- The Supabase client (`src/lib/supabase.ts`) is server-only and uses `SUPABASE_SERVICE_ROLE_KEY` (anon key only as a local-dev fallback). It returns `null` if no URL/key is set. All DB functions must handle this gracefully.
- RLS: every table denies anon/authenticated (no policies, no grants). A new table must be added to a lockdown migration like `20261031120100_rls_lockdown.sql`; `rls-lockdown.test.ts` fails if code uses a table the lockdown does not cover.
- JSON fallback (`data/*.json`) activates automatically when Supabase is null. It logs a warning in production. Only core team data (players, availability, schedule) has JSON fallback — management, scrims, community features require Supabase.
- Types are defined inline in `db.ts` (e.g., `Player`, `Scrim`, `Availability`, `AvailabilityTemplate`, `AvailabilityOverride`). Export types from `db.ts` — don't duplicate them.
- Migrations live in `supabase/migrations/` with timestamp-prefixed filenames. Run `supabase db push` to apply, `supabase db dump --schema public` to snapshot.
- `supabase-schema.sql` at root is a reference snapshot — not automatically applied. Keep it updated when adding migrations.
- Unit tests in `src/lib/__tests__/` mock Supabase responses. Test both the Supabase path and JSON fallback path for functions that support both.
- Seed data script at `scripts/seed-db.ts` populates dev environment from JSON files.
- Always use `.select()` to specify columns on Supabase queries — don't rely on `select('*')` except for small tables.

## Interfaces

- Connects to: auth (player lookup for login, invite management), team-hub (all CRUD operations), management (separate DB module)
- 18 tables total — see `docs/architecture.md` for the full table reference
