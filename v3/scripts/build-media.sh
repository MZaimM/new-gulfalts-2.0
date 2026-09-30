#!/usr/bin/env bash
# Builds the V3 media set from the production sources in ../video concept and ../Website Material.
#
#   H01 Intro              no video: it sits on H02's first frame (its poster)
#   H02 Dubai arrival      video concept/homepage/gulfalts-intro.mp4 → scrub, v02 (clouds → Gulf → Dubai)
#   H11 Our approach       video concept/DCP/DCP-Video.mp4           → scrub, v01 (+ reduced-motion stills)
#   H13 Our destinations   video concept/homepage/gulfalts-outro.mp4 → scrub, v02, played in reverse (pull-out)
#   Images (H03, H05, H08) → scripts/build-images.mjs (AVIF + JPEG, responsive widths)
#
# Scrub encodes are 1080p (desktop) and a native 608x1080 crop (mobile), H.264 with a short
# closed GOP (1 s, no B-frames) after a light denoise that strips render grain: sharp at
# full-screen size and a fraction of the weight of all-intra, while any seek decodes at most
# one second of video. (AV1/HEVC were tested and came out larger on this footage.)
#
# Usage: npm run media            (from the v3 folder, needs ffmpeg)
#        npm run media -- h02 h13 only rebuild those chapters (h02, h11, h13, v2, images)
#
# A re-encode that changes the picture gets a new version suffix: /media is cached for a week.
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

want() { [ -z "$ONLY" ] || [[ " $ONLY " == *" $1 "* ]]; }
ONLY="$*"

# scrub <master> <name> <version> <mobile crop x as a fraction of the frame width> <crf> <denoise> [end seconds]
# The poster is always the first source frame: for a reversed chapter (H13) that is the frame
# the pull-out lands on, so the reduced-motion view shows the same picture as the hold.
scrub() {
  local master="$1" name="$2" version="$3" focus="$4" crf="$5" denoise="$6" end="${7:-}"
  local mobile="crop=608:1080:'min(iw-608,max(0,iw*$focus-304))':0"
  local base="scale=1920:1080:flags=lanczos,hqdn3d=$denoise"
  local trim=()
  [ -n "$end" ] && trim=(-t "$end")
  # shellcheck disable=SC2046
  ffmpeg -v error -y -i "$master" ${trim[@]+"${trim[@]}"} -vf "$base" $(x264 "$crf") "$OUT_VIDEO/gulfalts-$name-desktop-$version.mp4"
  # shellcheck disable=SC2046
  ffmpeg -v error -y -i "$master" ${trim[@]+"${trim[@]}"} -vf "$base,$mobile" $(x264 "$crf") "$OUT_VIDEO/gulfalts-$name-mobile-$version.mp4"
  ffmpeg -v error -y -i "$master" -frames:v 1 -vf "scale=1920:1080:flags=lanczos" -pix_fmt yuvj420p -q:v 4 "$OUT_POSTER/gulfalts-$name-poster-desktop-$version.jpg"
  ffmpeg -v error -y -i "$master" -frames:v 1 -vf "scale=1920:1080:flags=lanczos,$mobile" -pix_fmt yuvj420p -q:v 4 "$OUT_POSTER/gulfalts-$name-poster-mobile-$version.jpg"
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

if want h02; then
  log "H02 Dubai arrival (homepage intro: clouds → Gulf → Dubai)"
  scrub "$SRC/homepage/gulfalts-intro.mp4" h02-dubai-arrival v02 0.5 29 1.5:1.5:4:4
fi

if want h11; then
  log "H11 Our approach (DCP)"
  DCP="$SRC/DCP/DCP-Video.mp4"
  scrub "$DCP" h11-raw-to-destination v01 0.5 32 2:2:6:6
  frames "$DCP" h11-raw-to-destination 0.5 10.5 12.4 15.2 19.5 28.6
fi

if want h13; then
  log "H13 Our destinations (homepage outro, reversed at runtime)"
  # Frames 0–141 only: the last 0.7 s is a still drone hold that would stall the start of the
  # pull-out. The first frame (the Dubai map) is the hold frame the markers are placed on.
  scrub "$SRC/homepage/gulfalts-outro.mp4" h13-dubai-pull-out v02 0.56 29 1.5:1.5:4:4 5.875
fi

if want v2; then
  log "Carry over from V2: H04 manifesto, logos"
  for file in \
    video/gulfalts-h04-brand-manifesto-desktop-v00.mp4 video/gulfalts-h04-brand-manifesto-mobile-v00.mp4 \
    posters/gulfalts-h04-brand-manifesto-poster-desktop-v00.jpg posters/gulfalts-h04-brand-manifesto-poster-mobile-v00.jpg \
    images/logo-dark.svg images/logo-light.svg images/gulfalts-wordmark-white.svg; do
    mkdir -p "$(dirname "$ROOT/public/media/$file")"
    cp "$V2/$file" "$ROOT/public/media/$file"
  done
fi

if want images && [ "${SKIP_IMAGES:-}" != 1 ]; then
  log "Images"
  node "$ROOT/scripts/build-images.mjs"
fi

log "Done"
du -sh "$OUT_VIDEO"/* "$OUT_IMAGE" | sort -k2
