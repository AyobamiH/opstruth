# Agent Instructions

- Run `node cli/bin/opstruth.js repo` before changes to establish repository ground truth.
- Run `node cli/bin/opstruth.js` after changes unless the user asks for a narrower check.
- Never deploy without explicit user approval.
- Never print secrets.
- Never mutate production by default.
- Always produce evidence after risky work.
- Treat warnings as unresolved proof gaps, not success.
- Keep stack detection inside the project boundary.
- Prefer evidence-backed findings with redacted previews, why it matters, and a next safe step.
- Use `node cli/bin/opstruth.js welcome` for first-run explanation and `node cli/bin/opstruth.js init --yes` only when the user wants a config file.

## Local Codex Skills

- Use `.codex/skills/github-auth-check` before GitHub operations.
- Use `.codex/skills/opstruth-preflight` before pushing.
- Use `.codex/skills/opstruth-completion-gate` before reporting opstruth work as complete.
- Use `.codex/skills/github-publish` when the user asks to publish changes.
- Use `.codex/skills/github-release` when the user asks for a release.
- Use `.codex/skills/opstruth-site-deploy` before site deployment.
- Use `.codex/skills/hyperframes-demo` for terminal demo work.

Skill-wide rules:

- Never print tokens.
- Never commit secrets.
- Never fake a push, release, deploy, render, or generated artifact.
- Always check git status first.
- Always run opstruth before risky repo operations.
- Always separate `Done` from `Blocked`.
- Always report the exact blocker if authentication fails.

## Completion Gate

Before reporting work as complete, run:

```bash
./scripts/opstruth-completion-gate.sh
```

No task is complete until the output has been reviewed.

If the completion gate fails, report the failure instead of claiming success.

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
