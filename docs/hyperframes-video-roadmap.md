# HyperFrames Video Roadmap

## Current State

The website no longer treats the Lovable-origin video or the older runtime-truth cuts as authoritative product truth assets.

The active website videos are now:

- `website/public/demo/opstruth-main-product-video.mp4`
- `website/public/demo/opstruth-product-tour.mp4`
- `website/public/demo/opstruth-proof-short-vertical.mp4`

They are derived from the current repo, source CLI output, npm package metadata, GitHub release state, website theme, and verified 0.2.0 product truth.

## Historical Material

The old website asset was removed from the active public asset tree:

```text
website/public/demo/opstruth-runtime-truth.mp4
```

It should not be reused as the final truth source for future homepage work because it came from Lovable's frontend-only understanding.

The older long HyperFrames runtime-truth render, snapshots, and source composition have also been removed from the active repo layout. Historical notes remain useful narrative reference, but current renders must come from `assets/video/opstruth-product-videos/`.

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


## 2026-07-06 In-Repo Product Video Pack

The refreshed product-video work now lives inside the OpsTruth repository, not in a private side pack. It builds on the existing website theme, current demo assets, and the useful proof-language lessons from the older runtime-truth work.

Source path:

```text
assets/video/opstruth-product-videos/
```

Website-ready output paths:

```text
website/public/demo/opstruth-main-product-video.mp4
website/public/demo/opstruth-product-tour.mp4
website/public/demo/opstruth-proof-short-vertical.mp4
```

The pack contains three variants:

1. Main product video, 16:9, 56 seconds.
2. Product tour / how-to, 16:9, 96 seconds.
3. Promo short, 9:16, 26 seconds.

Creative guardrails:

- use the website's dark operational theme, grid, terminal panels, status colours, and OpsTruth logo language
- preserve real CLI commands and current `0.2.0` product truth
- do not imply local or CI checks prove production
- do not show raw secrets, authorization headers, project references, or fake customer/adoption metrics
- keep captions/subtitles alongside each output

Future refreshes should update these in-repo compositions rather than creating a separate marketing repo or private pack.

## 2026-07-15 Website Video Organisation

The homepage now uses the current videos by screen shape:

- desktop and tablet hero surfaces use `opstruth-main-product-video.mp4`
- mobile hero surfaces use the portrait `opstruth-proof-short-vertical.mp4`
- the product-video section exposes the main product demo, practical product tour, and mobile short together

The older `opstruth-runtime-truth*`, `opstruth-hero-runtime-truth.mp4`, and `opstruth-current-runtime-truth.mp4` files were removed from `website/public/demo/` to avoid presenting stale product truth.

## 2026-07-15 Audio Update

The current pack now includes sound as part of the HyperFrames composition source. Future renders should preserve:

- direct-child `<audio>` elements owned by HyperFrames
- local ambient beds under each variant's `assets/audio/`
- local SFX requests and resolved cue assets under each variant
- captions/subtitles as separate reviewable text assets

Do not replace this with a disconnected marketing audio pass. Sound should remain tied to OpsTruth's compact, terminal-native, evidence-first identity.
