# Real-World Validation: Wagging Web Wins

## Date

2026-06-14

## Repos Involved

- Validation target: `AyobamiH/wagging-web-wins`
- Product repo: `AyobamiH/opstruth`
- Local workflow system: `/home/johnh/.openclaw/skills/coding-workflow-library`

## OpsTruth Version Context

The public package context during this validation was `opstruth@0.1.3`. This evidence does not claim a new release, version bump, npm publish, or full production verification.

## Workflow Evidence

- PR #11 hardened `import-reddit-tips` authorization and was merged.
- PR #12 added scheduler-secret documentation and a guarded migration draft.
- PR #12 was merged on 2026-06-14 with merge commit `d2f2014db18ff38deb69cd47b61288914bd069d1`.
- Local workflow records separated verified GitHub facts from Supabase production gates that were not executed.

## Commands / Checks Referenced

- GitHub PR metadata and check inspection.
- Git diff path review for PR #12.
- `git diff --check` over the PR range.
- Secret-pattern scan over the PR patch and intended docs/migration files.
- Local target repo status checks that left `evidence/` and `supabase/.temp/` untracked.
- Workflow-library validation with `./scripts/validate-skills`.

## Findings

`import-reddit-tips` carried a trust-boundary risk because a public Edge Function boundary, `verify_jwt=false`, privileged Supabase inserts into published `pet_tips`, and scheduler authorization needed to be considered together. PR #11 addressed the function boundary. PR #12 documented the scheduler boundary and added a guarded, non-executable migration draft.

## Verified

- The GitHub repo was `AyobamiH/wagging-web-wins`.
- PR #12 changed only `docs/import-reddit-tips-security.md` and `supabase/migrations/20260613211912_update_import_reddit_tips_scheduler_secret.sql`.
- PR #12 did not hardcode the scheduler secret.
- PR #12 retained remaining Supabase work as explicit gates.
- PR #12 was merged after the PR check passed.

## Warnings

- Static docs and migration review do not prove deployed Supabase behavior.
- A guarded migration draft is not an applied scheduler update.
- GitHub PR success does not prove Edge Function runtime behavior.
- Secret identifier names in docs are acceptable, but secret values must never be committed or printed.

## Not Verified

- Supabase remote secret presence.
- Deployed Edge Function behavior.
- Production scheduler headers.
- Database mutation safety in the live project.
- pg_cron job state after deployment.
- Runtime responses for admin, non-admin, scheduler, missing-secret, invalid-secret, and rate-limit cases.

## Safety Boundaries

No remote Supabase secret setup, Edge Function deploy, `db push`, migration application, SQL execution, pg_cron mutation, production endpoint call, hardened function invocation, npm publish, version bump, or release creation was performed for this evidence.

## Product Lessons For OpsTruth

- Real-repo validation needs first-class case-study output.
- Supabase probes should distinguish static source review from live project verification more clearly.
- Scheduler and cron findings need explicit proof-gap language.
- Evidence packs should summarize secret-boundary checks without exposing values.
- "Deliberately not done" is a product feature, not just a caveat.
- GitHub PR handoff evidence can help users understand what changed versus what was proven.

## v0.2 Backlog Items

- Better real-repo case study support.
- Clearer Supabase static versus live verification output.
- Clearer scheduler/cron proof gap language.
- Better secret-boundary evidence summaries.
- First-class "what was deliberately not done" output.
- Stronger GitHub PR/evidence handoff integration.
