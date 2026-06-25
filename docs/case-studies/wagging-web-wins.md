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

## Local Quality Proof

Wagging now has local quality proof through `npm run ci`, which runs lint, typecheck, tests, and build in order. The CI-aware validation confirmed lint passed with zero warnings, typecheck passed, Vitest passed 4 files and 40 tests, and the production build plus prerender completed.

OpsTruth quality reporting now exposes lint, typecheck, tests, build, and CI as separate proof signals. For Wagging, the configured `ci` script was the aggregate proof route, and the individual signals were reported as passed through that route rather than being collapsed into one generic quality result.

## GitHub CI Corroboration

Wagging also gained a GitHub Actions workflow named `CI`. The successful run inspected during validation was `28165808838` on commit `0786f1336b98c64f11bf3e34bb48845d1d9d8a54`, triggered by a push to `main`. Its `quality` job completed successfully from `2026-06-25T11:07:53Z` to `2026-06-25T11:08:54Z`.

This is external corroborating evidence. OpsTruth did not automatically ingest GitHub Actions metadata; the run was inspected separately and recorded in the case-study evidence.

## What CI Proves

CI proves that a fresh GitHub-hosted checkout can install with `npm ci` and run Wagging's committed quality gate for the pushed commit. It supports confidence in lint, typecheck, tests, build, and prerender behavior.

## What CI Does Not Prove

CI does not prove Supabase production configuration, scheduler activation, remote secret presence, deployed Edge Function behavior, live database permissions, production function authorization, or production security headers. The workflow intentionally uses inert build-time placeholders rather than production Supabase credentials.

## Production State Still Not Verified

Supabase mutation remains unapproved. No remote secret setup, Edge Function deploy, `db push`, migration application, SQL execution, pg_cron mutation, production endpoint call, or hardened function invocation was performed.

## Quality Signal Product Lessons

The case study now shows why quality proof must be granular. "CI passed" is useful, but it still needs to be separated from production runtime truth. OpsTruth should continue making those proof surfaces distinct and should treat GitHub Actions ingestion as a future product capability rather than pretending manual CI inspection is automatic.

## Remaining Gates

- Approve Supabase remote secret setup preflight.
- Review a safe scheduler secret storage path.
- Apply the scheduler update only after review.
- Deploy the hardened Edge Function.
- Verify runtime behavior with admin, non-admin, scheduler, missing-secret, invalid-secret, and rate-limit cases.
- Confirm deployed RLS/grants and function logs.
- Decide whether local-preview security-header warnings need environment-aware guidance while preserving strict production expectations.
