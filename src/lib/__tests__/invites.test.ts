import { describe, it, expect, vi } from "vitest";
import { checkSignIn, isInviteRedeemableBy, isValidDiscordId } from "@/lib/invites";
import type { Invite } from "@/lib/db";

const ALICE = "111111111111111111";
const MALLORY = "222222222222222222";
const future = new Date(Date.now() + 86_400_000).toISOString();
const past = new Date(Date.now() - 86_400_000).toISOString();

function invite(over: Partial<Invite> = {}): Invite {
  return {
    id: "inv1",
    token: "tok",
    org_role: "PLAYER",
    created_by: "owner",
    invited_discord_id: ALICE,
    used_by: null,
    used_at: null,
    expires_at: future,
    created_at: new Date().toISOString(),
    ...over,
  };
}

describe("isValidDiscordId", () => {
  it("accepts 17-20 digit snowflakes", () => {
    expect(isValidDiscordId("12345678901234567")).toBe(true);
    expect(isValidDiscordId(ALICE)).toBe(true);
    expect(isValidDiscordId("12345678901234567890")).toBe(true);
  });
  it("rejects usernames, short/long ids and non-strings", () => {
    for (const v of ["alice", "1234", "123456789012345678901", "1234567890123456a", "", null, 123]) {
      expect(isValidDiscordId(v)).toBe(false);
    }
  });
});

describe("isInviteRedeemableBy", () => {
  it("allows the invited user on an unused, unexpired invite", () => {
    expect(isInviteRedeemableBy(invite(), ALICE)).toBe(true);
  });
  it("rejects anyone else holding the link", () => {
    expect(isInviteRedeemableBy(invite(), MALLORY)).toBe(false);
  });
  it("rejects old invites with no bound user", () => {
    expect(isInviteRedeemableBy(invite({ invited_discord_id: null }), ALICE)).toBe(false);
  });
  it("rejects used invites (single use)", () => {
    expect(isInviteRedeemableBy(invite({ used_by: ALICE }), ALICE)).toBe(false);
  });
  it("rejects expired invites", () => {
    expect(isInviteRedeemableBy(invite({ expires_at: past }), ALICE)).toBe(false);
  });
  it("rejects a missing invite or empty id", () => {
    expect(isInviteRedeemableBy(null, ALICE)).toBe(false);
    expect(isInviteRedeemableBy(invite(), "")).toBe(false);
  });
});

describe("checkSignIn", () => {
  const DENIED = "/team-hub?error=not_approved";

  function deps(over: Partial<Parameters<typeof checkSignIn>[2]> = {}) {
    return {
      ownerDiscordId: "999999999999999999",
      approvedIds: [] as string[],
      getPlayerByDiscordId: vi.fn().mockResolvedValue(null),
      getInviteByToken: vi.fn().mockResolvedValue(invite()),
      ...over,
    };
  }

  it("denies a missing Discord id", async () => {
    expect(await checkSignIn(undefined, "tok", deps())).toBe(DENIED);
  });

  it("lets the owner in without a DB lookup", async () => {
    const d = deps();
    expect(await checkSignIn("999999999999999999", null, d)).toBe(true);
    expect(d.getPlayerByDiscordId).not.toHaveBeenCalled();
  });

  it("lets existing players in", async () => {
    const d = deps({ getPlayerByDiscordId: vi.fn().mockResolvedValue({ discord_id: MALLORY }) });
    expect(await checkSignIn(MALLORY, null, d)).toBe(true);
  });

  it("lets the invited user in while redeeming their invite", async () => {
    const d = deps();
    expect(await checkSignIn(ALICE, "tok", d)).toBe(true);
    expect(d.getInviteByToken).toHaveBeenCalledWith("tok");
  });

  it("denies a different user following the same open invite link", async () => {
    expect(await checkSignIn(MALLORY, "tok", deps())).toBe(DENIED);
  });

  it("denies a stranger with no invite token even while invites are open", async () => {
    expect(await checkSignIn(MALLORY, null, deps())).toBe(DENIED);
  });

  it("denies used and expired invites", async () => {
    expect(await checkSignIn(ALICE, "tok", deps({
      getInviteByToken: vi.fn().mockResolvedValue(invite({ used_by: ALICE })),
    }))).toBe(DENIED);
    expect(await checkSignIn(ALICE, "tok", deps({
      getInviteByToken: vi.fn().mockResolvedValue(invite({ expires_at: past })),
    }))).toBe(DENIED);
  });

  it("on DB failure, allows only the env allowlist (empty list = nobody)", async () => {
    const broken = vi.fn().mockRejectedValue(new Error("db down"));
    expect(await checkSignIn(ALICE, null, deps({ getPlayerByDiscordId: broken }))).toBe(DENIED);
    expect(await checkSignIn(ALICE, null, deps({ getPlayerByDiscordId: broken, approvedIds: [ALICE] }))).toBe(true);
  });
});
