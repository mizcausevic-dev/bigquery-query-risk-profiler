import { mkdir, writeFile } from "node:fs/promises";
import { buildProfile } from "../src/index.js";
import sample from "../fixtures/bigquery-risk-sample.json" with { type: "json" };

const profile = buildProfile(sample);
const cards = profile.lanes
  .map(
    (lane) => `
      <article class="card">
        <div class="top"><span>${lane.tier}</span><strong>${lane.riskControlScore}</strong></div>
        <h3>${lane.name}</h3>
        <p>${lane.narrative}</p>
        <dl>
          <div><dt>Project</dt><dd>${lane.project}</dd></div>
          <div><dt>Monthly scan</dt><dd>${lane.monthlyTbScanned} TB</dd></div>
          <div><dt>Recoverable</dt><dd>$${lane.remediationValueUsd.toLocaleString()}</dd></div>
          <div><dt>Unbounded</dt><dd>${lane.unboundedQueryCount}</dd></div>
        </dl>
        <p class="route">${lane.route}</p>
      </article>`
  )
  .join("");

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>BigQuery Query Risk Profiler</title>
  <meta name="description" content="Board-readable BigQuery query risk profiling for scan cost, slot pressure, partition hygiene, PII exposure, owner routing, and remediation priority." />
  <style>
    :root{color-scheme:dark;--bg:#050914;--panel:#0c1726;--panel2:#101c2e;--text:#f4f1e8;--muted:#aab6c8;--cyan:#28ddf2;--mint:#55f2bc;--amber:#ffd166;--line:rgba(40,221,242,.24)}
    *{box-sizing:border-box}body{margin:0;background:radial-gradient(circle at 12% 0%,rgba(255,209,102,.16),transparent 34rem),radial-gradient(circle at 88% 12%,rgba(40,221,242,.16),transparent 30rem),var(--bg);color:var(--text);font-family:"Segoe UI",system-ui,sans-serif}
    main{width:min(1180px,calc(100vw - 32px));margin:auto;padding:64px 0}.hero{border:1px solid var(--line);border-radius:30px;background:linear-gradient(135deg,rgba(16,28,46,.96),rgba(7,10,21,.95));padding:clamp(28px,5vw,58px);box-shadow:0 30px 90px rgba(0,0,0,.35)}
    .eyebrow{color:var(--amber);letter-spacing:.18em;text-transform:uppercase;font:800 12px/1 ui-monospace,SFMono-Regular,Consolas,monospace}h1{max-width:1000px;margin:18px 0;font-size:clamp(44px,8vw,104px);line-height:.91;letter-spacing:-.06em}.lede{max-width:820px;color:var(--muted);font-size:clamp(18px,2.2vw,24px);line-height:1.55}
    .metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-top:34px}.metric{border:1px solid rgba(255,255,255,.09);border-radius:18px;background:rgba(255,255,255,.04);padding:20px}.metric strong{display:block;font-size:34px}.metric span{color:var(--muted);font-size:12px;text-transform:uppercase;letter-spacing:.12em}
    .section{margin-top:28px;border:1px solid var(--line);border-radius:28px;background:rgba(12,23,38,.78);padding:clamp(22px,3vw,34px)}h2{margin:0 0 18px;font-size:clamp(30px,4vw,54px);line-height:1;letter-spacing:-.04em}.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}
    .card{border:1px solid rgba(255,255,255,.1);border-radius:22px;background:var(--panel2);padding:22px}.top{display:flex;justify-content:space-between;color:var(--cyan);font:800 12px/1 ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.14em}.top strong{color:var(--mint);font-size:30px;letter-spacing:0}h3{margin:16px 0 10px;font-size:25px;line-height:1.08}p{color:var(--muted);line-height:1.55}
    dl{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}dt{color:var(--muted);font-size:12px;text-transform:uppercase;letter-spacing:.1em}dd{margin:4px 0 0;font-weight:800}.route{color:var(--text);border-top:1px solid rgba(255,255,255,.08);padding-top:14px}.section-head{display:flex;justify-content:space-between;gap:18px;align-items:flex-start;margin-bottom:18px}.section-kicker{color:var(--mint);letter-spacing:.16em;text-transform:uppercase;font:800 12px/1.3 ui-monospace,SFMono-Regular,Consolas,monospace}.summary{max-width:760px;color:var(--muted);font-size:18px;line-height:1.55}.three{grid-template-columns:repeat(3,1fr)}.pill-list{display:flex;flex-wrap:wrap;gap:10px;margin-top:18px}.pill{border:1px solid rgba(40,221,242,.28);border-radius:999px;background:rgba(40,221,242,.07);padding:10px 13px;color:var(--text);font:800 12px/1 ui-monospace,SFMono-Regular,Consolas,monospace}.next-action,.boundary{margin-top:16px;border:1px solid rgba(85,242,188,.18);border-radius:16px;background:rgba(85,242,188,.06);padding:14px}.next-action span{color:var(--mint);letter-spacing:.14em;text-transform:uppercase;font:800 11px/1 ui-monospace,SFMono-Regular,Consolas,monospace}.next-action p{margin:8px 0 0;color:var(--text)}.workflow{display:grid;gap:12px}.step{display:grid;grid-template-columns:46px 1fr;gap:14px;align-items:start;border:1px solid rgba(255,255,255,.09);border-radius:18px;background:rgba(255,255,255,.035);padding:16px}.step strong{display:grid;place-items:center;width:36px;height:36px;border-radius:999px;background:rgba(40,221,242,.1);color:var(--cyan);border:1px solid var(--line)}.step h3{margin:0 0 6px;font-size:20px}.step p{margin:0}.boundary{border-color:rgba(255,209,102,.3);background:linear-gradient(135deg,rgba(255,209,102,.08),rgba(12,23,38,.76))}footer{color:var(--muted);padding-top:24px;font-size:14px;display:flex;flex-wrap:wrap;gap:12px}footer a{color:var(--cyan);text-decoration:none}@media(max-width:900px){.metrics,.grid,.three{grid-template-columns:1fr}.section-head{display:block}}@media(max-width:760px){main{padding:28px 0}.metrics,.grid{grid-template-columns:1fr}.step{grid-template-columns:1fr}}
  </style>
</head>
<body>
  <main>
    <section class="hero">
      <div class="eyebrow">BigQuery risk control</div>
      <h1>Expensive queries should have a risk route before scan cost compounds.</h1>
      <p class="lede">BigQuery Query Risk Profiler turns scan volume, partition hygiene, slot efficiency, PII exposure control, budget guardrails, stale datasets, and unbounded queries into one remediation sequence.</p>
      <div class="metrics">
        <div class="metric"><strong>${profile.summary.laneCount}</strong><span>Query lanes</span></div>
        <div class="metric"><strong>${profile.summary.meanRiskControlScore}</strong><span>Mean control</span></div>
        <div class="metric"><strong>${profile.summary.controlledCount}</strong><span>Controlled</span></div>
        <div class="metric"><strong>$${profile.summary.totalRemediationValueUsd.toLocaleString()}</strong><span>Recoverable</span></div>
      </div>
    </section>
    <section class="section">
      <h2>Query risk register</h2>
      <p><strong>Primary recommendation:</strong> ${profile.summary.primaryRecommendation}</p>
      <div class="grid">${cards}</div>
    </section>

    <section class="section">
      <div class="section-head">
        <div>
          <div class="section-kicker">Executive intelligence product</div>
          <h2>What this does</h2>
        </div>
        <p class="summary">This product gives finance, platform, and analytics leaders a shared way to see which query lanes are burning money, creating compliance exposure, or slowing the warehouse before the issue becomes another vague cloud-cost complaint.</p>
      </div>
      <div class="grid three">
        <article class="card"><div class="top"><span>GTM analyst lens</span></div><h3>Connects the signal to a commercial decision.</h3><p>Makes data-platform waste explainable in business terms: budget pressure, scan volume, PII exposure, owner routing, and time-to-remediation.</p></article>
        <article class="card"><div class="top"><span>SaaS value lens</span></div><h3>Turns operational noise into investable remediation.</h3><p>Turns query cleanup into recoverable margin, lower risk, and a ranked backlog instead of an engineering-only optimization exercise.</p></article>
        <article class="card"><div class="top"><span>Technical proof</span></div><h3>Keeps the calculation inspectable and safe.</h3><p>Uses fixture-backed scoring for scan cost, partition hygiene, slot efficiency, budget guardrails, stale datasets, and unbounded queries.</p></article>
      </div>
      <div class="pill-list" aria-label="Signal tags"><span class="pill">GCP data cost and risk control</span><span class="pill">board-ready evidence</span><span class="pill">owner routing</span><span class="pill">synthetic proof</span></div>
    </section>

    <section class="section">
      <div class="section-head">
        <div>
          <div class="section-kicker">Operating workflow</div>
          <h2>How the signal becomes a decision</h2>
        </div>
        <p class="summary">The workflow is designed for reusable diligence and operating packets: collect the evidence, score the posture, route the gap, and publish a buyer-readable next action.</p>
      </div>
      <div class="workflow">
        <div class="step"><strong>1</strong><div><h3>Register query lane and accountable owner</h3><p>Attach the responsible owner, audience, system lane, and decision context before the gcp data cost and risk control signal reaches an executive packet.</p></div></div>
        <div class="step"><strong>2</strong><div><h3>Score scan, partition, slot, PII, and budget posture</h3><p>Use the typed engine to turn raw operating evidence into a comparable posture that leaders can inspect without needing console access.</p></div></div>
        <div class="step"><strong>3</strong><div><h3>Route remediation by risk tier</h3><p>Turn the score into a concrete remediation motion with a named owner, urgency tier, and business consequence.</p></div></div>
        <div class="step"><strong>4</strong><div><h3>Publish recoverable value and next action</h3><p>Expose the executive-safe story: current posture, risk, recoverable value, and what should happen next.</p></div></div>
      </div>
    </section>

    <section class="section boundary">
      <div class="section-kicker">What these repos have in common</div>
      <h2>They convert platform complexity into board-ready operating proof.</h2>
      <p class="summary">The public surface uses synthetic BigQuery risk data only. No production projects, datasets, billing exports, query text, or credentials belong in this repo. The shared Kinetic Gain pattern is consistent: name the buyer pain, expose the evidence trail, produce a reusable artifact, and keep the public surface safe to review.</p>
    </section>
    <footer><span>BigQuery Query Risk Profiler</span><span>·</span><a href="https://portfolio.kineticgain.com/">Portfolio</a><a href="https://kineticgain.com/">Kinetic Gain</a><a href="https://github.com/mizcausevic-dev/bigquery-query-risk-profiler">GitHub</a></footer>
  </main>
</body>
</html>`;

await mkdir("site", { recursive: true });
await writeFile("site/index.html", html);
