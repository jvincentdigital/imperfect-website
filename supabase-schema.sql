-- IMPerfect Team Hub — Supabase Schema
-- Run this in the Supabase SQL editor after creating your project.

-- Players table
CREATE TABLE IF NOT EXISTS players (
  discord_id    TEXT PRIMARY KEY,
  display_name  TEXT NOT NULL,
  division      TEXT NOT NULL CHECK (division IN ('OW2', 'MR')),
  role          TEXT NOT NULL DEFAULT 'player' CHECK (role IN ('admin', 'coach', 'player')),
  is_admin      BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Schedule blocks table
CREATE TABLE IF NOT EXISTS schedule_blocks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start  DATE NOT NULL,
  division    TEXT NOT NULL CHECK (division IN ('OW2', 'MR')),
  day         TEXT NOT NULL CHECK (day IN ('MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN')),
  time_slot   TEXT NOT NULL,                  -- e.g. "16:00", "17:00"
  block_type  TEXT NOT NULL CHECK (block_type IN (
                'PRACTICE', 'SCRIM', 'VOD_REVIEW', 'MEETING', 'TOURNAMENT', 'FLEX', 'REST'
              )),
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Availability table
CREATE TABLE IF NOT EXISTS availability (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start          DATE NOT NULL,
  player_discord_id   TEXT NOT NULL REFERENCES players(discord_id) ON DELETE CASCADE,
  day                 TEXT NOT NULL CHECK (day IN ('MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN')),
  status              TEXT NOT NULL DEFAULT 'UNSURE' CHECK (status IN ('AVAILABLE', 'UNAVAILABLE', 'UNSURE')),
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (week_start, player_discord_id, day)
);

-- ─── Management Dashboard Tables ─────────────────────────────────────────────

-- Tournament entries
CREATE TABLE IF NOT EXISTS tournaments (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  game         TEXT NOT NULL,
  organizer    TEXT,
  format       TEXT,
  date_start   DATE,
  date_end     DATE,
  reg_deadline DATE,
  entry_fee    NUMERIC DEFAULT 0,
  prize_pool   NUMERIC DEFAULT 0,
  placement    TEXT,
  prize_won    NUMERIC DEFAULT 0,
  wins         INTEGER DEFAULT 0,
  losses       INTEGER DEFAULT 0,
  status       TEXT DEFAULT 'Upcoming',
  notes        TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Sponsors / CRM
CREATE TABLE IF NOT EXISTS sponsors (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name   TEXT NOT NULL,
  industry       TEXT,
  contact_name   TEXT,
  title          TEXT,
  email          TEXT,
  phone          TEXT,
  tier           TEXT DEFAULT 'Prospect',
  deal_value     NUMERIC DEFAULT 0,
  contract_start DATE,
  contract_end   DATE,
  deliverables   TEXT,
  paid_to_date   NUMERIC DEFAULT 0,
  status         TEXT DEFAULT 'Prospect',
  last_contact   DATE,
  next_followup  DATE,
  source         TEXT,
  notes          TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Revenue entries
CREATE TABLE IF NOT EXISTS revenue (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date           DATE NOT NULL,
  category       TEXT NOT NULL,
  description    TEXT,
  invoice_number TEXT,
  amount         NUMERIC DEFAULT 0,
  cost           NUMERIC DEFAULT 0,
  payment_method TEXT,
  received       BOOLEAN DEFAULT FALSE,
  receipt_ref    TEXT,
  notes          TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Merch pre-launch checklist
CREATE TABLE IF NOT EXISTS checklist_items (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section      TEXT NOT NULL,
  label        TEXT NOT NULL,
  completed    BOOLEAN DEFAULT FALSE,
  completed_by TEXT,
  completed_at TIMESTAMPTZ,
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for management tables
ALTER TABLE tournaments     ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsors        ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue         ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;

-- No policies: anon/authenticated are denied; the server uses the service
-- role key. See supabase/migrations/20261031120100_rls_lockdown.sql.

-- Seed: Merch pre-launch checklist items
INSERT INTO checklist_items (section, label) VALUES
  ('Foundation', 'Create Shopify account (Basic plan)'),
  ('Foundation', 'Connect custom domain: shop.imperfectorg.gg'),
  ('Foundation', 'Install Printful app and connect store'),
  ('Foundation', 'Configure Stripe payment gateway'),
  ('Foundation', 'Set up tax settings (Puerto Rico)'),
  ('Production', 'Finalize all 8 SKU designs'),
  ('Production', 'Submit samples order via Printful'),
  ('Production', 'Complete product photography'),
  ('Production', 'Write product descriptions in English'),
  ('Production', 'Write product descriptions in Spanish'),
  ('Production', 'Set up discount codes for players and partners'),
  ('Pre-Launch', 'Enable Discord community early access'),
  ('Pre-Launch', 'Publish 3 teaser posts on Instagram/TikTok'),
  ('Pre-Launch', 'Send 5 influencer PR packages'),
  ('Pre-Launch', 'Set up email signup landing page'),
  ('Pre-Launch', 'Run full checkout flow QA test'),
  ('Launch & Scale', 'Publish public launch announcement'),
  ('Launch & Scale', 'Go live on all social channels simultaneously'),
  ('Launch & Scale', 'Activate affiliate/referral program'),
  ('Launch & Scale', 'Launch first paid social ad campaign'),
  ('Launch & Scale', 'Set up monthly restock schedule')
ON CONFLICT DO NOTHING;

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER schedule_blocks_updated_at
  BEFORE UPDATE ON schedule_blocks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER availability_updated_at
  BEFORE UPDATE ON availability
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Player stats override (manual stat entry for when API data is wrong or unavailable)
CREATE TABLE IF NOT EXISTS player_stats_override (
  discord_id    TEXT PRIMARY KEY REFERENCES players(discord_id),
  mr_username   TEXT,              -- Marvel Rivals in-game username (for API lookup)
  use_override  BOOLEAN DEFAULT FALSE, -- If true, show manual data instead of API
  rank_name     TEXT,
  win_rate      NUMERIC,           -- 0.0-1.0
  kda           NUMERIC,
  matches       INTEGER,
  top_heroes    JSONB DEFAULT '[]', -- [{name, role, matchesPlayed, winRate, kda}]
  notes         TEXT,
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_by    TEXT               -- discord_id of admin who last edited
);

-- Row Level Security (optional but recommended)
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;

-- No policies: every table denies anon/authenticated and the server uses
-- the service role key (bypasses RLS). See 20261031120100_rls_lockdown.sql,
-- which also covers the tables added by later migrations.

-- ─── Performance Indexes ─────────────────────────────────────────────────────
CREATE INDEX idx_players_division_active ON players (division) WHERE archived = false;
CREATE INDEX idx_availability_week_player ON availability (week_start, player_discord_id);
CREATE INDEX idx_schedule_blocks_week_div ON schedule_blocks (week_start, division);
CREATE INDEX idx_scrims_division_date ON scrims (division, scheduled_at DESC);
CREATE INDEX idx_avail_templates_player ON availability_templates (player_discord_id);
CREATE INDEX idx_avail_overrides_player_date ON availability_overrides (player_discord_id, override_date);
