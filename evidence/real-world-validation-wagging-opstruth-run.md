# Real-World OpsTruth Validation: Wagging Web Wins

## Date

2026-06-16

## Target Repo

- Repo: `AyobamiH/wagging-web-wins`
- Local path: `/home/johnh/wagging-web-wins`
- Target branch: `main`
- Latest commit during validation: `7eeea04 Prepare import reddit tips Supabase execution packet`

## Validation Timing

This was a pre-application validation run. The scheduler execution packet existed, but the explicit approval line for Supabase mutation was not present in the prompt.

## Supabase Application Status

Supabase production mutation was not performed. No remote secret setup, Edge Function deploy, `db push`, migration application, SQL execution, pg_cron mutation, production endpoint call, or hardened function invocation happened during this run.

## OpsTruth Version Context

- Source CLI: `/home/johnh/opstruth/tempo/opstruth/cli/bin/opstruth.js`
- Public package context: `opstruth@0.1.3`
- Completion gate mode used before validation: `standard`
- Completion gate result before validation: passed

## Commands Run

```bash
./scripts/opstruth-completion-gate.sh --mode standard

cd /home/johnh/wagging-web-wins
node /home/johnh/opstruth/tempo/opstruth/cli/bin/opstruth.js repo
node /home/johnh/opstruth/tempo/opstruth/cli/bin/opstruth.js probes
node /home/johnh/opstruth/tempo/opstruth/cli/bin/opstruth.js secrets
node /home/johnh/opstruth/tempo/opstruth/cli/bin/opstruth.js quality
node /home/johnh/opstruth/tempo/opstruth/cli/bin/opstruth.js --skip evidence
node /home/johnh/opstruth/tempo/opstruth/cli/bin/opstruth.js --json --skip evidence > /tmp/opstruth-wagging-validation.json
node -e "JSON.parse(require('fs').readFileSync('/tmp/opstruth-wagging-validation.json','utf8')); console.log('wagging json parsed')"
```

Raw JSON output was not printed. It was parsed from `/tmp/opstruth-wagging-validation.json`.

## Completion Gate Mode Used

`standard`

The standard gate passed after the timeout-mode fix. Required checks included CLI lint, CLI tests, opstruth self-checks, website build, root build, and Wrangler dry-run. Optional network checks also completed.

## What Was Verified

- The Wagging repo was inspected at `/home/johnh/wagging-web-wins`.
- Git root, branch, recent commits, package manager, stack signals, Vite, React, TypeScript, Node ESM, and Supabase project structure were detected.
- Probe catalogue inspection completed without mutating the target repo.
- Secret scanning completed with redaction and did not print raw `.env` contents.
- JSON output from the source CLI parsed successfully.
- OpsTruth reported local evidence for the checks it could run.

## Warnings

- Secret and authorization references were detected in documentation and source surfaces.
- The warnings were redacted by OpsTruth output.
- Supabase checks remained mostly static and could not prove live remote behavior.
- Route and local runtime probes were skipped because no base URL, routes config, port, process, or health endpoint was provided.

## Failures

- `opstruth quality` reported failure because the Wagging `lint` script exited `127`.
- The one-command `opstruth --skip evidence` result was therefore `STATUS: Fail`.

## Skipped / Not Configured

- `quality.typecheck`, `quality.test`, and `quality.ci` were skipped because matching non-placeholder scripts were not present.
- Route checks were skipped because no `--base-url` or route config was provided.
- Local runtime checks were skipped because no port, health path, process, or service input was provided.
- Cloudflare checks were skipped because no Wrangler config was detected in Wagging.

## Not Verified

- Supabase remote secret presence.
- Live database permissions.
- Deployed Edge Function behavior.
- Production scheduler headers.
- pg_cron job state.
- Runtime responses for admin, non-admin, scheduler, missing-secret, invalid-secret, and rate-limit cases.
- Production/public route availability.

## What OpsTruth Helped Surface

OpsTruth separated merged code and documentation from operational truth. It showed that the repo had useful GitHub evidence and a prepared execution packet, while local quality still failed and Supabase production application remained a deliberate proof gap.

## What OpsTruth Could Not Prove

OpsTruth did not prove that Supabase production was configured correctly, that the scheduler secret exists remotely, that the Edge Function was deployed, or that the live scheduler path works. Those checks require explicit approved mutation or live-runtime inputs.

## Product Lessons

- Real validation should capture failed quality gates without treating them as infrastructure failure.
- Secret-reference warnings need clearer grouping between harmless documentation references and actionable source findings.
- Supabase output should distinguish static source confidence from live project confidence.
- The product should make "pre-application validation" a first-class evidence state.

## v0.2 Backlog Items

- Add a case-study/evidence command for real repo validation runs.
- Add clearer lint/build failure summaries with command exit codes.
- Group secret-reference findings by documentation, fixtures, and source code.
- Improve Supabase static versus live proof language.
- Add first-class "mutation not approved" evidence sections.
- Add a route/local-runtime setup hint when probes are skipped because inputs are missing.
