# Secret Reference Grouping

## Date

2026-06-25

## Problem

Real repos often contain secret-related language in multiple forms: source assignments, documentation references, placeholders, lockfiles, local-only `.env` files, and generated output. A flat warning count made evidence harder to trust because harmless references and actionable findings looked too similar.

## Change

OpsTruth now classifies secret and authorization references into grouped categories:

- actionable source findings
- documentation references
- placeholders/examples
- local-only files
- generated artifacts
- dependency/lockfile paths
- ignored binaries
- unknown token-like content requiring review

The `secrets` command reports the grouped summary in human output and JSON output.

## Tests Added

Regression tests cover:

- direct category classification
- detailed scan grouping
- redaction in grouped scan results
- `opstruth secrets --json` grouped output
- backwards-compatible warning findings for actionable items

## Commands Run

```bash
cd cli
npm run lint
npm test
node bin/opstruth.js secrets
node bin/opstruth.js --json --skip evidence > /tmp/opstruth-secret-grouping.json

cd /home/johnh/wagging-web-wins
node /home/johnh/opstruth/tempo/opstruth/cli/bin/opstruth.js secrets
node /home/johnh/opstruth/tempo/opstruth/cli/bin/opstruth.js --json --skip evidence > /tmp/opstruth-wagging-secret-grouping-preview.json
```

## What Was Verified

- CLI source syntax checks passed.
- The Node test suite passed.
- Documentation references are informational when they do not assign values.
- Placeholder/example assignments are informational.
- Untracked `.env` files are skipped without reading values.
- Tracked `.env` files remain actionable findings.
- Unknown long token-like strings are warning-level review items.
- JSON output remains parseable and ANSI-free.
- Raw fake values used in tests were redacted from scan output.
- The preview-backed Wagging Web Wins run parsed as JSON, returned `status=warn`, and had zero failures.
- Wagging secret/reference grouping reported actionable findings, documentation references, local-only files, generated/dependency paths, ignored binaries, and unknown review items separately.

## What Was Not Verified

- Remote secret store configuration.
- Deployed runtime secret availability.
- Production scheduler or Edge Function behavior.
- Any external secret manager integration.

## Safety Boundaries

The change is local and read-only. It does not deploy, publish, mutate databases, call production endpoints, or print raw secret values.

## Product Lesson

Secret evidence should show what was found and how it should be interpreted. A documentation-only reference is context. A tracked source assignment is actionable. A skipped `.env` file is a proof gap, not a pass.
