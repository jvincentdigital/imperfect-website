import { describe, it, expect, vi, beforeEach } from "vitest";
import { fake, opsOf } from "./helpers/fake-supabase";

vi.mock("@/lib/supabase", async () => {
  const { fake } = await import("./helpers/fake-supabase");
  return { supabase: fake.client };
});

import { getRevenue, createRevenue, updateSponsor, deleteRevenue } from "@/lib/management-db";

beforeEach(() => fake.reset());

describe("management-db (Supabase path, fake client)", () => {
  it("getRevenue reads revenue newest first", async () => {
    fake.respond([{ id: "r1" }]);
    expect(await getRevenue()).toEqual([{ id: "r1" }]);
    expect(fake.queries[0].table).toBe("revenue");
    expect(opsOf(fake.queries[0], "order")[0]).toEqual(["date", { ascending: false }]);
  });

  it("getRevenue returns [] on a null result", async () => {
    fake.respond(null);
    expect(await getRevenue()).toEqual([]);
  });

  it("createRevenue throws the DB error", async () => {
    fake.respond(null, { message: "denied" });
    await expect(
      createRevenue({ date: "2026-10-31", amount: 1, category: "other" } as never),
    ).rejects.toEqual({ message: "denied" });
  });

  it("updateSponsor targets one row by id", async () => {
    fake.respond({ id: "s1", company_name: "New" });
    expect(await updateSponsor("s1", { company_name: "New" })).toMatchObject({ company_name: "New" });
    expect(opsOf(fake.queries[0], "eq")).toEqual([["id", "s1"]]);
  });

  it("deleteRevenue throws when the DB refuses", async () => {
    fake.respond(null, { message: "denied" });
    await expect(deleteRevenue("r1")).rejects.toEqual({ message: "denied" });
  });
});
