import { describe, expect, it } from "vitest";
import { formatArtists, formatDuration, normalizeTimeRange, progressBar, truncate } from "../src/utils/format.js";

describe("format utilities", () => {
  it("formats durations as m:ss", () => {
    expect(formatDuration(188_000)).toBe("3:08");
    expect(formatDuration(0)).toBe("0:00");
  });

  it("formats artist lists", () => {
    expect(formatArtists([{ name: "A" }, { name: "B" }])).toBe("A, B");
    expect(formatArtists([])).toBe("Unknown");
  });

  it("truncates long strings", () => {
    expect(truncate("abcdef", 4)).toBe("abc…");
  });

  it("normalizes stats ranges", () => {
    expect(normalizeTimeRange("month")).toBe("short_term");
    expect(normalizeTimeRange("6-months")).toBe("medium_term");
    expect(normalizeTimeRange("all-time")).toBe("long_term");
  });

  it("renders a progress bar", () => {
    expect(progressBar(50, 100, 4)).toContain("██");
  });
});
