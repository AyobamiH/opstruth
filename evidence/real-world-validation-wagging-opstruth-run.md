# Real-World OpsTruth Validation: Wagging Web Wins

## Date

2026-06-25

## Target Repo

- Repo: `AyobamiH/wagging-web-wins`
- Local path: `/home/johnh/wagging-web-wins`
- Target branch: `main`
- Latest commit during validation: `0786f13 Make Wagging CI independent of production Supabase config`

## Validation Timing

This was still pre-Supabase-application validation. The reviewed Supabase execution packet remained ready, but the exact approval line for mutation was absent.

The latest run followed these safe, bounded updates:

- `ae9840e Triage Wagging lint quality issues`
- `338f0d6 Add Wagging OpsTruth runtime validation inputs`
- `8875ec8 Reduce Wagging lint backlog safely`
- `1bcee9f Reduce Wagging lint warnings safely`
- `1f456b1 Document GitHub and Supabase execution readiness`
- `a3ae062 Clear Wagging Fast Refresh lint warnings`

It also used the OpsTruth orchestration fix in `33054b7 Honor local config in OpsTruth one-command run` and later local-preview guidance from `1f8e0ff Clarify local preview security header guidance`.

The CI-aware follow-up added Wagging's GitHub Actions quality gate in `3141792 Add Wagging CI quality gate`, then made it independent of production Supabase configuration in `0786f13 Make Wagging CI independent of production Supabase config`.

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
node /home/johnh/opstruth/tempo/opstruth/cli/bin/opstruth.js routes
node /home/johnh/opstruth/tempo/opstruth/cli/bin/opstruth.js local
node /home/johnh/opstruth/tempo/opstruth/cli/bin/opstruth.js --skip evidence
node /home/johnh/opstruth/tempo/opstruth/cli/bin/opstruth.js --json --skip evidence > /tmp/opstruth-wagging-after-fast-refresh.json
node -e "JSON.parse(require('fs').readFileSync('/tmp/opstruth-wagging-after-fast-refresh.json','utf8')); console.log('wagging opstruth json parsed after fast refresh cleanup')"

node /home/johnh/opstruth/tempo/opstruth/cli/bin/opstruth.js secrets
node /home/johnh/opstruth/tempo/opstruth/cli/bin/opstruth.js --json --skip evidence > /tmp/opstruth-wagging-secret-grouping-preview.json

npm run ci
gh run view 28165808838 --repo AyobamiH/wagging-web-wins --json databaseId,conclusion,status,event,headSha,workflowName,jobs,url,createdAt,updatedAt

node /home/johnh/opstruth/tempo/opstruth/cli/bin/opstruth.js repo
node /home/johnh/opstruth/tempo/opstruth/cli/bin/opstruth.js quality
node /home/johnh/opstruth/tempo/opstruth/cli/bin/opstruth.js secrets
node /home/johnh/opstruth/tempo/opstruth/cli/bin/opstruth.js routes
node /home/johnh/opstruth/tempo/opstruth/cli/bin/opstruth.js local
node /home/johnh/opstruth/tempo/opstruth/cli/bin/opstruth.js --skip evidence
node /home/johnh/opstruth/tempo/opstruth/cli/bin/opstruth.js --json --skip evidence > /tmp/opstruth-wagging-ci-aware.json
node -e "JSON.parse(require('fs').readFileSync('/tmp/opstruth-wagging-ci-aware.json','utf8')); console.log('CI-aware Wagging JSON parsed')"
```

The route and local checks were run against a bounded Vite preview server on `127.0.0.1:4173`. Raw JSON output was not printed.

## Local Quality Proof

Wagging's local quality gate passed through `npm run ci`. That script runs lint, typecheck, tests, and build in order. The observed local proof was:

- `npm run lint` passed with zero warnings.
- `npm run typecheck` passed.
- Vitest passed 4 test files and 40 tests.
- `npm run build` passed, including client build, server build, and prerender.
- OpsTruth quality reported lint, typecheck, tests, build, and CI as distinct passed proof signals through the configured aggregate `ci` script.

## GitHub CI Corroboration

GitHub Actions was inspected as external corroborating evidence, not as an OpsTruth-ingested proof field.

- Workflow: `CI`
- Run: `28165808838`
- Trigger: `push`
- Commit: `0786f1336b98c64f11bf3e34bb48845d1d9d8a54`
- Conclusion: `success`
- Job: `quality`
- Job conclusion: `success`
- Started: `2026-06-25T11:07:53Z`
- Completed: `2026-06-25T11:08:54Z`

## What CI Proves

The GitHub CI run proves that a clean GitHub-hosted checkout could install dependencies with `npm ci` and run Wagging's committed `npm run ci` quality gate successfully for commit `0786f13`. It corroborates local proof for lint, typecheck, tests, build, and prerender behavior in a fresh CI environment.

## What CI Does Not Prove

The CI workflow uses inert public build-time placeholders for Supabase URL and anon key so that build-time imports do not require production credentials. It does not prove live Supabase production configuration, scheduler state, remote secret presence, deployed Edge Function behavior, RLS/grant behavior, or production-route security headers.

## Production State Still Not Verified

Supabase mutation remained unapproved. No remote secret setup, Edge Function deploy, `db push`, migration application, SQL execution, pg_cron mutation, production endpoint call, or hardened function invocation was performed.

## Quality Signal Product Lessons

Distinct quality proof signals make the case study easier to interpret. A single "quality passed" label would hide whether lint, typecheck, tests, build, or CI actually ran. The new signal model shows the aggregate route used while preserving proof gaps for scripts that are missing, unsafe, timed out, or not verified.

## What Was Verified

- The Wagging repo was inspected at `/home/johnh/wagging-web-wins`.
- Git root, branch, recent commits, package manager, stack signals, Vite, React, TypeScript, Node ESM, and Supabase project structure were detected.
- Package manager detection reports `npm`, matching the canonical lockfile.
- Probe catalogue inspection completed without mutating the target repo.
- Secret scanning completed with redaction and did not print raw `.env` contents.
- JSON output from the source CLI parsed successfully.
- `npm run lint` completed with zero errors and zero warnings after the Fast Refresh cleanup.
- `npm run ci` completed successfully after the GitHub CI quality gate was added.
- `npm run build` completed and pre-rendered public pages.
- `git diff --check` completed before commit.
- Secret/reference scanning produced grouped evidence categories instead of only a flat warning count.
- Direct `opstruth routes` reached `/`, `/services`, and `/faq` on local preview with HTTP `200`.
- Direct `opstruth local` detected port `4173` listening and reached the `/` health path with HTTP `200`.
- The one-command run consumed the same configured route and local inputs: quality passed, local passed, routes warned, and local was not skipped.
- The final one-command result was `STATUS: Partial pass` with no failures.
- The CI-aware JSON run parsed successfully with `status=warn`, 16 checks, 162 warnings, and zero failures.
- After secret-reference grouping, the preview-backed JSON run parsed successfully with `status=warn`, zero failures, and grouped secret/reference counts.

## Warnings

- Secret and authorization references were detected with redaction. The latest scanner groups these as actionable findings, documentation references, placeholders/examples, local-only files, generated/dependency paths, ignored binaries, and unknown review items.
- Local preview route probes warned that the Vite preview responses did not include production-style browser security headers.
- Supabase checks remained mostly static and could not prove live remote behavior.
- The build pre-render step read published blog data. This was not a mutation, but it is runtime-adjacent evidence rather than a pure static compile.
- Earlier one-command JSON output contained a large flat warning list dominated by secret/auth reference findings and local-preview route-header warnings. Secret-reference grouping now reduces the interpretation burden by separating context from actionable review items.
- The grouped Wagging secret scan still produced high warning volume: 63 actionable findings, 84 documentation references, 1 local-only file, 45 generated artifacts, 1 dependency/lockfile path, 8 ignored binaries, and 88 unknown review items.

## Failures

- None in the final validation run.

## Skipped / Not Configured

- `quality.typecheck`, `quality.test`, and `quality.ci` were skipped because matching non-placeholder scripts were not present.
- Cloudflare checks were skipped because no Wrangler config was detected in Wagging.
- Production route checks remained outside this local-preview run.
- The one-command run did not skip local runtime when `opstruth.config.json` supplied supported local inputs.

## Not Verified

- Supabase remote secret presence.
- Live database permissions.
- Deployed Edge Function behavior.
- Production scheduler headers.
- cron job state.
- Runtime responses for admin, non-admin, scheduler, missing-secret, invalid-secret, and rate-limit cases.
- Production/public route availability.
- Production security headers for the deployed website.
- Process ownership beyond the local port/health evidence.

## What OpsTruth Helped Surface

OpsTruth separated merged code, clean local lint/build evidence, local runtime evidence, static source warnings, and production proof gaps. The run showed that Wagging now has strong local quality and preview evidence, but `Partial pass` remains accurate because route headers warned and production Supabase application remains deliberately unperformed.

## What OpsTruth Could Not Prove

OpsTruth did not prove that production Supabase is configured correctly, that the scheduler secret exists remotely, that the Edge Function was deployed, or that the live scheduler path works. Those checks require explicit approved mutation or live-runtime evidence.

## Product Lessons

- Real validation should show incremental improvement without turning remaining proof gaps into passes.
- Local preview routes and local liveness are useful, but they do not prove production deployment.
- Route probes should distinguish local-preview header warnings from production header requirements.
- The one-command orchestrator must keep regression coverage for config-driven local and route checks.
- Secret-reference warnings now need continued evidence-pack polish around the grouped categories, especially for large real repos.
- Supabase output should distinguish static source confidence from live project confidence.
- Clean lint is useful evidence, but it does not resolve live scheduler, database, or deployment proof gaps.

## Exact-Commit GitHub Actions Proof

2026-06-26 merged-main validation used the source CLI after adding the `github-ci` command and after fixing internal SHA redaction in the proof path.

## Merged Main Commit

- Branch: `main`
- Merge commit: `70d7845`
- Source PR: `https://github.com/AyobamiH/wagging-web-wins/pull/13`
- PR #13 result: merged normally; no admin bypass was used.

## Repository Resolution

`opstruth github-ci --workflow CI` resolved the repository as `AyobamiH/wagging-web-wins` from the local `origin` remote.

## Workflow And Job Result

- Workflow: `CI`
- Run ID: `28217133767`
- Trigger: `push`
- Conclusion: `success`
- Job inspected: `quality`
- Job conclusion: `success`
- Exact commit match: yes

## Local Quality Proof

Merged `main` passed `npm run ci`. The current run proved lint, typecheck, 47 Vitest tests across 5 files, client/server build, and prerender. OpsTruth quality also reported the aggregate `ci` script as the proof route for lint, typecheck, tests, build, and CI.

## Local Runtime Proof

A bounded local Vite preview server ran on `127.0.0.1:4173`. Direct OpsTruth route checks reached `/`, `/services`, and `/faq` with HTTP `200`. Direct local runtime checks confirmed port `4173` listening and `/` health returning HTTP `200`.

## CI Proof

The one-command run with `--github-ci --workflow CI --skip evidence` included GitHub CI as `Pass`, quality as `Pass`, local runtime as `Pass`, and routes as `Partial pass` due to local-preview header warnings. JSON output parsed successfully.

## Production State Still Not Verified

Local preview route success does not prove production route availability or production security headers. GitHub CI success does not prove deployment. No deploy was performed.

## Supabase State Still Not Verified

Supabase mutation was not approved. No remote secret setup, Edge Function deploy, `db push`, migration application, SQL execution, pg_cron mutation, production endpoint call, or hardened function invocation was performed. Scheduler state, live database permissions, remote secret presence, and production Edge Function behavior remain proof gaps.

## Supabase Final Readiness

The 2026-06-26 final readiness pass stayed in the no-approval path. Wagging `main` was aligned with `origin/main` after `48e23bb Document import Reddit tips production verification plan`. The source safety gate reported `tracked_source_findings=0`, local `npm run ci` passed, Supabase CLI `2.108.0` was available, required runtime variables were present by yes/no check, and Supabase project access returned success.

OpsTruth verified exact-commit GitHub Actions proof for the current Wagging commit after the documentation-only readiness commit. The `CI` workflow run `28230876112` completed successfully with the `quality` job marked `success`.

The reviewed execution packet remained unexecuted. The scheduler migration remains a guarded, non-executable draft until the secret-storage path is explicitly approved and reviewed.

## Approval Boundary

The actual prompt did not begin with the required Supabase mutation approval line. That made the approved production path unavailable for this run. The readiness evidence is therefore a pre-application result, not a production application result.

## Mutation Not Run

No Supabase secret was set, no Edge Function was deployed, no migration was applied, no SQL was executed, no pg_cron job was changed, and no production endpoint or hardened function was invoked.

## Live Function State Not Verified

No missing-credential, invalid-secret, admin, non-admin, scheduler, rate-limit, or authorised production request was sent. The expected response paths are documented in Wagging's `docs/import-reddit-tips-production-verification.md`, but they were not exercised against production.

## Scheduler State Not Verified

No production scheduler metadata was inspected through SQL, no scheduler job was changed, and no scheduler execution was observed. The scheduler remains a planned verification target after explicit approval.

## Planned Verification

The next approved run should execute only the reviewed packet, then verify function deployment metadata, missing-credential denial, incorrect-secret denial, authorised behavior only if safely bounded, count-only database effects, telemetry, and scheduler state without printing secrets or project identifiers.

## Current OpsTruth Result

`opstruth repo`, `opstruth quality`, `opstruth secrets`, and `opstruth github-ci --workflow CI` were run against Wagging. Repo and quality passed, exact-commit GitHub CI passed, and the secret scan remained warning-class evidence with redacted references requiring review.

The combined JSON proof parsed successfully. Its top-level status was `fail` in this no-preview invocation because the configured local route and health checks require a bounded preview server and none was running for that specific command. This does not change the earlier local-preview proof; it records that local runtime checks are only verified when their runtime precondition is active.

## v0.2 Backlog Items

- Add a case-study/evidence command for real repo validation runs.
- Add clearer lint/build summaries with before/after counts and whether warnings remain.
- Keep regression coverage for one-command local orchestration honoring `opstruth.config.json`.
- Extend grouped secret-reference findings into evidence packs and case-study summaries.
- Improve Supabase static versus live proof language.
- Add first-class "mutation not approved" evidence sections.
- Add local-preview versus production-route language for route header warnings.
- Keep exact-commit GitHub Actions proof visible in case-study evidence without implying production deployment.
