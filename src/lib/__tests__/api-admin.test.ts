import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// ── Mocks ──────────────────────────────────────────────────────────────────

const mockAuth = vi.fn();
vi.mock("@/auth", () => ({ auth: () => mockAuth() }));

const mockGetAllPlayers = vi.fn();
const mockUpdatePlayerRole = vi.fn();
const mockAppendAuditLog = vi.fn();
const mockGetInvites = vi.fn();
const mockCreateInvite = vi.fn();
const mockGetAuditLog = vi.fn();
vi.mock("@/lib/db", () => ({
  getAllPlayers: (...a: unknown[]) => mockGetAllPlayers(...a),
  updatePlayerRole: (...a: unknown[]) => mockUpdatePlayerRole(...a),
  appendAuditLog: (e: unknown) => mockAppendAuditLog(e),
  getInvites: () => mockGetInvites(),
  createInvite: (...a: unknown[]) => mockCreateInvite(...a),
  getAuditLog: (l: unknown) => mockGetAuditLog(l),
}));

vi.mock("@/lib/csrf", () => ({
  verifyCsrfOrigin: () => true,
}));

// ── Helpers ────────────────────────────────────────────────────────────────

function makeSession(discordId: string, orgRole?: string) {
  return { user: { discordId, orgRole } };
}

function ownerSession() {
  return makeSession("owner123", "OWNER");
}

function playerSession() {
  return makeSession("player1", "PLAYER");
}

function getReq(url: string, params?: Record<string, string>) {
  const u = new URL(url, "http://localhost");
  if (params) Object.entries(params).forEach(([k, v]) => u.searchParams.set(k, v));
  return new NextRequest(u.toString(), {
    headers: { host: "localhost", origin: "http://localhost" },
  });
}

function mutReq(url: string, method: string, body: unknown) {
  return new NextRequest(new URL(url, "http://localhost").toString(), {
    method,
    body: JSON.stringify(body),
    headers: {
      "content-type": "application/json",
      host: "localhost",
      origin: "http://localhost",
    },
  });
}

// ── Tests: GET /api/admin/users ───────────────────────────────────────────

describe("GET /api/admin/users", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    process.env.OWNER_DISCORD_ID = "owner123";
  });

  it("returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const { GET } = await import("@/app/api/admin/users/route");
    const res = await GET();
    expect(res.status).toBe(401);
    expect(await res.json()).toMatchObject({ error: "Unauthorized" });
  });

  it("returns 403 when user is PLAYER (no manageRoles)", async () => {
    mockAuth.mockResolvedValue(playerSession());
    const { GET } = await import("@/app/api/admin/users/route");
    const res = await GET();
    expect(res.status).toBe(403);
  });

  it("returns 200 with players array when OWNER", async () => {
    mockAuth.mockResolvedValue(ownerSession());
    mockGetAllPlayers.mockResolvedValue([
      { discord_id: "p1", display_name: "Player1", org_role: "PLAYER" },
    ]);
    const { GET } = await import("@/app/api/admin/users/route");
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body[0].discord_id).toBe("p1");
    expect(mockGetAllPlayers).toHaveBeenCalledWith(true);
  });
});

// ── Tests: PATCH /api/admin/users ─────────────────────────────────────────

describe("PATCH /api/admin/users", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    process.env.OWNER_DISCORD_ID = "owner123";
  });

  it("returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const { PATCH } = await import("@/app/api/admin/users/route");
    const res = await PATCH(mutReq("/api/admin/users", "PATCH", { discord_id: "p1", org_role: "CAPTAIN" }));
    expect(res.status).toBe(401);
  });

  it("returns 403 for non-OWNER", async () => {
    mockAuth.mockResolvedValue(playerSession());
    const { PATCH } = await import("@/app/api/admin/users/route");
    const res = await PATCH(mutReq("/api/admin/users", "PATCH", { discord_id: "p1", org_role: "CAPTAIN" }));
    expect(res.status).toBe(403);
  });

  it("returns 400 when trying to assign OWNER role", async () => {
    mockAuth.mockResolvedValue(ownerSession());
    const { PATCH } = await import("@/app/api/admin/users/route");
    const res = await PATCH(mutReq("/api/admin/users", "PATCH", { discord_id: "p1", org_role: "OWNER" }));
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ error: "OWNER role cannot be assigned via UI" });
  });

  it("returns 400 when trying to modify the owner's record", async () => {
    mockAuth.mockResolvedValue(ownerSession());
    const { PATCH } = await import("@/app/api/admin/users/route");
    const res = await PATCH(mutReq("/api/admin/users", "PATCH", { discord_id: "owner123", org_role: "PLAYER" }));
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ error: "Cannot modify the owner's role" });
  });

  it("returns 200 on valid role update", async () => {
    mockAuth.mockResolvedValue(ownerSession());
    mockGetAllPlayers.mockResolvedValue([
      { discord_id: "p1", org_role: "PLAYER", captain_of: null },
    ]);
    mockUpdatePlayerRole.mockResolvedValue(undefined);
    mockAppendAuditLog.mockResolvedValue(undefined);
    const { PATCH } = await import("@/app/api/admin/users/route");
    const res = await PATCH(mutReq("/api/admin/users", "PATCH", { discord_id: "p1", org_role: "CAPTAIN", captain_of: "MR" }));
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ ok: true });
    expect(mockUpdatePlayerRole).toHaveBeenCalledWith("p1", "CAPTAIN", "MR");
    expect(mockAppendAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        actor_discord_id: "owner123",
        action_type: "ROLE_CHANGE",
        entity_id: "p1",
      }),
    );
  });
});

// ── Tests: GET /api/admin/invites ─────────────────────────────────────────

describe("GET /api/admin/invites", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    process.env.OWNER_DISCORD_ID = "owner123";
  });

  it("returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const { GET } = await import("@/app/api/admin/invites/route");
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("returns 403 for non-OWNER", async () => {
    mockAuth.mockResolvedValue(playerSession());
    const { GET } = await import("@/app/api/admin/invites/route");
    const res = await GET();
    expect(res.status).toBe(403);
  });

  it("returns 200 with invites array when OWNER", async () => {
    mockAuth.mockResolvedValue(ownerSession());
    mockGetInvites.mockResolvedValue([
      { id: "inv1", token: "abc", org_role: "PLAYER", used: false },
    ]);
    const { GET } = await import("@/app/api/admin/invites/route");
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body[0].id).toBe("inv1");
  });
});

// ── Tests: POST /api/admin/invites ────────────────────────────────────────

describe("POST /api/admin/invites", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    process.env.OWNER_DISCORD_ID = "owner123";
  });

  it("returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const { POST } = await import("@/app/api/admin/invites/route");
    const res = await POST(mutReq("/api/admin/invites", "POST", { org_role: "PLAYER" }));
    expect(res.status).toBe(401);
  });

  it("returns 400 when trying to create OWNER invite", async () => {
    mockAuth.mockResolvedValue(ownerSession());
    const { POST } = await import("@/app/api/admin/invites/route");
    const res = await POST(mutReq("/api/admin/invites", "POST", { org_role: "OWNER" }));
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ error: "Cannot create invite for OWNER role" });
  });

  it.each([undefined, "", "someuser", "1234", 123456789012345678])(
    "returns 400 when invited_discord_id is %s",
    async (invited) => {
      mockAuth.mockResolvedValue(ownerSession());
      const { POST } = await import("@/app/api/admin/invites/route");
      const res = await POST(mutReq("/api/admin/invites", "POST", { org_role: "PLAYER", invited_discord_id: invited }));
      expect(res.status).toBe(400);
      expect(mockCreateInvite).not.toHaveBeenCalled();
    },
  );

  it("returns 201 on valid invite creation, bound to the Discord id", async () => {
    mockAuth.mockResolvedValue(ownerSession());
    mockCreateInvite.mockResolvedValue({ id: "inv2", token: "xyz", org_role: "CAPTAIN" });
    mockAppendAuditLog.mockResolvedValue(undefined);
    const { POST } = await import("@/app/api/admin/invites/route");
    const res = await POST(mutReq("/api/admin/invites", "POST", {
      org_role: "CAPTAIN",
      invited_discord_id: " 111111111111111111 ",
    }));
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.id).toBe("inv2");
    expect(mockCreateInvite).toHaveBeenCalledWith("CAPTAIN", "owner123", "111111111111111111");
    // The secret token is not written to the audit log.
    expect(JSON.stringify(mockAppendAuditLog.mock.calls)).not.toContain("xyz");
    expect(mockAppendAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action_type: "INVITE_CREATE",
        entity_id: "inv2",
      }),
    );
  });
});

// ── Tests: GET /api/admin/audit-log ───────────────────────────────────────

describe("GET /api/admin/audit-log", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    process.env.OWNER_DISCORD_ID = "owner123";
  });

  it("returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const { GET } = await import("@/app/api/admin/audit-log/route");
    const res = await GET(getReq("/api/admin/audit-log"));
    expect(res.status).toBe(401);
  });

  it("returns 403 for non-OWNER", async () => {
    mockAuth.mockResolvedValue(playerSession());
    const { GET } = await import("@/app/api/admin/audit-log/route");
    const res = await GET(getReq("/api/admin/audit-log"));
    expect(res.status).toBe(403);
  });

  it("returns 200 with audit log entries", async () => {
    mockAuth.mockResolvedValue(ownerSession());
    mockGetAuditLog.mockResolvedValue([
      { id: "log1", action_type: "ROLE_CHANGE", actor_discord_id: "owner123" },
    ]);
    const { GET } = await import("@/app/api/admin/audit-log/route");
    const res = await GET(getReq("/api/admin/audit-log", { limit: "50" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body[0].id).toBe("log1");
    expect(mockGetAuditLog).toHaveBeenCalledWith(50);
  });
});
