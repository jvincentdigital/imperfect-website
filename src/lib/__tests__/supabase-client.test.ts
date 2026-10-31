import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const createClient = vi.fn((url: string, key: string) => ({ url, key }));
vi.mock("@supabase/supabase-js", () => ({ createClient: (u: string, k: string) => createClient(u, k) }));

async function load(env: Record<string, string | undefined>) {
  vi.resetModules();
  for (const [k, v] of Object.entries(env)) vi.stubEnv(k, v as string);
  return import("@/lib/supabase");
}

beforeEach(() => createClient.mockClear());
afterEach(() => vi.unstubAllEnvs());

describe("server Supabase client", () => {
  it("uses the service role key when set", async () => {
    const m = await load({ SUPABASE_URL: "https://x.supabase.co", SUPABASE_SERVICE_ROLE_KEY: "srv", SUPABASE_ANON_KEY: "anon" });
    expect(m.supabaseKeyRole).toBe("service_role");
    expect(createClient).toHaveBeenCalledWith("https://x.supabase.co", "srv");
  });

  it("falls back to the anon key (local dev / rollout window)", async () => {
    const m = await load({ SUPABASE_URL: "https://x.supabase.co", SUPABASE_SERVICE_ROLE_KEY: undefined, SUPABASE_ANON_KEY: "anon" });
    expect(m.supabaseKeyRole).toBe("anon");
    expect(createClient).toHaveBeenCalledWith("https://x.supabase.co", "anon");
  });

  it("is null when nothing is configured", async () => {
    const m = await load({ SUPABASE_URL: undefined, SUPABASE_SERVICE_ROLE_KEY: undefined, SUPABASE_ANON_KEY: undefined });
    expect(m.supabase).toBeNull();
    expect(m.supabaseKeyRole).toBe("none");
    expect(m.isSupabaseConfigured()).toBe(false);
  });
});
