# OpsTruth Product Videos

This in-repo HyperFrames pack updates the OpsTruth video system from the actual project state rather than a separate marketing folder.

## Source Truth Inspected

- `docs/current-video-truth-brief.md`
- `docs/hyperframes-video-roadmap.md`
- the active website components in `website/src/components/site/`
- the website theme in `website/src/styles.css`
- existing demo videos in `website/public/demo/`
- the historical HyperFrames runtime-truth composition before it was removed from the active repo layout
- current CLI help, welcome, probes, one-command, GitHub CI, Supabase live proof, and configuration docs

## Variants

| Variant | Source | Output | Format | Target length |
| --- | --- | --- | --- | --- |
| Main product video | `main-product/index.html` | `website/public/demo/opstruth-main-product-video.mp4` | 16:9 | 56s |
| Product tour | `product-tour/index.html` | `website/public/demo/opstruth-product-tour.mp4` | 16:9 | 96s |
| Promo short | `promo-short/index.html` | `website/public/demo/opstruth-proof-short-vertical.mp4` | 9:16 | 26s |

## Audio

Each composition includes a direct-child HyperFrames audio bed plus timed UI cues.

- background beds live in each variant's `assets/audio/` directory
- cue requests live in each variant's `audio_request.json`
- resolved bundled cue files live in each variant's `assets/sfx/` directory
- `audio_meta.json` records the local SFX resolution result

The audio is intentionally restrained: low terminal-style beds, soft confirmation cues, and boundary/error accents. It supports the proof-oriented product identity without adding voiceover or unsupported marketing claims.

## Product Truth Boundaries

The videos preserve the current OpsTruth promise:

- local-first and read-only by default
- no deploys, database writes, service restarts, model calls, or raw secret output
- skipped checks are not passes
- not verified is not safe
- exact-commit CI evidence is separate from production evidence
- Supabase live proof is explicit and local-file driven
- telemetry proof is count-only and redaction-gated

## Commands

```bash
cd assets/video/opstruth-product-videos
npm run lint
npm run validate
npm run inspect
npm run render
```

Rendered outputs are written into `website/public/demo/` so the website can reference them without relying on external marketing assets.
