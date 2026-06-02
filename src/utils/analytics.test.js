import { describe, expect, it } from "vitest";
import { deriveDashboardMetrics, formatDuration } from "./analytics";

describe("analytics", () => {
  it("formats duration as mm:ss", () => {
    expect(formatDuration(125)).toBe("02:05");
  });

  it("returns empty dashboard metrics without sessions", () => {
    const metrics = deriveDashboardMetrics([]);
    expect(metrics.totalSessions).toBe(0);
    expect(metrics.averageFocus).toBe(0);
  });

  it("computes averages from saved sessions", () => {
    const metrics = deriveDashboardMetrics([
      { fatigue: 40, focusScore: 80, attentionScore: 70, postureScore: 90, duration: 600 },
      { fatigue: 60, focusScore: 60, attentionScore: 50, postureScore: 70, duration: 900 },
    ]);
    expect(metrics.totalSessions).toBe(2);
    expect(metrics.averageFatigue).toBe(50);
    expect(metrics.averageFocus).toBe(70);
  });
});
