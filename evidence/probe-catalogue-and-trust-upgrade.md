# Probe Catalogue And Trust Upgrade

## Status

Partial pass.

## What Changed

- Added a strict project-boundary model: git root when available, otherwise current directory only with safety ignores.
- Added `opstruth welcome`, `opstruth init --yes`, and help handling that exits before checks run.
- Added an internal evidence-backed finding shape with status, area, title, finding, evidence, why it matters, and next safe step.
- Added a stack-aware probe catalogue with 30 initial probes across git, Node/TypeScript, quality, routes, local runtime, secrets, Supabase, Cloudflare, Docker, GitHub Actions, Vercel, and Netlify.
- Updated orchestration to detect stack inside the boundary, select safe automatic probes, explain skipped probes, aggregate findings, and produce an evidence pack.
- Updated markdown output with calm trust sections: What Matters Most, Verified, Warnings, Failures, Skipped Or Not Configured, Not Verified, Check Summary, Why You Can Trust This Result, Evidence Available, What opstruth Did Not Do, Overall Confidence, Evidence, and Next Safe Step.

## Evidence Collected

- `npm run lint`: passed.
- `npm test`: passed.
- `node bin/opstruth.js --help`: printed help and exited successfully.
- `node bin/opstruth.js welcome`: printed welcome and safety model.
- `node bin/opstruth.js`: completed with partial pass, selected 14 automatic safe probes, skipped unconfigured route/local/Supabase/Cloudflare checks honestly, and wrote `evidence/opstruth-report.md`.
- `node bin/opstruth.js secrets`: passed with no risky references found.
- `node bin/opstruth.js evidence --title "Probe Catalogue Test"`: wrote an evidence pack.

## Proof Gaps

- Route proof remains unverified unless `--base-url` or route config is provided.
- Local runtime proof remains unverified unless ports, health path, process, or service inputs are provided.
- Supabase, Cloudflare, Docker, GitHub Actions, Vercel, and Netlify probes are static/detection-oriented unless their config exists.
- The catalogue includes scaffolding for broad ecosystems; deeper stack-specific proof remains future work.

## What opstruth Did Not Do

- No deploys.
- No database mutations.
- No queue or job triggers.
- No service restarts or kills.
- No OpenAI calls.
- No raw secrets printed.

## Next Safe Step

Add route and local runtime inputs for projects where live availability matters, then rerun `opstruth` and attach the generated evidence pack.
