# bigquery-query-risk-profiler

Board-readable BigQuery query risk profiler for scan cost, slot pressure, partition hygiene, PII exposure controls, owner attribution, budget guardrails, stale datasets, and remediation priority.

[![ci](https://github.com/mizcausevic-dev/bigquery-query-risk-profiler/actions/workflows/ci.yml/badge.svg)](https://github.com/mizcausevic-dev/bigquery-query-risk-profiler/actions/workflows/ci.yml)
[![pages](https://github.com/mizcausevic-dev/bigquery-query-risk-profiler/actions/workflows/pages.yml/badge.svg)](https://github.com/mizcausevic-dev/bigquery-query-risk-profiler/actions/workflows/pages.yml)
[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](LICENSE)

## Why this exists

BigQuery risk becomes expensive when scan volume, privacy exposure, and stale datasets do not resolve to owners:

- Which query lanes scan too much data?
- Which jobs lack partition filters or query caps?
- Which datasets contain privacy-sensitive data without strong controls?
- Which stale datasets still create cost and exposure?
- Which remediation sequence saves money and reduces governance risk first?

This repo converts synthetic BigQuery query metadata into a board-readable query-risk profile.

## Local run

```bash
npm install
npm run verify
npm run demo
```

## CLI

```bash
npx bigquery-query-risk-profiler fixtures/bigquery-risk-sample.json --format markdown
npx bigquery-query-risk-profiler fixtures/bigquery-risk-sample.json --format json
```

## Kinetic Gain fit

This adds a GCP data-platform governance lane to the Kinetic Gain portfolio: BigQuery scan-cost control, privacy-safe query routing, partition hygiene, slot efficiency, and owner-readable remediation.

## Product depth

BigQuery Query Risk Profiler is not a console replacement. It is an executive operating surface for teams that need to explain why query cost, privacy exposure, and data-platform hygiene matter before they show up as budget overruns, audit gaps, or stalled analytics work.

- **Buyer value:** gives finance, platform, analytics, privacy, and revenue leaders a shared view of which query lanes are creating cost or control pressure.
- **Technical proof:** uses typed scoring over scan volume, partition hygiene, slot efficiency, PII exposure control, budget guardrails, unbounded query counts, stale datasets, owner attribution, and remediation value.
- **GTM story:** positions BigQuery governance as margin protection and data-trust infrastructure, not just warehouse tuning.

## What these repos have in common

This repo follows the Kinetic Gain pattern used across the portfolio:

- Turn fragmented operating evidence into one board-readable decision surface.
- Keep the public artifact safe by using synthetic data, fixtures, and inspectable scoring.
- Tie every risk signal to an owner, a business audience, a remediation route, and a reusable proof packet.
- Make the technical implementation useful to engineers while keeping the narrative understandable to non-technical buyers.

## Operating workflow

1. Register BigQuery lanes with owner, audience, project, query hygiene, and remediation value.
2. Score control posture using transparent weights across cost, privacy, ownership, and operational hygiene.
3. Sort the riskiest lanes first so leaders see where exposure and savings concentrate.
4. Export the result as CLI output and a static public proof surface for portfolio review.
