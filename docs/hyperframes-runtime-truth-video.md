# opstruth Runtime Truth Launch Video

## Current Production Video Decision

Decision date: 2026-06-06.

Decision: SUPERSEDE the Lovable-origin hero asset with current-truth video assets generated from inspected repo, CLI, npm, GitHub release, and Cloudflare evidence.

The previous production hero path remains historical material:

```text
website/public/demo/opstruth-runtime-truth.mp4
```

It should not be treated as the current product truth asset because it came from Lovable's frontend-only understanding.

The active website video paths are:

```text
website/public/demo/opstruth-hero-runtime-truth.mp4
website/public/demo/opstruth-current-runtime-truth.mp4
```

The website references them as:

```text
/demo/opstruth-hero-runtime-truth.mp4
/demo/opstruth-current-runtime-truth.mp4
```

The older long HyperFrames plan below is now historical source material and narrative reference. Future render work must start from `docs/current-video-truth-brief.md` and re-inspect current product truth before creating new assets.

## Concept

Create a 60-90 second flagship product video for opstruth, built from the product's own runtime language:

- `STATUS`
- `What Matters Most`
- `Verified`
- `Warnings`
- `Failures`
- `Skipped Or Not Configured`
- `Not Verified`
- `Overall Confidence`
- `Next Safe Step`
- `Evidence Pack`

The video is not a generic SaaS promo. It is a movement from assumption to proof: AI-assisted engineering moves quickly, but speed does not answer what is actually true afterward.

The visual system should feel like a premium infrastructure tool: calm, technical, precise, local-first, read-only, and evidence-backed.

## Core Message

Most tools show only:

```text
pass
fail
```

opstruth shows:

```text
verified
warning
failure
skipped
not verified
confidence
next safe step
```

The emotional payoff:

```text
Now I know what is true.
```

## Scene List

Storyboard target runtime: 80 seconds. The current website hero asset is the selected 18-second production cut described above.

| Time   | Scene                     | Purpose                                                                                       |
| ------ | ------------------------- | --------------------------------------------------------------------------------------------- |
| 0-5s   | Cold open: runtime report | Start with opstruth's language before explaining it.                                          |
| 5-18s  | Assumption wall           | Show ordinary engineering assumptions breaking down.                                          |
| 18-28s | Product command           | Introduce `opstruth` as the better question: what can we prove?                               |
| 28-45s | Probe activation          | Show stack-aware safe probes: repo, secrets, routes, runtime, Supabase, Cloudflare, evidence. |
| 45-62s | Evidence and proof gaps   | Show redacted finding, not verified list, and next safe step.                                 |
| 62-72s | Cleaner run               | Show stronger confidence with explicit checked surfaces.                                      |
| 72-80s | Product reveal            | Close with opstruth name and GitHub URL.                                                      |

## Shot List

### Shot 1: Cold Runtime Output

Visual: black near-terminal canvas, subtle grid, small mono text, opstruth report sections appearing one by one.

On screen:

```text
STATUS: Partial pass

Verified:
- Repository inspected
- Secret scan completed with redaction

Warnings:
- Route checks skipped because no base URL was provided

Not Verified:
- Production runtime was not checked

Next Safe Step:
- Run opstruth with --base-url before trusting production.
```

Motion:

- Text appears as structured report blocks, not typewriter noise.
- `STATUS: Partial pass` lands first and holds.
- `Verified`, `Warnings`, and `Not Verified` use distinct restrained accents.
- `Partial pass` should feel honest, not weak.

### Shot 2: Assumptions

Visual: short phrases in a quiet interface field. Each line appears, then dims as unsupported.

On screen:

```text
The build passed.
Production should be fine.
The route probably works.
The secret is probably safe.
Nothing was triggered.
```

Then interrupt:

```text
should is not verified
```

Motion:

- Assumption lines drift into a low-confidence column.
- `should is not verified` cuts through with a calm but decisive transition.

### Shot 3: Product Command

Visual: terminal prompt using the required identity.

On screen:

```bash
advanced_pudding9228@web:~/project$ opstruth
```

Then:

```text
opstruth asks a better question.

What can we prove?
```

Motion:

- Terminal prompt is clean and centered inside a full-frame operational surface.
- No root, localhost, or private username appears.

### Shot 4: Probe Catalogue Activation

Visual: horizontal probe lanes or report modules, each switching from unknown to checked/skipped.

On screen:

```text
Repo
Secrets
Routes
Runtime
Supabase
Cloudflare
Evidence
```

Supporting command flashes:

```bash
opstruth welcome
opstruth probes
opstruth
opstruth secrets
opstruth routes --base-url https://example.com
opstruth local --port 3000 --health /health
```

Motion:

- Probe labels activate with a precise scan-line or status-pill transition.
- Avoid fake dashboards or fake metrics.
- Keep the surface readable at all frames.

### Shot 5: Redacted Evidence Finding

Visual: evidence card with file, line, pattern, redacted preview, why it matters, and next safe step.

On screen:

```text
Warning: Possible secret reference

Evidence:
File: src/config.ts
Line: 12
Pattern: SUPABASE_SERVICE_ROLE_KEY
Preview: SUPABASE_SERVICE_ROLE_KEY=***REDACTED***

Why it matters:
Service role keys must never be exposed to browser code.

Next safe step:
Move real values into environment storage.
```

Motion:

- Highlight `Evidence`, then `Why it matters`, then `Next safe step`.
- The redaction should feel protective, not alarming.

### Shot 6: Not Verified Is Honest

Visual: proof gap list. Unknowns are not hidden; they are labeled.

On screen:

```text
Not Verified:
- Production runtime
- Database mutation safety
- Publishing/job side effects
```

Then:

```text
opstruth does not pretend unknowns are safe.
```

Motion:

- Proof gaps settle into a separate column from warnings and failures.
- The list should feel like clarity, not error state.

### Shot 7: Evidence Pack

Visual: markdown evidence pack opens as a clean artifact.

Terminal command:

```bash
advanced_pudding9228@web:~/project$ cat evidence/opstruth-report.md
```

On screen:

```text
# opstruth Evidence Pack

STATUS: Pass

Verified:
- Repository inspected
- Quality checks passed
- Routes responded
- Secrets scan completed with redaction

Overall Confidence:
Strong local confidence for the checks performed.
```

Motion:

- Markdown artifact slides in like a reviewable handoff.
- Evidence paths and labels remain legible.

### Shot 8: Product Reveal

Visual: minimal opstruth wordmark style, report language as subtle background texture.

On screen:

```text
opstruth

Read-only operational truth checks for AI-assisted engineering.

github.com/AyobamiH/opstruth
```

Motion:

- Calm final hold.
- No fake customer logos, adoption numbers, enterprise claims, or AI magic visuals.

## Voiceover Script

```text
Most engineering failures do not start with bad code.

They start with assumptions.

The build passed.

The deploy looked fine.

The route should work.

The secret is probably safe.

Probably.

opstruth asks a different question.

What can we prove?

It inspects the repo.

Checks the stack.

Runs safe probes.

Redacts sensitive findings.

Separates what was verified from what was not.

No deploys.

No database mutations.

No job triggers.

No OpenAI calls.

Just operational truth.

For the parts it can prove, it gives evidence.

For the parts it cannot, it says so.

Because confidence is not the same as proof.

AI coding tools are fast.

opstruth checks what is actually true afterward.
```

## Motion Notes

- Build from the final readable frame first, then animate into and out of it.
- Use report sections as motion primitives: status blocks, verified rows, warning rows, proof-gap rows, evidence cards.
- Avoid large decorative gradients, cyberpunk effects, robot imagery, and fake operational dashboards.
- Treat `Partial pass` as honest confidence: a premium product naming what it did and did not prove.
- Use restrained colors:
  - background: near black or deep graphite
  - verified: calm green
  - warning: amber
  - not verified: cool gray
  - evidence: quiet blue or white
- Use monospaced type for terminal/report surfaces and a precise sans for reveal lines.
- All text must remain readable in 1920x1080.

## Terminal Commands

Feature these commands as concise excerpts:

```bash
advanced_pudding9228@web:~/project$ opstruth welcome
advanced_pudding9228@web:~/project$ opstruth probes
advanced_pudding9228@web:~/project$ opstruth
advanced_pudding9228@web:~/project$ opstruth secrets
advanced_pudding9228@web:~/project$ opstruth routes --base-url https://example.com
advanced_pudding9228@web:~/project$ opstruth local --port 3000 --health /health
advanced_pudding9228@web:~/project$ cat evidence/opstruth-report.md
```

Do not show massive logs. Use curated, redacted excerpts.

## Runtime Output Excerpts

### Cold Open

```text
STATUS: Partial pass

Verified:
- Repository inspected
- Secret scan completed with redaction

Warnings:
- Route checks skipped because no base URL was provided

Not Verified:
- Production runtime was not checked

Next Safe Step:
- Run opstruth with --base-url before trusting production.
```

### Probe Activation

```text
Repo        checked
Secrets     checked with redaction
Routes      skipped: base URL not provided
Runtime     not verified
Supabase    static config inspected
Cloudflare  static config inspected
Evidence    report ready
```

### Redacted Finding

```text
Warning: Possible secret reference

Evidence:
File: src/config.ts
Line: 12
Pattern: SUPABASE_SERVICE_ROLE_KEY
Preview: SUPABASE_SERVICE_ROLE_KEY=***REDACTED***

Why it matters:
Service role keys must never be exposed to browser code.

Next safe step:
Move real values into environment storage.
```

### Cleaner Run

```text
STATUS: Pass

Verified:
- Repository inspected
- Quality checks passed
- Routes responded
- Secrets scan completed with redaction

Overall Confidence:
Strong local confidence for the checks performed.

Evidence:
- evidence/opstruth-report.md
```

## Asset Requirements

Generated assets:

- `assets/video/opstruth-runtime-truth/index.html` for the HyperFrames composition.
- `assets/video/opstruth-runtime-truth/snapshots/` for rendered verification stills and a contact sheet.
- `website/public/demo/opstruth-hero-runtime-truth.mp4` for the active website hero loop.
- `website/public/demo/opstruth-current-runtime-truth.mp4` for the active controlled product film.
- No stock footage.
- No fake production screenshots.
- No raw private repo paths or secrets.
- Terminal identity must always be `advanced_pudding9228@web`.

## HyperFrames Project Prompt

Use this prompt when scaffolding the HyperFrames project:

```text
Create a 75-second 1920x1080 HyperFrames composition for opstruth.

The video is a premium infrastructure launch film based entirely on opstruth runtime report language. Use terminal/report surfaces as the visual identity. The core arc is assumption to proof.

Required visual sections:
- STATUS: Partial pass
- What Matters Most
- Verified
- Warnings
- Not Verified
- Overall Confidence
- Next Safe Step
- Evidence Pack

Required terminal identity:
advanced_pudding9228@web

Do not use root, localhost, johnh, fake customers, fake adoption numbers, fake production evidence, raw secrets, robot imagery, cyberpunk visuals, or generic SaaS dashboards.

Use the voiceover script and scene list from docs/hyperframes-runtime-truth-video.md.
```

## Render Instructions

The HyperFrames project lives at:

```text
assets/video/opstruth-runtime-truth/
```

Validate and render from that directory. These instructions are historical for the old HyperFrames composition and should be refreshed against `docs/current-video-truth-brief.md` before use:

```bash
cd assets/video/opstruth-runtime-truth
npx hyperframes lint
npx hyperframes inspect --samples 15
npx hyperframes render --output ../../../website/public/demo/opstruth-current-runtime-truth.mp4 --quality high --fps 30
```

The current rendered output paths are:

```text
public/demo/opstruth-hero-runtime-truth.mp4
public/demo/opstruth-current-runtime-truth.mp4
```
