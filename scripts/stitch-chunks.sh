#!/usr/bin/env bash
# stitch-chunks.sh — concatenate Hyperframes chunk MP4s into one final MP4
# with consistent encoding so concat never trips on mismatched params.
#
# Usage:
#   scripts/stitch-chunks.sh [CHUNK_DIR] [OUTPUT_FILE]
#
# Defaults:
#   CHUNK_DIR    = /tmp/hfrender/chunks
#   OUTPUT_FILE  = website/public/demo/opstruth-hyperframes-final.mp4
#
# Chunk naming convention (sorted lexicographically):
#   chunk-001.mp4, chunk-002.mp4, ...
#
# Strategy:
#   1. Re-encode every chunk to identical params (h264 yuv420p 1920x1080@30, AAC).
#      This guarantees the concat demuxer cannot fail on codec/timebase drift,
#      even if individual renders used different CRF / fps / pixel-format.
#   2. Build a concat list file and stream-copy the normalized chunks into
#      the final MP4 with +faststart for web playback.

set -euo pipefail

CHUNK_DIR="${1:-/tmp/hfrender/chunks}"
OUTPUT_FILE="${2:-website/public/demo/opstruth-hyperframes-final.mp4}"

# Target encoding (must match across all chunks for a clean concat)
WIDTH=1920
HEIGHT=1080
FPS=30
VCODEC=libx264
PIX_FMT=yuv420p
CRF=18
PRESET=slow
ACODEC=aac
ABITRATE=192k
ASR=48000

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "error: ffmpeg not found in PATH" >&2
  exit 1
fi

if [[ ! -d "$CHUNK_DIR" ]]; then
  echo "error: chunk directory not found: $CHUNK_DIR" >&2
  exit 1
fi

shopt -s nullglob
chunks=( "$CHUNK_DIR"/chunk-*.mp4 )
shopt -u nullglob

if (( ${#chunks[@]} == 0 )); then
  echo "error: no chunk-*.mp4 files in $CHUNK_DIR" >&2
  exit 1
fi

# Sort lexicographically (chunk-001, chunk-002, ...)
IFS=$'\n' chunks=( $(printf '%s\n' "${chunks[@]}" | sort) )
unset IFS

WORK_DIR="$(mktemp -d -t hfstitch-XXXXXX)"
trap 'rm -rf "$WORK_DIR"' EXIT

echo "→ Found ${#chunks[@]} chunk(s) in $CHUNK_DIR"
echo "→ Normalizing chunks in $WORK_DIR"

list_file="$WORK_DIR/concat.txt"
: > "$list_file"

i=0
for src in "${chunks[@]}"; do
  i=$((i+1))
  out="$WORK_DIR/$(printf 'norm-%04d.mp4' "$i")"
  echo "   [$i/${#chunks[@]}] $(basename "$src") → $(basename "$out")"

  # Detect whether the chunk has an audio stream; if not, inject silent track
  # so every normalized chunk has identical stream layout.
  has_audio=$(ffprobe -v error -select_streams a -show_entries stream=index \
    -of csv=p=0 "$src" | head -n1 || true)

  if [[ -n "$has_audio" ]]; then
    ffmpeg -hide_banner -loglevel error -y \
      -i "$src" \
      -vf "scale=${WIDTH}:${HEIGHT}:force_original_aspect_ratio=decrease,pad=${WIDTH}:${HEIGHT}:(ow-iw)/2:(oh-ih)/2,fps=${FPS},format=${PIX_FMT}" \
      -c:v "$VCODEC" -preset "$PRESET" -crf "$CRF" \
      -c:a "$ACODEC" -b:a "$ABITRATE" -ar "$ASR" -ac 2 \
      -movflags +faststart \
      "$out"
  else
    ffmpeg -hide_banner -loglevel error -y \
      -i "$src" \
      -f lavfi -i "anullsrc=channel_layout=stereo:sample_rate=${ASR}" \
      -shortest \
      -vf "scale=${WIDTH}:${HEIGHT}:force_original_aspect_ratio=decrease,pad=${WIDTH}:${HEIGHT}:(ow-iw)/2:(oh-ih)/2,fps=${FPS},format=${PIX_FMT}" \
      -c:v "$VCODEC" -preset "$PRESET" -crf "$CRF" \
      -c:a "$ACODEC" -b:a "$ABITRATE" -ar "$ASR" -ac 2 \
      -movflags +faststart \
      "$out"
  fi

  printf "file '%s'\n" "$out" >> "$list_file"
done

mkdir -p "$(dirname "$OUTPUT_FILE")"

echo "→ Concatenating into $OUTPUT_FILE"
ffmpeg -hide_banner -loglevel error -y \
  -f concat -safe 0 -i "$list_file" \
  -c copy -movflags +faststart \
  "$OUTPUT_FILE"

size=$(du -h "$OUTPUT_FILE" | cut -f1)
dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUTPUT_FILE")
echo "✓ Done: $OUTPUT_FILE  ($size, ${dur}s)"
