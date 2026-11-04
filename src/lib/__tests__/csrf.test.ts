import { describe, it, expect } from "vitest";
import { verifyCsrfOrigin } from "@/lib/csrf";

function req(headers: Record<string, string>) {
  return new Request("https://imperfectgg.com/api/x", { method: "POST", headers });
}

describe("verifyCsrfOrigin", () => {
  it("allows requests without an Origin header (server to server)", () => {
    expect(verifyCsrfOrigin(req({ host: "imperfectgg.com" }))).toBe(true);
  });

  it("allows same-origin requests", () => {
    expect(
      verifyCsrfOrigin(req({ origin: "https://imperfectgg.com", host: "imperfectgg.com" })),
    ).toBe(true);
  });

  it("compares host including port", () => {
    expect(
      verifyCsrfOrigin(req({ origin: "http://localhost:3000", host: "localhost:3000" })),
    ).toBe(true);
    expect(
      verifyCsrfOrigin(req({ origin: "http://localhost:4000", host: "localhost:3000" })),
    ).toBe(false);
  });

  it("rejects a foreign origin", () => {
    expect(
      verifyCsrfOrigin(req({ origin: "https://evil.example", host: "imperfectgg.com" })),
    ).toBe(false);
  });

  it("rejects a lookalike subdomain origin", () => {
    expect(
      verifyCsrfOrigin(
        req({ origin: "https://imperfectgg.com.evil.example", host: "imperfectgg.com" }),
      ),
    ).toBe(false);
  });

  it("rejects a malformed or opaque origin", () => {
    expect(verifyCsrfOrigin(req({ origin: "not a url", host: "imperfectgg.com" }))).toBe(false);
    expect(verifyCsrfOrigin(req({ origin: "null", host: "imperfectgg.com" }))).toBe(false);
  });
});
