# opstruth Lovable Knowledge Base

> Read this file before making any changes to the opstruth website. It is the source of truth for repo structure, boundaries, messaging, and file-level context.

---

## 1. Project Summary

**opstruth** is a local, read-only operational truth checker for AI-assisted engineering. It runs as a CLI, inspects a project's actual state after AI-assisted changes, and produces an **evidence pack** that separates verified facts from unverified assumptions and explicitly out-of-scope actions.

This repository contains two distinct products:

- **The CLI** (`cli/`) — the actual opstruth tool. Node.js, read-only, evidence-first.
- **The website** (`website/`) — the marketing/explainer frontend for the CLI. TanStack Start + React 19 + Tailwind v4.

The website **explains** the CLI, evidence packs, proof gaps, stack-aware probes, and the read-only safety model. The website is **not** the CLI and must never claim CLI behavior the CLI does not perform.

---

## 2. Monorepo Structure

```
/
  cli/        # opstruth CLI tool (Node.js, the actual product)
  website/    # Lovable/frontend website app (TanStack Start)
  docs/       # documentation (safety model, probe catalogue, etc.)
  evidence/   # curated evidence pack examples & fixture runs
  .codex/     # Codex workflow skills (release, publish, preflight)
  .github/    # GitHub workflows, issue/PR templates
  src/        # CLI source — belongs to CLI, NOT the frontend
  bin/        # CLI entry points
  test/       # CLI tests
  LOVABLE.md  # repo-root guardrails
  README.md, AGENTS.md, CONTRIBUTING.md, SECURITY.md, LICENSE
```

Folder purposes:

- `cli/` — All CLI source, fixtures, commands, library code, tests.
- `website/` — All frontend code. **The only place Lovable should write.**
- `docs/` — Long-form documentation (safety model, probe catalogue, community testing, roadmap). Lovable does not edit unless explicitly asked.
- `evidence/` — Real evidence-pack outputs from fixture runs. Reference-only for the website; do not edit.
- `.codex/` — Local workflow skills for Codex sessions. Off-limits.
- `.github/` — CI workflows and templates. Off-limits.

---

## 3. Lovable Working Boundary

**Lovable must only edit website code inside `website/`.**

Do **not**:
- Touch `cli/`, `docs/`, `evidence/`, `.codex/`, `.github/`, or any root-level CLI source (`src/`, `bin/`, `test/`).
- Move website files back to the repository root.
- Merge website dependencies into root `package.json`.
- Create root-level `src/`, `public/`, `package.json`, `vite.config.*`, `tailwind.config.*`, `tsconfig.json`, or `components.json`.
- Restructure or "flatten" the monorepo.

If Lovable cannot safely target `website/`, stop and explain the limitation rather than restructuring.

Allowed exceptions (documentation only):
- `LOVABLE.md` (root guardrails)
- `website/LOVABLE.md` (website guardrails)
- `docs/lovable-knowledge-base.md` (this file)

---

## 4. Website App Root

**App root:** `website/`

From `website/package.json` (verified):

- Package manager: **bun** (lockfile `website/bun.lock` present; root may use npm for CLI but website uses bun).
- Framework: TanStack Start v1 (React 19, Vite 7).
- Styling: Tailwind CSS v4 via `@tailwindcss/vite`.

Scripts (verified in `website/package.json`):

| Script | Command |
|--------|---------|
| `dev` | `vite dev` |
| `build` | `vite build` |
| `build:dev` | `vite build --mode development` |
| `preview` | `vite preview` |
| `lint` | `eslint .` |
| `format` | `prettier --write .` |

Run all commands from inside `website/`:

```bash
cd website
bun install
bun run dev      # local dev server
bun run build    # production build
bun run preview  # preview built output
```

**Expected build output:** TanStack Start + Vite emits `website/dist/client` and `website/dist/server` (SSR-capable). Exact deployment output directory may be `.output/` depending on Nitro config — *not verified for this repo's current hosting target.*

---

## 5. Important Website Files

| Path | Purpose | Safe for Lovable | Notes |
|---|---|---|---|
| `website/package.json` | Website deps & scripts | Yes (add deps via `bun add` from `website/`) | Never merge into root |
| `website/vite.config.ts` | Vite + TanStack Start config | Yes, carefully | Do not externalize SSR deps |
| `website/tsconfig.json` | TS config (strict) | Yes, carefully | Strict mode; every import must resolve |
| `website/components.json` | shadcn/ui generator config | Yes | Used to scaffold UI primitives |
| `website/src/` | All source code | Yes | Canonical source location |
| `website/src/routes/` | File-based routes (TanStack) | Yes | See section 6 |
| `website/src/components/` | React components | Yes | Split into `site/` and `ui/` |
| `website/src/components/site/` | Page-section components | Yes | See section 7 |
| `website/src/components/ui/` | shadcn/ui primitives | Yes, sparingly | Generated; prefer composing over editing |
| `website/src/styles.css` | Tailwind v4 + design tokens | Yes | All color/theme tokens live here |
| `website/src/router.tsx` | Router config | Yes, carefully | Keep query client wiring intact |
| `website/src/start.ts` | Start instance / middleware | Yes, carefully | |
| `website/src/server.ts` | SSR entry | Avoid unless necessary | |
| `website/src/routeTree.gen.ts` | Auto-generated route tree | **No** | Generated by router plugin |
| `website/src/lib/utils.ts` | `cn()` and helpers | Yes | |
| `website/src/assets/` | Imported assets (mp4/jpg via asset manifests) | Yes | `*.asset.json` files describe Lovable-managed assets |
| `website/public/` | Static assets served as-is | Yes | See section 9 |
| `website/.lovable/project.json` | Lovable project metadata | **No** | Managed by Lovable |
| `website/README.md` | Website README | Yes | |
| `website/LOVABLE.md` | Website guardrails | Yes | Keep guardrails intact |

---

## 6. Website Routes and Pages

File-based routing under `website/src/routes/`:

- `__root.tsx` — Root layout (HTML shell, head tags, providers, `<Outlet />`).
- `index.tsx` — `/` homepage. Composes all `site/*` sections (Hero, Problem, ProofGap, WhatItChecks, ExampleOutput, EvidencePack, GitHubWorkflow, WillNotDo, Community, footer/header).
- `sitemap.xml.ts` — `/sitemap.xml` server route emitting sitemap XML.
- `README.md` — Routing conventions notes.

Currently the site is a single-page homepage with section anchors (`#checks`, `#evidence`, `#github`, `#boundaries`). Adding new top-level sections (About, Pricing, Blog, etc.) should be **separate route files**, not more hash anchors — each with its own `head()` metadata.

---

## 7. Website Components

All section components live in `website/src/components/site/`.

| Path | What it controls | Role | Safe edit notes |
|---|---|---|---|
| `site/SiteHeader.tsx` | Top navigation bar | Logo + nav links to anchors / GitHub | Keep links pointing to real anchors / real repo |
| `site/SiteFooter.tsx` | Footer | Logo, GitHub link, anchor links, version chip | Keep `v0.1 · pre-release` status truthful |
| `site/Logo.tsx` | opstruth wordmark/mark | Visual identity | Don't replace with generic mark |
| `site/Hero.tsx` | Landing hero | Headline, subhead, install command, **autoplay product video** with poster fallback | Video and poster wired via `*.asset.json` manifests in `src/assets/` |
| `site/Problem.tsx` | "The gap" section | Six canonical questions opstruth answers | Don't change the six questions without verifying CLI output |
| `site/ProofGap.tsx` | Verified / Not verified / Did not do | Three-lane operational proof model | Lines must reflect actual CLI behavior |
| `site/WhatItChecks.tsx` | Probe catalogue grid | 8 probe categories with "what it proves / does not prove" | Must match `docs/probe-catalogue.md` |
| `site/ExampleOutput.tsx` | Sample CLI output | Terminal-styled evidence excerpt | Must be a real, runnable example |
| `site/EvidencePack.tsx` | Evidence pack explainer | Describes the markdown report artifact | |
| `site/GitHubWorkflow.tsx` | GitHub-first workflow | Repo links + CI YAML example | YAML must match `.github/workflows/opstruth-example.yml` |
| `site/WillNotDo.tsx` | Hard boundaries | Explicit list of what opstruth never does | Do **not** soften or remove items |
| `site/Community.tsx` | Community testing CTA | Encourages bringing repos / filing probes | |
| `site/CommandBlock.tsx` | Reusable copyable shell command | `$ command` with copy-to-clipboard | Reuse for any shell snippet |

UI primitives in `website/src/components/ui/` are shadcn-generated (button, card, dialog, etc.). Prefer composing them over editing.

---

## 8. Styling and Design System

- **Main CSS:** `website/src/styles.css` — Tailwind v4 via `@import "tailwindcss"` plus custom design tokens.
- **Tailwind v4:** No `tailwind.config.js`; tokens defined as CSS variables in `styles.css` (`oklch(...)` for colors). Use semantic tokens (`bg-surface`, `text-foreground`, `border-border`, `text-status-pass`, `text-status-fail`, `text-status-skip`, etc.) — **never** raw color classes.
- **Theme:** Dark, terminal-inspired. Monospaced labels, restrained palette, status colors (pass/fail/skip) used sparingly.
- **Typography:** Mono for labels/code/CLI; sans for body and headlines. Avoid generic Inter/Poppins look — stay editorial and engineering-forward.
- **Code blocks:** `CommandBlock` for inline shell; `<pre>` blocks with `border-strong` + `bg-[oklch(...)]` for multi-line YAML/output.
- **Responsive:** Mobile-first; sections use `mx-auto max-w-6xl px-6 py-20 md:py-28`. Grids collapse to single column on small screens.
- **No** purple-gradient SaaS aesthetic. Keep it operational and calm.

---

## 9. Assets

`website/public/` (verified):

| Path | Purpose | Used where | Safe edit |
|---|---|---|---|
| `public/logo-mark.png` | opstruth logo | Favicon / OG fallback | Yes; keep mark identity |
| `public/og-card.png` | OpenGraph share card | `__root.tsx` head meta | Yes; regenerate if branding changes |
| `public/robots.txt` | Crawl rules | Root | Yes |
| `public/llms.txt` | LLM-targeted summary | Root | Keep aligned with positioning |

`website/src/assets/` (historical Lovable-managed asset manifests):

| Path | Purpose | Used where |
|---|---|---|
| `src/assets/opstruth-launch.mp4.asset.json` | Superseded product launch video manifest | Removed from active website source |
| `src/assets/opstruth-poster.jpg.asset.json` | Superseded poster/fallback manifest | Removed from active website source |

The active website now serves current in-repo video assets from `website/public/demo/` instead of Lovable-hosted asset manifests.

---

## 10. Product Messaging Rules

Preserve this positioning at all times:

- **Local-first** — runs on the developer's machine.
- **Read-only by default** — no mutations, no deploys, no side effects.
- **Evidence-first** — every finding has a file, line, why-it-matters, and a next safe step.
- **Separates verified facts from "not verified" and "did not do"** — three lanes.
- opstruth **does not**: deploy, mutate databases, trigger jobs, publish content, call OpenAI/Anthropic/any model API, restart services, or print raw secrets.
- opstruth **is not**: generic DevOps, generic observability, an AI agent, autonomous remediation, or hypeware.

Preferred headline direction:

> **AI coding tools are fast. opstruth checks what is actually true afterward.**

---

## 11. Safe Claims vs. Claims To Avoid

**Safe claims:**
- read-only checks
- local CLI
- stack-aware probes (TypeScript, React, Vite, Next.js, Docker, Supabase, Cloudflare, etc.)
- evidence packs (structured markdown reports)
- proof gaps (explicit "not verified" lane)
- GitHub-first workflow (CI artifact upload pattern)
- community testing (bring repos, file false positives, request probes)
- pre-release / v0.1 status

**Avoid (unsupported):**
- production monitoring / APM
- replacement for a security audit
- autonomous deployment or remediation
- "guaranteed" safety / zero false positives
- enterprise compliance certifications (SOC2, ISO, etc.)
- fabricated customer logos, user counts, GitHub stars, or testimonials
- AI/agentic behavior the CLI does not perform

---

## 12. CLI Relationship

- CLI source lives in `cli/`. Lovable does not modify it.
- Website copy and examples must reflect **real** CLI commands. Do not invent flags or subcommands.

Commands to verify (against `cli/bin/opstruth.js` / `cli/src/commands/*`) before referencing on the site:

```
opstruth
opstruth welcome
opstruth probes
opstruth repo
opstruth secrets
opstruth routes --base-url https://example.com
opstruth local --port 3000 --health /health
opstruth evidence
opstruth init --yes
opstruth --strict --out evidence/opstruth.md
```

The website's CI snippet must match `.github/workflows/opstruth-example.yml`.

---

## 13. Evidence and Docs Relationship

- `evidence/` contains real fixture-run outputs (`vite-react-app.md`, `next-app.md`, `supabase-cloudflare-app.md`, `risky-secret-app.md`, etc.). Lovable does not edit.
- `docs/` contains canonical product docs (`safety-model.md`, `probe-catalogue.md`, `community-testing.md`, `roadmap.md`, `one-command-flow.md`). Lovable does not edit unless explicitly asked.
- Website may reference these conceptually and link to them on GitHub. If quoting evidence, use a real verified excerpt — do not paraphrase into a stronger claim.

---

## 14. Deployment Notes

From `website/package.json` and `website/vite.config.ts`:
- Build command: `bun run build` from `website/`.
- Build tool: Vite 7 + TanStack Start.
- Likely output: `website/dist/client` + `website/dist/server` (SSR-capable). Nitro target / hosting adapter — *not verified in this knowledge pass.*
- Production URL: `https://opstruth.woeinvests.workers.dev` (Cloudflare Workers, deployed from the canonical monorepo).

**Not verified:**
- Whether Lovable's production build serves SSR or static output for this project.
- Exact CDN / edge configuration.
- Whether the npm CLI package has been published.
- Whether the GitHub repo is public.

Do not invent deployment settings. Ask the user before changing build config.

---

## 15. Future Lovable Instructions (reusable block)

> Read `docs/lovable-knowledge-base.md` first.
>
> You are working on the opstruth website only.
>
> The website app root is `website/`.
>
> Only modify files inside `website/`.
>
> Do not modify `cli/`, `docs/`, `evidence/`, `.codex/`, `.github/`, or root package/config files.
>
> Do not create `src/` or `public/` at the repo root.
>
> Preserve the read-only, evidence-first positioning of opstruth. Never claim behaviors the CLI does not perform.

---

## 16. Unknowns / Not Verified

- Exact Lovable deployment pipeline behavior for a monorepo with the app root at `website/` (whether Lovable auto-detects the subdirectory).
- Whether the website's SSR runtime is Workers-style edge or Node — affects which server-side libraries are safe.
- Current hosting configuration beyond the Cloudflare Workers production URL.
- Whether the `opstruth` npm package has been published publicly.
- Whether the GitHub repository `ayobamih/opstruth` is public or private at the time of reading.
- Real-world adoption metrics — do not assert any without source.
