# Current Video Truth Brief

Date: 2026-06-06.

This brief is the source of truth for the refreshed opstruth website videos.

## Current Product State

- npm package: `opstruth@0.1.2`
- npm package description: `Read-only operational truth checks for AI-assisted engineering workflows.`
- npm package homepage: `https://opstruth.woeinvests.workers.dev`
- npm package binary: `opstruth -> bin/opstruth.js`
- production website: `https://opstruth.woeinvests.workers.dev`
- production runtime: Cloudflare Workers
- production response inspected: `HTTP/2 200`
- GitHub release: `v0.1.2`
- CLI source: `cli/`
- website source: `website/`
- read-only model: no deploys, no database mutations, no queue/job triggers, no OpenAI calls, no service restarts, no raw secret printing

The current source CLI output is the primary runtime truth for these videos. The source run reports:

```text
STATUS: Partial pass

Verified:
- Project boundary resolved before stack detection
- Probe catalogue entries: 30
- Automatic safe probes selected: 15
- Safety level: safe_readonly=30

Warnings:
- Secret-like references are reported with redacted previews
- .env contents are not printed

Not Verified:
- Production/public route availability was not checked without route inputs
- Local runtime liveness was not checked without port/process inputs
```

The published npm package was verified for package metadata, installability, and the `--help`, `welcome`, `probes`, human one-command, and JSON one-command command surfaces. The refreshed videos should still show package truth separately from source-runtime truth because the public package remains a v0.1 testing release and source work may move ahead before the next npm publish.

## Video Direction

Both videos come from today's inspected product truth, not from the old Lovable-origin hero asset and not from the older long HyperFrames render.

The story is:

```text
AI coding tools are fast.

But after they change code, someone still has to ask:

What can we prove?

opstruth answers with evidence:
repo truth,
package truth,
runtime truth,
release truth,
production truth,
and proof gaps.
```

## Created Assets

- `website/public/demo/opstruth-hero-runtime-truth.mp4`
  - 16 seconds
  - silent
  - loopable
  - 1920x1080
  - homepage hero surface
- `website/public/demo/opstruth-current-runtime-truth.mp4`
  - 56 seconds
  - silent
  - 1920x1080
  - controlled flagship product film

The videos use opstruth's own report language as the visual identity:

- `STATUS`
- `Verified`
- `Warnings`
- `Not Verified`
- `Evidence Pack`
- `Next Safe Step`
- read-only safety boundaries
- proof gaps

## What To Avoid

- no Lovable-origin assumptions as final product truth
- no restoration of the old 80-second HyperFrames render as final product truth
- no fake dashboards
- no fake customers
- no fake metrics
- no generic SaaS animation
- no claims beyond v0.1 public testing
- no claim that production state is proven without explicit route/runtime input
- no raw secrets
- no deploy, npm publish, release, or Lovable setting changes during video work
