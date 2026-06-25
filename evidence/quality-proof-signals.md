# Quality Proof Signals

## Date

2026-06-25

## Problem

OpsTruth previously selected and ran quality scripts, but the result could read like a single quality surface. Real repos need distinct proof for lint, typecheck, tests, build, and CI.

## Change

The quality command now reports structured proof signals for:

- lint
- typecheck
- tests
- build
- CI

Each signal records whether it is configured, passed, failed, not configured, skipped, timed out, or not verified.

## Execution Strategy

When a safe `ci` script exists, OpsTruth runs it as the aggregate proof path and reports which individual configured scripts it covers. When CI is absent or unsafe, OpsTruth runs safe individual scripts.

## Safety Boundary

Mutation-like quality scripts are not executed automatically. Scripts that appear to deploy, publish, push databases, run Supabase mutations, or mutate cron are skipped for human review.

## Tests Added

Regression coverage now includes:

- all five signals configured and passing through CI
- failing lint
- missing tests
- timed-out build
- passing CI
- mutation-like CI refusal
- individual scripts when CI is absent
- package-manager runner selection
- JSON output parseability and ANSI-free output
- evidence/check rows for each signal

## Commands Run

```bash
cd cli
npm run lint
npm test
node bin/opstruth.js quality
node bin/opstruth.js --json --skip evidence > /tmp/opstruth-quality-signals.json
```

## What Was Verified

- CLI syntax checks passed.
- The Node test suite passed.
- Quality JSON parsed successfully.
- Distinct signal records appear in the quality result.
- Missing scripts are not treated as passes.
- CI is not assumed to cover a signal unless the CI script names that script.

## What Was Not Verified

- GitHub Actions ingestion as a first-class OpsTruth input.
- Production deployment health.
- Remote Supabase configuration.
- Live scheduler/function behavior.
