---
name: opstruth-preflight
description: Run opstruth local confidence checks before pushing or risky repository operations. Use before GitHub publishing, release preparation, or major handoff.
---

# opstruth Preflight

## Purpose

Run local project confidence checks before pushing or other risky repo operations.

## When To Use

Use before publishing, pushing, releases, handoffs, or when the user asks for a preflight, confidence check, proof run, or release readiness check.

## Commands To Run

Always check state first:

```bash
git status --short
npm run lint
npm test
node bin/opstruth.js --help
node bin/opstruth.js welcome
node bin/opstruth.js probes
node bin/opstruth.js --skip evidence
./scripts/demo-fixtures.sh
```

Write or update:

```text
evidence/preflight.md
```

## Safety Boundaries

- Never print tokens.
- Never commit secrets.
- Never fake test, fixture, or opstruth output.
- Do not deploy, publish, tag, or push.
- Treat warnings as proof gaps, not success.

## Required Checks

- `git status --short`
- `npm run lint`
- `npm test`
- `node bin/opstruth.js --help`
- `node bin/opstruth.js welcome`
- `node bin/opstruth.js probes`
- `node bin/opstruth.js --skip evidence`
- `./scripts/demo-fixtures.sh`
- Confirm `evidence/preflight.md` records commands, status, warnings, failures, and next safe step.

## Failure Handling

If any command fails, stop after collecting enough output to identify the failure. Write the blocker into `evidence/preflight.md` if possible.

If fixture generation changes evidence files, report those changed files.

## Final Report Format

```text
Status: Done | Blocked
Checks: <passed/failed summary>
Evidence: evidence/preflight.md updated | blocked
Warnings/proof gaps: <summary>
Blocker: <exact blocker, if any>
Next step: <safe next command>
```
