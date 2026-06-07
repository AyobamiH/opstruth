#!/usr/bin/env bash
set -u

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CLI="$ROOT/cli/bin/opstruth.js"
FIXTURES="$ROOT/fixtures"
OUT="$ROOT/evidence/fixture-matrix"
TMP_ROOT="${TMPDIR:-/tmp}/opstruth-fixture-matrix"

mkdir -p "$OUT"
rm -rf "$TMP_ROOT"
mkdir -p "$TMP_ROOT"

run_cmd() {
  local fixture="$1"
  local workdir="$2"
  local label="$3"
  shift 3
  local logfile="$TMP_ROOT/$fixture.$label.txt"
  local status="pass"
  if ! (cd "$workdir" && "$@") >"$logfile" 2>&1; then
    status="fail"
  fi
  printf '%s\n' "$status"
}

for source in "$FIXTURES"/*; do
  [ -d "$source" ] || continue
  fixture="$(basename "$source")"
  workdir="$TMP_ROOT/$fixture"
  mkdir -p "$workdir"
  cp -R "$source"/. "$workdir"/

  if [ "$fixture" != "non-git-folder" ]; then
    git -C "$workdir" init >/dev/null 2>&1 || true
    git -C "$workdir" add . >/dev/null 2>&1 || true
    git -C "$workdir" commit -m "fixture baseline" >/dev/null 2>&1 || true
  fi

  repo_status="$(run_cmd "$fixture" "$workdir" repo node "$CLI" repo)"
  probes_status="$(run_cmd "$fixture" "$workdir" probes node "$CLI" probes)"
  secrets_status="$(run_cmd "$fixture" "$workdir" secrets node "$CLI" secrets)"
  quality_status="$(run_cmd "$fixture" "$workdir" quality node "$CLI" quality)"
  default_status="$(run_cmd "$fixture" "$workdir" default node "$CLI" --skip evidence)"
  json_status="$(run_cmd "$fixture" "$workdir" json node "$CLI" --json --skip evidence)"

  {
    printf '# Fixture Matrix: %s\n\n' "$fixture"
    printf 'Source fixture: `fixtures/%s`\n\n' "$fixture"
    printf 'Temporary copy: `%s`\n\n' "$workdir"
    printf 'No source fixture files were mutated.\n\n'
    printf '## Commands\n\n'
    printf '| Command | Status |\n'
    printf '| --- | --- |\n'
    printf '| `opstruth repo` | `%s` |\n' "$repo_status"
    printf '| `opstruth probes` | `%s` |\n' "$probes_status"
    printf '| `opstruth secrets` | `%s` |\n' "$secrets_status"
    printf '| `opstruth quality` | `%s` |\n' "$quality_status"
    printf '| `opstruth --skip evidence` | `%s` |\n' "$default_status"
    printf '| `opstruth --json --skip evidence` | `%s` |\n\n' "$json_status"
    printf '## Notes\n\n'
    if [ "$fixture" = "failing-real-test-script" ]; then
      printf '%s\n' '- Expected quality failure fixture. A failing test script should fail.'
    elif [ "$fixture" = "default-npm-placeholder-test" ]; then
      printf '%s\n' '- Expected placeholder-test fixture. The default npm placeholder test should be skipped, not failed.'
    elif [ "$fixture" = "risky-secret-app" ]; then
      printf '%s\n' '- Expected secret-warning fixture. Values are fake and should be redacted.'
    else
      printf '%s\n' "- Command excerpts are kept in temporary files under \`$TMP_ROOT\` during the run; only this summary is intended for commit."
    fi
  } >"$OUT/$fixture.md"
done

{
  printf '# opstruth Fixture Matrix\n\n'
  printf 'Generated from safe fixture copies under `%s`.\n\n' "$TMP_ROOT"
  printf '| Fixture | Evidence |\n'
  printf '| --- | --- |\n'
  for file in "$OUT"/*.md; do
    name="$(basename "$file" .md)"
    [ "$name" = "README" ] && continue
    printf '| `%s` | `%s` |\n' "$name" "evidence/fixture-matrix/$(basename "$file")"
  done
} >"$OUT/README.md"

echo "Fixture matrix written to $OUT"
