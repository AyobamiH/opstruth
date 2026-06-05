# Agent Instructions

- Run `opstruth repo` before changes to establish repository ground truth.
- Run `opstruth` after changes unless the user asks for a narrower check.
- Never deploy without explicit user approval.
- Never print secrets.
- Never mutate production by default.
- Always produce evidence after risky work.
- Treat warnings as unresolved proof gaps, not success.
- Keep stack detection inside the project boundary.
- Prefer evidence-backed findings with redacted previews, why it matters, and a next safe step.
- Use `opstruth welcome` for first-run explanation and `opstruth init --yes` only when the user wants a config file.

## Local Codex Skills

- Use `.codex/skills/github-auth-check` before GitHub operations.
- Use `.codex/skills/opstruth-preflight` before pushing.
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
