# GitHub Actions Proof

## Purpose

GitHub Actions proof lets opstruth read workflow metadata for the exact local commit under review. It is a read-only external proof source for hosted quality checks.

## Explicit Opt-In

The default one-command run does not contact GitHub. Run it explicitly:

```bash
opstruth github-ci
opstruth github-ci --workflow CI
opstruth --github-ci
```

Or enable it in `opstruth.config.json`:

```json
{
  "github": {
    "ci": {
      "enabled": true,
      "workflow": "CI"
    }
  }
}
```

## Repository And Commit Resolution

opstruth resolves the current Git commit with local Git and resolves the GitHub repository from the `origin` remote. HTTPS, SSH, and `ssh://` GitHub remotes are supported.

## Exact-Commit Matching

A workflow run is proof only when the run `headSha` exactly matches the current local commit. A successful workflow for another commit is reported as a proof gap.

## Workflow Selection

Use `--workflow <name>` or `github.ci.workflow` to restrict matching to a named workflow such as `CI`. When multiple completed runs match the same commit and workflow, opstruth chooses the latest completed run deterministically.

## Result States

- `verified_success`: exact-commit workflow run completed successfully.
- `verified_failure`: exact-commit workflow run completed with a non-success conclusion.
- `in_progress`: exact-commit workflow run is queued or running.
- `no_run_for_commit`: no workflow run was found for the current commit.
- `authentication_unavailable`: GitHub CLI or authentication was unavailable.
- `repository_unresolved`: the GitHub repository could not be resolved from `origin`.
- `workflow_not_found`: runs existed, but not for the configured workflow.
- `commit_mismatch`: returned runs did not match the current commit.
- `not_configured`: no GitHub CI proof was requested.
- `not_verified`: metadata could not be trusted or parsed.

## Human Output

Human output reports repository resolution, exact commit match, workflow name, run ID, event, status, conclusion, and job conclusions. It does not print logs.

## JSON Output

JSON output includes `data.githubCi` with repository, local commit SHA, workflow, run ID, event, status, conclusion, job summaries, timestamps, and `exactCommitMatch`.

## Evidence Output

GitHub Actions proof can be attached to evidence packs as hosted quality evidence. It remains separate from local `opstruth quality` output and from production/runtime proof.

## Authentication

The integration uses read-only `gh` CLI metadata. If `gh` is unavailable or not authenticated, the result is `authentication_unavailable` / `Not Verified`, not a repository failure.

## Read-Only Boundary

The command does not rerun workflows, cancel workflows, approve deployments, read logs by default, deploy, mutate databases, set secrets, or call production endpoints.

## What CI Proves

CI can prove that GitHub ran the configured workflow for the exact commit and that the selected job conclusions were successful.

## What CI Does Not Prove

CI does not prove production deployment, Supabase state, scheduler state, remote secret presence, production headers, live function authorization, database permissions, or runtime side effects.

## Limitations

This is metadata ingestion, not a deployment monitor. It depends on the local `origin` remote, GitHub Actions metadata, and available `gh` authentication.
