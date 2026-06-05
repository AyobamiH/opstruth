# opstruth Evidence Pack

## Status
Partial pass

## Operator Summary
This evidence pack separates verified facts from unverified claims. opstruth is read-only and does not prove production state unless route or runtime checks were explicitly configured.

## Scope
- Phase: local proof run
- Working directory: /tmp/opstruth-fixture-runs-225931/risky-secret-app
- Git root: /tmp/opstruth-fixture-runs-225931/risky-secret-app

## Files Changed
- package.json
- src/

## Commands Run
- git diff --check
- npm run test

## Check Results
- pass: repo inspection
- not_verified: typescript project detection
- warn: secret reference scan
- pass: git diff --check
- pass: package script test

## Verified Facts
- Project boundary: /tmp/opstruth-fixture-runs-225931/risky-secret-app
- Probe catalogue entries: 30
- Automatic safe probes selected: 8
- Current working directory inspected: /tmp/opstruth-fixture-runs-225931/risky-secret-app
- Git root checked: /tmp/opstruth-fixture-runs-225931/risky-secret-app
- Important repo files checked
- Project language detected: JavaScript
- Node module mode detected: ESM
- Package manager detected: npm
- Platforms detected: Node ESM
- Project boundary scanned: /tmp/opstruth-fixture-runs-225931/risky-secret-app
- Source files scanned with redaction
- .env contents were not printed
- git diff --check executed
- package.json scripts inspected
- Existing quality scripts selected: test
- Safety boundary observed: no deploys, database mutations, OpenAI calls, publishing, queue triggers, restarts, or kills were run by opstruth

## Risks And Gaps
| Severity | Finding |
| --- | --- |
| Review | warn: src/config.js:1 matched OPENAI_API_KEY |
| Review |   evidence: file: src/config.js |
| Review |   evidence: line: 1 |
| Review |   evidence: pattern: OPENAI_API_KEY |
| Review |   evidence: redacted preview: export const OPENAI_API_KEY = "[REDACTED]"; |
| Review |   why it matters: Secret-like values and service-role references can create account, data, or infrastructure exposure if committed or exposed to browsers. |
| Review |   next safe step: Confirm whether this is a harmless reference. Move real secrets to secret storage and keep only names/placeholders in source. |
| Review | warn: src/config.js:2 matched SUPABASE_SERVICE_ROLE_KEY |
| Review |   evidence: file: src/config.js |
| Review |   evidence: line: 2 |
| Review |   evidence: pattern: SUPABASE_SERVICE_ROLE_KEY |
| Review |   evidence: redacted preview: export const SUPABASE_SERVICE_ROLE_KEY = "[REDACTED]"; |
| Review |   why it matters: Secret-like values and service-role references can create account, data, or infrastructure exposure if committed or exposed to browsers. |
| Review |   next safe step: Confirm whether this is a harmless reference. Move real secrets to secret storage and keep only names/placeholders in source. |
| Review | warn: src/config.js:3 matched bearer |
| Review |   evidence: file: src/config.js |
| Review |   evidence: line: 3 |
| Review |   evidence: pattern: bearer |
| Review |   evidence: redacted preview: export const authorization = [REDACTED] |
| Review |   why it matters: Secret-like values and service-role references can create account, data, or infrastructure exposure if committed or exposed to browsers. |
| Review |   next safe step: Confirm whether this is a harmless reference. Move real secrets to secret storage and keep only names/placeholders in source. |
| Review | src/config.js:1 matched OPENAI_API_KEY |
| Review | src/config.js:2 matched SUPABASE_SERVICE_ROLE_KEY |
| Review | src/config.js:3 matched bearer |
| Review | No production deploy was executed |

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
Review warnings, then rerun opstruth or the specific command after addressing them.
