# Completion Gate

The completion gate is the standard proof pass before Codex reports an opstruth task as complete.

Run it from the repository root:

```bash
./scripts/opstruth-completion-gate.sh
```

The default mode is `standard`.

## Modes

```bash
./scripts/opstruth-completion-gate.sh --mode quick
./scripts/opstruth-completion-gate.sh --mode standard
./scripts/opstruth-completion-gate.sh --mode extended
```

`quick` is for fast local confidence. It runs CLI lint, CLI tests, opstruth self-checks, JSON parsing, and optional network checks. It skips website build, root build, and Wrangler dry-run.

`standard` is the normal completion gate. It runs CLI checks, self-checks, website build/lint, root build/sync, Wrangler dry-run, and optional network checks.

`extended` is for slow machines, cold dependency installs, or large builds. It keeps the same required proof surface as `standard` but with longer timeouts.

## Why It Exists

opstruth is an evidence-first project. A task is not complete just because files changed or a command appeared to pass once. The gate makes Codex collect repeatable proof before claiming success.

## What It Checks

- git status, branch, and recent commits
- CLI lint and tests
- `opstruth repo`, `opstruth secrets`, `opstruth probes`, and JSON output parsing
- CLI regression tests for route/local config orchestration in the one-command run
- website build and lint in standard/extended modes
- root website build/sync in standard/extended modes unless explicitly skipped
- Cloudflare dry-run in standard/extended modes
- npm package metadata, when the registry is reachable
- production homepage reachability, when the network is reachable

## Timeouts

The gate uses named per-step timeouts.

Quick mode:

- CLI lint: 120s
- CLI tests: 120s
- opstruth self-checks and JSON parsing: 120s
- website build: skipped
- root build: skipped
- Wrangler dry-run: skipped
- network checks: 20s, warning-only

Standard mode:

- CLI lint: 180s
- CLI tests: 180s
- opstruth self-checks and JSON parsing: 120s
- website build: 300s
- website lint: 180s, warning-only
- root build: 600s
- Wrangler dry-run: 300s
- network checks: 30s, warning-only

Extended mode:

- CLI lint: 300s
- CLI tests: 300s
- opstruth self-checks and JSON parsing: 180s
- website build: 900s
- website lint: 300s, warning-only
- root build: 1200s
- Wrangler dry-run: 600s
- network checks: 45s, warning-only

## Environment Overrides

```text
OPSTRUTH_COMPLETION_MODE
OPSTRUTH_CLI_TIMEOUT
OPSTRUTH_TEST_TIMEOUT
OPSTRUTH_WEBSITE_BUILD_TIMEOUT
OPSTRUTH_ROOT_BUILD_TIMEOUT
OPSTRUTH_WRANGLER_TIMEOUT
OPSTRUTH_NETWORK_TIMEOUT
OPSTRUTH_SKIP_ROOT_BUILD
```

Timeout values may be plain seconds or include a shell timeout suffix such as `600s`.

## Root Build

The standalone website build checks the website package directly. The root build then exercises the deploy-facing root script, which installs/builds the website and syncs `website/dist` into root `dist` for Cloudflare checks.

That means standard and extended modes intentionally do some duplicate website work. The duplicate step proves that the root deployment path still works. If the environment is slow or cold-installing dependencies, rerun with:

```bash
./scripts/opstruth-completion-gate.sh --mode extended
```

For a focused local check that skips the root build:

```bash
OPSTRUTH_SKIP_ROOT_BUILD=1 ./scripts/opstruth-completion-gate.sh --mode standard
```

## What It Does Not Do

The gate does not deploy, publish npm, tag releases, create GitHub releases, mutate databases, trigger jobs, call external AI APIs, restart services, or print raw secrets.

## How To Interpret Results

Failures block completion. Report the exact failing phase and do not claim the task is complete.

A timeout is not a pass. It means the proof step did not complete within the selected mode. Use extended mode for large builds or investigate the named step.

Timeout output includes:

- step name
- timeout seconds
- mode
- whether the step was required or optional
- suggested rerun command

Warnings are unresolved proof gaps. A skipped route, local runtime, Supabase, or production check is not a pass; it means the gate did not receive enough safe evidence to prove that area.

Network checks for npm metadata and production reachability are non-blocking because local execution environments can temporarily lack registry or internet access. Website lint is warning-only because existing UI fast-refresh warnings are not completion blockers. When optional checks warn, include that warning in the final report.

## Extra Checks

If a task touches probes or fixtures, also run:

```bash
./scripts/run-fixture-matrix.sh
```

If a task touches production or website assets, verify the relevant URLs and assets after the normal build/deploy path has completed.
