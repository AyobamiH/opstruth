# opstruth Product Maturity Plan

## Current Product State

- npm package: `opstruth@0.1.3`
- GitHub repository: `https://github.com/AyobamiH/opstruth`
- GitHub release: `v0.1.3`
- Production website: `https://opstruth.woeinvests.workers.dev`
- Production runtime: Cloudflare Workers
- CLI source path: `cli/`
- Website source path: `website/`
- Evidence path: `evidence/`

Known limitations:

- Some probes are static-only and do not prove live runtime behavior.
- Route checks need `--base-url` or route config before production availability can be verified.
- Local runtime checks need explicit port, health, process, or service inputs.
- Supabase and Cloudflare checks are mostly static unless explicit route/runtime inputs are provided.
- `opstruth@0.1.3` is a v0.1 public testing release, not a mature production coverage claim.
- opstruth is not a replacement for a security audit, deployment monitor, or incident response system.

## Maturity Definition

A stranger can install opstruth, run it on a messy repo, trust the output, understand the proof gaps, and know the next safe action.

## Maturity Pillars

1. Probe quality
2. Real-world repo fixture testing
3. Evidence pack quality
4. First-run onboarding
5. CLI command UX
6. Configuration and explicit inputs
7. CI/GitHub Action usage
8. Safety and secret handling
9. Release discipline
10. Production/docs alignment

## Release Discipline

This maturity work should not automatically publish npm.

The `v0.1.3` maturity release was published only after local checks, fixture matrix evidence, npm auth verification, public install testing, and source push completed.

Release should only happen after:

- source validation passes
- public install behavior is confirmed
- generated evidence is reviewed
- no secrets or generated junk are staged
- GitHub release notes match actual behavior
- npm publishing is explicitly requested

## Completion Gate

No opstruth task is complete until the completion gate has run and the final report includes proof:

```bash
./scripts/opstruth-completion-gate.sh
```

See `docs/completion-gate.md`. Skipped checks remain proof gaps, not passes.

The completion gate now uses named per-step timeouts. Build steps get longer timeouts, network checks are warning-only, and a timeout is a blocker to investigate rather than a pass.

The gate is mode-aware:

- `quick` skips heavy website/root build proof and is only for fast local confidence.
- `standard` is the default completion proof path.
- `extended` keeps the same required proof surface as standard with longer build and Wrangler timeouts.

Use extended mode when root build or website build is slow because of cold dependency installs or constrained execution environments.

## Real-World Validation

Wagging Web Wins is now tracked as a real-repo validation case study. It demonstrates the product distinction between merged code, static source review, PR evidence, and unverified production truth.

The 2026-06-17 source CLI run against Wagging Web Wins also showed why this distinction matters. OpsTruth parsed JSON successfully and verified repo/probe/secret-scan surfaces, but the one-command result stayed `STATUS: Fail` because Wagging's local `lint` script exited `1` with real lint errors. A stale Bun lockfile had previously caused ambiguous `127` quality failures, so the run also reinforced package-manager consistency as operational evidence. Supabase production mutation was not approved, so live scheduler, secret, database, and Edge Function behavior remained proof gaps.

The 2026-06-18 follow-up showed incremental proof improvement without overclaiming. Wagging's lint backlog dropped from 42 errors and 20 warnings to 32 errors and 20 warnings, local Vite preview routes responded with HTTP `200`, and the local runtime probe confirmed port `4173`. The one-command result still remained `STATUS: Fail` because lint still failed, local preview did not prove production headers, and Supabase production application was still unapproved.

The 2026-06-19 follow-up closed two local validation gaps. Wagging's lint backlog was reduced from 32 errors and 20 warnings to 0 errors and 20 warnings, so local quality now passes while Fast Refresh and hook warnings remain tracked. OpsTruth also fixed the one-command orchestration path so configured local runtime inputs in `opstruth.config.json` are honored by `opstruth --skip evidence`; the Wagging validation run reported routes as `warn`, local as `pass`, quality as `pass`, and no local-runtime skip. Supabase mutation remained unapproved and was not performed.

See `docs/case-studies/wagging-web-wins.md`, `evidence/real-world-validation-wagging-web-wins.md`, and `evidence/real-world-validation-wagging-opstruth-run.md`.

## Maturity Work In This Pass

This pass focuses on trust surfaces that can be improved safely without changing the product promise:

- richer probe metadata
- clearer skipped/proof-gap reporting
- JSON probe catalogue output
- safer config defaults
- route and local runtime config support
- secret allowlists with redaction preserved
- fixture matrix coverage for common repo shapes
- evidence pack section standards
- first-run and subcommand help improvements
- CI and GitHub Action guidance

## What Maturity Does Not Mean Yet

Maturity does not mean opstruth can prove every operational fact. The tool should remain honest about what it did not check.

Examples:

- A passing static Cloudflare config check does not prove the deployed Worker is healthy.
- A passing Supabase migration scan does not prove live database permissions.
- A passing quality script does not prove route availability.
- A skipped route probe is a proof gap, not a clean bill of health.
