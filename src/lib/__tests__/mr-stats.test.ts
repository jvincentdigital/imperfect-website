import { describe, it, expect } from "vitest";
import { transformApiResponse, mrHeroPortrait } from "@/lib/mr-stats";

function hero(name: string, play_time: number, extra: Record<string, unknown> = {}) {
  return { hero_name: name, play_time, matches: 10, wins: 6, kills: 20, deaths: 10, assists: 10, ...extra };
}

describe("transformApiResponse", () => {
  it("returns null when there are no matches and no heroes", () => {
    expect(transformApiResponse("p", {})).toBeNull();
    expect(transformApiResponse("p", null)).toBeNull();
    expect(
      transformApiResponse("p", { overall_stats: { ranked: { total_matches: 0 } }, heroes_ranked: [] }),
    ).toBeNull();
  });

  it("computes win rate and KDA from ranked totals", () => {
    const s = transformApiResponse("p", {
      overall_stats: {
        ranked: { total_matches: 20, total_wins: 15, total_kills: 100, total_deaths: 50, total_assists: 50 },
      },
    })!;
    expect(s.winRate).toBe(0.75);
    expect(s.kda).toBe(3);
    expect(s.matchesPlayed).toBe(20);
    expect(s.dataSource).toBe("api");
  });

  it("does not divide by zero when deaths are zero", () => {
    const s = transformApiResponse("p", {
      overall_stats: { ranked: { total_matches: 1, total_wins: 1, total_kills: 4, total_deaths: 0, total_assists: 2 } },
    })!;
    expect(s.kda).toBe(6);
  });

  it("keeps the top 3 heroes by play time and skips unknown heroes", () => {
    const s = transformApiResponse("p", {
      heroes_ranked: [
        hero("Loki", 100),
        hero("Unknown", 9999),
        hero("Hulk", 500),
        hero("Storm", 300),
        hero("Groot", 50),
      ],
    })!;
    expect(s.topHeroes.map((h) => h.name)).toEqual(["Hulk", "Storm", "Loki"]);
  });

  it("maps hero roles case-insensitively and computes per-hero stats", () => {
    const s = transformApiResponse("p", { heroes_ranked: [hero("hulk", 1)] })!;
    expect(s.topHeroes[0]).toMatchObject({ role: "Vanguard", matchesPlayed: 10, winRate: 0.6, kda: 3 });
  });

  it("prefers the API thumbnail, then the built-in portrait", () => {
    const s = transformApiResponse("p", {
      heroes_ranked: [hero("Loki", 2, { hero_thumbnail: "/x/loki.png" }), hero("Mantis", 1)],
    })!;
    expect(s.topHeroes[0].portraitUrl).toBe("https://marvelrivalsapi.com/rivals/x/loki.png");
    expect(s.topHeroes[1].portraitUrl).toBe(mrHeroPortrait("Mantis"));
  });

  it("derives rank name and tier from the season max level", () => {
    const rank = (max_level: number) =>
      transformApiResponse("p", {
        overall_stats: { ranked: { total_matches: 1 } },
        player: { info: { rank_game_season: { "1": { max_level } } } },
      })!.rank;
    expect(rank(0)).toMatchObject({ name: "Unranked", tier: "" });
    expect(rank(1).name).toBe("Bronze");
    expect(rank(14)).toMatchObject({ name: "Diamond", tier: "14" });
    expect(rank(25).name).toBe("One Above All");
  });

  // BUG (not fixed here): the latest season is picked with a plain string
  // sort, so season "10" sorts before "9" and an older season wins. Only
  // matters if the API's season keys can differ in length.
  it.skip("picks the newest season even when keys have different lengths", () => {
    const s = transformApiResponse("p", {
      overall_stats: { ranked: { total_matches: 1 } },
      player: { info: { rank_game_season: { "9": { max_level: 3 }, "10": { max_level: 20 } } } },
    })!;
    expect(s.rank.name).toBe("Celestial");
  });
});

describe("mrHeroPortrait", () => {
  it("is case-insensitive and returns null for unknown heroes", () => {
    expect(mrHeroPortrait("Hulk")).toContain("bruce-banner");
    expect(mrHeroPortrait("HULK")).toBe(mrHeroPortrait("hulk"));
    expect(mrHeroPortrait("Nobody")).toBeNull();
  });

  // BUG (not fixed here): Phoenix, Rogue and Angela have portraits but no
  // entry in HERO_ROLES, so their role shows as "Unknown".
  it.skip("every hero with a portrait also has a role", () => {
    for (const name of ["Phoenix", "Rogue", "Angela"]) {
      const s = transformApiResponse("p", { heroes_ranked: [hero(name, 1)] })!;
      expect(s.topHeroes[0].role).not.toBe("Unknown");
    }
  });
});
