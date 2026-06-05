# opstruth Website

The frontend website for opstruth — a local, read-only CLI that verifies what is actually true after AI-assisted changes.

## App Root

This folder (`website/`) is the canonical website app root. All frontend work happens here.

> **Reminder:** Root-level files and folders belong to the CLI/monorepo. Do not create root-level `src/`, `public/`, frontend config, or package files for website work.

## Tech Stack

- **Framework:** TanStack Start v1 (React 19, file-based routing)
- **Build Tool:** Vite 7
- **Styling:** Tailwind CSS v4
- **Language:** TypeScript

## Local Development

Run the dev server from inside this directory:

```bash
cd website
bun install
bun run dev
```

The dev server will start and print the local preview URL.

## Build

```bash
cd website
bun run build
```

**Expected build output:**
- Vite builds the app into `.output/` (or the configured Vite output directory).
- SSR and client bundles are generated automatically by TanStack Start.

## Preview (Production Build Locally)

```bash
cd website
bun run preview
```

## Available Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| `dev` | `vite dev` | Start development server |
| `build` | `vite build` | Production build |
| `build:dev` | `vite build --mode development` | Development build |
| `preview` | `vite preview` | Preview production build locally |
| `lint` | `eslint .` | Lint source files |
| `format` | `prettier --write .` | Format source files |

## Project Structure

```
website/
  src/
    components/     # React components (site/, ui/)
    routes/         # TanStack file-based routes
    styles.css      # Tailwind + custom design tokens
    router.tsx      # Router configuration
    start.ts        # Start instance configuration
  public/           # Static assets (favicon, og images, etc.)
  package.json      # Website dependencies only
  vite.config.ts    # Vite configuration
  tsconfig.json     # TypeScript configuration
```

## Notes

- This is a monorepo. The CLI lives outside `website/`.
- CLI work belongs in `cli/`.
- Keep all website dependencies inside `website/package.json`.
- Keep all website source inside `website/src/`.
- Do not create root-level frontend files.
- Do not modify `cli/`, `docs/`, `evidence/`, `.codex/`, or `.github/` for website work.
