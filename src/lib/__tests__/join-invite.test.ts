import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ReactElement } from "react";

// Integration test for /team-hub/join/[token]: the page, the invite rules and
// the call order into the data layer (mocked; no live DB).
const ALICE = "111111111111111111";
const MALLORY = "222222222222222222";

const mockAuth = vi.fn();
vi.mock("@/auth", () => ({ auth: () => mockAuth() }));

class RedirectError extends Error {}
const mockRedirect = vi.fn((to: string) => {
  throw new RedirectError(to);
});
vi.mock("next/navigation", () => ({ redirect: (to: string) => mockRedirect(to) }));

const calls: string[] = [];
const mockGetInviteByToken = vi.fn();
const mockRedeemInvite = vi.fn();
const mockUpsertPlayer = vi.fn<(p: unknown) => Promise<void>>(async () => { calls.push("upsert"); });
const mockAppendAuditLog = vi.fn<(e: unknown) => Promise<void>>(async () => {});
vi.mock("@/lib/db", () => ({
  getInviteByToken: (t: string) => mockGetInviteByToken(t),
  redeemInvite: async (t: string, id: string) => { calls.push("redeem"); return mockRedeemInvite(t, id); },
  upsertPlayer: (p: unknown) => mockUpsertPlayer(p),
  appendAuditLog: (e: unknown) => mockAppendAuditLog(e),
}));

const future = new Date(Date.now() + 86_400_000).toISOString();

function openInvite(over: Record<string, unknown> = {}) {
  return { id: "inv1", token: "tok", org_role: "CAPTAIN", created_by: "owner", invited_discord_id: ALICE, used_by: null, expires_at: future, ...over };
}

async function visit(discordId: string | null) {
  mockAuth.mockResolvedValue(discordId ? { user: { discordId, name: "n" } } : null);
  const { default: JoinPage } = await import("@/app/team-hub/join/[token]/page");
  try {
    return (await JoinPage({ params: Promise.resolve({ token: "tok" }) })) as ReactElement<{ message?: string }>;
  } catch (e) {
    if (e instanceof RedirectError) return { redirect: e.message };
    throw e;
  }
}

beforeEach(() => {
  vi.clearAllMocks();
  calls.length = 0;
});

describe("join page invite redemption", () => {
  it("redeems for the invited user, claiming before creating the player", async () => {
    mockGetInviteByToken.mockResolvedValue(openInvite());
    mockRedeemInvite.mockResolvedValue("CAPTAIN");
    expect(await visit(ALICE)).toEqual({ redirect: "/team-hub/dashboard" });
    expect(calls).toEqual(["redeem", "upsert"]);
    expect(mockRedeemInvite).toHaveBeenCalledWith("tok", ALICE);
    expect(mockUpsertPlayer).toHaveBeenCalledWith(expect.objectContaining({ discord_id: ALICE, org_role: "CAPTAIN" }));
  });

  it("refuses a different Discord user and never touches the DB", async () => {
    mockGetInviteByToken.mockResolvedValue(openInvite());
    const page = await visit(MALLORY);
    expect((page as ReactElement<{ message: string }>).props.message).toMatch(/different Discord account/);
    expect(mockRedeemInvite).not.toHaveBeenCalled();
    expect(mockUpsertPlayer).not.toHaveBeenCalled();
  });

  it("refuses an old unbound invite", async () => {
    mockGetInviteByToken.mockResolvedValue(openInvite({ invited_discord_id: null }));
    await visit(ALICE);
    expect(mockUpsertPlayer).not.toHaveBeenCalled();
  });

  it("does not create a player when the atomic claim loses (already used)", async () => {
    mockGetInviteByToken.mockResolvedValue(openInvite());
    mockRedeemInvite.mockResolvedValue(null);
    const page = await visit(ALICE);
    expect((page as ReactElement<{ message: string }>).props.message).toMatch(/already been used/);
    expect(mockUpsertPlayer).not.toHaveBeenCalled();
  });

  it("refuses used and expired invites", async () => {
    mockGetInviteByToken.mockResolvedValue(openInvite({ used_by: ALICE }));
    await visit(ALICE);
    mockGetInviteByToken.mockResolvedValue(openInvite({ expires_at: new Date(0).toISOString() }));
    await visit(ALICE);
    expect(mockRedeemInvite).not.toHaveBeenCalled();
  });

  it("sends signed-out visitors to sign in", async () => {
    expect(await visit(null)).toEqual({ redirect: "/team-hub?next=/team-hub/join/tok" });
  });
});
