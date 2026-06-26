# GitHub Actions Proof Evidence

## Date

2026-06-26

## Change

Added first-class, read-only GitHub Actions metadata ingestion through `opstruth github-ci` and opt-in one-command execution through `--github-ci` or `github.ci.enabled`.

## Proof Model

- Resolve local Git commit.
- Resolve GitHub repository from `origin`.
- Query GitHub Actions metadata for the exact commit.
- Optionally filter by workflow name.
- Report workflow/run/job status without reading logs.
- Treat CI as hosted quality proof, not production truth.

## Safety Boundaries

The integration does not deploy, publish, mutate databases, set secrets, read workflow logs by default, approve deployments, rerun workflows, or invoke production endpoints.

## Tests Added

- successful exact-commit run
- raw command stdout parsing for GitHub metadata without commit SHA redaction
- resolved local Git SHA matching against GitHub metadata without manual commit injection
- failed and cancelled exact-commit runs
- queued or in-progress run
- successful run for a different commit
- no run for current commit
- multiple matching runs
- workflow-name filtering
- SSH, `ssh://`, and HTTPS origin parsing
- missing origin
- missing GitHub CLI / authentication
- malformed GitHub response
- JSON parseability and ANSI-free output
- one-command config opt-in
- default one-command run makes no GitHub request

## Expected Product Impact

OpsTruth can now distinguish:

- local quality proof,
- GitHub-hosted exact-commit CI proof,
- and production proof gaps.

This helps evidence packs avoid the common mistake of treating "CI passed" as "production is true."

## Remaining Limitations

GitHub Actions metadata still does not prove production deployment, Supabase state, scheduler state, production route headers, deployed Edge Function behavior, or live database permissions.

## Resume Fix

During merged-main validation against Wagging Web Wins, the GitHub CLI could see the exact `CI` run, but `opstruth github-ci` initially reported `no_run_for_commit`. The root cause was internal redaction of long SHA-like strings before comparison. The fix keeps redaction enabled by default while allowing the GitHub metadata path to preserve raw stdout only for local Git and `gh` JSON parsing. Human and JSON output still pass through the normal output redaction layer.
