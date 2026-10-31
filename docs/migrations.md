# Database Migrations

## Overview

Schema changes are tracked as SQL migration files in `supabase/migrations/`. Each file is a sequential, forward-only migration. The `supabase-schema.sql` file in the project root is the **human-readable source of truth** — keep it in sync with migrations.

## Workflow

### Making a schema change

1. Edit `supabase-schema.sql` to reflect the desired end state
2. Generate a migration file using the Supabase CLI:
   ```bash
   supabase db diff --schema public -f describe_your_change
   ```
   This creates a new file in `supabase/migrations/` with a timestamp prefix.
3. Review the generated migration — confirm it only contains the intended changes
4. Apply to local Supabase:
   ```bash
   supabase db reset   # or: supabase migration up
   ```
5. Apply to production via Vercel deployment (migrations run automatically) or manually:
   ```bash
   supabase db push
   ```
6. Commit both `supabase-schema.sql` and the new migration file together

### Migration file naming

```
supabase/migrations/YYYYMMDDHHMMSS_description.sql
```

Example: `20260415120000_add_player_photo_url.sql`

### Current migrations

| File | Description |
|---|---|
| `20260401033055_remote_commit.sql` | Initial schema — players, schedule_blocks, availability, tournaments, sponsors, revenue, checklist_items. RLS policies, seed data |
| `20260402010856_role_system.sql` | Role system — adds org_role, game, in_game_role, rank, captain_of, archived to players. Creates scrims, announcements, audit_log, invites, player_stats_override, reminders_sent tables |
| `20260406_recurring_availability_and_scrim_applications.sql` | Recurring availability — availability_templates, availability_overrides. Scrim applications — scrim_applications table with indexes |
| `20260407_community_teams.sql` | Community registration — community_teams, community_team_players tables with indexes |
| `20260609120000_drop_allow_all_anon_policies.sql` | Drops the "Allow all for anon" policies |
| `20261031120000_invites_bound_to_discord_id.sql` | Adds `invites.invited_discord_id` (invite bound to one Discord user) |
| `20261031120100_rls_lockdown.sql` | RLS on every table, all policies dropped, anon/authenticated revoked. Apply only after the service role key is live; see `docs/database-security.md` |

## Local development

Start a local Supabase instance (requires Docker):
```bash
supabase start
supabase db reset   # applies all migrations from scratch
```

This is equivalent to running `supabase-schema.sql` directly.

## Rules

- **Never edit a migration file after it has been applied to production.** Create a new migration instead.
- **Never delete migration files.** They form the complete history of the database schema.
- Keep `supabase-schema.sql` and migrations in sync — if they diverge, migrations win.
