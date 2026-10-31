/**
 * Data access layer — uses Supabase when configured, falls back to JSON files.
 * Connect Supabase by setting SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (server-only)
 * in .env.local. See src/lib/supabase.ts.
 */
import { supabase } from "./supabase";
import type { OrgRole } from "./permissions";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");

let _jsonFallbackWarned = false;

/**
 * Returns a shallow copy of `obj` containing only the keys listed in `allowed`.
 * Used as a writable-column allowlist before persisting route-supplied objects
 * to Supabase — strips any unknown/privileged fields (mass-assignment guard).
 */
function pick<T extends Record<string, unknown>>(obj: T, allowed: readonly string[]): Partial<T> {
  const out: Partial<T> = {};
  for (const key of allowed) {
    if (key in obj && obj[key] !== undefined) {
      out[key as keyof T] = obj[key as keyof T];
    }
  }
  return out;
}

// ─── Writable-column allowlists ─────────────────────────────────────────────
// Only these columns may be set by route-supplied objects. Server-managed
// columns (id, created_at, updated_at) and anything not listed is stripped.

const PLAYER_COLUMNS = [
  "discord_id", "display_name", "division", "role", "is_admin",
  "org_role", "game", "in_game_role", "rank", "captain_of", "archived",
] as const;

const SCHEDULE_BLOCK_COLUMNS = [
  "id", "week_start", "division", "day", "time_slot", "block_type", "notes",
] as const;

const AVAILABILITY_COLUMNS = [
  "id", "week_start", "player_discord_id", "day", "status",
] as const;

const SCRIM_COLUMNS = [
  "game", "division", "opponent_org", "scheduled_at", "format",
  "status", "result", "score", "notes", "created_by",
] as const;

const ANNOUNCEMENT_COLUMNS = [
  "title", "body", "author_discord_id", "pinned", "target_audience",
] as const;

const AVAILABILITY_TEMPLATE_COLUMNS = [
  "player_discord_id", "day_of_week", "morning", "afternoon", "evening",
] as const;

const AVAILABILITY_OVERRIDE_COLUMNS = [
  "player_discord_id", "override_date", "morning", "afternoon", "evening",
] as const;

function readJson<T>(filename: string): T[] {
  if (process.env.NODE_ENV === "production" && !_jsonFallbackWarned) {
    _jsonFallbackWarned = true;
    console.error(
      "[db] CRITICAL: Supabase is not configured in production. " +
      "Serving stale static JSON data — this is NOT suitable for production use. " +
      "Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables."
    );
  }
  try {
    const raw = fs.readFileSync(path.join(DATA_DIR, filename), "utf-8");
    return JSON.parse(raw) as T[];
  } catch {
    return [];
  }
}

function writeJson<T>(filename: string, data: T[]): void {
  fs.writeFileSync(path.join(DATA_DIR, filename), JSON.stringify(data, null, 2));
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type Player = {
  discord_id:   string;
  display_name: string;
  division:     string;
  role:         "admin" | "coach" | "player";
  is_admin:     boolean;
  // New fields (added in role_system migration)
  org_role:     OrgRole;
  game:         "OW2" | "MR" | "BOTH" | null;
  in_game_role: string | null;
  rank:         string | null;
  captain_of:   string | null;
  archived:     boolean;
};

export type ScheduleBlock = {
  id:         string;
  week_start: string;
  division:   string;
  day:        "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN";
  time_slot:  string;
  block_type: "PRACTICE" | "SCRIM" | "VOD_REVIEW" | "MEETING" | "TOURNAMENT" | "FLEX" | "REST";
  notes?:     string;
};

export type Availability = {
  id:                string;
  week_start:        string;
  player_discord_id: string;
  day:               "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN";
  status:            "AVAILABLE" | "UNAVAILABLE" | "UNSURE";
};

export type Scrim = {
  id:           string;
  game:         "OW2" | "MR";
  division:     string;
  opponent_org: string;
  scheduled_at: string; // ISO timestamp
  format:       string | null;
  status:       "Pending" | "Confirmed" | "Cancelled" | "Completed";
  result:       "W" | "L" | "Draw" | null;
  score:        string | null;
  notes:        string | null;
  created_by:   string;
  created_at:   string;
  updated_at:   string;
};

export type Announcement = {
  id:                string;
  title:             string;
  body:              string;
  author_discord_id: string;
  pinned:            boolean;
  target_audience:   "ALL" | "IMPERFECT" | "SHADOWS" | "ECHOES" | "COACHES" | "MANAGERS" | "PLAYERS";
  created_at:        string;
  updated_at:        string;
};

export type AuditEntry = {
  id:               string;
  actor_discord_id: string;
  action_type:      string;
  entity_type:      string;
  entity_id:        string;
  before_val:       Record<string, unknown> | null;
  after_val:        Record<string, unknown> | null;
  created_at:       string;
};

export type Invite = {
  id:         string;
  token:      string;
  org_role:   OrgRole;
  created_by: string;
  invited_discord_id: string | null;
  used_by:    string | null;
  used_at:    string | null;
  expires_at: string;
  created_at: string;
};

// ─── Players ──────────────────────────────────────────────────────────────────

export async function getPlayerByDiscordId(discordId: string): Promise<Player | null> {
  if (supabase) {
    const { data } = await supabase
      .from("players")
      .select("*")
      .eq("discord_id", discordId)
      .single();
    return data as Player | null;
  }
  const players = readJson<Player>("players.json");
  return players.find((p) => p.discord_id === discordId) ?? null;
}

export async function getAllPlayers(includeArchived = false): Promise<Player[]> {
  if (supabase) {
    let q = supabase.from("players").select("*").order("display_name");
    if (!includeArchived) q = q.eq("archived", false);
    const { data } = await q;
    return (data as Player[]) ?? [];
  }
  const players = readJson<Player>("players.json");
  return includeArchived ? players : players.filter((p) => !p.archived);
}

export async function upsertPlayer(player: Partial<Player> & { discord_id: string }): Promise<void> {
  const safe = pick(player, PLAYER_COLUMNS) as Partial<Player> & { discord_id: string };
  if (supabase) {
    await supabase.from("players").upsert(safe, { onConflict: "discord_id" });
    return;
  }
  const players = readJson<Player>("players.json");
  const idx = players.findIndex((p) => p.discord_id === safe.discord_id);
  if (idx >= 0) players[idx] = { ...players[idx], ...safe };
  else players.push(safe as Player);
  writeJson("players.json", players);
}

export async function archivePlayer(discordId: string): Promise<void> {
  if (supabase) {
    await supabase.from("players").update({ archived: true }).eq("discord_id", discordId);
    return;
  }
  const players = readJson<Player>("players.json");
  const idx = players.findIndex((p) => p.discord_id === discordId);
  if (idx >= 0) players[idx].archived = true;
  writeJson("players.json", players);
}

export async function updatePlayerRole(discordId: string, orgRole: OrgRole, captainOf?: string | null): Promise<void> {
  if (supabase) {
    await supabase
      .from("players")
      .update({ org_role: orgRole, captain_of: captainOf ?? null })
      .eq("discord_id", discordId);
    return;
  }
  const players = readJson<Player>("players.json");
  const idx = players.findIndex((p) => p.discord_id === discordId);
  if (idx >= 0) {
    players[idx].org_role = orgRole;
    players[idx].captain_of = captainOf ?? null;
  }
  writeJson("players.json", players);
}

// ─── Schedule ─────────────────────────────────────────────────────────────────

export async function getScheduleBlocks(weekStart: string, division: string): Promise<ScheduleBlock[]> {
  if (supabase) {
    const { data } = await supabase
      .from("schedule_blocks")
      .select("*")
      .eq("week_start", weekStart)
      .eq("division", division);
    return (data as ScheduleBlock[]) ?? [];
  }
  const blocks = readJson<ScheduleBlock>("schedule.json");
  return blocks.filter((b) => b.week_start === weekStart && b.division === division);
}

export async function getAllVodReviews(): Promise<ScheduleBlock[]> {
  if (supabase) {
    const { data } = await supabase
      .from("schedule_blocks")
      .select("*")
      .eq("block_type", "VOD_REVIEW")
      .order("week_start", { ascending: false });
    return (data as ScheduleBlock[]) ?? [];
  }
  const blocks = readJson<ScheduleBlock>("schedule.json");
  return blocks
    .filter((b) => b.block_type === "VOD_REVIEW")
    .sort((a, b) => b.week_start.localeCompare(a.week_start));
}

export async function upsertScheduleBlock(block: ScheduleBlock): Promise<ScheduleBlock> {
  const safe = pick(block, SCHEDULE_BLOCK_COLUMNS) as ScheduleBlock;
  if (supabase) {
    const { data } = await supabase
      .from("schedule_blocks")
      .upsert(safe, { onConflict: "id" })
      .select()
      .single();
    return data as ScheduleBlock;
  }
  const blocks = readJson<ScheduleBlock>("schedule.json");
  const idx = blocks.findIndex((b) => b.id === safe.id);
  if (idx >= 0) blocks[idx] = safe;
  else blocks.push(safe);
  writeJson("schedule.json", blocks);
  return safe;
}

export async function deleteScheduleBlock(id: string): Promise<void> {
  if (supabase) {
    await supabase.from("schedule_blocks").delete().eq("id", id);
    return;
  }
  const blocks = readJson<ScheduleBlock>("schedule.json");
  writeJson("schedule.json", blocks.filter((b) => b.id !== id));
}

// ─── Availability ─────────────────────────────────────────────────────────────

export async function getAvailability(weekStart: string, discordId?: string): Promise<Availability[]> {
  if (supabase) {
    let query = supabase.from("availability").select("*").eq("week_start", weekStart);
    if (discordId) query = query.eq("player_discord_id", discordId);
    const { data } = await query;
    return (data as Availability[]) ?? [];
  }
  const rows = readJson<Availability>("availability.json");
  return rows.filter(
    (r) => r.week_start === weekStart && (!discordId || r.player_discord_id === discordId)
  );
}

/** Get availability for a set of players (team-scoped). */
export async function getAvailabilityForPlayers(weekStart: string, discordIds: string[]): Promise<Availability[]> {
  if (discordIds.length === 0) return [];
  if (supabase) {
    const { data } = await supabase
      .from("availability")
      .select("*")
      .eq("week_start", weekStart)
      .in("player_discord_id", discordIds);
    return (data as Availability[]) ?? [];
  }
  const rows = readJson<Availability>("availability.json");
  return rows.filter(
    (r) => r.week_start === weekStart && discordIds.includes(r.player_discord_id)
  );
}

export async function upsertAvailability(row: Availability): Promise<Availability> {
  const safe = pick(row, AVAILABILITY_COLUMNS) as Availability;
  if (supabase) {
    const { data } = await supabase
      .from("availability")
      .upsert(safe, { onConflict: "week_start,player_discord_id,day" })
      .select()
      .single();
    return data as Availability;
  }
  row = safe;
  const rows = readJson<Availability>("availability.json");
  const idx = rows.findIndex(
    (r) =>
      r.week_start === row.week_start &&
      r.player_discord_id === row.player_discord_id &&
      r.day === row.day
  );
  if (idx >= 0) rows[idx] = row;
  else rows.push(row);
  writeJson("availability.json", rows);
  return row;
}

// ─── Scrims ───────────────────────────────────────────────────────────────────

export async function getScrims(division?: string): Promise<Scrim[]> {
  if (!supabase) return [];
  let q = supabase.from("scrims").select("*").order("scheduled_at", { ascending: true });
  if (division) q = q.eq("division", division);
  const { data } = await q;
  return (data as Scrim[]) ?? [];
}

export async function createScrim(scrim: Omit<Scrim, "id" | "created_at" | "updated_at">): Promise<Scrim> {
  if (!supabase) throw new Error("Supabase required for scrims");
  const { data, error } = await supabase.from("scrims").insert(pick(scrim, SCRIM_COLUMNS)).select().single();
  if (error) throw error;
  return data as Scrim;
}

export async function updateScrim(id: string, patch: Partial<Scrim>): Promise<Scrim> {
  if (!supabase) throw new Error("Supabase required for scrims");
  const { data, error } = await supabase
    .from("scrims")
    .update(pick(patch, SCRIM_COLUMNS))
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Scrim;
}

export async function deleteScrim(id: string): Promise<void> {
  if (!supabase) throw new Error("Supabase required for scrims");
  await supabase.from("scrims").delete().eq("id", id);
}

// ─── Announcements ────────────────────────────────────────────────────────────

export async function getAnnouncements(audience?: string): Promise<Announcement[]> {
  if (!supabase) return [];
  let q = supabase
    .from("announcements")
    .select("*")
    .order("pinned", { ascending: false })
    .order("created_at", { ascending: false });
  if (audience && audience !== "ALL") {
    q = q.in("target_audience", ["ALL", audience]);
  }
  const { data } = await q;
  return (data as Announcement[]) ?? [];
}

export async function createAnnouncement(a: Omit<Announcement, "id" | "created_at" | "updated_at">): Promise<Announcement> {
  if (!supabase) throw new Error("Supabase required for announcements");
  const { data, error } = await supabase.from("announcements").insert(pick(a, ANNOUNCEMENT_COLUMNS)).select().single();
  if (error) throw error;
  return data as Announcement;
}

export async function updateAnnouncement(id: string, patch: Partial<Announcement>): Promise<void> {
  if (!supabase) throw new Error("Supabase required for announcements");
  await supabase.from("announcements").update(pick(patch, ANNOUNCEMENT_COLUMNS)).eq("id", id);
}

export async function deleteAnnouncement(id: string): Promise<void> {
  if (!supabase) throw new Error("Supabase required for announcements");
  await supabase.from("announcements").delete().eq("id", id);
}

// ─── Audit Log ────────────────────────────────────────────────────────────────

export async function appendAuditLog(entry: Omit<AuditEntry, "id" | "created_at">): Promise<void> {
  if (!supabase) return; // no-op without DB
  await supabase.from("audit_log").insert(entry);
}

export async function getAuditLog(limit = 100): Promise<AuditEntry[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from("audit_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data as AuditEntry[]) ?? [];
}

// ─── Invites ──────────────────────────────────────────────────────────────────

export async function getInvites(): Promise<Invite[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from("invites")
    .select("*")
    .order("created_at", { ascending: false });
  return (data as Invite[]) ?? [];
}

export async function createInvite(
  orgRole: OrgRole,
  createdBy: string,
  invitedDiscordId: string,
): Promise<Invite> {
  if (!supabase) throw new Error("Supabase required for invites");
  const { data, error } = await supabase
    .from("invites")
    .insert({ org_role: orgRole, created_by: createdBy, invited_discord_id: invitedDiscordId })
    .select()
    .single();
  if (error) throw error;
  return data as Invite;
}

export async function getInviteByToken(token: string): Promise<Invite | null> {
  if (!supabase) return null;
  const { data } = await supabase
    .from("invites")
    .select("*")
    .eq("token", token)
    .single();
  return data as Invite | null;
}

/**
 * Marks the invite used by `discordId` and returns its role, or null.
 * Single use and race safe: the UPDATE only matches a row that is still
 * unused, unexpired and bound to this Discord user, so two concurrent
 * redemptions cannot both succeed.
 */
export async function redeemInvite(token: string, discordId: string): Promise<OrgRole | null> {
  if (!supabase) return null;
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("invites")
    .update({ used_by: discordId, used_at: now })
    .eq("token", token)
    .eq("invited_discord_id", discordId)
    .is("used_by", null)
    .gt("expires_at", now)
    .select("org_role")
    .maybeSingle();
  if (error || !data) return null;
  return (data as { org_role: OrgRole }).org_role;
}

export async function deleteInvite(id: string): Promise<void> {
  if (!supabase) return;
  await supabase.from("invites").delete().eq("id", id);
}

// ─── Availability Templates (Recurring) ─────────────────────────────────────

export type AvailabilityBlock = "available" | "unavailable" | "unset";

export type AvailabilityTemplate = {
  id:                string;
  player_discord_id: string;
  day_of_week:       number; // 0=Mon, 6=Sun
  morning:           AvailabilityBlock;
  afternoon:         AvailabilityBlock;
  evening:           AvailabilityBlock;
  updated_at:        string;
};

export type AvailabilityOverride = {
  id:                string;
  player_discord_id: string;
  override_date:     string; // YYYY-MM-DD
  morning:           AvailabilityBlock;
  afternoon:         AvailabilityBlock;
  evening:           AvailabilityBlock;
  created_at:        string;
};

/** Resolved availability for a single date. */
export type ResolvedDay = {
  date:      string; // YYYY-MM-DD
  morning:   AvailabilityBlock;
  afternoon: AvailabilityBlock;
  evening:   AvailabilityBlock;
  source:    "override" | "template" | "none";
};

export async function getTemplates(discordId: string): Promise<AvailabilityTemplate[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from("availability_templates")
    .select("*")
    .eq("player_discord_id", discordId)
    .order("day_of_week");
  return (data as AvailabilityTemplate[]) ?? [];
}

export async function saveTemplates(
  discordId: string,
  rows: { day_of_week: number; morning: AvailabilityBlock; afternoon: AvailabilityBlock; evening: AvailabilityBlock }[],
): Promise<void> {
  if (!supabase) return;
  const toUpsert = rows.map((r) =>
    pick({ player_discord_id: discordId, ...r }, AVAILABILITY_TEMPLATE_COLUMNS),
  );
  await supabase
    .from("availability_templates")
    .upsert(toUpsert, { onConflict: "player_discord_id,day_of_week" });
}

export async function getOverrides(discordId: string): Promise<AvailabilityOverride[]> {
  if (!supabase) return [];
  const today = new Date().toISOString().slice(0, 10);
  const { data } = await supabase
    .from("availability_overrides")
    .select("*")
    .eq("player_discord_id", discordId)
    .gte("override_date", today)
    .order("override_date")
    .limit(30);
  return (data as AvailabilityOverride[]) ?? [];
}

export async function upsertOverride(
  discordId: string,
  override: { override_date: string; morning: AvailabilityBlock; afternoon: AvailabilityBlock; evening: AvailabilityBlock },
): Promise<AvailabilityOverride> {
  if (!supabase) throw new Error("Supabase required");
  const { data, error } = await supabase
    .from("availability_overrides")
    .upsert(
      pick({ player_discord_id: discordId, ...override }, AVAILABILITY_OVERRIDE_COLUMNS),
      { onConflict: "player_discord_id,override_date" },
    )
    .select()
    .single();
  if (error) throw error;
  return data as AvailabilityOverride;
}

export async function deleteOverride(discordId: string, overrideDate: string): Promise<void> {
  if (!supabase) return;
  await supabase
    .from("availability_overrides")
    .delete()
    .eq("player_discord_id", discordId)
    .eq("override_date", overrideDate);
}

/**
 * Resolve availability for a player over a date range.
 * Priority: override > template > unset.
 */
export async function resolveAvailability(
  discordId: string,
  startDate: string,
  endDate: string,
): Promise<ResolvedDay[]> {
  const templates = await getTemplates(discordId);
  // Build template lookup by day_of_week
  const tplMap = new Map<number, AvailabilityTemplate>();
  for (const t of templates) tplMap.set(t.day_of_week, t);

  // Fetch overrides in range
  let overrides: AvailabilityOverride[] = [];
  if (supabase) {
    const { data } = await supabase
      .from("availability_overrides")
      .select("*")
      .eq("player_discord_id", discordId)
      .gte("override_date", startDate)
      .lte("override_date", endDate);
    overrides = (data as AvailabilityOverride[]) ?? [];
  }
  const overrideMap = new Map<string, AvailabilityOverride>();
  for (const o of overrides) overrideMap.set(o.override_date, o);

  const results: ResolvedDay[] = [];
  const cur = new Date(startDate + "T00:00:00");
  const end = new Date(endDate + "T00:00:00");

  while (cur <= end) {
    const dateStr = cur.toISOString().slice(0, 10);
    // JS getDay: 0=Sun, convert to our 0=Mon scheme
    const jsDay = cur.getDay();
    const dow = jsDay === 0 ? 6 : jsDay - 1; // 0=Mon..6=Sun

    const ovr = overrideMap.get(dateStr);
    if (ovr) {
      results.push({
        date: dateStr,
        morning: ovr.morning,
        afternoon: ovr.afternoon,
        evening: ovr.evening,
        source: "override",
      });
    } else {
      const tpl = tplMap.get(dow);
      if (tpl) {
        results.push({
          date: dateStr,
          morning: tpl.morning,
          afternoon: tpl.afternoon,
          evening: tpl.evening,
          source: "template",
        });
      } else {
        results.push({
          date: dateStr,
          morning: "unset",
          afternoon: "unset",
          evening: "unset",
          source: "none",
        });
      }
    }
    cur.setDate(cur.getDate() + 1);
  }
  return results;
}

// ─── Scrim Applications ─────────────────────────────────────────────────────

export type ScrimApplication = {
  id:                string;
  team_name:         string;
  discord_invite:    string | null;
  captain_name:      string;
  captain_discord:   string;
  region:            string;
  game:              "ow2" | "marvel_rivals" | "both";
  format:            string;
  rank_range:        string;
  preferred_days:    string[];
  preferred_blocks:  string[];
  earliest_date:     string;
  message:           string | null;
  discord_confirmed: boolean;
  status:            "pending" | "accepted" | "declined" | "scheduled";
  linked_scrim_id:   string | null;
  reviewed_by:       string | null;
  reviewed_at:       string | null;
  decline_reason:    string | null;
  submitted_at:      string;
};

export async function getScrimApplications(status?: string): Promise<ScrimApplication[]> {
  if (!supabase) return [];
  let q = supabase.from("scrim_applications").select("*").order("submitted_at", { ascending: false });
  if (status) q = q.eq("status", status);
  const { data } = await q;
  return (data as ScrimApplication[]) ?? [];
}

export async function createScrimApplication(
  app: Omit<ScrimApplication, "id" | "status" | "linked_scrim_id" | "reviewed_by" | "reviewed_at" | "decline_reason" | "submitted_at">,
): Promise<ScrimApplication> {
  if (!supabase) throw new Error("Supabase required");
  const { data, error } = await supabase
    .from("scrim_applications")
    .insert(app)
    .select()
    .single();
  if (error) throw error;
  return data as ScrimApplication;
}

export async function checkDuplicateApplication(captainDiscord: string, game: string): Promise<boolean> {
  if (!supabase) return false;
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data } = await supabase
    .from("scrim_applications")
    .select("id")
    .eq("captain_discord", captainDiscord)
    .eq("game", game)
    .in("status", ["pending", "accepted"])
    .gte("submitted_at", sevenDaysAgo)
    .limit(1);
  return (data?.length ?? 0) > 0;
}

export async function updateScrimApplication(
  id: string,
  patch: Partial<ScrimApplication>,
): Promise<ScrimApplication> {
  if (!supabase) throw new Error("Supabase required");
  const { data, error } = await supabase
    .from("scrim_applications")
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as ScrimApplication;
}

// ─── Community Teams ────────────────────────────────────────────────────────

export type CommunityTeam = {
  id:              string;
  team_name:       string;
  team_tag:        string | null;
  games:           string[];
  platforms:       string[];
  region:          string;
  discord_server:  string | null;
  referral_source: string | null;
  goals:           string[];
  about:           string | null;
  status:          "pending" | "approved" | "declined" | "active";
  submitted_at:    string;
  reviewed_by:     string | null;
  reviewed_at:     string | null;
  notes:           string | null;
  decline_reason:  string | null;
};

export type CommunityTeamPlayer = {
  id:             string;
  team_id:        string;
  is_captain:     boolean;
  ign:            string;
  discord_handle: string;
  role:           string;
  rank:           string;
  platform:       string;
  created_at:     string;
};

export async function getCommunityTeams(status?: string): Promise<CommunityTeam[]> {
  if (!supabase) return [];
  let q = supabase.from("community_teams").select("*").order("submitted_at", { ascending: false });
  if (status) q = q.eq("status", status);
  const { data } = await q;
  return (data as CommunityTeam[]) ?? [];
}

export async function getCommunityTeamPlayers(teamId: string): Promise<CommunityTeamPlayer[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from("community_team_players")
    .select("*")
    .eq("team_id", teamId)
    .order("is_captain", { ascending: false });
  return (data as CommunityTeamPlayer[]) ?? [];
}

export async function createCommunityTeam(
  team: Omit<CommunityTeam, "id" | "status" | "submitted_at" | "reviewed_by" | "reviewed_at" | "notes" | "decline_reason">,
  players: Omit<CommunityTeamPlayer, "id" | "team_id" | "created_at">[],
): Promise<CommunityTeam> {
  if (!supabase) throw new Error("Supabase required");
  const { data: teamData, error: teamErr } = await supabase
    .from("community_teams")
    .insert(team)
    .select()
    .single();
  if (teamErr) throw teamErr;
  const created = teamData as CommunityTeam;

  if (players.length > 0) {
    const playerRows = players.map((p) => ({ ...p, team_id: created.id }));
    await supabase.from("community_team_players").insert(playerRows);
  }

  return created;
}

export async function checkDuplicateCommunityTeam(captainDiscord: string, games: string[]): Promise<boolean> {
  if (!supabase) return false;
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  // Find teams where captain matches and games overlap within 30 days
  const { data: captainTeams } = await supabase
    .from("community_team_players")
    .select("team_id")
    .eq("discord_handle", captainDiscord)
    .eq("is_captain", true);

  if (!captainTeams?.length) return false;

  const teamIds = captainTeams.map((t) => t.team_id);
  const { data: recentTeams } = await supabase
    .from("community_teams")
    .select("id, games")
    .in("id", teamIds)
    .in("status", ["pending", "approved", "active"])
    .gte("submitted_at", thirtyDaysAgo);

  if (!recentTeams?.length) return false;

  // Check if any recent team has overlapping games
  for (const t of recentTeams) {
    const tGames = (t.games as string[]) ?? [];
    if (games.some((g) => tGames.includes(g))) return true;
  }
  return false;
}

export async function updateCommunityTeam(
  id: string,
  patch: Partial<CommunityTeam>,
): Promise<CommunityTeam> {
  if (!supabase) throw new Error("Supabase required");
  const { data, error } = await supabase
    .from("community_teams")
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as CommunityTeam;
}

// ─── Stats Overrides ─────────────────────────────────────────────────────────

export async function getStatsOverride(discordId: string): Promise<{
  mr_username: string | null;
  use_override: boolean;
  rank_name: string | null;
  win_rate: number | null;
  kda: number | null;
  matches: number | null;
  top_heroes: { name: string; role: string; matchesPlayed: number; winRate: number; kda: number }[];
} | null> {
  if (!supabase) return null;
  try {
    const { data } = await supabase
      .from("player_stats_override")
      .select("*")
      .eq("discord_id", discordId)
      .single();
    return data ?? null;
  } catch {
    return null; // Table might not exist yet
  }
}

export async function upsertStatsOverride(
  discordId: string,
  override: Record<string, unknown>,
): Promise<void> {
  if (!supabase) return;
  try {
    await supabase
      .from("player_stats_override")
      .upsert({ discord_id: discordId, ...override, updated_at: new Date().toISOString() }, { onConflict: "discord_id" });
  } catch {
    // Table might not exist
  }
}

// ── Lineups ───────────────────────────────────────────────────────────────

export type LineupSlot = {
  player_discord_id: string;
  role: string;
  hero?: string | null;
};

export type Lineup = {
  id:           string;
  scrim_id:     string;
  status:       "draft" | "submitted" | "approved";
  slots:        LineupSlot[];
  notes:        string | null;
  submitted_by: string;
  submitted_at: string;
  approved_by:  string | null;
  approved_at:  string | null;
  updated_at:   string;
};

export async function getLineupForScrim(scrimId: string): Promise<Lineup | null> {
  if (!supabase) return null;
  const { data } = await supabase
    .from("lineups")
    .select("*")
    .eq("scrim_id", scrimId)
    .maybeSingle();
  return (data as Lineup | null) ?? null;
}

export async function upsertLineup(
  lineup: Omit<Lineup, "id" | "submitted_at" | "updated_at" | "approved_by" | "approved_at"> & {
    id?: string;
  },
): Promise<Lineup> {
  if (!supabase) throw new Error("Supabase required for lineups");
  const payload = { ...lineup, updated_at: new Date().toISOString() };
  const { data, error } = await supabase
    .from("lineups")
    .upsert(payload, { onConflict: "scrim_id" })
    .select()
    .single();
  if (error) throw error;
  return data as Lineup;
}

export async function approveLineup(id: string, approvedBy: string): Promise<Lineup> {
  if (!supabase) throw new Error("Supabase required for lineups");
  const { data, error } = await supabase
    .from("lineups")
    .update({
      status: "approved",
      approved_by: approvedBy,
      approved_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Lineup;
}
