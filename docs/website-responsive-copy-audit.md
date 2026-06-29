# Website Responsive And Copy Audit

## Visual References Reviewed

- `evidence/launch-screenshots/opstruth-homepage-mobile-v0.1.3.png`
- `evidence/launch-screenshots/opstruth-homepage-desktop-v0.1.3.png`
- The close-up showing the runtime video header exposing `/demo/opstruth-current-runtime-truth.mp4`
- Fresh local before screenshots captured under `/tmp/opstruth-responsive-audit/before/`

## Mobile Layout Problems

- The mobile screenshot showed dense desktop structures compressed into a narrow column.
- Body copy, card text, command controls, and metadata labels were often rendered at 11-13px.
- The example-output grid kept wide desktop intrinsic widths on mobile. The pre-fix audit showed the example-output column and terminal panel measuring about 754px wide inside 320-430px viewports, masked by global horizontal overflow hiding.
- Several grid and flex children lacked `min-w-0`, so code, terminal headers, and long labels could force their parent wider than the viewport.
- Commands and card links had small practical tap areas.

## Desktop Layout Problems

- Alternating sections used generous vertical gaps while some right-hand cards/media did not balance the left-hand copy.
- Dense feature grids used four columns too early, leaving card copy narrow and uneven.
- The video and code examples did not consistently align with a shared responsive grid.
- Header and footer copy was small and low-contrast relative to the rest of the page.

## Typography And Contrast Problems

- Visitor-facing paragraphs were often `text-sm` or smaller on mobile.
- All-caps labels used 11px type and wide letter spacing, making dense sections feel compressed.
- Muted text was used for important explanatory copy, so some section descriptions lacked hierarchy.
- Footer and navigation links were readable on desktop but too small for comfortable mobile interaction.

## Overflow And Media Problems

- The root and global stylesheet used horizontal overflow hiding, which masked the wide terminal/code issue instead of fixing it.
- Video title bars displayed internal asset paths and could force long unhelpful strings into narrow headers.
- Code and terminal examples were correctly scrollable in places, but their wrappers did not always have `min-w-0`.
- The page needed source-level wrapping and responsive constraints instead of browser-scale or transform tricks.

## Copy Problems

- The hero used lowercase brand casing in prose: `opstruth checks what is true afterward.`
- The runtime video header exposed an internal asset path.
- The GitHub workflow headline, `The repo is part of the product.`, was abstract.
- The evidence headline, `One markdown file. Reviewable. Attachable. Boring on purpose.`, used awkward implementation-led language.
- The community CTA, `Bring messy repos. File false positives. Request probes.`, was terse and unclear.
- The boundaries heading used lowercase product casing.
- Metadata and public LLM context used lowercase brand casing in visitor-facing prose.

## Internal Implementation Text Found In The UI

- Hero video label: `/demo/opstruth-hero-runtime-truth.mp4`
- Runtime video label: `/demo/opstruth-current-runtime-truth.mp4`
- Evidence card header: `evidence/fixture-runs/risky-secret-app.md`
- Evidence example working directory: `/tmp/opstruth-fixture-runs/risky-secret-app`

Technical command names, package names, URLs, and evidence file paths remain where they are useful as code or product instructions.

## Fixes Applied

- Removed global horizontal overflow hiding from the page root and base stylesheet.
- Added source-level `min-w-0` constraints to grids, media frames, cards, terminal panels, command blocks, and two-column sections.
- Reworked mobile section padding, paragraph size, label size, card padding, and command tap targets.
- Replaced raw video path labels with visitor-facing video titles and context.
- Kept videos in stable responsive aspect-ratio frames with meaningful fallback text.
- Improved navigation and footer tap targets and focus-visible states.
- Normalised feature grids to collapse earlier and keep copy readable.
- Added a focused content regression script for the discovered copy/layout leak classes.

## Copy Rewrites

| Location | Before | After | Reason |
| --- | --- | --- | --- |
| Hero headline | `opstruth checks what is true afterward.` | `OpsTruth checks what is actually true afterwards.` | Correct brand casing and clearer product promise. |
| Hero video title bar | `/demo/opstruth-hero-runtime-truth.mp4` | `Runtime truth walkthrough` / `See verified, warning, and not verified states.` | Remove asset path and explain the media. |
| Runtime video title bar | `RUNTIME TRUTH FILM` / `/demo/opstruth-current-runtime-truth.mp4` | `Runtime truth walkthrough` / `56-second product demo` | Replace internal path and vague film label with useful copy. |
| Current proof paragraph | `opstruth was rebuilt...` | `OpsTruth was rebuilt...` | Correct brand casing in prose. |
| Gap paragraph | `opstruth answers six questions...` | `OpsTruth answers six questions...` | Correct brand casing. |
| Proof-gap paragraph | `opstruth separates facts...` | `OpsTruth separates facts...` | Correct brand casing. |
| GitHub section headline | `The repo is part of the product.` | `The checks are open and reviewable.` | Explain the benefit directly. |
| GitHub section body | `opstruth is meant to be inspected...` | `OpsTruth is meant to be inspected... The site sends developers back to the evidence, not a black box.` | Correct casing and clarify reviewability. |
| Evidence headline | `One markdown file. Reviewable. Attachable. Boring on purpose.` | `One Markdown report. Easy to review, share, and attach.` | More natural visitor-facing copy. |
| Evidence header | `evidence/fixture-runs/risky-secret-app.md` | `Example evidence report` | Remove implementation path from a title bar. |
| Evidence example directory | `/tmp/opstruth-fixture-runs/risky-secret-app` | `redacted fixture checkout` | Avoid exposing an internal temp path in visitor copy. |
| Boundaries headline | `What opstruth will never do.` | `What OpsTruth will never do.` | Correct brand casing. |
| Community headline | `Bring messy repos. File false positives. Request probes.` | `Run OpsTruth on a real repository. Report false positives. Request a missing probe.` | Make the action explicit. |
| Community intro | `opstruth is local...` | `OpsTruth is local...` | Correct brand casing. |
| Footer/navigation metadata | Lowercase visitor-facing brand in metadata and LLM context | `OpsTruth` in visitor-facing metadata/prose | Consistent public product casing. |

## Deliberately Preserved Technical Language

- `opstruth`, `npx opstruth`, and `npm install -g opstruth` remain lowercase because they are package and command names.
- Historical package-version strings such as `opstruth@0.1.3` remain lowercase because they are npm package identifiers.
- `evidence/opstruth-report.md` and `evidence/opstruth.md` remain in code/instruction contexts because they are actual output paths.
- `src/config.js` remains inside the evidence example because file-and-line evidence is part of the product truth.
- `verified`, `warning`, `not verified`, `skipped`, `quality gate`, `exact-commit CI`, and `read-only` remain because they describe product behaviour.

## Remaining Limitations

- The screenshots are still local render evidence, not proof of a deployed production page.
- The website still contains known warning-only Fast Refresh lint warnings in shared UI primitives.
- The runtime demo files remain in `/demo/`; the fix removes public path labels, not the asset URLs.
- Code blocks may scroll horizontally inside their containers on small screens to preserve command meaning.

## Viewports Validated

Before-change viewports captured:

- `320 x 800`
- `375 x 812`
- `390 x 844`
- `430 x 932`
- `768 x 1024`
- `1024 x 768`
- `1280 x 800`
- `1440 x 900`
- `1920 x 1080`

After-change screenshots are captured under `/tmp/opstruth-responsive-audit/after/`.
