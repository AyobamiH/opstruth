# opstruth Evidence Pack

## Status
Partial pass

## Operator Summary
This evidence pack separates verified facts from unverified claims. opstruth is read-only and does not prove production state unless route or runtime checks were explicitly configured.

## Scope
- Phase: local proof run
- Working directory: /tmp/opstruth-fixture-runs-225931/supabase-cloudflare-app
- Git root: /tmp/opstruth-fixture-runs-225931/supabase-cloudflare-app

## Files Changed
- package.json
- src/
- supabase/
- wrangler.toml

## Commands Run
- git diff --check
- npm run typecheck

## Check Results
- pass: repo inspection
- pass: typescript project detection
- pass: secret reference scan
- pass: git diff --check
- pass: package script typecheck
- warn: supabase static audit
- pass: cloudflare config inspection

## Verified Facts
- Project boundary: /tmp/opstruth-fixture-runs-225931/supabase-cloudflare-app
- Probe catalogue entries: 30
- Automatic safe probes selected: 11
- Current working directory inspected: /tmp/opstruth-fixture-runs-225931/supabase-cloudflare-app
- Git root checked: /tmp/opstruth-fixture-runs-225931/supabase-cloudflare-app
- Important repo files checked
- Project language detected: TypeScript
- Node module mode detected: ESM
- Package manager detected: npm
- Platforms detected: TypeScript, Node ESM, Cloudflare, Supabase
- TypeScript project detected via tsconfig, TypeScript dependency, .ts/.tsx source, or TS config files
- Project boundary scanned: /tmp/opstruth-fixture-runs-225931/supabase-cloudflare-app
- Source files scanned with redaction
- .env contents were not printed
- git diff --check executed
- package.json scripts inspected
- Existing quality scripts selected: typecheck
- Supabase migrations inspected: 1
- Frontend Supabase references inspected
- Cloudflare config detected: wrangler.toml
- +1 more

## Risks And Gaps
| Severity | Finding |
| --- | --- |
| Review | Protected table referenced from frontend: agent_jobs in src/supabaseClient.ts |
| Review | No production deploy was executed |
| Review | No database mutation was executed |
| Review | No OpenAI usage was monitored |
| Review | No publishing or job side effects were verified |
| Review | Live Supabase permissions were not checked |
| Review | No migrations were applied |
| Review | No Cloudflare deploy was executed |
| Review | Cloudflare dashboard state was not checked |
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
Review warnings, then rerun opstruth or the specific command after addressing them.
