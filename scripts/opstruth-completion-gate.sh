#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPLETION_JSON="${OPSTRUTH_COMPLETION_JSON:-/tmp/opstruth-completion.json}"
export OPSTRUTH_COMPLETION_JSON="$COMPLETION_JSON"
export NPM_CONFIG_CACHE="${NPM_CONFIG_CACHE:-/tmp/opstruth-npm-cache}"
export npm_config_package_lock="${npm_config_package_lock:-false}"

MODE="${OPSTRUTH_COMPLETION_MODE:-standard}"

while [ "$#" -gt 0 ]; do
  case "$1" in
    --mode)
      MODE="${2:-}"
      shift 2
      ;;
    --mode=*)
      MODE="${1#--mode=}"
      shift
      ;;
    -h|--help)
      cat <<'EOF'
Usage: ./scripts/opstruth-completion-gate.sh [--mode quick|standard|extended]

Environment overrides:
  OPSTRUTH_COMPLETION_MODE
  OPSTRUTH_CLI_TIMEOUT
  OPSTRUTH_TEST_TIMEOUT
  OPSTRUTH_SELF_TIMEOUT
  OPSTRUTH_WEBSITE_BUILD_TIMEOUT
  OPSTRUTH_ROOT_BUILD_TIMEOUT
  OPSTRUTH_WRANGLER_TIMEOUT
  OPSTRUTH_NETWORK_TIMEOUT
  OPSTRUTH_SKIP_ROOT_BUILD
EOF
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      exit 2
      ;;
  esac
done

case "$MODE" in
  quick)
    DEFAULT_CLI_TIMEOUT=120
    DEFAULT_TEST_TIMEOUT=120
    DEFAULT_SELF_TIMEOUT=120
    DEFAULT_WEBSITE_BUILD_TIMEOUT=120
    DEFAULT_ROOT_BUILD_TIMEOUT=120
    DEFAULT_WRANGLER_TIMEOUT=120
    DEFAULT_NETWORK_TIMEOUT=20
    DEFAULT_SKIP_WEBSITE_BUILD=1
    DEFAULT_SKIP_ROOT_BUILD=1
    DEFAULT_SKIP_WRANGLER=1
    ;;
  standard)
    DEFAULT_CLI_TIMEOUT=180
    DEFAULT_TEST_TIMEOUT=180
    DEFAULT_SELF_TIMEOUT=120
    DEFAULT_WEBSITE_BUILD_TIMEOUT=300
    DEFAULT_ROOT_BUILD_TIMEOUT=600
    DEFAULT_WRANGLER_TIMEOUT=300
    DEFAULT_NETWORK_TIMEOUT=30
    DEFAULT_SKIP_WEBSITE_BUILD=0
    DEFAULT_SKIP_ROOT_BUILD=0
    DEFAULT_SKIP_WRANGLER=0
    ;;
  extended)
    DEFAULT_CLI_TIMEOUT=300
    DEFAULT_TEST_TIMEOUT=300
    DEFAULT_SELF_TIMEOUT=180
    DEFAULT_WEBSITE_BUILD_TIMEOUT=900
    DEFAULT_ROOT_BUILD_TIMEOUT=1200
    DEFAULT_WRANGLER_TIMEOUT=600
    DEFAULT_NETWORK_TIMEOUT=45
    DEFAULT_SKIP_WEBSITE_BUILD=0
    DEFAULT_SKIP_ROOT_BUILD=0
    DEFAULT_SKIP_WRANGLER=0
    ;;
  *)
    echo "Unknown completion gate mode: $MODE" >&2
    echo "Use one of: quick, standard, extended" >&2
    exit 2
    ;;
esac

CLI_TIMEOUT="${OPSTRUTH_CLI_TIMEOUT:-$DEFAULT_CLI_TIMEOUT}"
TEST_TIMEOUT="${OPSTRUTH_TEST_TIMEOUT:-$DEFAULT_TEST_TIMEOUT}"
SELF_TIMEOUT="${OPSTRUTH_SELF_TIMEOUT:-$DEFAULT_SELF_TIMEOUT}"
WEBSITE_BUILD_TIMEOUT="${OPSTRUTH_WEBSITE_BUILD_TIMEOUT:-$DEFAULT_WEBSITE_BUILD_TIMEOUT}"
ROOT_BUILD_TIMEOUT="${OPSTRUTH_ROOT_BUILD_TIMEOUT:-$DEFAULT_ROOT_BUILD_TIMEOUT}"
WRANGLER_TIMEOUT="${OPSTRUTH_WRANGLER_TIMEOUT:-$DEFAULT_WRANGLER_TIMEOUT}"
NETWORK_TIMEOUT="${OPSTRUTH_NETWORK_TIMEOUT:-$DEFAULT_NETWORK_TIMEOUT}"
SKIP_ROOT_BUILD="${OPSTRUTH_SKIP_ROOT_BUILD:-$DEFAULT_SKIP_ROOT_BUILD}"
SKIP_WEBSITE_BUILD="$DEFAULT_SKIP_WEBSITE_BUILD"
SKIP_WRANGLER="$DEFAULT_SKIP_WRANGLER"

duration_arg() {
  case "$1" in
    *s|*m|*h) printf '%s\n' "$1" ;;
    *) printf '%ss\n' "$1" ;;
  esac
}

duration_seconds() {
  case "$1" in
    *s) printf '%s\n' "${1%s}" ;;
    *m) printf '%s\n' "$(( ${1%m} * 60 ))" ;;
    *h) printf '%s\n' "$(( ${1%h} * 3600 ))" ;;
    *) printf '%s\n' "$1" ;;
  esac
}

is_truthy() {
  case "${1:-}" in
    1|true|TRUE|yes|YES|on|ON) return 0 ;;
    *) return 1 ;;
  esac
}

suggested_rerun() {
  if [ "$MODE" = "extended" ]; then
    echo "OPSTRUTH_ROOT_BUILD_TIMEOUT=1200 ./scripts/opstruth-completion-gate.sh --mode extended"
  else
    echo "./scripts/opstruth-completion-gate.sh --mode extended"
  fi
}

mkdir -p "$NPM_CONFIG_CACHE"
cd "$REPO_ROOT"

run_required() {
  local name="$1"
  local timeout_value
  timeout_value="$(duration_arg "$2")"
  shift 2

  echo "== required: ${name} (${timeout_value} timeout, mode=${MODE}) =="
  set +e
  timeout "$timeout_value" "$@"
  local code=$?
  set -e

  if [ "$code" -eq 124 ]; then
    cat <<EOF
BLOCKED: required step timed out
step name: ${name}
timeout seconds: $(duration_seconds "$timeout_value")
mode: ${MODE}
required: yes
suggested rerun command: $(suggested_rerun)
EOF
    exit 124
  fi

  if [ "$code" -ne 0 ]; then
    echo "BLOCKED: required step failed: ${name} exited ${code} (mode=${MODE})"
    exit "$code"
  fi
}

run_optional() {
  local name="$1"
  local timeout_value
  timeout_value="$(duration_arg "$2")"
  shift 2

  echo "== optional: ${name} (${timeout_value} timeout, mode=${MODE}) =="
  set +e
  timeout "$timeout_value" "$@"
  local code=$?
  set -e

  if [ "$code" -eq 124 ]; then
    cat <<EOF
WARNING: optional step timed out
step name: ${name}
timeout seconds: $(duration_seconds "$timeout_value")
mode: ${MODE}
required: no
suggested rerun command: $(suggested_rerun)
EOF
    return 0
  fi

  if [ "$code" -ne 0 ]; then
    echo "WARNING: optional step failed: ${name} exited ${code} (mode=${MODE})"
    return 0
  fi
}

echo "== opstruth completion gate =="
echo "mode: $MODE"

echo "== repo state =="
git status --short
git branch --show-current
git log --oneline -5

run_required "CLI lint" "$CLI_TIMEOUT" bash -lc "cd cli && npm run lint"
run_required "CLI tests" "$TEST_TIMEOUT" bash -lc "cd cli && npm test"

run_required "opstruth repo self-check" "$SELF_TIMEOUT" bash -lc "cd cli && node bin/opstruth.js repo"
run_required "opstruth secrets self-check" "$SELF_TIMEOUT" bash -lc "cd cli && node bin/opstruth.js secrets"
run_required "opstruth probes self-check" "$SELF_TIMEOUT" bash -lc "cd cli && node bin/opstruth.js probes"
run_required "opstruth probes JSON output" "$SELF_TIMEOUT" bash -lc 'cd cli && node bin/opstruth.js probes --json > "$OPSTRUTH_COMPLETION_JSON"'
run_required "opstruth JSON parsing" "$SELF_TIMEOUT" node -e "JSON.parse(require('fs').readFileSync(process.argv[1], 'utf8')); console.log('json output parsed')" "$COMPLETION_JSON"

if is_truthy "$SKIP_WEBSITE_BUILD"; then
  echo "== skipped: website build (mode=${MODE}) =="
else
  run_required "website build" "$WEBSITE_BUILD_TIMEOUT" bash -lc "cd website && npm run build"
  run_optional "website lint" "$CLI_TIMEOUT" bash -lc "cd website && npm run lint"
fi

if is_truthy "$SKIP_ROOT_BUILD"; then
  echo "== skipped: root build (mode=${MODE}, OPSTRUTH_SKIP_ROOT_BUILD=${SKIP_ROOT_BUILD}) =="
else
  run_required "root build" "$ROOT_BUILD_TIMEOUT" npm run build
fi

if is_truthy "$SKIP_WRANGLER"; then
  echo "== skipped: wrangler dry-run (mode=${MODE}) =="
else
  run_required "wrangler dry-run" "$WRANGLER_TIMEOUT" npx wrangler deploy --dry-run
fi

NETWORK_SECONDS="$(duration_seconds "$(duration_arg "$NETWORK_TIMEOUT")")"
run_optional "npm metadata" "$NETWORK_TIMEOUT" npm view opstruth version description homepage repository bin --json
run_optional "production reachability" "$NETWORK_TIMEOUT" curl -I --max-time "$NETWORK_SECONDS" https://opstruth.woeinvests.workers.dev

echo "== completion gate done =="
