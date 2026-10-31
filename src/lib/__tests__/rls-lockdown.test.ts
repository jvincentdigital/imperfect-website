import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

// Static guard: every table the code touches must be covered by the RLS
// lockdown migration, and the migration must not open anything to anon.
const root = path.resolve(__dirname, "../../..");
const sql = fs.readFileSync(
  path.join(root, "supabase/migrations/20261031120100_rls_lockdown.sql"),
  "utf8",
);

function walk(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return e.name === "__tests__" ? [] : walk(p);
    return /\.(ts|tsx)$/.test(e.name) ? [p] : [];
  });
}

const tablesInCode = new Set<string>();
for (const file of walk(path.join(root, "src"))) {
  for (const m of fs.readFileSync(file, "utf8").matchAll(/\.from\("([a-z_]+)"\)/g)) {
    tablesInCode.add(m[1]);
  }
}

const lockedTables = new Set(
  [...(sql.match(/ARRAY\[([\s\S]*?)\]/)?.[1] ?? "").matchAll(/'([a-z_]+)'/g)].map((m) => m[1]),
);

describe("RLS lockdown migration", () => {
  it("finds the tables used in code", () => {
    expect(tablesInCode.size).toBeGreaterThan(10);
  });

  it.each([...tablesInCode].sort())("covers table %s", (table) => {
    expect(lockedTables.has(table)).toBe(true);
  });

  it("enables RLS, drops all policies and revokes anon/authenticated", () => {
    expect(sql).toMatch(/ENABLE ROW LEVEL SECURITY/);
    expect(sql).toMatch(/DROP POLICY/);
    expect(sql).toMatch(/REVOKE ALL ON public\.%I FROM anon, authenticated/);
  });

  it("creates no policy and grants nothing to anon or authenticated", () => {
    expect(sql).not.toMatch(/CREATE POLICY/i);
    expect(sql).not.toMatch(/GRANT[^;]*TO[^;]*\b(anon|authenticated)\b/i);
  });
});
