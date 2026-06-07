# Completion Gate

The completion gate is the standard proof pass before Codex reports an opstruth task as complete.

Run it from the repository root:

```bash
./scripts/opstruth-completion-gate.sh
```

## Why It Exists

opstruth is an evidence-first project. A task is not complete just because files changed or a command appeared to pass once. The gate makes Codex collect repeatable proof before claiming success.

## What It Checks

- git status, branch, and recent commits
- CLI lint and tests
- `opstruth repo`, `opstruth secrets`, `opstruth probes`, and JSON output parsing
- website build and lint
- root website build/sync
- Cloudflare dry-run
- npm package metadata, when the registry is reachable
- production homepage reachability, when the network is reachable

## What It Does Not Do

The gate does not deploy, publish npm, tag releases, create GitHub releases, mutate databases, trigger jobs, call external AI APIs, restart services, or print raw secrets.

The gate runs build, lint, and test commands directly, then uses focused opstruth subcommands for repository, secret, and probe-catalogue proof. This avoids duplicate package-manager install/build work inside the aggregate quality command.

## How To Interpret Results

Failures block completion. Report the exact failing command and do not claim the task is complete.

Warnings are unresolved proof gaps. A skipped route, local runtime, Supabase, or production check is not a pass; it means the gate did not receive enough safe evidence to prove that area.

Network checks for npm metadata and production reachability are non-blocking because local execution environments can temporarily lack registry or internet access. When they warn, include that warning in the final report.

## Extra Checks

If a task touches probes or fixtures, also run:

```bash
./scripts/run-fixture-matrix.sh
```

If a task touches production or website assets, verify the relevant URLs and assets after the normal build/deploy path has completed.
