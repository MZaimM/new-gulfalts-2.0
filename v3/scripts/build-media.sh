#!/usr/bin/env bash
# Builds the V3 media set from the production sources in ../video concept and ../Website Material.
#
#   H02 Dubai arrival      video concept/DFD/scene1&2.mp4   → scrub, v01
#   H11 Our approach       video concept/DCP/DCP-Video.mp4  → scrub, v01 (+ reduced-motion stills)
#   H13 Our destinations   video concept/DFD/Scene-2.mp4    → scrub, v01, played in reverse (pull-out)
#   Images (H03, H05, H08) → scripts/build-images.mjs (AVIF + JPEG, responsive widths)
#
# Scrub encodes are 1080p (desktop) and a native 608x1080 crop (mobile), H.264 with a short
# closed GOP (1 s, no B-frames) after a light denoise that strips render grain: sharp at
# full-screen size and a fraction of the weight of all-intra, while any seek decodes at most
# one second of video. (AV1/HEVC were tested and came out larger on this footage.)
#
# Usage: npm run media   (from the v3 folder, needs ffmpeg)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/../video concept"
V2="$ROOT/../v2/public/media"
OUT_VIDEO="$ROOT/public/media/video"
OUT_POSTER="$ROOT/public/media/posters"
OUT_IMAGE="$ROOT/public/media/images"
mkdir -p "$OUT_VIDEO" "$OUT_POSTER" "$OUT_IMAGE"

log() { printf '\n\033[1m%s\033[0m\n' "$*"; }

GOP=30
x264() {
  echo -an -c:v libx264 -preset slower -profile:v high -pix_fmt yuv420p -crf "$1" \
    -g $GOP -keyint_min $GOP -sc_threshold 0 -bf 0 -refs 1 -x264-params aq-mode=3 -movflags +faststart
}

# scrub <master> <name> <mobile crop x as a fraction of the frame width> <crf> <denoise> [end seconds]
# The poster is always the first source frame: for a reversed chapter (H13) that is the frame
# the pull-out lands on, so the reduced-motion view shows the same picture as the hold.
scrub() {
  local master="$1" name="$2" focus="$3" crf="$4" denoise="$5" end="${6:-}"
  local mobile="crop=608:1080:'min(iw-608,max(0,iw*$focus-304))':0"
  local base="scale=1920:1080:flags=lanczos,hqdn3d=$denoise"
  local trim=()
  [ -n "$end" ] && trim=(-t "$end")
  # shellcheck disable=SC2046
  ffmpeg -v error -y -i "$master" ${trim[@]+"${trim[@]}"} -vf "$base" $(x264 "$crf") "$OUT_VIDEO/gulfalts-$name-desktop-v01.mp4"
  # shellcheck disable=SC2046
  ffmpeg -v error -y -i "$master" ${trim[@]+"${trim[@]}"} -vf "$base,$mobile" $(x264 "$crf") "$OUT_VIDEO/gulfalts-$name-mobile-v01.mp4"
  ffmpeg -v error -y -i "$master" -frames:v 1 -vf "scale=1920:1080:flags=lanczos" -pix_fmt yuvj420p -q:v 4 "$OUT_POSTER/gulfalts-$name-poster-desktop-v01.jpg"
  ffmpeg -v error -y -i "$master" -frames:v 1 -vf "scale=1920:1080:flags=lanczos,$mobile" -pix_fmt yuvj420p -q:v 4 "$OUT_POSTER/gulfalts-$name-poster-mobile-v01.jpg"
}

# frames <master> <name> <t1> <t2> ...  stills for the reduced-motion sequence
frames() {
  local master="$1" name="$2" n=1; shift 2
  for t in "$@"; do
    ffmpeg -v error -y -ss "$t" -i "$master" -frames:v 1 -vf "scale=1280:720:flags=lanczos" -pix_fmt yuvj420p -q:v 4 \
      "$OUT_IMAGE/gulfalts-$name-frame-$(printf '%02d' $n)-v01.jpg"
    n=$((n + 1))
  done
}

log "H02 Dubai arrival (DFD scene 1 & 2)"
scrub "$SRC/DFD/scene1&2.mp4" h02-dubai-arrival 0.45 30 1.5:1.5:4:4

log "H11 Our approach (DCP)"
DCP="$SRC/DCP/DCP-Video.mp4"
scrub "$DCP" h11-raw-to-destination 0.5 32 2:2:6:6
frames "$DCP" h11-raw-to-destination 0.5 10.5 12.4 15.2 19.5 28.6

log "H13 Our destinations (DFD scene 2, reversed at runtime)"
# Only the first 7.7 s: the static drone hold at the end would stall the start of the pull-out.
scrub "$SRC/DFD/Scene-2.mp4" h13-dubai-pull-out 0.52 30 1.5:1.5:4:4 7.7

log "Carry over from V2: H01 reveal, H04 manifesto, logos"
for file in \
  video/gulfalts-h01-brand-reveal-desktop-v00.mp4 video/gulfalts-h01-brand-reveal-mobile-v00.mp4 \
  posters/gulfalts-h01-brand-reveal-poster-desktop-v00.jpg posters/gulfalts-h01-brand-reveal-poster-mobile-v00.jpg \
  video/gulfalts-h04-brand-manifesto-desktop-v00.mp4 video/gulfalts-h04-brand-manifesto-mobile-v00.mp4 \
  posters/gulfalts-h04-brand-manifesto-poster-desktop-v00.jpg posters/gulfalts-h04-brand-manifesto-poster-mobile-v00.jpg \
  images/logo-dark.svg images/logo-light.svg images/gulfalts-wordmark-white.svg images/creative-interior.jpg; do
  mkdir -p "$(dirname "$ROOT/public/media/$file")"
  cp "$V2/$file" "$ROOT/public/media/$file"
done

log "Images"
[ "${SKIP_IMAGES:-}" = 1 ] || node "$ROOT/scripts/build-images.mjs"

log "Done"
du -sh "$OUT_VIDEO"/* "$OUT_IMAGE" | sort -k2
