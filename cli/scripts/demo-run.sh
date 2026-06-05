#!/usr/bin/env sh
set -eu

ROOT="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
REPO_ROOT="$(CDPATH= cd -- "$ROOT/.." && pwd)"
BIN="$ROOT/bin/opstruth.js"
OUT_DIR="$REPO_ROOT/evidence/fixture-runs"
TMP_ROOT="${TMPDIR:-/tmp}/opstruth-demo-run-$$"

mkdir -p "$OUT_DIR" "$TMP_ROOT"

echo "==> Welcome"
node "$BIN" welcome

echo
echo "==> Vite React fixture"
mkdir -p "$TMP_ROOT/vite-react-app"
cp -R "$ROOT/fixtures/vite-react-app/." "$TMP_ROOT/vite-react-app/"
git init "$TMP_ROOT/vite-react-app" >/dev/null 2>&1
(cd "$TMP_ROOT/vite-react-app" && node "$BIN" --out "$OUT_DIR/demo-vite-react-app.md")

echo
echo "==> Risky secret fixture"
mkdir -p "$TMP_ROOT/risky-secret-app"
cp -R "$ROOT/fixtures/risky-secret-app/." "$TMP_ROOT/risky-secret-app/"
git init "$TMP_ROOT/risky-secret-app" >/dev/null 2>&1
(cd "$TMP_ROOT/risky-secret-app" && node "$BIN" secrets --out "$OUT_DIR/demo-risky-secret-app.md")

echo
echo "Evidence files:"
echo "- $OUT_DIR/demo-vite-react-app.md"
echo "- $OUT_DIR/demo-risky-secret-app.md"
