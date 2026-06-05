#!/usr/bin/env sh
set -eu

ROOT="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
BIN="$ROOT/bin/opstruth.js"
OUT_DIR="$ROOT/evidence/fixture-runs"
TMP_ROOT="${TMPDIR:-/tmp}/opstruth-fixture-runs-$$"

mkdir -p "$OUT_DIR" "$TMP_ROOT"

run_fixture() {
  name="$1"
  git_mode="$2"
  src="$ROOT/fixtures/$name"
  work="$TMP_ROOT/$name"
  mkdir -p "$work"
  cp -R "$src/." "$work/"
  if [ "$git_mode" = "git" ]; then
    git init "$work" >/dev/null 2>&1
  fi
  echo "==> $name"
  (cd "$work" && node "$BIN" --out "$OUT_DIR/$name.md") >/dev/null
  echo "    wrote $OUT_DIR/$name.md"
}

run_fixture "vite-react-app" "git"
run_fixture "next-app" "git"
run_fixture "supabase-cloudflare-app" "git"
run_fixture "plain-node-app" "git"
run_fixture "non-git-folder" "nogit"
run_fixture "risky-secret-app" "git"

echo
echo "Fixture evidence written to $OUT_DIR"
