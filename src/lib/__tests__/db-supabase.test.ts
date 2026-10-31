import { describe, it, expect, vi, beforeEach } from "vitest";
import { fake, opsOf } from "./helpers/fake-supabase";

// Supabase path with a fake client: asserts the exact queries, no live DB.
vi.mock("@/lib/supabase", async () => {
  const { fake } = await import("./helpers/fake-supabase");
  return { supabase: fake.client };
});

import {
  createInvite,
  getInviteByToken,
  getInvites,
  redeemInvite,
  deleteInvite,
  getPlayerByDiscordId,
  upsertPlayer,
} from "@/lib/db";

const ALICE = "111111111111111111";

beforeEach(() => fake.reset());

describe("db invites (Supabase path)", () => {
  it("createInvite stores the bound Discord id", async () => {
    fake.respond({ id: "inv1", token: "t", org_role: "PLAYER", invited_discord_id: ALICE });
    const inv = await createInvite("PLAYER", "owner", ALICE);
    expect(inv.invited_discord_id).toBe(ALICE);
    const q = fake.queries[0];
    expect(q.table).toBe("invites");
    expect(opsOf(q, "insert")[0][0]).toEqual({
      org_role: "PLAYER",
      created_by: "owner",
      invited_discord_id: ALICE,
    });
  });

  it("createInvite throws on a DB error", async () => {
    fake.respond(null, { message: "boom" });
    await expect(createInvite("PLAYER", "owner", ALICE)).rejects.toEqual({ message: "boom" });
  });

  it("redeemInvite claims atomically: token + bound user + unused + unexpired", async () => {
    fake.respond({ org_role: "CAPTAIN" });
    expect(await redeemInvite("tok", ALICE)).toBe("CAPTAIN");
    const q = fake.queries[0];
    expect(fake.queries).toHaveLength(1); // one UPDATE, no read-then-write race
    expect(opsOf(q, "update")[0][0]).toMatchObject({ used_by: ALICE });
    expect(opsOf(q, "eq")).toEqual([["token", "tok"], ["invited_discord_id", ALICE]]);
    expect(opsOf(q, "is")).toEqual([["used_by", null]]);
    expect(opsOf(q, "gt")[0][0]).toBe("expires_at");
    expect(q.ops.at(-1)?.[0]).toBe("maybeSingle");
  });

  it("redeemInvite returns null when no row matched (used, expired, wrong user)", async () => {
    fake.respond(null);
    expect(await redeemInvite("tok", ALICE)).toBeNull();
  });

  it("redeemInvite returns null on a DB error", async () => {
    fake.respond(null, { message: "boom" });
    expect(await redeemInvite("tok", ALICE)).toBeNull();
  });

  it("getInviteByToken filters by token", async () => {
    fake.respond({ id: "inv1", token: "tok" });
    expect(await getInviteByToken("tok")).toMatchObject({ token: "tok" });
    expect(opsOf(fake.queries[0], "eq")).toEqual([["token", "tok"]]);
  });

  it("getInvites returns [] when the query returns null", async () => {
    fake.respond(null);
    expect(await getInvites()).toEqual([]);
  });

  it("deleteInvite deletes by id", async () => {
    await deleteInvite("inv1");
    expect(opsOf(fake.queries[0], "delete")).toHaveLength(1);
    expect(opsOf(fake.queries[0], "eq")).toEqual([["id", "inv1"]]);
  });
});

describe("db players (Supabase path)", () => {
  it("getPlayerByDiscordId queries players by discord_id", async () => {
    fake.respond({ discord_id: ALICE });
    expect(await getPlayerByDiscordId(ALICE)).toEqual({ discord_id: ALICE });
    expect(fake.queries[0].table).toBe("players");
    expect(opsOf(fake.queries[0], "eq")).toEqual([["discord_id", ALICE]]);
  });

  it("upsertPlayer strips non-allowlisted columns (mass-assignment guard)", async () => {
    await upsertPlayer({
      discord_id: ALICE,
      display_name: "Alice",
      ...({ id: "evil", created_at: "x" } as object),
    });
    const [payload, opts] = opsOf(fake.queries[0], "upsert")[0];
    expect(payload).toEqual({ discord_id: ALICE, display_name: "Alice" });
    expect(opts).toEqual({ onConflict: "discord_id" });
  });
});
