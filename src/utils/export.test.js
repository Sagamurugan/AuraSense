import { describe, expect, it } from "vitest";
import { sessionsToCsv } from "./export";

describe("export", () => {
  it("builds csv with header and rows", () => {
    const csv = sessionsToCsv([
      {
        date: "Jan 01",
        duration: 120,
        fatigue: 30,
        blinks: 40,
        focusScore: 75,
      },
    ]);
    expect(csv).toContain("Date");
    expect(csv).toContain("Jan 01");
    expect(csv).toContain("75");
  });
});
