import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { exportToCSV } from "@/lib/export";

// exportToCSV is browser code: stub the few DOM pieces it touches and
// capture the Blob it builds so we can read the CSV text.
let blob: Blob | null;
let anchor: { href: string; download: string; click: ReturnType<typeof vi.fn> };

beforeEach(() => {
  blob = null;
  anchor = { href: "", download: "", click: vi.fn() };
  vi.stubGlobal("document", { createElement: () => anchor });
  vi.spyOn(URL, "createObjectURL").mockImplementation((b) => {
    blob = b as Blob;
    return "blob:test";
  });
  vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

async function csv() {
  expect(blob).not.toBeNull();
  return blob!.text();
}

describe("exportToCSV", () => {
  it("does nothing for an empty list", () => {
    exportToCSV([], "empty");
    expect(anchor.click).not.toHaveBeenCalled();
  });

  it("uses the first row's keys as the header", async () => {
    exportToCSV([{ name: "Ana", wins: 3 }, { name: "Luis", wins: 5 }], "players");
    expect(await csv()).toBe("name,wins\nAna,3\nLuis,5");
    expect(anchor.click).toHaveBeenCalledOnce();
  });

  it("respects explicit headers and blanks missing or null values", async () => {
    exportToCSV([{ a: 1, b: null }], "x", ["a", "b", "c"]);
    expect(await csv()).toBe("a,b,c\n1,,");
  });

  it("quotes commas, newlines and quotes", async () => {
    exportToCSV([{ note: 'Hi, "team"\nGG' }], "x");
    expect(await csv()).toBe('note\n"Hi, ""team""\nGG"');
  });

  it("adds .csv to the filename only when missing", () => {
    exportToCSV([{ a: 1 }], "report");
    expect(anchor.download).toBe("report.csv");
    exportToCSV([{ a: 1 }], "report.csv");
    expect(anchor.download).toBe("report.csv");
  });
});
