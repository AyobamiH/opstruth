#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPLETION_JSON="${OPSTRUTH_COMPLETION_JSON:-/tmp/opstruth-completion.json}"
export OPSTRUTH_COMPLETION_JSON="$COMPLETION_JSON"
export NPM_CONFIG_CACHE="${NPM_CONFIG_CACHE:-/tmp/opstruth-npm-cache}"
export npm_config_package_lock="${npm_config_package_lock:-false}"

mkdir -p "$NPM_CONFIG_CACHE"
cd "$REPO_ROOT"

run_required() {
  local name="$1"
  local seconds="$2"
  shift 2

  echo "== required: ${name} (${seconds} timeout) =="
  set +e
  timeout "$seconds" "$@"
  local code=$?
  set -e

  if [ "$code" -eq 124 ]; then
    echo "BLOCKED: required step timed out: ${name} after ${seconds}"
    exit 124
  fi

  if [ "$code" -ne 0 ]; then
    echo "BLOCKED: required step failed: ${name} exited ${code}"
    exit "$code"
  fi
}

run_optional() {
  local name="$1"
  local seconds="$2"
  shift 2

  echo "== optional: ${name} (${seconds} timeout) =="
  set +e
  timeout "$seconds" "$@"
  local code=$?
  set -e

  if [ "$code" -eq 124 ]; then
    echo "WARNING: optional step timed out: ${name} after ${seconds}"
    return 0
  fi

  if [ "$code" -ne 0 ]; then
    echo "WARNING: optional step failed: ${name} exited ${code}"
    return 0
  fi
}

echo "== opstruth completion gate =="

echo "== repo state =="
git status --short
git branch --show-current
git log --oneline -5

run_required "CLI lint" 180s bash -lc "cd cli && npm run lint"
run_required "CLI tests" 180s bash -lc "cd cli && npm test"

run_required "opstruth repo self-check" 120s bash -lc "cd cli && node bin/opstruth.js repo"
run_required "opstruth secrets self-check" 120s bash -lc "cd cli && node bin/opstruth.js secrets"
run_required "opstruth probes self-check" 120s bash -lc "cd cli && node bin/opstruth.js probes"
run_required "opstruth probes JSON output" 120s bash -lc 'cd cli && node bin/opstruth.js probes --json > "$OPSTRUTH_COMPLETION_JSON"'
run_required "opstruth JSON parsing" 120s node -e "JSON.parse(require('fs').readFileSync(process.argv[1], 'utf8')); console.log('json output parsed')" "$COMPLETION_JSON"

run_required "website build" 300s bash -lc "cd website && npm run build"
run_optional "website lint" 180s bash -lc "cd website && npm run lint"

run_required "root build" 300s npm run build
run_required "wrangler dry-run" 300s npx wrangler deploy --dry-run

run_optional "npm metadata" 30s npm view opstruth version description homepage repository bin --json
run_optional "production reachability" 30s curl -I --max-time 30 https://opstruth.woeinvests.workers.dev

echo "== completion gate done =="
