# CODEX GOAL

opstruth starts as a CLI, but each command should later become a Codex skill, MCP tool, or CI gate.

First future skills:

1. Repo Ground Truth Skill
2. One Command Proof Run Skill
3. Evidence Pack Skill
4. Supabase RLS Hardening Skill
5. Cloudflare Runtime Truth Skill
6. AI Job Safety Skill
7. Route Smoke Matrix Skill
8. Secret and Header Guard Skill

First public product message:

```text
AI coding tools are fast. opstruth checks whether the project is actually safe, working, and explainable afterward.
```

## Completion Gate

Before reporting work as complete, run:

```bash
./scripts/opstruth-completion-gate.sh
```

No task is complete until the output has been reviewed.

If the completion gate fails, report the failure instead of claiming success.

The gate supports quick, standard, and extended modes. Standard is the default; extended is for slow machines, cold installs, or large builds:

```bash
./scripts/opstruth-completion-gate.sh --mode extended
```

The gate uses per-step timeouts: build phases get mode-specific timeouts, optional network checks are warning-only, and timeouts must be reported as blockers with the exact failing phase. A timeout is not a pass.

If the task touched probes or fixtures, also run the fixture matrix if available:

```bash
./scripts/run-fixture-matrix.sh
```

If the task touched npm publishing, verify:

```bash
npm view opstruth version description homepage repository bin --json
```

If the task touched production or website assets, verify:

```bash
curl -I https://opstruth.woeinvests.workers.dev
```

and any relevant asset URLs.
