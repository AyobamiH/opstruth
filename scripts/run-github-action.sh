#!/usr/bin/env bash
set -euo pipefail

: "${GITHUB_ACTION_PATH:?GITHUB_ACTION_PATH is required}"
: "${GITHUB_WORKSPACE:?GITHUB_WORKSPACE is required}"
: "${GITHUB_OUTPUT:?GITHUB_OUTPUT is required}"

if [[ -z "${OPSTRUTH_ACTION_OUTPUT_PATH:-}" ||
      "$OPSTRUTH_ACTION_OUTPUT_PATH" == /* ||
      "$OPSTRUTH_ACTION_OUTPUT_PATH" == *$'\n'* ||
      "$OPSTRUTH_ACTION_OUTPUT_PATH" == *$'\r'* ]]; then
  echo "output_path must be a non-empty repository-relative path" >&2
  exit 2
fi

IFS='/' read -r -a output_segments <<< "$OPSTRUTH_ACTION_OUTPUT_PATH"
for segment in "${output_segments[@]}"; do
  if [[ "$segment" == ".." ]]; then
    echo "output_path must not escape the repository workspace" >&2
    exit 2
  fi
done

args=(--out "$OPSTRUTH_ACTION_OUTPUT_PATH" --no-color)

if [[ "${OPSTRUTH_ACTION_STRICT:-false}" == "true" ]]; then
  args+=(--strict)
elif [[ "${OPSTRUTH_ACTION_STRICT:-false}" != "false" ]]; then
  echo "strict must be 'true' or 'false'" >&2
  exit 2
fi

if [[ -n "${OPSTRUTH_ACTION_BASE_URL:-}" ]]; then
  if [[ "$OPSTRUTH_ACTION_BASE_URL" != https://* ||
        "$OPSTRUTH_ACTION_BASE_URL" == *$'\n'* ||
        "$OPSTRUTH_ACTION_BASE_URL" == *$'\r'* ]]; then
    echo "base_url must be an HTTPS URL on one line" >&2
    exit 2
  fi
  args+=(--base-url "$OPSTRUTH_ACTION_BASE_URL")
fi

cd "$GITHUB_WORKSPACE"
node "$GITHUB_ACTION_PATH/cli/bin/opstruth.js" "${args[@]}"
printf 'report_path=%s\n' "$OPSTRUTH_ACTION_OUTPUT_PATH" >> "$GITHUB_OUTPUT"
