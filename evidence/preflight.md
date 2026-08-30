# ChatGPT Plugin Preflight

- **Date:** 2026-08-25
- **Scope:** OpsTruth skills-only ChatGPT plugin, local marketplace metadata, submission materials, and public policy/support pages
- **Branch:** `feat/chatgpt-opstruth-plugin`
- **Production writes:** none

## Verified

| Check | Result |
| --- | --- |
| `node cli/bin/opstruth.js repo --json` | Pass. Canonical Git root and clean starting state established before changes. |
| `node scripts/validate-chatgpt-plugin.mjs` | Pass. Manifest, listing limits, logo, six skill bundles, resources and agent metadata validated. |
| `quick_validate.py` for all six bundled skills | Pass for `repo-map`, `secret-audit`, `build-verify`, `git-preflight`, `runtime-truth` and `llm-drift-control`. |
| `node scripts/website-content-regression.mjs` | Pass. |
| `node cli/bin/opstruth.js --help` and `welcome` | Pass. The documented command surface and safety explanation rendered successfully. |
| `node cli/bin/opstruth.js probes --json` | Pass. Thirty probes remain catalogued as safe and read-only; explicit route and runtime inputs remain proof gaps. |
| `website: npm run lint` | Pass with zero errors. Six existing Fast Refresh warnings remain in unrelated shared UI files. |
| `website: npm run build` | Pass. Client and SSR bundles include `/privacy`, `/terms` and `/support`. |
| `git diff --check` | Pass. |
| Submission ZIP integrity | Pass. 59 entries, 665,339 bytes, SHA-256 `33dda57530e45f775a80da10d0a067eed526e679e220eb1065a15222eaa228f9`. |
| Independent `repo-map` forward test | Pass. The bundled skill mapped `cli/fixtures/vite-react-app` read-only, correctly treated it as a detection fixture rather than a runnable Vite app, identified the project-boundary caveat, and left execution health unverified. |
| Independent `llm-drift-control` forward test | Pass. The bundled skill contradicted the claims that the branch was clean, all tests had passed, or the plugin was publish-ready; it confirmed only the narrower structural validation claim. |
| Local marketplace authentication policy | Verified against the official marketplace format. `policy.authentication` is required metadata that selects install-time versus first-use handling; `ON_INSTALL` does not add an MCP server or authentication flow to this skills-only plugin. |

## Blocked Or Not Verified

| Check | Status and consequence |
| --- | --- |
| CLI `node --test` | Not executed to completion. The managed environment stopped the test runner when its child-process fixtures requested permissions. This is an environment blocker, not a passing or failing test result. |
| `node cli/bin/opstruth.js secrets --json` | Completed with `warn`. Findings are redacted and concentrated in deliberate secret fixtures, scanner/parser definitions, documentation references and existing UI token-like strings. They remain review items rather than a clean pass. |
| `node cli/bin/opstruth.js --skip evidence --json` | Blocked at the same managed child-process permission boundary while attempting the broader orchestrated check. |
| `./scripts/opstruth-completion-gate.sh` | Blocked. The first attempt could not create the default npm cache under `/root/.npm`; the retry with a temporary cache reached the same managed child-process permission boundary as the CLI tests. The completion gate is not passed. |
| Local HTTP preview requests | Not verified. The production build passed, but the managed execution environment did not allow a background preview server and a separate HTTP probe to share the required process/network boundary. |
| GitHub authentication gate | The repository-required `gh` CLI remains unavailable. After explicit user approval for the connected GitHub integration, that integration was verified as `AyobamiH` with admin and push access to the matching `AyobamiH/opstruth` repository. No commit or push was attempted because the local preflight still did not complete. |
| Public policy URLs | Not live until the website source changes are approved and deployed. No deployment was attempted. |
| OpenAI public submission | Not started. Developer identity verification, portal upload, OpenAI safety review and final publication remain external approval steps. |

## Changed State

- Local source files were added or updated on the feature branch.
- Website dependencies were installed locally from the checked-in lockfile for validation.
- A submission ZIP was created outside the repository.
- No Git commit, Git push, deployment, OpenAI portal submission, database mutation or production write occurred.

## Approved GitHub Integration Follow-up

- **Date:** 2026-08-25
- **User approval:** received for the connected GitHub integration and website deployment.
- **Connected identity:** verified as `AyobamiH` with admin and push access to `AyobamiH/opstruth`.
- **Remote:** matches `https://github.com/AyobamiH/opstruth.git`.
- **Local preflight retry:** blocked before publication. Both `npm run lint` and `npm test` require child-process execution that this managed environment could not approve; the execution channel disconnected before the command could complete.
- **Hosted CI hardening:** added a dedicated `plugin` job to `.github/workflows/ci.yml` so a published candidate would validate the six-skill ChatGPT package alongside the existing CLI and website jobs.
- **Remote and production writes:** none. Repository policy requires stopping before commit, push, or deployment when the local preflight does not complete.

## Next Safe Step

1. Run `NPM_CONFIG_CACHE=/tmp/opstruth-completion-npm-cache ./scripts/opstruth-completion-gate.sh` in an environment that permits the repository test fixtures, or obtain an explicit one-time exception to publish only the feature branch and use hosted CI as the missing test gate.
2. If the CI-first exception is approved, publish the feature branch through the verified GitHub integration and require all CLI, plugin and website jobs to pass before merging.
3. Merge only the verified candidate to `main`, which is the repository's configured Cloudflare deployment path.
4. Verify the live privacy, terms and support URLs after deployment.
5. Install the plugin from its local marketplace and execute the representative prompt set in new conversations before public submission.

## 2026-08-30 canonical-domain migration preflight

- **Scope:** bind the OpsTruth website to `https://opstruth.io`, move the independent MCP service to `https://mcp.opstruth.io`, and retain `workers.dev` only for compatibility or historical evidence.
- **Starting branch:** `main` at `d37c5d1983d889e4d1563e654b4684e7d839f39e`.
- **Production writes during preflight:** none.

### Verified

| Check | Result |
| --- | --- |
| `node cli/bin/opstruth.js repo` before changes | Pass. Canonical Git root and Cloudflare configuration detected. |
| `npm run ci` | Pass. CLI lint and all 80 tests passed; plugin validation passed; website client and SSR builds passed. |
| `cd cli && npm run lint && npm test` | Pass. All 80 CLI tests passed. |
| `node bin/opstruth.js --help`, `welcome`, `probes`, and `--skip evidence` | Pass or partial pass with no failures. The broad run retained its documented proof gaps and redacted fixture warnings. |
| `./scripts/demo-fixtures.sh` | Pass. Six fixture evidence files regenerated successfully, inspected, and restored because the generated output was unrelated to this domain-only change. |
| `node bin/opstruth.js secrets` | Partial pass with no failures. Existing redacted fixture/parser/documentation warnings remain; no new secret material was introduced. |
| `./scripts/opstruth-completion-gate.sh --mode quick` | Pass. Required CLI checks completed; the production reachability probe truthfully observed the pre-migration `502`. |
| `git diff --check` | Pass. |
| GitHub connector identity and repository authority | Verified for `AyobamiH/opstruth` with admin and push access. The local `gh` executable is unavailable, so publication must use the connected GitHub integration rather than local `gh`. |

### Proof gaps before merge

- The owned domain was observed at `502 Connection refused` before the custom-domain binding.
- Production deployment, DNS replacement, and post-deploy route checks remain unverified until the pull request is merged and the existing Cloudflare workflow completes.
- The repository's existing six Fast Refresh warnings and redacted secret-fixture warnings remain warnings, not failures and not new findings from this change.

### Next safe step

Publish the exact domain-migration branch through the authenticated GitHub integration, require hosted CI, merge only after checks pass, then verify `https://opstruth.io`, its policy/video routes, and the separate `https://mcp.opstruth.io` service before indexing final evidence.
