# opstruth Evidence Pack

## STATUS
warn

## SCOPE
- Phase: local proof run
- Working directory: /home/johnh/opstruth
- Git root: /home/johnh/opstruth

## FILES_CHANGED
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

## COMMANDS_RUN
- git diff --check
- npm run typecheck
- npm run lint
- npm run test
- npm run build
- npm run ci

## CHECKS
- pass: repo inspection
- warn: secret reference scan
- pass: git diff --check
- pass: package script typecheck
- pass: package script lint
- pass: package script test
- pass: package script build
- pass: package script ci

## LIVE_VERIFICATION
- Current working directory inspected: /home/johnh/opstruth
- Git root checked: /home/johnh/opstruth
- Package manager detected: npm
- Important repo files checked
- Source files scanned with redaction
- .env contents were not printed
- git diff --check executed
- Available quality scripts detected
- No deploy, database mutation, OpenAI, publishing, or service restart commands were run by opstruth

## SAFETY_BOUNDARIES
- Read-only checks only
- No deploy commands run by opstruth
- No database mutation commands run by opstruth
- No OpenAI calls run by opstruth
- No secrets printed by opstruth

## JOBS_TRIGGERED
Not verified unless evidence provided

## OPENAI_CALLS_RUN
Not verified unless evidence provided

## PUBLISHING_CHANGED
Not verified unless evidence provided

## DEPLOYS_RUN
No deploy command run by opstruth

## DATABASE_MUTATIONS
No database mutation command run by opstruth

## RISKS_REMAINING
- src/lib/redact.js:2 matched OPENAI_API_KEY
- src/lib/redact.js:3 matched SUPABASE_SERVICE_ROLE_KEY
- src/lib/redact.js:4 matched service_role
- src/lib/redact.js:5 matched access_token
- src/lib/redact.js:6 matched refresh_token
- src/lib/redact.js:7 matched client_secret
- src/lib/redact.js:8 matched private_key
- src/lib/redact.js:9 matched webhook_secret
- src/lib/redact.js:10 matched api_key
- src/lib/redact.js:11 matched authorization
- src/lib/redact.js:12 matched bearer
- src/lib/scan.js:6 matched OPENAI_API_KEY
- No production deploy was executed
- No database mutation was executed
- No OpenAI usage was monitored
- No publishing/job side effects were verified
- supabase was not verified
- cloudflare was not verified
- routes was not verified
- local was not verified

## NEXT_SAFE_STEP
Review warnings, then run the narrowest skipped check with explicit read-only inputs.
