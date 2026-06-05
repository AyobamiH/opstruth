# Site Audit And Redesign Notes

Date: 2026-06-05

## Repo Reality

opstruth is positioned as a local, read-only operational truth checker for AI-assisted engineering. The strongest proof surfaces are the CLI output, probe catalogue, fixture evidence, safety model, CI usage, and markdown evidence packs.

## Findings

- The previous site tone was directionally correct: calm, local-first, technical, and evidence-oriented.
- The proof surfaces were underused. The homepage stated trust more than it showed the repo's own evidence structure.
- Some demo copy was too synthetic and risked implying proof that the current repo does not provide by default.
- GitHub/docs/evidence workflows needed to be more prominent because the repo is part of the product.

## Redesign Decisions

- Keep the restrained terminal-native visual system.
- Make verified vs not verified vs did-not-do the visual core.
- Replace synthetic output with repo-derived excerpts and accurate evidence paths.
- Surface safety model, probe catalogue, fixture evidence, community testing, and CI artifact usage.
- Keep claims honest: no deploys, no database mutations, no AI API calls, no service restarts, no raw secret printing.
