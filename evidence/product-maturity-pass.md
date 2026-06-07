# Product Maturity Pass

Date: 2026-06-07

## Product State

- Repository: `https://github.com/AyobamiH/opstruth`
- Branch during work: `main`
- Commit before maturity work: `3ed25c3 Document opstruth v0.1.2 CLI identity release`
- Maturity implementation commit: `49a0f52 Improve opstruth product maturity`
- CLI version commit: `6af2105 Bump opstruth CLI to v0.1.3`
- npm package: `opstruth@0.1.3`
- GitHub release: `v0.1.3`
- Production website: `https://opstruth.woeinvests.workers.dev`
- Production runtime: Cloudflare Workers
- CLI source: `cli/`
- Website source: `website/`
- Evidence path: `evidence/`

## Maturity Phases Completed

- Probe metadata now includes normalized mode, mutability, explicit inputs, evidence expectations, skip reasons, proof limitations, supported stacks, and not-verified claims.
- `opstruth probes` now reports catalogue totals, area/mode/safety distribution, selected probes, explicit-input probes, skipped probes, and skipped reasons.
- `opstruth probes --json` now returns ANSI-free catalogue, selected probe, and skipped-probe metadata.
- Evidence pack markdown now includes explicit probe results, warnings, failures, skipped/not-configured, not-verified, evidence paths, and confidence sections.
- `opstruth init --yes` now writes a safer starter `opstruth.config.json` schema.
- Route config supports `routes: [{ path, expectedStatus }]`.
- Local runtime config supports `local.ports` and `local.healthPaths`.
- Secret scan config supports allowlist paths and patterns while preserving redaction.
- Secret findings now distinguish `secret-like value` from `secret reference` and label fixture/demo and documentation contexts.
- Root fixture matrix added for common repo shapes.
- CI, configuration, probe quality, evidence pack, route/runtime, Supabase, and Cloudflare maturity docs added.
- Website and docs version references aligned to `opstruth@0.1.3` and GitHub release `v0.1.3`.

## Fixture Matrix Summary

Generated with:

```bash
./scripts/run-fixture-matrix.sh
```

Evidence directory:

```text
evidence/fixture-matrix/
```

Fixtures covered:

- `plain-node-app`
- `vite-react-app`
- `next-app`
- `tanstack-app`
- `cloudflare-worker-app`
- `supabase-app`
- `non-git-folder`
- `default-npm-placeholder-test`
- `failing-real-test-script`
- `risky-secret-app`
- `no-package-json`
- `missing-build-script`
- `route-config-app`

Expected behavior was observed:

- normal fixtures ran core commands without source mutation
- default npm placeholder tests were skipped instead of failed
- the deliberate failing test fixture failed quality checks
- fake fixture secret references were redacted and labeled as fixture/demo context
- non-git folders produced proof gaps rather than hard failures

## Validation

CLI validation:

```bash
cd cli
npm run lint
npm test
node bin/opstruth.js --help
node bin/opstruth.js welcome
node bin/opstruth.js probes
node bin/opstruth.js probes --json
node bin/opstruth.js --skip evidence
node bin/opstruth.js --json --skip evidence
```

Results:

- CLI lint passed.
- CLI tests passed.
- `opstruth probes --json` parsed and remained ANSI-free.
- `opstruth --json --skip evidence` completed with `status: warn`, no failures, and redacted warning evidence.
- The one-command run remained honest about route/local/Supabase proof gaps.

Website and deployment validation:

```bash
cd website
npm run build
npm run lint
cd ..
npm run build
timeout 120s env NPM_CONFIG_CACHE=/tmp/opstruth-npm-cache npx wrangler deploy --dry-run
```

Results:

- Website build passed.
- Website lint passed with 6 existing Fast Refresh warnings and 0 errors.
- Root build passed and synced `website/dist` to ignored root `dist`.
- Wrangler dry-run passed and did not deploy.

Public package validation:

```bash
npm install -g opstruth@0.1.3 --prefix /tmp/opstruth-public-0.1.3-prefix
/tmp/opstruth-public-0.1.3-prefix/bin/opstruth --help
/tmp/opstruth-public-0.1.3-prefix/bin/opstruth welcome
/tmp/opstruth-public-0.1.3-prefix/bin/opstruth probes --json
/tmp/opstruth-public-0.1.3-prefix/bin/opstruth --skip evidence
/tmp/opstruth-public-0.1.3-prefix/bin/opstruth --json --skip evidence
```

Results:

- Registry install succeeded with a timed npm command and `/tmp` cache.
- Installed `opstruth@0.1.3` command surfaces ran successfully from `/tmp`.
- Published package metadata confirmed `bin.opstruth` points to `bin/opstruth.js`.

Production reachability:

```bash
curl -I https://opstruth.woeinvests.workers.dev
curl -I https://opstruth.woeinvests.workers.dev/demo/opstruth-hero-runtime-truth.mp4
curl -I https://opstruth.woeinvests.workers.dev/demo/opstruth-current-runtime-truth.mp4
```

Results:

- Production website returned `HTTP/2 200`.
- Hero video returned `HTTP/2 200`.
- Current runtime truth video returned `HTTP/2 200`.

## Known Limitations

- Some probes remain static-only.
- Route checks still require `--base-url` or route config before production/public route availability is verified.
- Local runtime checks still require explicit local ports, health paths, process names, or service names.
- Supabase checks remain static and do not verify live database permissions.
- Cloudflare checks do not inspect dashboard state and do not deploy.
- Secret scanner intentionally warns on redacted demo/documentation references when they match risky names.
- `opstruth@0.1.3` remains a v0.1 public testing release.

## What Was Not Done

- No manual deployment.
- No Lovable setting changes.
- No video work.
- No production architecture change.
- No secrets committed.
- No `.env`, `.npmrc`, tarballs, node_modules, dist/build/cache output, `.wrangler`, temp auth files, or generated junk intentionally staged.
