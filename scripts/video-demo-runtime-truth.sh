#!/usr/bin/env sh
set -eu

PROMPT='advanced_pudding9228@web:~/project$'

say() {
  printf '%s\n' "$1"
}

cmd() {
  printf '\n%s %s\n' "$PROMPT" "$1"
}

pause() {
  sleep "${1:-0.15}"
}

say "opstruth runtime truth demo"
say "terminal identity: advanced_pudding9228@web"
pause

cmd "opstruth welcome"
cat <<'EOF'
Operational truth checks for AI-assisted engineering.

opstruth runs read-only checks to separate:
- what was verified
- what was not verified
- what looks risky
- what evidence supports the finding
- what the next safe step is
EOF
pause

cmd "opstruth probes"
cat <<'EOF'
Probe catalogue

Repo        read-only
Secrets     redacted scan
Routes      explicit base URL only
Runtime     explicit local port only
Supabase    static inspection
Cloudflare  static inspection
Evidence    markdown report
EOF
pause

cmd "opstruth"
cat <<'EOF'
STATUS: Partial pass

What Matters Most
- No failures
- Runtime proof gaps remain

Verified
- Repository inspected
- Secret scan completed with redaction
- Probe catalogue selected safe checks

Warnings
- Route checks skipped because no base URL was provided

Not Verified
- Production runtime was not checked
- Database mutation safety was not checked
- Publishing/job side effects were not checked

Overall Confidence
Good for local iteration. Some proof gaps remain before production confidence.

Next Safe Step
Run opstruth with --base-url before trusting production.
EOF
pause

cmd "opstruth secrets"
cat <<'EOF'
STATUS: Partial pass

Warning: Possible secret reference

Evidence
File: src/config.ts
Line: 12
Pattern: SUPABASE_SERVICE_ROLE_KEY
Preview: SUPABASE_SERVICE_ROLE_KEY=***REDACTED***

Why it matters
Service role keys must never be exposed to browser code.

Next Safe Step
Move real values into environment storage.
EOF
pause

cmd "opstruth routes --base-url https://example.com"
cat <<'EOF'
STATUS: Pass

Verified
- Routes checked with read-only HEAD/GET requests
- Response status, redirects, headers, and latency captured

Not Verified
- Route behavior behind authentication
- Database writes or queue side effects
EOF
pause

cmd "opstruth local --port 3000 --health /health"
cat <<'EOF'
STATUS: Pass

Verified
- Local port 3000 accepted a connection
- Health endpoint responded

What opstruth did not do
- It did not start, restart, or kill the service
EOF
pause

cmd "cat evidence/opstruth-report.md"
cat <<'EOF'
# opstruth Evidence Pack

STATUS: Pass

Verified
- Repository inspected
- Quality checks passed
- Routes responded
- Secrets scan completed with redaction

Overall Confidence
Strong local confidence for the checks performed.

Next Safe Step
Attach this evidence pack to the change or handoff.
EOF

say ""
say "AI coding tools are fast."
say "opstruth checks what is actually true afterward."
