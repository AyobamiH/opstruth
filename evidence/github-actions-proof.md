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
