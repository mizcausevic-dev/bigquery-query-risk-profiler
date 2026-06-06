import { describe, expect, it } from "vitest";
import sample from "../fixtures/bigquery-risk-sample.json" with { type: "json" };
import { buildProfile, classifyTier, renderMarkdown, scoreLane } from "../src/index.js";

describe("bigquery query risk profiler", () => {
  it("classifies query risk tiers", () => {
    expect(classifyTier(90)).toBe("CONTROLLED");
    expect(classifyTier(76)).toBe("WATCH");
    expect(classifyTier(58)).toBe("REVIEW");
    expect(classifyTier(40)).toBe("ESCALATE");
  });

  it("scores query lanes from risk evidence", () => {
    const lane = scoreLane(sample.lanes[0]);
    expect(lane.riskControlScore).toBeLessThan(70);
    expect(lane.route).toContain("query risk");
  });

  it("sorts highest-risk BigQuery lanes first", () => {
    const profile = buildProfile(sample);
    expect(profile.summary.laneCount).toBe(4);
    expect(profile.lanes[0].riskControlScore).toBeLessThanOrEqual(profile.lanes[1].riskControlScore);
    expect(profile.summary.primaryRecommendation).toContain(profile.summary.highestRiskLane);
  });

  it("renders markdown output", () => {
    const markdown = renderMarkdown(buildProfile(sample));
    expect(markdown).toContain("| Lane | Tier | Control score |");
    expect(markdown).toContain("Customer 360 unpartitioned scan");
  });
});
