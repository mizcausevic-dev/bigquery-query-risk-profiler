import { readFile } from "node:fs/promises";

const html = await readFile("site/index.html", "utf8");
const robots = await readFile("site/robots.txt", "utf8");
const sitemap = await readFile("site/sitemap.xml", "utf8");
const markers = [
  "BigQuery Query Risk Profiler",
  "Expensive queries should have a risk route",
  "Customer 360 unpartitioned scan",
  "Primary recommendation",
  "Product depth",
  "What these repos have in common",
  "Buyer value",
  "Technical proof",
  "GTM story",
  "Portfolio"
];

for (const marker of markers) {
  if (!html.includes(marker)) {
    throw new Error(`Missing marker: ${marker}`);
  }
}

if (!robots.includes("Sitemap:")) {
  throw new Error("Missing robots sitemap pointer");
}

if (!sitemap.includes("bigquery-query-risk-profiler")) {
  throw new Error("Missing sitemap URL");
}

console.log("smoke ok");
