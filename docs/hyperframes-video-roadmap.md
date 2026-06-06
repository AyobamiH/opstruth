# HyperFrames Video Roadmap

## Current State

The website no longer treats the Lovable-origin video as the authoritative product truth asset.

The active website videos are:

- `website/public/demo/opstruth-hero-runtime-truth.mp4`
- `website/public/demo/opstruth-current-runtime-truth.mp4`

They are derived from the current repo, source CLI output, npm package metadata, GitHub release state, and Cloudflare production response.

## Historical Material

The old website asset remains historical launch material:

```text
website/public/demo/opstruth-runtime-truth.mp4
```

It should not be reused as the final truth source for future homepage work because it came from Lovable's frontend-only understanding.

The older long HyperFrames runtime-truth render and storyboard remain useful source material, but they should not be restored as the final product video without another evidence refresh.

## Current Video Brief

Use this file as the current video source of truth:

```text
docs/current-video-truth-brief.md
```

The refreshed video direction is:

- show the movement from assumption to proof
- use opstruth report language as the visual system
- keep proof gaps visible
- separate package truth from source-runtime truth
- avoid fake production confidence
- avoid generic SaaS promo pacing

## Future Requirements

- Re-run current product truth inspection before any future video refresh.
- Verify npm, GitHub release, Cloudflare production, source CLI output, and website asset paths.
- If HyperFrames is locally available, render through the real HyperFrames workflow.
- If HyperFrames is unavailable or blocked, use a deterministic local code-render path and document the limitation.
- Do not claim a render exists unless the MP4 exists.
- Do not publish npm, create releases, deploy, or modify Lovable settings during video generation.
