# LOVABLE.md — Website App Root

## Full Knowledge Base

Before making frontend changes, read:

`docs/lovable-knowledge-base.md`

That file contains the full repo map, website file map, messaging rules, and Lovable boundaries.

## Canonical App Root

This folder (`website/`) is the canonical website app root.

## Working Rules

1. **All design, page, component, asset, and styling work belongs here.**
   - Source code: `website/src/`
   - Components: `website/src/components/`
   - Routes: `website/src/routes/`
   - Styles: `website/src/styles.css`
   - Static assets: `website/public/`

2. **Keep all website dependencies inside `website/package.json`.**
   - Install with `bun add <pkg>` from inside `website/`.
   - Do not add website dependencies to the root `package.json`.

3. **Keep all website source inside `website/src`.**
   - Do not create source files outside this directory tree.

4. **Keep website static assets inside `website/public`.**
   - Images, fonts, and other public files go here.

5. **Do not touch the CLI.**
   - The CLI lives outside `website/`. Leave `cli/` and root monorepo files alone.
   - Do not modify `cli/package.json`, `cli/bin/`, `cli/src/`, `cli/test/`, `cli/fixtures/`, `cli/examples/`, or `cli/scripts/`.

6. **Do not touch repository infrastructure.**
   - Leave `docs/`, `evidence/`, `.codex/`, and `.github/` alone unless the user explicitly asks.

## Quick Reference

- Framework: TanStack Start v1 (React 19 + Vite)
- Styling: Tailwind CSS v4 with custom tokens in `src/styles.css`
- Routing: File-based in `src/routes/` (see `src/routes/README.md`)
- Build: Vite (SSR/SSG compatible)

## Disallowed Changes

- Do not move files out of `website/` to the repo root.
- Do not create root-level frontend files.
- Do not create `src/`, `public/`, `vite.config.*`, `tailwind.config.*`, `tsconfig.json`, or `components.json` at the repo root.
- Do not modify CLI code, docs, evidence, Codex skills, GitHub workflows, or root monorepo configuration.
