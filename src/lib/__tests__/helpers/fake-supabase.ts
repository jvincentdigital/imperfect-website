/**
 * Tiny stand-in for the supabase-js query builder. Records every call so a
 * test can assert which table, filters and payloads were used, and returns
 * whatever result the test queued. No network, no live database.
 */
type Result = { data: unknown; error: unknown };
export type Op = [method: string, ...args: unknown[]];
export type Query = { table: string; ops: Op[] };

export function createFakeSupabase() {
  const queries: Query[] = [];
  const results: Result[] = [];

  function next(): Result {
    return results.shift() ?? { data: null, error: null };
  }

  function from(table: string) {
    const query: Query = { table, ops: [] };
    queries.push(query);
    const chain: Record<string, unknown> = {};
    for (const m of [
      "select", "insert", "update", "upsert", "delete",
      "eq", "neq", "is", "gt", "gte", "lt", "lte", "in", "order", "limit",
    ]) {
      chain[m] = (...args: unknown[]) => {
        query.ops.push([m, ...args]);
        return chain;
      };
    }
    for (const m of ["single", "maybeSingle"]) {
      chain[m] = () => {
        query.ops.push([m]);
        return Promise.resolve(next());
      };
    }
    // Awaiting the builder directly (no .single()) resolves the next result.
    chain.then = (resolve: (r: Result) => unknown, reject: (e: unknown) => unknown) =>
      Promise.resolve(next()).then(resolve, reject);
    return chain;
  }

  return {
    client: { from },
    queries,
    /** Queue the result for the next awaited query. */
    respond(data: unknown, error: unknown = null) {
      results.push({ data, error });
    },
    reset() {
      queries.length = 0;
      results.length = 0;
    },
  };
}

export function opsOf(q: Query | undefined, method: string): unknown[][] {
  return (q?.ops ?? []).filter((o) => o[0] === method).map((o) => o.slice(1));
}

/** Shared instance: mock "@/lib/supabase" with { supabase: fake.client }. */
export const fake = createFakeSupabase();
