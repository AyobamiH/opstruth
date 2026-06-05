# opstruth Evidence Pack

## Status
Partial pass

## Operator Summary
This evidence pack separates verified facts from unverified claims. opstruth is read-only and does not prove production state unless route or runtime checks were explicitly configured.

## Scope
- Phase: local proof run
- Working directory: /home/johnh/opstruth
- Git root: /home/johnh/opstruth

## Files Changed
- .github/
- AGENTS.md
- CODEX_GOAL.md
- LICENSE
- README.md
- bin/
- docs/
- evidence/
- examples/
- package.json
- src/
- test/

## Commands Run
- git diff --check
- npm run typecheck
- npm run lint
- npm run test
- npm run build
- npm run ci

## Check Results
- pass: repo inspection
- not_verified: typescript project detection
- pass: secret reference scan
- pass: git diff --check
- pass: package script typecheck
- pass: package script lint
- pass: package script test
- pass: package script build
- pass: package script ci

## Verified Facts
- Current working directory inspected: /home/johnh/opstruth
- Git root checked: /home/johnh/opstruth
- Important repo files checked
- Project language detected: JavaScript
- Node module mode detected: ESM
- Package manager detected: npm
- Platforms detected: Node ESM, GitHub Actions
- Source files scanned with redaction
- .env contents were not printed
- git diff --check executed
- package.json scripts inspected
- Existing quality scripts selected: typecheck, lint, test, build, ci
- Safety boundary observed: no deploys, database mutations, OpenAI calls, publishing, queue triggers, restarts, or kills were run by opstruth

## Risks And Gaps
| Severity | Finding |
| --- | --- |
| Review | No production deploy was executed |
| Review | No database mutation was executed |
| Review | No OpenAI usage was monitored |
| Review | No publishing or job side effects were verified |
| Review | Supabase database exposure was not checked |
| Review | Cloudflare deployment configuration was not checked |
| Review | Production/public route availability was not checked |
| Review | Local runtime liveness was not checked |

## What Was Not Done
| Area | opstruth result |
| --- | --- |
| Jobs or queues | Not triggered by opstruth; not verified unless separate evidence is attached |
| OpenAI or external AI calls | Not called by opstruth; usage not monitored |
| Publishing | Not changed by opstruth |
| Deploys | No deploy command run by opstruth |
| Database mutations | No database mutation command run by opstruth |

## Safety Boundaries
- Read-only checks only
- No deploy commands run by opstruth
- No database mutation commands run by opstruth
- No OpenAI calls run by opstruth
- No secrets printed by opstruth

## Next Safe Step
Add read-only inputs such as --base-url or --port when route or runtime proof matters.
