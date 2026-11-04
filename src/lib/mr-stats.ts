// ---------------------------------------------------------------------------
// Marvel Rivals player stats — types & helpers
// ---------------------------------------------------------------------------

export type HeroStat = {
  name: string;
  role: "Vanguard" | "Duelist" | "Strategist" | string;
  matchesPlayed: number;
  winRate: number; // 0.0-1.0
  kda: number;
  portraitUrl: string | null;
};

export type PlayerStats = {
  username: string;
  rank: { name: string; tier: string; iconUrl: string | null };
  winRate: number; // 0.0-1.0
  kda: number;
  matchesPlayed: number;
  topHeroes: HeroStat[]; // top 3
  dataSource: "api" | "manual" | "cached";
  lastUpdated: string; // ISO timestamp
};

// ---------------------------------------------------------------------------
// Hero role mapping
// ---------------------------------------------------------------------------

const HERO_ROLES: Record<string, "Vanguard" | "Duelist" | "Strategist"> = {
  // Vanguard
  magneto: "Vanguard",
  thor: "Vanguard",
  "captain america": "Vanguard",
  hulk: "Vanguard",
  "doctor strange": "Vanguard",
  venom: "Vanguard",
  groot: "Vanguard",
  "peni parker": "Vanguard",
  "emma frost": "Vanguard",
  "the thing": "Vanguard",
  ultron: "Vanguard",
  angela: "Vanguard",
  rogue: "Vanguard",

  // Duelist
  "spider-man": "Duelist",
  "black panther": "Duelist",
  wolverine: "Duelist",
  hawkeye: "Duelist",
  "star-lord": "Duelist",
  "the punisher": "Duelist",
  "black widow": "Duelist",
  "iron man": "Duelist",
  "human torch": "Duelist",
  psylocke: "Duelist",
  "winter soldier": "Duelist",
  namor: "Duelist",
  "moon knight": "Duelist",
  "scarlet witch": "Duelist",
  "iron fist": "Duelist",
  "squirrel girl": "Duelist",
  blade: "Duelist",
  "mister fantastic": "Duelist",
  magik: "Duelist",
  hela: "Duelist",
  storm: "Duelist",
  "captain marvel": "Duelist",
  "the hood": "Duelist",
  "white fox": "Duelist",
  daredevil: "Duelist",
  gambit: "Duelist",
  "black bolt": "Duelist",
  "mr. negative": "Duelist",
  taskmaster: "Duelist",
  phoenix: "Duelist",

  // Strategist
  mantis: "Strategist",
  "luna snow": "Strategist",
  loki: "Strategist",
  "adam warlock": "Strategist",
  "cloak & dagger": "Strategist",
  "rocket raccoon": "Strategist",
  "jeff the land shark": "Strategist",
  "invisible woman": "Strategist",
};

function heroRole(name: string): "Vanguard" | "Duelist" | "Strategist" | string {
  return HERO_ROLES[name.toLowerCase()] ?? "Unknown";
}

// Hero name → square headshot icon (344x344 webp from marvelrivalsapi.com)
const MR_HERO_ICON: Record<string, string> = {
  "hulk": "https://marvelrivalsapi.com/rivals/heroes/transformations/bruce-banner-headbig-0.webp",
  "the punisher": "https://marvelrivalsapi.com/rivals/heroes/transformations/the-punisher-headbig-0.webp",
  "storm": "https://marvelrivalsapi.com/rivals/heroes/transformations/storm-headbig-0.webp",
  "loki": "https://marvelrivalsapi.com/rivals/heroes/transformations/loki-headbig-0.webp",
  "human torch": "https://marvelrivalsapi.com/rivals/heroes/transformations/human-torch-headbig-0.webp",
  "doctor strange": "https://marvelrivalsapi.com/rivals/heroes/transformations/doctor-strange-headbig-0.webp",
  "mantis": "https://marvelrivalsapi.com/rivals/heroes/transformations/mantis-headbig-0.webp",
  "hawkeye": "https://marvelrivalsapi.com/rivals/heroes/transformations/hawkeye-headbig-0.webp",
  "captain america": "https://marvelrivalsapi.com/rivals/heroes/transformations/captain-america-headbig-0.webp",
  "rocket raccoon": "https://marvelrivalsapi.com/rivals/heroes/transformations/rocket-raccoon-headbig-0.webp",
  "hela": "https://marvelrivalsapi.com/rivals/heroes/transformations/hela-headbig-0.webp",
  "cloak & dagger": "https://marvelrivalsapi.com/rivals/heroes/transformations/cloak-dagger-headbig-0.webp",
  "black panther": "https://marvelrivalsapi.com/rivals/heroes/transformations/black-panther-headbig-0.webp",
  "groot": "https://marvelrivalsapi.com/rivals/heroes/transformations/groot-headbig-0.webp",
  "ultron": "https://marvelrivalsapi.com/rivals/heroes/transformations/ultron-headbig-0.webp",
  "magik": "https://marvelrivalsapi.com/rivals/heroes/transformations/magik-headbig-0.webp",
  "moon knight": "https://marvelrivalsapi.com/rivals/heroes/transformations/moon-knight-headbig-0.webp",
  "luna snow": "https://marvelrivalsapi.com/rivals/heroes/transformations/luna-snow-headbig-0.webp",
  "squirrel girl": "https://marvelrivalsapi.com/rivals/heroes/transformations/squirrel-girl-headbig-0.webp",
  "black widow": "https://marvelrivalsapi.com/rivals/heroes/transformations/black-widow-headbig-0.webp",
  "iron man": "https://marvelrivalsapi.com/rivals/heroes/transformations/iron-man-headbig-0.webp",
  "venom": "https://marvelrivalsapi.com/rivals/heroes/transformations/venom-headbig-0.webp",
  "spider-man": "https://marvelrivalsapi.com/rivals/heroes/transformations/spider-man-headbig-0.webp",
  "magneto": "https://marvelrivalsapi.com/rivals/heroes/transformations/magneto-headbig-0.webp",
  "scarlet witch": "https://marvelrivalsapi.com/rivals/heroes/transformations/scarlet-witch-headbig-0.webp",
  "thor": "https://marvelrivalsapi.com/rivals/heroes/transformations/thor-headbig-0.webp",
  "mister fantastic": "https://marvelrivalsapi.com/rivals/heroes/transformations/mister-fantastic-headbig-0.webp",
  "winter soldier": "https://marvelrivalsapi.com/rivals/heroes/transformations/winter-soldier-headbig-0.webp",
  "peni parker": "https://marvelrivalsapi.com/rivals/heroes/transformations/peni-parker-headbig-0.webp",
  "star-lord": "https://marvelrivalsapi.com/rivals/heroes/transformations/star-lord-headbig-0.webp",
  "namor": "https://marvelrivalsapi.com/rivals/heroes/transformations/namor-headbig-0.webp",
  "adam warlock": "https://marvelrivalsapi.com/rivals/heroes/transformations/adam-warlock-headbig-0.webp",
  "jeff the land shark": "https://marvelrivalsapi.com/rivals/heroes/transformations/jeff-the-land-shark-headbig-0.webp",
  "psylocke": "https://marvelrivalsapi.com/rivals/heroes/transformations/psylocke-headbig-0.webp",
  "wolverine": "https://marvelrivalsapi.com/rivals/heroes/transformations/wolverine-headbig-0.webp",
  "invisible woman": "https://marvelrivalsapi.com/rivals/heroes/transformations/invisible-woman-headbig-0.webp",
  "the thing": "https://marvelrivalsapi.com/rivals/heroes/transformations/the-thing-headbig-0.webp",
  "iron fist": "https://marvelrivalsapi.com/rivals/heroes/transformations/iron-fist-headbig-0.webp",
  "emma frost": "https://marvelrivalsapi.com/rivals/heroes/transformations/emma-frost-headbig-0.webp",
  "phoenix": "https://marvelrivalsapi.com/rivals/heroes/transformations/phoenix-headbig-0.webp",
  "blade": "https://marvelrivalsapi.com/rivals/heroes/transformations/blade-headbig-0.webp",
  "captain marvel": "https://marvelrivalsapi.com/rivals/heroes/transformations/captain-marvel-headbig-0.webp",
  "the hood": "https://marvelrivalsapi.com/rivals/heroes/transformations/the-hood-headbig-0.webp",
  "white fox": "https://marvelrivalsapi.com/rivals/heroes/transformations/white-fox-headbig-0.webp",
  "daredevil": "https://marvelrivalsapi.com/rivals/heroes/transformations/daredevil-headbig-0.webp",
  "gambit": "https://marvelrivalsapi.com/rivals/heroes/transformations/gambit-headbig-0.webp",
  "black bolt": "https://marvelrivalsapi.com/rivals/heroes/transformations/black-bolt-headbig-0.webp",
  "mr. negative": "https://marvelrivalsapi.com/rivals/heroes/transformations/mr-negative-headbig-0.webp",
  "taskmaster": "https://marvelrivalsapi.com/rivals/heroes/transformations/taskmaster-headbig-0.webp",
  "rogue": "https://marvelrivalsapi.com/rivals/heroes/transformations/rogue-headbig-0.webp",
  "angela": "https://marvelrivalsapi.com/rivals/heroes/transformations/angela-headbig-0.webp",
};

/** Get the square headshot icon URL for a Marvel Rivals hero. */
export function mrHeroPortrait(heroName: string): string | null {
  return MR_HERO_ICON[heroName.toLowerCase()] ?? null;
}

function rankFromLevel(level: number): string {
  if (level >= 25) return "One Above All";
  if (level >= 21) return "Eternity";
  if (level >= 18) return "Celestial";
  if (level >= 15) return "Grandmaster";
  if (level >= 12) return "Diamond";
  if (level >= 9) return "Platinum";
  if (level >= 6) return "Gold";
  if (level >= 3) return "Silver";
  if (level >= 1) return "Bronze";
  return "Unranked";
}

// ---------------------------------------------------------------------------
// Transform raw API response -> PlayerStats
// ---------------------------------------------------------------------------

export function transformApiResponse(
  username: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any,
): PlayerStats | null {
  const ranked = data?.overall_stats?.ranked;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const heroes: any[] = data?.heroes_ranked ?? [];

  // Treat empty data as "no stats available"
  const totalMatches = ranked?.total_matches ?? 0;
  if (totalMatches === 0 && heroes.length === 0) return null;

  const totalWins = ranked?.total_wins ?? 0;
  const totalKills = ranked?.total_kills ?? 0;
  const totalDeaths = ranked?.total_deaths ?? 0;
  const totalAssists = ranked?.total_assists ?? 0;

  const winRate = totalMatches > 0 ? totalWins / totalMatches : 0;
  const kda = (totalKills + totalAssists) / Math.max(totalDeaths, 1);

  // Rank info — decode from season data since rankData.rank is often "Invalid level"
  const rankData = data?.player?.rank;
  const seasons = data?.player?.info?.rank_game_season ?? {};
  const latestSeason = Object.keys(seasons)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .pop();
  const seasonData = latestSeason ? seasons[latestSeason] : null;
  const maxLevel = seasonData?.max_level ?? 0;

  const rank = {
    name: rankFromLevel(maxLevel),
    tier: maxLevel > 0 ? String(maxLevel) : "",
    iconUrl: rankData?.image ?? null,
  };

  // Top 3 heroes by play_time — skip heroes the API can't identify yet
  const sorted = [...heroes]
    .filter((h) => h.hero_name && h.hero_name !== "Unknown")
    .sort((a, b) => (b.play_time ?? 0) - (a.play_time ?? 0));

  const topHeroes: HeroStat[] = sorted.slice(0, 3).map((h) => {
    const heroMatches = h.matches ?? 0;
    const heroWins = h.wins ?? 0;
    const heroKills = h.kills ?? 0;
    const heroDeaths = h.deaths ?? 0;
    const heroAssists = h.assists ?? 0;

    return {
      name: h.hero_name ?? "Unknown",
      role: heroRole(h.hero_name ?? ""),
      matchesPlayed: heroMatches,
      winRate: heroMatches > 0 ? heroWins / heroMatches : 0,
      kda: (heroKills + heroAssists) / Math.max(heroDeaths, 1),
      portraitUrl: h.hero_thumbnail
        ? `https://marvelrivalsapi.com/rivals${h.hero_thumbnail}`
        : mrHeroPortrait(h.hero_name ?? ""),
    };
  });

  return {
    username,
    rank,
    winRate,
    kda,
    matchesPlayed: totalMatches,
    topHeroes,
    dataSource: "api",
    lastUpdated: new Date().toISOString(),
  };
}
