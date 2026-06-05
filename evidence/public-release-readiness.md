# Public Release Readiness

## Status

Ready for a credible GitHub v0.1 public testing release, with documented limitations.

## Files Changed

- Probe catalogue and command surface: `src/lib/probes.js`, `src/commands/probes.js`, `src/cli.js`.
- Boundary, scan, evidence, and quality refinements: `src/lib/scan.js`, `src/commands/evidence.js`, `src/commands/quality.js`.
- Fixture projects: `fixtures/vite-react-app`, `fixtures/next-app`, `fixtures/supabase-cloudflare-app`, `fixtures/plain-node-app`, `fixtures/non-git-folder`, `fixtures/risky-secret-app`.
- Regression tests: `test/typescript-compatibility.test.js`.
- Public docs: `README.md`, `CONTRIBUTING.md`, `SECURITY.md`, `docs/*.md`.
- GitHub materials: `.github/ISSUE_TEMPLATE/*.md`, `.github/PULL_REQUEST_TEMPLATE.md`, `.github/workflows/*.yml`.
- Demo scripts: `scripts/demo-run.sh`, `scripts/demo-fixtures.sh`.
- Evidence examples: `evidence/fixture-runs/*.md`.

## Probe Quality Improvements

- Added `opstruth probes`.
- Probe catalogue reports total probes, probes by area, default mode, safety level, and detected probes for the current project.
- Tightened probe descriptions so each says what evidence is collected, what is proved, what is not proved, and the next safe step.
- Kept all v0.1 catalogue probes `safe_readonly`; no deploy, mutation, restart, OpenAI, or queue-trigger behavior was added.

## Fixture Repos Created

- `vite-react-app`: TypeScript, React, Vite.
- `next-app`: TypeScript, React, Next.js.
- `supabase-cloudflare-app`: Supabase migrations and Wrangler config.
- `plain-node-app`: simple Node ESM package.
- `non-git-folder`: no git and no package metadata.
- `risky-secret-app`: fake placeholders for redaction testing.

## Fixture Evidence Generated

- `evidence/fixture-runs/vite-react-app.md`
- `evidence/fixture-runs/next-app.md`
- `evidence/fixture-runs/supabase-cloudflare-app.md`
- `evidence/fixture-runs/plain-node-app.md`
- `evidence/fixture-runs/non-git-folder.md`
- `evidence/fixture-runs/risky-secret-app.md`

## Tests Added Or Updated

- Vite fixture detects Vite, React, and TypeScript.
- Next fixture detects Next.js.
- Supabase/Cloudflare fixture detects both platforms and matching probes.
- Risky secret fixture reports redacted evidence.
- Non-git folder skips `git diff --check` without failing.
- Help exits without checks.
- Evidence pack creation is verified.
- Route/local checks remain skipped unless configured.

## README And GitHub Positioning

- README rewritten for public GitHub release positioning.
- GitHub description and topics documented in `docs/github-release-checklist.md`.
- Community testing workflow documented in `docs/community-testing.md`.
- Probe catalogue documented in `docs/probe-catalogue.md`.

## CI Examples

- `.github/workflows/ci.yml` runs lint, tests, help, and `node bin/opstruth.js`.
- `.github/workflows/opstruth-example.yml` shows local checkout usage and future `npx opstruth` guidance.
- `docs/ci.md` explains strict mode, artifact upload, local usage, and future npx usage.

## Screenshot And Recording Readiness

- `scripts/demo-run.sh` runs welcome, a Vite fixture proof run, and risky secret fixture scan.
- `scripts/demo-fixtures.sh` regenerates all fixture evidence.
- `docs/screenshots-and-recordings.md` includes asciinema and simple terminal capture examples.

## Commands Run

- `npm run lint`: passed.
- `npm test`: passed.
- `node bin/opstruth.js --help`: passed.
- `node bin/opstruth.js welcome`: passed.
- `node bin/opstruth.js probes || true`: passed.
- `node bin/opstruth.js`: passed with partial pass and no warnings.
- `./scripts/demo-fixtures.sh`: passed and regenerated fixture evidence.

## Known Limitations

- Some probes are static-only.
- Route checks need `--base-url` or route config.
- Local runtime checks need explicit port, health path, process, or service inputs.
- Package is not published yet; `npx opstruth` is future-facing.
- opstruth is not a replacement for a security audit.
- Fixture runs are local temp-copy simulations, not installed dependency builds.

## v0.1 Readiness

This is ready for a public GitHub v0.1 testing release. It is credible, local, read-only, evidence-oriented, and clear about proof gaps.
