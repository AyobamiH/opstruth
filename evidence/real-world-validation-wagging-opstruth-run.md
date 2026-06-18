# Real-World OpsTruth Validation: Wagging Web Wins

## Date

2026-06-18

## Target Repo

- Repo: `AyobamiH/wagging-web-wins`
- Local path: `/home/johnh/wagging-web-wins`
- Target branch: `main`
- Latest commit during validation: `338f0d6 Add Wagging OpsTruth runtime validation inputs`

## Validation Timing

This was still pre-application validation. The reviewed Supabase execution packet remained ready, but the exact approval line for mutation was absent.

The run followed two safe Wagging updates:

- `ae9840e Triage Wagging lint quality issues`
- `338f0d6 Add Wagging OpsTruth runtime validation inputs`

## Supabase Application Status

Supabase production mutation was not performed. No remote secret setup, Edge Function deploy, `db push`, migration application, SQL execution, cron mutation, production endpoint call, or hardened function invocation happened during this run.

## OpsTruth Version Context

- Source CLI: `/home/johnh/opstruth/tempo/opstruth/cli/bin/opstruth.js`
- Public package context: `opstruth@0.1.3`
- Completion gate mode used before validation: `standard`
- Completion gate result before validation: passed

## Commands Run

```bash
./scripts/opstruth-completion-gate.sh --mode standard

cd /home/johnh/wagging-web-wins
npm run lint
npm run build
git diff --check
node /home/johnh/opstruth/tempo/opstruth/cli/bin/opstruth.js repo
node /home/johnh/opstruth/tempo/opstruth/cli/bin/opstruth.js probes
node /home/johnh/opstruth/tempo/opstruth/cli/bin/opstruth.js secrets
node /home/johnh/opstruth/tempo/opstruth/cli/bin/opstruth.js quality
node /home/johnh/opstruth/tempo/opstruth/cli/bin/opstruth.js routes
node /home/johnh/opstruth/tempo/opstruth/cli/bin/opstruth.js local
node /home/johnh/opstruth/tempo/opstruth/cli/bin/opstruth.js --skip evidence
node /home/johnh/opstruth/tempo/opstruth/cli/bin/opstruth.js --json --skip evidence > /tmp/opstruth-wagging-validation-after-lint-triage.json
node -e "JSON.parse(require('fs').readFileSync('/tmp/opstruth-wagging-validation-after-lint-triage.json','utf8')); console.log('wagging json parsed after lint triage')"
```

The route and local checks were run against a bounded Vite preview server on `127.0.0.1:4173`. Raw JSON output was not printed.

## What Was Verified

- The Wagging repo was inspected at `/home/johnh/wagging-web-wins`.
- Git root, branch, recent commits, package manager, stack signals, Vite, React, TypeScript, Node ESM, and Supabase project structure were detected.
- Package manager detection reports `npm`, matching the canonical lockfile.
- Probe catalogue inspection completed without mutating the target repo.
- Secret scanning completed with redaction and did not print raw `.env` contents.
- JSON output from the source CLI parsed successfully.
- `npm run build` completed and pre-rendered public pages.
- `git diff --check` completed.
- Direct `opstruth routes` reached `/`, `/services`, and `/faq` on local preview with HTTP `200`.
- Direct `opstruth local` detected port `4173` listening and reached the `/` health path with HTTP `200`.

## Warnings

- Secret and authorization references were detected in documentation and source surfaces, with redaction.
- Local preview route probes warned that the Vite preview responses did not include production-style browser security headers.
- Supabase checks remained mostly static and could not prove live remote behavior.
- The build pre-render step read published blog data. This was not a mutation, but it is runtime-adjacent evidence rather than a pure static compile.

## Failures

- `opstruth quality` reported failure because the Wagging `lint` script exited `1`.
- Lint improved from 42 errors and 20 warnings to 32 errors and 20 warnings after bounded mechanical fixes.
- The one-command `opstruth --skip evidence` result remained `STATUS: Fail`.

## Skipped / Not Configured

- `quality.typecheck`, `quality.test`, and `quality.ci` were skipped because matching non-placeholder scripts were not present.
- Cloudflare checks were skipped because no Wrangler config was detected in Wagging.
- In the one-command run, `local` still appeared as skipped even though direct `opstruth local` used `opstruth.config.json` successfully. This exposed an OpsTruth orchestration gap: local config is supported by the subcommand but not fully used by the one-command local-gating decision.

## Not Verified

- Supabase remote secret presence.
- Live database permissions.
- Deployed Edge Function behavior.
- Production scheduler headers.
- cron job state.
- Runtime responses for admin, non-admin, scheduler, missing-secret, invalid-secret, and rate-limit cases.
- Production/public route availability.
- Production security headers for the deployed website.

## What OpsTruth Helped Surface

OpsTruth separated merged code, local runtime evidence, local quality failure, static source warnings, and production proof gaps. The run showed that Wagging now has stronger local preview evidence, but it still cannot be treated as operationally clean because lint fails and production Supabase application remains deliberately unperformed.

## What OpsTruth Could Not Prove

OpsTruth did not prove that production Supabase is configured correctly, that the scheduler secret exists remotely, that the Edge Function was deployed, or that the live scheduler path works. Those checks require explicit approved mutation or live-runtime evidence.

## Product Lessons

- Real validation should show incremental improvement without turning remaining failures into passes.
- Local preview routes and local liveness are useful, but they do not prove production deployment.
- Route probes should distinguish local-preview header warnings from production header requirements.
- The one-command orchestrator should call local checks when `opstruth.config.json` contains local runtime inputs.
- Secret-reference warnings need clearer grouping between harmless documentation references and actionable source findings.
- Supabase output should distinguish static source confidence from live project confidence.

## v0.2 Backlog Items

- Add a case-study/evidence command for real repo validation runs.
- Add clearer lint/build failure summaries with command exit codes and before/after counts.
- Make one-command local orchestration honor local runtime inputs in `opstruth.config.json`.
- Group secret-reference findings by documentation, fixtures, generated output, and application source.
- Improve Supabase static versus live proof language.
- Add first-class "mutation not approved" evidence sections.
- Add local-preview versus production-route language for route header warnings.
