---
schema: clawsweeper.project-vision.v1
project_id: opstruth
repository: AyobamiH/opstruth
---

# Project Vision

## Identity

OpsTruth is a read-only operational-truth product for AI-assisted engineering, distributed primarily as a CLI with supporting website and CI surfaces.

## Purpose

Inspect a project, detect its stack, run safe probes, collect evidence, distinguish verified from unverified state, and produce proof-oriented reports without mutating the target.

## Owns

- Stack-aware repository inspection and safe diagnostic probes.
- Evidence-oriented CLI output and reports.
- Explicit quality, CI, route, secret, Supabase, Cloudflare, and local-runtime proof signals.
- The public website and package/action surfaces for the standalone product.

## Does Not Own

- Deployment, remediation, provider writes, database mutation, job triggering, or service restarts.
- Independent execution authority.
- The hosted ChatGPT/Codex plugin implementation in opstruth-chatgpt-plugin.
- DoneState execution semantics.

## Non-Negotiable Invariants

- Read-only by default.
- Skipped is not failed; unverified is not safe.
- Evidence must remain scoped to the inspected project boundary.
- Raw secrets are never printed.
- CI proof and production proof remain separate.
- Completion claims require the repository's completion gate and evidence after the final change.

## Evidence of Done

A change is done only after the relevant local verification and completion gate pass. Runtime or production claims require their own evidence rather than inference from source checks.

## Relationships

- opstruth-chatgpt-plugin: hosted conversational integration.
- DoneState: authorised execution product that OpsTruth can independently verify.
- Proof & State: portfolio governance.

## Canonical Sources

README.md, AGENTS.md, CODEX_GOAL.md, docs/completion-gate.md, and the relevant proof-signal documentation.

## Agent Rule

Use this repository to establish and report truth, not to make the inspected system true by changing it.
