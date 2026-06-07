#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPLETION_JSON="${OPSTRUTH_COMPLETION_JSON:-/tmp/opstruth-completion.json}"
export NPM_CONFIG_CACHE="${NPM_CONFIG_CACHE:-/tmp/opstruth-npm-cache}"
export npm_config_package_lock="${npm_config_package_lock:-false}"

mkdir -p "$NPM_CONFIG_CACHE"
cd "$REPO_ROOT"

echo "== opstruth completion gate =="

echo "== repo state =="
git status --short
git branch --show-current
git log --oneline -5

echo "== website checks =="
cd website
timeout 180s npm run build -- --configLoader runner
timeout 120s npm run lint || true
cd ..

echo "== root build =="
timeout 60s node scripts/sync-website-dist.js

echo "== cli checks =="
cd cli
timeout 120s npm run lint
timeout 120s npm test
timeout 60s node bin/opstruth.js repo
timeout 60s node bin/opstruth.js secrets
timeout 60s node bin/opstruth.js probes
timeout 60s node bin/opstruth.js probes --json > "$COMPLETION_JSON"
node -e "JSON.parse(require('fs').readFileSync(process.argv[1], 'utf8')); console.log('json output parsed')" "$COMPLETION_JSON"
cd ..

echo "== cloudflare dry run =="
timeout 300s npx wrangler deploy --dry-run

echo "== package metadata =="
timeout 30s npm view opstruth version description homepage repository bin --json || echo "warning: npm metadata unavailable"

echo "== production reachability =="
curl -I --max-time 30 https://opstruth.woeinvests.workers.dev || echo "warning: production reachability unavailable"

echo "== completion gate done =="
