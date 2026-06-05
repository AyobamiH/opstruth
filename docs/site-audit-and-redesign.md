# Site Audit And Redesign Notes

Date: 2026-05-28

## Repo Reality

opstruth is a local, read-only operational truth checker for AI-assisted engineering. The repo already contains a clear safety model, stack-aware probe catalogue, fixture runs, CI usage, evidence pack format, and community testing guidance.

The strongest product proof is not a dashboard or a generic landing page. It is the CLI output and markdown evidence pack structure:

- What Matters Most
- Verified
- Warnings
- Skipped Or Not Configured
- Not Verified
- Why You Can Trust This Result
- Evidence Available
- What opstruth Did Not Do
- Next Safe Step

## Current Website Fit

The existing site has the right tone: calm, terminal-native, local-first, and restrained. It correctly avoids enterprise theatre and AI magic claims.

However, the homepage used some synthetic examples that did not match current repo output. In particular:

- It referenced Supabase RLS evidence that is not present in the current default run.
- It referenced `.opstruth/...` evidence paths, while the current CLI writes `evidence/opstruth-report.md` by default and fixture outputs under `evidence/fixture-runs/`.
- It did not surface enough of the repo's docs, CI workflow, fixture evidence, or probe catalogue metadata.

## Redesign Direction

The redesign should keep the existing operational visual system, but make the repo evidence the visual core:

- Use real terminal identity: `advanced_pudding9228@web`.
- Show real CLI sections and real evidence file paths.
- Make verified vs not verified visible early.
- Show the probe catalogue as inspectable metadata, not marketing bullets.
- Connect the homepage to GitHub docs, evidence, fixture runs, CI usage, and contribution/probe requests.
- Keep claims honest: local checks, read-only boundaries, static probes where applicable, opt-in route/runtime proof.

## What Must Stay Honest

opstruth does not currently prove production state without explicit route/runtime inputs. It does not deploy, mutate databases, call OpenAI, publish, restart services, trigger jobs, or print raw secrets. The website should treat those boundaries as the product, not as footnotes.
