-- Lock the database down.
-- Only the server (service role key) reads or writes.
-- anon and authenticated get nothing: no policies, no grants.
-- The public site reads through the server, so it needs no anon access.
-- Apply ONLY after SUPABASE_SERVICE_ROLE_KEY is live on Vercel.

DO $$
DECLARE
  t text;
  p record;
  tables text[] := ARRAY[
    'announcements', 'audit_log', 'availability',
    'availability_overrides', 'availability_templates',
    'checklist_items', 'community_team_players',
    'community_teams', 'invites', 'lineups', 'players',
    'player_stats_override', 'reminders_sent', 'revenue',
    'schedule_blocks', 'scrim_applications', 'scrims',
    'sponsors', 'tournaments'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    IF to_regclass('public.' || t) IS NULL THEN
      CONTINUE;
    END IF;
    EXECUTE format(
      'ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    FOR p IN
      SELECT policyname FROM pg_policies
      WHERE schemaname = 'public' AND tablename = t
    LOOP
      EXECUTE format(
        'DROP POLICY %I ON public.%I', p.policyname, t);
    END LOOP;
    EXECUTE format(
      'REVOKE ALL ON public.%I FROM anon, authenticated', t);
    EXECUTE format(
      'GRANT ALL ON public.%I TO service_role', t);
  END LOOP;
END $$;
