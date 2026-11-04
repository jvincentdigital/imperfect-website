import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// The limiter keeps its store at module level, so each test loads a fresh copy.
async function load() {
  vi.resetModules();
  return (await import("@/lib/rate-limit")).checkRateLimit;
}

function req(ip?: string) {
  const headers: Record<string, string> = {};
  if (ip) headers["x-forwarded-for"] = ip;
  return new Request("https://imperfectgg.com/api/x", { method: "POST", headers });
}

describe("checkRateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
  });
  afterEach(() => vi.useRealTimers());

  it("allows 60 requests per minute and blocks the 61st", async () => {
    const check = await load();
    for (let i = 0; i < 60; i++) expect(check(req("1.1.1.1"))).toBe(true);
    expect(check(req("1.1.1.1"))).toBe(false);
  });

  it("tracks each IP separately", async () => {
    const check = await load();
    for (let i = 0; i < 60; i++) check(req("1.1.1.1"));
    expect(check(req("1.1.1.1"))).toBe(false);
    expect(check(req("2.2.2.2"))).toBe(true);
  });

  it("uses the first address in x-forwarded-for", async () => {
    const check = await load();
    for (let i = 0; i < 60; i++) check(req("3.3.3.3, 10.0.0.1"));
    expect(check(req("3.3.3.3"))).toBe(false);
    expect(check(req("10.0.0.1"))).toBe(true);
  });

  it("resets after the one minute window", async () => {
    const check = await load();
    for (let i = 0; i < 60; i++) check(req("4.4.4.4"));
    expect(check(req("4.4.4.4"))).toBe(false);
    vi.advanceTimersByTime(60_001);
    expect(check(req("4.4.4.4"))).toBe(true);
  });

  it("puts requests without x-forwarded-for in one shared bucket", async () => {
    const check = await load();
    for (let i = 0; i < 60; i++) check(req());
    expect(check(req())).toBe(false);
  });
});
