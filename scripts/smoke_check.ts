import { readFile } from "node:fs/promises";

const html = await readFile("site/index.html", "utf8");
const markers = [
  "BigQuery Query Risk Profiler",
  "Expensive queries should have a risk route",
  "Customer 360 unpartitioned scan",
  "Primary recommendation"
];

for (const marker of markers) {
  if (!html.includes(marker)) {
    throw new Error(`Missing marker: ${marker}`);
  }
}

console.log("smoke ok");
