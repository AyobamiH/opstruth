# Roadmap

- v0.1: one-command read-only proof run with project boundaries, welcome/help/init UX, evidence-backed findings, and markdown evidence packs
- v0.2: configurable allowlists, policy config, richer route matrices, and stack-specific proof summaries
- v0.3: CI-friendly report output and hosted-CI status adapters that remain read-only
- v0.4: broader probe catalogue coverage for monorepos, package workspaces, database platforms, and hosting providers
- v0.5: Codex skills and MCP-compatible adapters over the same local-first proof primitives

## TypeScript Compatibility

Current v1 support is detection-first: opstruth identifies TypeScript, framework config, ESM mode, test/lint tools, package scripts, and package manager lockfiles, then runs only existing quality scripts. Future work can add workspace-aware detection, tsconfig reference summaries, and optional TypeScript implementation after the JavaScript CLI surface settles.

## Probe Catalogue Direction

The catalogue is the core architecture. Probes declare what stack they apply to, whether they are safe to run automatically, what evidence they collect, what they prove, and what they do not prove. Future probes should make proof gaps clearer rather than making opstruth feel more powerful.

Dangerous actions remain out of scope for default orchestration. Deploys, database mutations, queue/job triggers, service restarts, publishing, OpenAI calls, and credential rotation require explicit human approval or stay disabled.
