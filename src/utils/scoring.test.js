import { describe, expect, it } from "vitest";
import { clamp, getSessionFocusScore } from "./scoring";

describe("scoring", () => {
  it("clamps values inside range", () => {
    expect(clamp(12, 0, 10)).toBe(10);
    expect(clamp(-2, 0, 10)).toBe(0);
  });

  it("scores sessions with weighted components", () => {
    const score = getSessionFocusScore({
      fatigue: 20,
      attentionScore: 80,
      postureScore: 90,
      distractionEvents: 1,
    });
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThanOrEqual(100);
  });
});
