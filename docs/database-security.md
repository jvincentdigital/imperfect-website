# Database security (Supabase RLS + invites)

Last updated 2026-10-31.

## The model

- The app talks to Supabase **only from the server**, with `SUPABASE_SERVICE_ROLE_KEY`
  (`src/lib/supabase.ts`). The service role bypasses RLS.
- The database denies everyone else. Migration
  `supabase/migrations/20261031120100_rls_lockdown.sql` enables RLS on every table,
  drops every policy, and revokes all grants from `anon` and `authenticated`.
  A leaked anon key reads and writes nothing.
- The public site (roster, news, results) reads through server components and API
  routes, so it needs **no** anon policy. If a future feature reads Supabase from the
  browser, add a narrow `FOR SELECT TO anon` policy for that one table first.
- No Supabase variable may get a `NEXT_PUBLIC_` prefix
  (`scripts/check-no-public-supabase.sh`, run in CI).
- `src/lib/__tests__/rls-lockdown.test.ts` fails if code uses a table that the
  lockdown migration does not list. When you add a table, add it to a new lockdown
  migration (copy the DO block) in the same PR.
- `/api/health` reports `supabase_key`: `service_role`, `anon` or `none`.

## Invites

- Each invite is bound to one Discord user id (`invites.invited_discord_id`,
  migration `20261031120000_invites_bound_to_discord_id.sql`). The admin types the
  id when making the invite (Discord: Developer Mode, right-click the user,
  Copy User ID).
- Sign-in (`checkSignIn` in `src/lib/invites.ts`): a new member gets in only while
  following their own `/team-hub/join/<token>` link, and only if the invite is bound
  to their Discord id, unused and unexpired. Anyone else holding the link is refused.
- Redemption (`redeemInvite` in `src/lib/db.ts`) is one atomic UPDATE that matches
  only an unused, unexpired row bound to that user, so a link works once. The join
  page claims the invite before it creates the player row.
- Invites made before 2026-10-31 have no bound id and can never be used. Make new ones.
- If the DB is down at sign-in, only ids in `APPROVED_DISCORD_IDS` get in. An empty
  list now means nobody (it used to mean everybody).

## Rollout (do these in order)

The order keeps the site working: the server must hold the service role key before
the database stops answering the anon key.

1. **Key on Vercel.** Vercel, project `imperfect`, Settings, Environment Variables:
   `SUPABASE_SERVICE_ROLE_KEY` must exist for Production (as of 2026-10-31 it does,
   created about 212 days earlier; Preview does not have it). Value = Supabase
   dashboard, Project Settings, API Keys, the `service_role` secret key. Server-only:
   never `NEXT_PUBLIC_`. Mark it Sensitive. If you change it, redeploy.
2. **Deploy.** Merge the PR; Vercel deploys main.
3. **Check.** Open `https://imperfectgg.com/api/health`. It must say
   `"supabase_key":"service_role"` and `"supabase":"connected"`. If it says `anon`,
   stop and fix step 1 (then redeploy). Do not run step 4 yet.
4. **Migrations.** Supabase dashboard, SQL Editor. Paste and run, in this order:
   1. `supabase/migrations/20261031120000_invites_bound_to_discord_id.sql`
   2. `supabase/migrations/20261031120100_rls_lockdown.sql`

   (Or `supabase db push` from the repo, which also runs any older migration the
   project has not recorded.) Both files are safe to run twice.
5. **Verify.**
   - `/api/health` still says `connected`; sign in to Team Hub; open Management.
   - Supabase dashboard, Advisors, Security: no "RLS disabled" or "policy allows
     all" findings for these tables.
   - Anon key is refused (run in your own terminal):
     `curl "$SUPABASE_URL/rest/v1/revenue?select=id&limit=1" -H "apikey: $SUPABASE_ANON_KEY" -H "Authorization: Bearer $SUPABASE_ANON_KEY"`
     must return an error (permission denied), not rows.
6. **Re-issue invites.** Old open invites are dead. Make new ones with the person's
   Discord user id.

Between steps 2 and 4, making a new invite fails (the column does not exist yet).
Signing in for existing members is not affected.

**If something breaks after step 4:** it is almost always the key. Check
`/api/health`; set the right `SUPABASE_SERVICE_ROLE_KEY` and redeploy. Do not reopen
the database with allow-all policies.
