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
