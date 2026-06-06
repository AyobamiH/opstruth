# LOVABLE.md — Monorepo Guardrails

## Full Knowledge Base

Before making frontend changes, read:

`docs/lovable-knowledge-base.md`

That file contains the full repo map, website file map, messaging rules, and Lovable boundaries.

## Project Structure

This is a **monorepo**.

```
/
  cli/        # opstruth CLI tool (Node.js, read-only operational truth checks)
  website/    # frontend website app (TanStack Start + React + Tailwind)
  docs/       # documentation
  evidence/   # evidence examples and fixture runs
  .codex/     # Codex workflow skills
  .github/    # GitHub workflows and templates
```

## Lovable Working Rules

1. **Lovable must only work inside `website/`.**
   - All design, page, component, asset, and styling work belongs in `website/src/`.
   - All website dependencies must stay inside `website/package.json`.
   - All website static assets belong in `website/public/`.

2. **`cli/` must not be touched.**
   - Do not modify CLI source, commands, or configuration.
   - Do not change `cli/package.json`, `cli/bin/`, `cli/src/`, `cli/test/`, `cli/fixtures/`, `cli/examples/`, or `cli/scripts/` for frontend work.

3. **Do not move the frontend back to repo root.**
   - The website app root is intentionally `website/`.
   - Do not create frontend files at the repository root.

4. **Do not merge website dependencies into root package files.**
   - The root `package.json` is for monorepo orchestration scripts.
   - CLI dependencies live in `cli/package.json`.
   - Website dependencies live in `website/package.json` and `website/bun.lock`.

5. **If Lovable cannot safely target `website/`, stop and explain the limitation.**
   - Do not restructure the repository to make it "simpler."
   - Do not flatten `website/` into the root.

## Allowed Root Changes

- This `LOVABLE.md` file.
- Anything the user explicitly requests outside `website/`.

## Disallowed Root Changes

- Do not create `src/`, `public/`, `vite.config.*`, `tailwind.config.*`, `tsconfig.json`, or `components.json` at the root for frontend work.
- Do not move files out of `website/` to the root.
- Do not modify `cli/`, `docs/`, `evidence/`, `.codex/`, or `.github/` unless explicitly asked.
- Do not modify root monorepo infrastructure for frontend work.
