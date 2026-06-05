# Examples

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
./scripts/demo-fixtures.sh
```

This copies local fixtures to temporary directories, initializes git where appropriate, runs opstruth, and writes evidence to `evidence/fixture-runs/`.
