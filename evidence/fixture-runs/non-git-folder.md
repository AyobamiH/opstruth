# opstruth Evidence Pack

## Status
Partial pass

## Operator Summary
This evidence pack separates verified facts from unverified claims. opstruth is read-only and does not prove production state unless route or runtime checks were explicitly configured.

## Scope
- Phase: local proof run
- Working directory: /tmp/opstruth-fixture-runs-225931/non-git-folder
- Git root: not a git repository

## Files Changed
- No changed files detected

## Commands Run
- No command evidence attached

## Check Results
- pass: repo inspection
- not_verified: typescript project detection
- pass: secret reference scan

## Verified Facts
- Project boundary: /tmp/opstruth-fixture-runs-225931/non-git-folder
- Probe catalogue entries: 30
- Automatic safe probes selected: 2
- Current working directory inspected: /tmp/opstruth-fixture-runs-225931/non-git-folder
- Git root checked: not a git repository
- Important repo files checked
- Project language detected: JavaScript
- Node module mode detected: not declared ESM
- Package manager detected: none
- Platforms detected: none
- Project boundary scanned: /tmp/opstruth-fixture-runs-225931/non-git-folder
- Source files scanned with redaction
- .env contents were not printed
- git diff --check skipped outside git repository
- package.json scripts inspected
- Existing quality scripts selected: none
- Safety boundary observed: no deploys, database mutations, OpenAI calls, publishing, queue triggers, restarts, or kills were run by opstruth

## Risks And Gaps
| Severity | Finding |
| --- | --- |
| Review | No git repository detected. opstruth is scanning the current directory with safety ignores. For best results, run inside a project repo. |
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
Review warnings, then rerun opstruth or the specific command after addressing them.
