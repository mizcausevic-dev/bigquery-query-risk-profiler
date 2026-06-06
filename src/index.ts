import { readFile } from "node:fs/promises";

export type QueryRiskTier = "CONTROLLED" | "WATCH" | "REVIEW" | "ESCALATE";

export interface QueryLane {
  name: string;
  owner: string;
  audience: string;
  project: string;
  monthlyTbScanned: number;
  businessCriticality: number;
  ownerAttribution: number;
  partitionHygiene: number;
  slotEfficiency: number;
  piiExposureControl: number;
  budgetGuardrails: number;
  unboundedQueryCount: number;
  staleDatasetCount: number;
  remediationValueUsd: number;
  narrative: string;
  nextAction: string;
}

export interface QueryRiskInput {
  generatedAt: string;
  organization: string;
  lanes: QueryLane[];
}

export interface ScoredQueryLane extends QueryLane {
  riskControlScore: number;
  queryRiskScore: number;
  tier: QueryRiskTier;
  route: string;
}

export interface QueryRiskProfile {
  generatedAt: string;
  organization: string;
  lanes: ScoredQueryLane[];
  summary: {
    laneCount: number;
    controlledCount: number;
    escalationCount: number;
    highestRiskLane: string;
    meanRiskControlScore: number;
    totalRemediationValueUsd: number;
    primaryRecommendation: string;
  };
}

const clamp = (value: number, min = 0, max = 100): number => Math.min(max, Math.max(min, value));

export function classifyTier(riskControlScore: number): QueryRiskTier {
  if (riskControlScore >= 84) return "CONTROLLED";
  if (riskControlScore >= 70) return "WATCH";
  if (riskControlScore >= 52) return "REVIEW";
  return "ESCALATE";
}

export function scoreLane(lane: QueryLane): ScoredQueryLane {
  const unboundedPenalty = clamp(lane.unboundedQueryCount * 8);
  const stalePenalty = clamp(lane.staleDatasetCount * 4);
  const scanPressure = clamp(lane.monthlyTbScanned / 18);

  const riskControlScore = Math.round(
    clamp(
      lane.ownerAttribution * 0.16 +
        lane.partitionHygiene * 0.18 +
        lane.slotEfficiency * 0.16 +
        lane.piiExposureControl * 0.18 +
        lane.budgetGuardrails * 0.14 +
        (100 - unboundedPenalty) * 0.08 +
        (100 - stalePenalty) * 0.05 +
        (100 - scanPressure) * 0.03 +
        lane.businessCriticality * 0.02
    )
  );

  const queryRiskScore = 100 - riskControlScore;
  const tier = classifyTier(riskControlScore);
  const route =
    tier === "ESCALATE"
      ? "Escalate query risk until owner attribution, partition hygiene, PII controls, and budget guardrails are restored."
      : tier === "REVIEW"
        ? "Route to BigQuery query risk governance review with unbounded scans, stale datasets, and remediation value attached."
        : tier === "WATCH"
          ? "Keep under watch with query caps, partition enforcement, and weekly scan-cost evidence."
          : "Controlled BigQuery lane with current ownership, partitions, PII controls, and budget evidence.";

  return { ...lane, riskControlScore, queryRiskScore, tier, route };
}

export function buildProfile(input: QueryRiskInput): QueryRiskProfile {
  const lanes = input.lanes.map(scoreLane).sort((a, b) => a.riskControlScore - b.riskControlScore);
  const meanRiskControlScore = Math.round(
    lanes.reduce((sum, lane) => sum + lane.riskControlScore, 0) / Math.max(lanes.length, 1)
  );
  const highestRiskLane = lanes[0]?.name ?? "No lanes";
  const controlledCount = lanes.filter((lane) => lane.tier === "CONTROLLED").length;
  const escalationCount = lanes.filter((lane) => lane.tier === "ESCALATE").length;
  const totalRemediationValueUsd = lanes.reduce((sum, lane) => sum + lane.remediationValueUsd, 0);

  return {
    generatedAt: input.generatedAt,
    organization: input.organization,
    lanes,
    summary: {
      laneCount: lanes.length,
      controlledCount,
      escalationCount,
      highestRiskLane,
      meanRiskControlScore,
      totalRemediationValueUsd,
      primaryRecommendation: `Fix ${highestRiskLane} first; it has the weakest BigQuery query-risk posture.`
    }
  };
}

export async function loadProfile(path: string): Promise<QueryRiskProfile> {
  return buildProfile(JSON.parse(await readFile(path, "utf8")) as QueryRiskInput);
}

export function renderMarkdown(profile: QueryRiskProfile): string {
  const rows = profile.lanes
    .map(
      (lane) =>
        `| ${lane.name} | ${lane.tier} | ${lane.riskControlScore} | ${lane.project} | ${lane.monthlyTbScanned} TB | $${lane.remediationValueUsd.toLocaleString()} | ${lane.nextAction} |`
    )
    .join("\n");

  return [
    "# BigQuery Query Risk Profiler",
    "",
    `Organization: ${profile.organization}`,
    "",
    `Primary recommendation: ${profile.summary.primaryRecommendation}`,
    "",
    "| Lane | Tier | Control score | Project | Monthly scan | Recoverable value | Next action |",
    "| --- | --- | ---: | --- | ---: | ---: | --- |",
    rows
  ].join("\n");
}
