# opstruth

Read-only operational truth checks for AI-assisted engineering.

AI coding tools are fast, but developers still need proof:

- what changed
- what is configured
- what looks risky
- what was verified
- what was not verified

`opstruth` is a stack-aware, read-only CLI. It inspects the repo, detects the stack, runs safe probes, collects evidence, explains risks, and produces a proof-oriented report.

```bash
opstruth
```

## Example Output

Cleaned example from a fixture run:

```text
STATUS: Partial pass

What Matters Most
- No failures

Verified
- Project boundary: /tmp/opstruth-fixture-runs/vite-react-app
- Probe catalogue entries: 30
- Automatic safe probes selected: 15
- Project language detected: TypeScript
- Platforms detected: TypeScript, React, Vite, Node ESM

Skipped Or Not Configured
- routes.head_root: Not relevant to detected stack or missing configuration
- local.ports: Not relevant to detected stack or missing configuration

Not Verified
- Production/public route availability was not checked
- Local runtime liveness was not checked

Overall Confidence
Basic checks passed. Runtime or production verification may still be incomplete.
```

## Install

Published package:

```bash
npm install -g opstruth
opstruth
```

One-off usage:

```bash
npx opstruth
```

The public npm package is `opstruth@0.1.3`. This is a v0.1 public testing release, not a claim of mature production coverage.

Local development:

```bash
git clone https://github.com/AyobamiH/opstruth.git
cd opstruth
cd cli
npm install
npm link
opstruth
```

Release:

```text
https://github.com/AyobamiH/opstruth/releases/tag/v0.1.3
```

## Commands

```bash
opstruth
opstruth welcome
opstruth init
opstruth repo
opstruth quality
opstruth routes --base-url https://example.com
opstruth secrets
opstruth supabase
opstruth cloudflare
opstruth local --port 3000 --health /health
opstruth evidence
opstruth probes
```

Useful flags:

```bash
opstruth --strict
opstruth --json
opstruth --out evidence/opstruth.md
opstruth --skip routes
opstruth --only secrets
opstruth --color
opstruth --no-color
NO_COLOR=1 opstruth
```

Human terminal output is colourised when supported, using the same calm status language as the website. Use `--no-color` or `NO_COLOR=1` to disable colour, or `--color` to force colour for terminal demos. `--json` remains machine-readable and ANSI-free.

## Safety Model

opstruth is read-only by default. It does not:

- deploy
- mutate databases
- trigger jobs or queues
- publish content
- call OpenAI
- restart services
- kill processes
- print raw secrets

Skipped is not failed. Unverified is not safe. opstruth reports proof gaps instead of pretending they are confidence.

Secret scans group findings into actionable source findings, documentation references, placeholders/examples, local-only files, generated/dependency paths, ignored binaries, and unknown review items. See `docs/secret-reference-classification.md`.

Quality checks report lint, typecheck, tests, build, and CI as distinct proof signals. See `docs/quality-proof-signals.md`.

## Completion Gate

Codex work in this repo is not complete until the completion gate has run and the final report includes proof:

```bash
./scripts/opstruth-completion-gate.sh
```

See `docs/completion-gate.md`.

## Who It Is For

- Codex users
- Cursor users
- Claude Code users
- Lovable, Replit, and bolt users
- solo founders
- agencies
- developers reviewing AI-generated changes

## Focused Diagnostic Reviews

Start with the open-source CLI. If an opstruth report exposes risk you cannot interpret safely,
the same evidence can frame a focused diagnostic review for an AI-built website, app, automation,
or deployment setup.

A deeper review can look at repo structure, deployment path, secret exposure risk, runtime checks,
and the proof gaps to resolve before production changes. opstruth supports that review workflow; it
does not replace a security audit or guarantee that an app is safe.

For now, open a GitHub issue with the evidence pack and the narrow question you need answered.

## Example Workflows

Before trusting AI changes:

```bash
opstruth
```

Before deployment, with public route evidence:

```bash
opstruth --base-url https://example.com
```

Local runtime check:

```bash
opstruth local --port 3000 --health /health
```

CI:

```bash
opstruth --strict --out evidence/opstruth.md
```

Inspect the probe catalogue:

```bash
opstruth probes
```

## Real-World Validation

The Wagging Web Wins case study documents an OpsTruth-style review of a real app repo: authorization hardening, scheduler proof gaps, secret-boundary handling, GitHub PR gates, and the deliberate stop before Supabase mutation.

See `docs/case-studies/wagging-web-wins.md`.

## Project Boundaries

If opstruth starts inside a git repository, the git root is the project boundary. If no git repository is detected, opstruth scans only the current directory with safety ignores and prints:

```text
No git repository detected. opstruth is scanning the current directory with safety ignores. For best results, run inside a project repo.
```

## Probe Catalogue

The initial catalogue covers:

- git status, diff checks, diff stats, log context, and merge conflict marker scan
- Node, TypeScript, Vite, Next.js, React, ESLint, Vitest, Playwright, and package scripts
- route and local runtime checks when explicitly configured
- secret and risky reference scans with redaction
- static Supabase, Cloudflare/Wrangler, Docker, GitHub Actions, Vercel, and Netlify detection

Each probe defines what evidence it collects, what it proves, what it does not prove, and the next safe step.

The current catalogue also reports skipped-probe reasons, explicit inputs required, proof limitations, and metadata suitable for JSON automation:

```bash
opstruth probes --json
```

See `docs/probe-quality-model.md` for the maturity model.

## Configuration

Create a starter config:

```bash
opstruth init --yes
```

`opstruth.config.json` can provide route paths, local ports/health paths, and secret-scan allowlists. The one-command run uses supported route and local config inputs when present; without CLI flags or config, runtime checks stay skipped and are reported as proof gaps.

See `docs/configuration.md`.

## Current Limitations

- Some probes are static-only.
- Route checks need `--base-url` or route config.
- Local runtime checks need `--port`, `--health`, process, or service inputs.
- `opstruth@0.1.3` is a v0.1 public testing release.
- opstruth is not a replacement for a security audit.
- opstruth does not prove production state unless you provide production/staging route or runtime inputs.

## Development

This repository is a monorepo:

- `cli/` contains the opstruth package and probe implementation.
- `website/` contains the Lovable/TanStack frontend.
- `docs/` and `evidence/` contain project documentation and proof outputs.

CLI checks:

```bash
cd cli
npm run lint
npm test
node bin/opstruth.js
./scripts/demo-fixtures.sh
```

Website checks:

```bash
cd website
npm run lint
npm run build
```

Fixture evidence is written to root `evidence/fixture-runs/`.

## Website Deployment

The production website is served by Cloudflare Workers:

```text
https://opstruth.woeinvests.workers.dev
```

Lovable is the frontend editing surface, not the production deployment source. Production deploys run from the canonical monorepo through `.github/workflows/deploy-cloudflare.yml`, using only GitHub repository secrets for Cloudflare credentials. Website dependencies stay in `website/package.json`.

See `docs/deployment.md` and `docs/cloudflare-deployment.md` for the deployment model and local preview commands.

## Website Videos

The current website videos are generated from inspected repo, source CLI, npm, GitHub release, and Cloudflare production truth:

```text
website/public/demo/opstruth-hero-runtime-truth.mp4
website/public/demo/opstruth-current-runtime-truth.mp4
```

The older `website/public/demo/opstruth-runtime-truth.mp4` asset is historical launch material, not the current product truth source. See `docs/current-video-truth-brief.md` for the video evidence brief.
