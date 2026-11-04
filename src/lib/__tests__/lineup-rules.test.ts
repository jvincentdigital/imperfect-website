import { describe, it, expect } from "vitest";
import {
  rolesForGame,
  slotCountForGame,
  expectedSlotRoles,
  isValidRole,
} from "@/lib/lineup-rules";

describe("lineup rules", () => {
  it("OW2 is 5v5 role queue: 1 tank, 2 dps, 2 support", () => {
    expect(slotCountForGame("OW2")).toBe(5);
    expect(expectedSlotRoles("OW2")).toEqual(["tank", "dps", "dps", "support", "support"]);
  });

  it("MR is 6v6: 1 vanguard, 2 duelists, 2 strategists, 1 flex", () => {
    expect(slotCountForGame("MR")).toBe(6);
    expect(expectedSlotRoles("MR")).toEqual([
      "vanguard", "duelist", "duelist", "strategist", "strategist", "flex",
    ]);
  });

  it("slot count always matches the expanded slot list", () => {
    for (const game of ["OW2", "MR"] as const) {
      expect(expectedSlotRoles(game)).toHaveLength(slotCountForGame(game));
    }
  });

  it("role keys are unique per game", () => {
    for (const game of ["OW2", "MR"] as const) {
      const keys = rolesForGame(game).map((r) => r.key);
      expect(new Set(keys).size).toBe(keys.length);
    }
  });

  it("isValidRole accepts only the game's own roles", () => {
    expect(isValidRole("OW2", "tank")).toBe(true);
    expect(isValidRole("OW2", "vanguard")).toBe(false);
    expect(isValidRole("MR", "flex")).toBe(true);
    expect(isValidRole("MR", "dps")).toBe(false);
  });

  it("isValidRole is case sensitive and rejects empty input", () => {
    expect(isValidRole("OW2", "Tank")).toBe(false);
    expect(isValidRole("MR", "")).toBe(false);
  });
});
