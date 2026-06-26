# Wagging Web Wins Case Study

## What Was Being Tested

Wagging Web Wins is a real website/app repository at `AyobamiH/wagging-web-wins`, not a synthetic fixture. The review focused on the `import-reddit-tips` Supabase Edge Function and the scheduler path that calls it.

## Why This Repo Mattered

The repo had live application concerns that fit the OpsTruth model: Edge Function authorization, Supabase secrets, scheduled jobs, migration safety, and GitHub PR handoff. The work was useful precisely because it mixed code changes with production proof gaps.

## What OpsTruth-Style Review Looked For

- What the code actually allowed.
- Which callers could reach the function.
- Whether privileged inserts happened before authorization.
- Whether scheduler authorization depended on public keys.
- Whether evidence was recorded without printing secrets.
- Which production steps were intentionally not performed.

## Risk Found

`import-reddit-tips` had a critical trust-boundary risk. The function was exposed at a public Edge Function boundary with `verify_jwt=false`, used privileged Supabase credentials to insert published `pet_tips`, and had a scheduler authorization pattern that needed a private scheduler secret rather than public anon/API-key style headers.

## What Was Changed

PR #11 hardened `import-reddit-tips` authorization and was merged. The hardening delayed privileged service-role usage until after authorization and rate limiting, supported authenticated admin callers, and added a scheduled-call boundary through `x-import-reddit-tips-secret`.

PR #12 added a guarded scheduler migration draft and security documentation. It was reviewed and squash-merged as `d2f2014` only after confirming that it changed the intended docs/migration files and did not hardcode the scheduler secret.

## Evidence Produced

- PR #11: `Harden import reddit tips authorization`.
- PR #12: `Draft import reddit tips scheduler secret migration`.
- PR #12 files: `docs/import-reddit-tips-security.md` and `supabase/migrations/20260613211912_update_import_reddit_tips_scheduler_secret.sql`.
- PR #12 merge commit: `d2f2014db18ff38deb69cd47b61288914bd069d1`.
- Local workflow logs recorded checks, skipped production steps, and remaining gates.
- OpsTruth source CLI validation evidence: `evidence/real-world-validation-wagging-opstruth-run.md`.

## What Was Verified

- GitHub auth and repo permissions were sufficient for branch and PR handoff.
- PR #12 changed only the intended docs and migration draft.
- The migration draft was intentionally non-executable.
- The migration did not hardcode `IMPORT_REDDIT_TIPS_SECRET`.
- The docs stated that remote secret setup, scheduler secret storage, migration application, function deployment, and runtime verification remained separate gates.
- PR checks passed before merge.

## What Was Not Verified

- Supabase production secrets were not verified remotely.
- The hardened Edge Function was not deployed in this workflow.
- The scheduler was not updated in production.
- No database migration was applied.
- No runtime endpoint was called.
- Production behavior was not proven.

## What Was Deliberately Not Done

The workflow did not set Supabase remote secrets, deploy Edge Functions, run `db push`, apply migrations, execute SQL, mutate pg_cron, invoke production endpoints, call the hardened function, print secrets, or stage local-only evidence/temp files.

## Why This Matters For AI-Assisted Builders

The work showed the difference between "code changed" and "production truth verified." AI-assisted changes can harden code quickly, but the operational truth still depends on what was inspected, what was merged, what was deployed, and what remained unverified.

## Result

Wagging Web Wins became a real OpsTruth validation case: the workflow improved an authorization boundary, recorded evidence, protected secrets, used PR gates, and stopped before production mutation. The stop was not a failure. It was an honest proof gap.

The 2026-06-17 OpsTruth run against Wagging was intentionally pre-application validation. It confirmed repo and stack detection, npm package-manager detection, probe catalogue inspection, redacted secret scanning, and parseable JSON output. It also reported `STATUS: Fail` because Wagging's local `lint` script exited `1` with real lint errors, and it kept Supabase production behavior in `Not Verified`.

The 2026-06-18 follow-up reduced the lint backlog from 42 errors and 20 warnings to 32 errors and 20 warnings without disabling rules or changing Supabase behavior. Wagging also gained local-only OpsTruth runtime inputs for Vite preview at `127.0.0.1:4173`. Direct route probes reached `/`, `/services`, and `/faq` with HTTP `200`, and direct local runtime probes confirmed port `4173` and `/` health. The one-command result still stayed `STATUS: Fail` because lint remained failing, and production Supabase mutation was still not approved.

The 2026-06-19 follow-up reduced lint to zero errors and 20 warnings with bounded type and correctness fixes. OpsTruth then fixed its one-command orchestration so supported route and local inputs from `opstruth.config.json` are used without duplicate CLI flags. Against a bounded local preview, the run reported `STATUS: Partial pass`: quality and local checks passed, all three configured routes returned HTTP `200`, route checks warned about preview security headers, and no failures were reported. Supabase production mutation was still not approved or performed.

The 2026-06-25 follow-up cleared the remaining 12 Fast Refresh warnings by moving helpers, variants, and hooks into adjacent non-component modules. Wagging's `npm run lint` now exits `0` with zero warnings, `npm run build` still completes, and OpsTruth's one-command run still reports `STATUS: Partial pass` with no failures. The remaining proof gaps are not local lint quality gaps; they are live Supabase, scheduler, deployment, and production-route verification gates.

The same pass improved OpsTruth's secret-reference evidence. The Wagging run still surfaced secret/auth language, but the scanner now separates actionable source findings from documentation references, placeholders, local-only files, generated/dependency paths, ignored binaries, and unknown token-like review items. This made the evidence easier to review without claiming Supabase production secrets were configured or safe.

The 2026-06-26 follow-up reviewed and merged PR #13, `add-import-reddit-tips-observability`, then fast-forwarded Wagging `main` to merge commit `70d7845`. The branch added count-only pipeline telemetry for `import-reddit-tips` after authorization/rate limiting, plus focused tests and docs. Local `npm run ci` passed before and after merge, and the changed-file scan did not find secret values. A Cloudflare Pages preview check was still failed, but the branch did not change site deployment files and was merged without admin bypass.

OpsTruth's new `github-ci` command then verified exact-commit GitHub Actions metadata for merged `main`. It resolved `AyobamiH/wagging-web-wins`, matched the local merge commit to workflow `CI` run `28217133767`, and recorded the `quality` job as `success`. The first live validation exposed a useful product bug: the generic redaction layer was replacing long SHA-like strings before internal comparison. OpsTruth fixed that by preserving raw stdout only for Git and `gh` JSON parsing in the GitHub proof path while keeping human/JSON output redacted.

With a bounded local preview on `127.0.0.1:4173`, direct route checks reached `/`, `/services`, and `/faq` with HTTP `200`, and direct local checks confirmed port `4173` plus `/` health. The one-command run with `--github-ci --workflow CI --skip evidence` included GitHub CI as `Pass`, quality as `Pass`, local as `Pass`, routes as warning-only local-preview header evidence, and no failures.

The final 2026-06-26 readiness pass stayed in the no-approval Supabase path. Wagging added `docs/import-reddit-tips-production-verification.md` at `48e23bb` to define the denial, invalid-secret, authorised, telemetry, database-effect, function metadata, and scheduler verification plan without invoking production. Local CI passed, the tracked-source safety gate reported zero findings, Supabase CLI/project access preflight succeeded, and OpsTruth verified exact-commit GitHub Actions run `28230876112` for the current commit. The reviewed execution packet remained unexecuted because the actual prompt did not include the required approval line.

The combined OpsTruth JSON proof parsed successfully, but the no-preview invocation reported `STATUS: Fail` because configured local route and health checks require an active local preview server. That result was preserved as an operational precondition, not rewritten into a pass.

## Local Quality Proof

Wagging now has local quality proof through `npm run ci`, which runs lint, typecheck, tests, and build in order. The CI-aware validation confirmed lint passed with zero warnings, typecheck passed, Vitest passed 4 files and 40 tests, and the production build plus prerender completed.

OpsTruth quality reporting now exposes lint, typecheck, tests, build, and CI as separate proof signals. For Wagging, the configured `ci` script was the aggregate proof route, and the individual signals were reported as passed through that route rather than being collapsed into one generic quality result.

## GitHub CI Corroboration

Wagging also gained a GitHub Actions workflow named `CI`. The successful run inspected during validation was `28165808838` on commit `0786f1336b98c64f11bf3e34bb48845d1d9d8a54`, triggered by a push to `main`. Its `quality` job completed successfully from `2026-06-25T11:07:53Z` to `2026-06-25T11:08:54Z`.

This began as external corroborating evidence. OpsTruth now has first-class GitHub Actions metadata ingestion through `opstruth github-ci`, with opt-in one-command support through `--github-ci` or config.

## What CI Proves

CI proves that a fresh GitHub-hosted checkout can install with `npm ci` and run Wagging's committed quality gate for the pushed commit. It supports confidence in lint, typecheck, tests, build, and prerender behavior.

## What CI Does Not Prove

CI does not prove Supabase production configuration, scheduler activation, remote secret presence, deployed Edge Function behavior, live database permissions, production function authorization, or production security headers. The workflow intentionally uses inert build-time placeholders rather than production Supabase credentials.

## Exact-Commit GitHub Actions Proof

- Merged main commit: `70d7845`
- Repository resolution: `AyobamiH/wagging-web-wins`
- Workflow and job result: `CI` run `28217133767`, `quality:success`
- Local quality proof: merged-main `npm run ci` passed lint, typecheck, 47 tests across 5 files, build, and prerender
- Local runtime proof: local preview routes `/`, `/services`, `/faq` returned HTTP `200`; local port `4173` and `/` health passed
- CI proof: exact commit match was verified by OpsTruth

## Local Evidence Versus Production Proof

Local quality, local preview, and exact-commit CI are strong evidence for the code and hosted quality gate. They are not production proof. Production deployment, Supabase remote secret setup, scheduler state, live Edge Function authorization, live database permissions, and production route headers remain separate gates.

## Production State Still Not Verified

Supabase mutation was later approved with the exact required approval line. The approved run set the remote `IMPORT_REDDIT_TIPS_SECRET` name from private runtime, deployed only `import-reddit-tips`, and ran bounded live verification requests.

Verified production behavior from the approved run:

- missing credentials returned `401`
- incorrect scheduler credentials returned `403`
- authorised scheduled-path smoke request returned `200`
- the authorised response reported zero candidates and zero inserts
- `pet_tips` count stayed `0`
- read-only scheduler metadata showed one `import-reddit-tips-daily` job at `0 8 * * *`
- scheduler metadata classified the private scheduler header as present and the legacy `apikey` header as absent

Still not verified:

- autonomous pg_cron execution
- function log telemetry
- complete admin/non-admin production matrix
- ongoing reliability beyond one smoke request
- complete database permission or tenant-isolation proof

## Quality Signal Product Lessons

The case study now shows why quality proof must be granular. "CI passed" is useful, but it still needs to be separated from production runtime truth. OpsTruth should continue making those proof surfaces distinct and should treat GitHub Actions ingestion as a future product capability rather than pretending manual CI inspection is automatic.

## Remaining Gates

- Observe an autonomous scheduled execution.
- Verify function log telemetry contains only count-only safe fields.
- Verify admin and non-admin production authorization branches.
- Verify rate-limit behavior in production.
- Confirm deployed RLS/grants and broader database effects.
- Decide whether local-preview security-header warnings need environment-aware guidance while preserving strict production expectations.
