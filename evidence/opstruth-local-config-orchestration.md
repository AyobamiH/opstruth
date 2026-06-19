# OpsTruth Local Config Orchestration

## Problem

Direct `opstruth routes` and `opstruth local` could read Wagging Web Wins runtime inputs from `opstruth.config.json`, but the one-command run still skipped local runtime unless a CLI flag was passed.

That meant a configured project could show local runtime evidence when commands were run individually, while `opstruth --skip evidence` still reported local runtime as a proof gap.

## Root Cause

`runLocal` already loaded `opstruth.config.json`, but `runOrchestrator` only decided to call `runLocal` when local CLI flags or the legacy `opstruth.local.json` file existed.

The orchestrator did not inspect supported `opstruth.config.json` local inputs before deciding whether local probes were eligible.

## Fix

The one-command orchestrator now loads `opstruth.config.json` and treats configured local ports as explicit local runtime inputs.

If supported local config is present, `opstruth` calls the local probe during the all-in-one run. If no config or flags exist, local runtime remains skipped with a clear proof-gap message.

The fix does not start, stop, restart, or kill local services. It only probes inputs the operator already provided.

## Tests Added

- One-command run consumes route inputs from `opstruth.config.json`.
- One-command run consumes local port and health inputs from `opstruth.config.json`.
- JSON output remains parseable and ANSI-free for config-driven one-command runs.
- Existing direct `routes` and `local` command coverage remains unchanged.
- Existing no-config fixture coverage still expects route/local proof gaps to remain skipped.

## Wagging Validation

Target repo: `AyobamiH/wagging-web-wins`

Configured local inputs:

- base URL: `http://127.0.0.1:4173`
- routes: `/`, `/services`, `/faq`
- local port: `4173`
- health path: `/`

Validation result after starting the local Vite preview:

- `opstruth routes`: `STATUS: Partial pass`
- route statuses: HTTP `200` for `/`, `/services`, and `/faq`
- route warnings: local preview responses were missing browser security headers
- `opstruth local`: `STATUS: Pass`
- one-command JSON result: `overall=warn`
- one-command child result: `routes=warn`
- one-command child result: `local=pass`
- one-command child result: `quality=pass`
- `local_skipped=0`

## Remaining Limitations

- Local preview route evidence does not prove production route headers.
- Local runtime liveness does not prove production uptime.
- Supabase live permissions, scheduler state, and remote secrets remained not verified because mutation approval was not present.
- Secret-reference warnings in Wagging documentation/source still need separate triage; no raw secrets were printed by OpsTruth.

## What Was Not Changed

- No deployment was run.
- No npm package was published.
- No release was created.
- No Supabase secret was set.
- No database migration was applied.
- No SQL or scheduler mutation was executed.
- No production endpoint was called.
