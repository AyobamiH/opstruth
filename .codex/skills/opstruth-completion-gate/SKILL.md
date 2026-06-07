# opstruth Completion Gate

## Purpose

Before reporting any opstruth task as complete, run the completion gate and include proof in the final report.

## When to Use

Use after any task that changes:

- CLI
- website
- docs
- evidence
- release files
- package metadata
- Cloudflare config
- GitHub Actions
- probe catalogue
- tests
- fixtures
- scripts

## Command

```bash
cd /home/johnh/opstruth/tempo/opstruth
./scripts/opstruth-completion-gate.sh
```

## Rules

- Do not say "done" until this has run.
- Do not hide failures.
- Do not treat skipped checks as passes.
- Do not print secrets.
- Do not commit generated junk.
- If the task involves npm publishing, also verify `npm view`.
- If the task involves production, also verify production URLs.
- If the task involves videos, verify video assets locally and in build output.
- If the task involves probes or fixtures, run the fixture matrix if available.

## Final Report Requirement

Every final report must include:

- checks run
- files changed
- commit SHA
- push status
- evidence created
- blockers, if any
