-- Bind each invite to the one Discord user it is for.
-- Old invites keep NULL and can no longer be redeemed.

ALTER TABLE invites
  ADD COLUMN IF NOT EXISTS invited_discord_id TEXT;

CREATE INDEX IF NOT EXISTS idx_invites_invited_discord_id
  ON invites (invited_discord_id);
