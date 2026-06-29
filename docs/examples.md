# Examples

## Install

```bash
npm install -g opstruth
opstruth
```

The latest published npm package is `opstruth@0.1.3`. Source is prepared for `opstruth@0.2.0`,
pending an authenticated npm publish.

## One-Off Usage

```bash
npx opstruth
```

This runs the published package without a global install.

## Terminal Colour

```bash
opstruth --color
opstruth --no-color
NO_COLOR=1 opstruth
```

Human terminal output is colourised only for readability. `opstruth --json` stays machine-readable and ANSI-free. Evidence markdown output remains ANSI-free.

## One Command

```bash
opstruth
```

Use this after AI-assisted changes to collect repo, stack, secret, quality, and configured runtime evidence.

## Route Evidence

```bash
opstruth --base-url https://example.com
```

This adds read-only HEAD/GET route checks when routes are configured.

## Local Runtime

```bash
opstruth local --port 3000 --health /health
```

This checks only the explicit local port and health path. It does not start, restart, or kill services.

## Secret Scan

```bash
opstruth secrets
```

Findings include file, line, matched pattern, redacted preview, why it matters, and the next safe step.

## Fixture Runs

```bash
cd cli
./scripts/demo-fixtures.sh
```

This copies local fixtures to temporary directories, initializes git where appropriate, runs opstruth, and writes evidence to `evidence/fixture-runs/`.

## Public Fixture Matrix

```bash
./scripts/run-fixture-matrix.sh
```

This copies root fixtures to `/tmp`, runs the core opstruth commands, and writes commit-friendly summaries to `evidence/fixture-matrix/`.

## Configuration

```bash
opstruth init --yes
opstruth routes --base-url https://example.com
opstruth local --port 3000 --health /health
```

`opstruth.config.json` can provide route paths, local ports/health paths, and secret-scan allowlists. CLI flags remain the clearest way to provide runtime inputs.

## Release Links

- GitHub release: `https://github.com/AyobamiH/opstruth/releases/tag/v0.1.3`
- Production website: `https://opstruth.woeinvests.workers.dev`
