# Current Video Truth Brief

Original date: 2026-06-06.
Truth alignment updated: 2026-06-17.
Package release note: source and npm package truth advanced to `opstruth@0.2.0` after these videos
were produced.

This brief is the source of truth for the refreshed opstruth website videos.

## Current Product State

- npm package at video production time: `opstruth@0.1.3`
- current npm package: `opstruth@0.2.0`
- npm package description: `Read-only operational truth checks for AI-assisted engineering workflows.`
- npm package homepage: `https://opstruth.woeinvests.workers.dev`
- npm package binary: `opstruth -> bin/opstruth.js`
- production website: `https://opstruth.woeinvests.workers.dev`
- production runtime: Cloudflare Workers
- production response inspected: `HTTP/2 200`
- GitHub release at video production time: `v0.1.3`
- current GitHub release: `v0.2.0`
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

The published npm package was verified for package metadata, installability, and the `--help`, `welcome`, `probes`, human one-command, and JSON one-command command surfaces when these videos were produced. The refreshed videos should still show package truth separately from source-runtime truth because public package truth can lag or advance independently from source work and website assets.

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

## Current Public Video Assets

- `website/public/demo/opstruth-main-product-video.mp4`
  - 56 seconds
  - 1920x1080
  - sound
  - homepage desktop and product proof surface
- `website/public/demo/opstruth-product-tour.mp4`
  - 96 seconds
  - 1920x1080
  - sound
  - practical product tour and how-to surface
- `website/public/demo/opstruth-proof-short-vertical.mp4`
  - 26 seconds
  - 1080x1920
  - sound
  - mobile and portrait social surface

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


## 2026-07-06 Product Video Refresh

The in-repo HyperFrames video system has been refreshed against current OpsTruth product truth. The refresh keeps the existing dark terminal-native visual language and updates the message from the earlier `0.1.3` package/release cycle to the current `opstruth@0.2.0` state.

New source compositions live in:

```text
assets/video/opstruth-product-videos/
```

The refreshed variants are:

- main product video: `website/public/demo/opstruth-main-product-video.mp4`
- product tour / how-to: `website/public/demo/opstruth-product-tour.mp4`
- vertical promo short: `website/public/demo/opstruth-proof-short-vertical.mp4`

The scripts and captions preserve these current product truths:

- latest package and release: `opstruth@0.2.0` / `v0.2.0`
- 30 probe catalogue entries, all safe read-only
- exact-commit GitHub CI proof is explicit and separate from production proof
- Supabase live proof is local-file driven and does not call production
- telemetry proof is count-only and redaction-gated
- route and local runtime proof require explicit inputs
- skipped is not passed, and not verified is not safe

The older runtime-truth MP4s and Lovable-origin asset manifests were removed from the active website asset tree after the current pack was rendered. Future product-video work should start from `assets/video/opstruth-product-videos/` and re-run product truth inspection before rendering.

## 2026-07-15 Audio Pass

The refreshed in-repo HyperFrames videos now include framework-owned audio elements rather than silent-only renders.

Audio remains product-truth neutral:

- no voiceover was added
- no new product claims were introduced
- no production proof was implied through sound
- cues are limited to restrained terminal/proof accents
- background beds and SFX are local in-repo assets

HyperFrames auth reported no HeyGen sign-in for this run, so the SFX were resolved from the bundled local HyperFrames media library and the ambient beds were generated locally as deterministic procedural assets.
