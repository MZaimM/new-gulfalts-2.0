#!/usr/bin/env bash
# Builds the V3 media set from the production sources in ../video concept and ../Website Material.
#
#   H01 Intro              no video: it sits on H02's first frame (its poster)
#   H02 Dubai arrival      video concept/homepage/gulfalts-new-intro.mp4 → scrub, v03 (the Gulf → Dubai coast)
#   H11 Our approach       video concept/DCP/DCP-Video.mp4           → scrub, v01 (+ reduced-motion stills)
#   DCP Built for all      video concept/DCP/dcp-built-for-all.mp4    → scrub, v01 (venue page, our-approach)
#   DCP Final tour         video concept/DCP/dcp-final-tour.mp4       → scrub, v01 (venue page, tour)
#   DFD Approach           video concept/DFD/dfd-approach.mp4         → scrub, v01 (venue page, our-approach)
#   DFD Tour               video concept/DFD/tour/tour-01..04.mp4     → joined, sped up → scrub, v01 (venue page, tour)
#   H13 Our destinations   video concept/homepage/gulfalts-outro.mp4 → scrub, v02, played in reverse (pull-out)
#   DFD page (dfd-page)   video concept/DFD/Video 1–4.mp4            → scrub, dfd-arrival + dfd-transformation v01
#   Images (H03, H05, H08) → scripts/build-images.mjs (AVIF + JPEG, responsive widths)
#
# Scrub encodes are 1080p (desktop) and a native 608x1080 crop (mobile), H.264 with a short
# closed GOP (1 s, no B-frames) after a light denoise that strips render grain: sharp at
# full-screen size and a fraction of the weight of all-intra, while any seek decodes at most
# one second of video. (AV1/HEVC were tested and came out larger on this footage.)
#
# Usage: npm run media            (from the v3 folder, needs ffmpeg)
#        npm run media -- h02 h13 only rebuild those chapters (h02, h11, dcp, dfd, dfd-page, h13, v2, images)
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
  log "H02 Dubai arrival (homepage intro: the Gulf → Dubai coast)"
  # 1920x1080 at its native 30 fps (426 frames, 14.2 s). The mobile crop sits right of centre,
  # on the UAE coast early on and Downtown Dubai at the end.
  scrub "$SRC/homepage/gulfalts-new-intro.mp4" h02-dubai-arrival v03 0.6 29 1.5:1.5:4:4
fi

if want h11; then
  log "H11 Our approach (DCP)"
  DCP="$SRC/DCP/DCP-Video.mp4"
  scrub "$DCP" h11-raw-to-destination v01 0.5 32 2:2:6:6
  frames "$DCP" h11-raw-to-destination 0.5 10.5 12.4 15.2 19.5 28.6
fi

if want dcp; then
  log "DCP venue: Built for all (our-approach section)"
  # 1920x1080 at 24 fps (12.05 s). Same settings as H11, which is the same kind of footage.
  scrub "$SRC/DCP/dcp-built-for-all.mp4" dcp-built-for-all v01 0.5 32 2:2:6:6
  log "DCP venue: Final tour (tour section)"
  # 1920x1080 at 24 fps (12.05 s).
  scrub "$SRC/DCP/dcp-final-tour.mp4" dcp-final-tour v01 0.5 32 2:2:6:6
fi

if want dfd; then
  log "DFD venue: Approach (our-approach section)"
  # 1920x1080 at 24 fps (8.08 s). Same settings as the DCP venue footage.
  scrub "$SRC/DFD/dfd-approach.mp4" dfd-approach v01 0.5 32 2:2:6:6

  log "DFD venue: Tour (tour section, four clips joined)"
  # The clips play straight on from each other. Clip 1 is 30 fps H.264, the others 24 fps HEVC
  # 10-bit, so each segment is trimmed, retimed and brought to 1920x1080 / 24 fps / 8-bit before
  # joining into a near-lossless master, which is then encoded like the other scrub footage.
  # Segments: "clip start end speed" (end "-" = to the clip's end). Clip 1's flight in and clip 3
  # are sped up on request; clip 1 drops back to 1x at 10.5 s, where the dojo shows in the windows.
  TOUR="$SRC/DFD/tour"
  TOUR_SEGMENTS=("1 0 10.5 2" "1 10.5 - 1" "2 0 - 1" "3 0 - 1.5" "4 0 - 1")
  inputs=() graph="" joins="" n=0
  for i in 1 2 3 4; do inputs+=(-i "$TOUR/tour-0$i.mp4"); done
  for segment in "${TOUR_SEGMENTS[@]}"; do
    read -r clip start end speed <<< "$segment"
    trim="start=$start"
    [ "$end" != "-" ] && trim+=":end=$end"
    graph+="[$((clip - 1)):v]trim=$trim,setpts=(PTS-STARTPTS)/$speed,fps=24,scale=1920:1080:flags=lanczos,format=yuv420p,setsar=1[v$n];"
    joins+="[v$n]"
    n=$((n + 1))
  done
  ffmpeg -v error -y "${inputs[@]}" -filter_complex "${graph}${joins}concat=n=$n:v=1:a=0[out]" -map "[out]" \
    -an -c:v libx264 -preset slow -crf 12 -pix_fmt yuv420p "$TOUR/dfd-tour-master.mp4"
  scrub "$TOUR/dfd-tour-master.mp4" dfd-tour v02 0.5 32 2:2:6:6
fi

if want h13; then
  log "H13 Our destinations (homepage outro, reversed at runtime)"
  # Frames 0–141 only: the last 0.7 s is a still drone hold that would stall the start of the
  # pull-out. The first frame (the Dubai map) is the hold frame the markers are placed on.
  scrub "$SRC/homepage/gulfalts-outro.mp4" h13-dubai-pull-out v02 0.56 29 1.5:1.5:4:4 5.875
fi

if want dfd-page; then
  log "Fintech District page: arrival (Video 1) and transformation (Videos 4 → 3 → 2)"
  DFD="$SRC/DFD"
  # Arrival: space → Sheikh Zayed Road → Al Quoz → the DFD warehouse → the studio inside (30 fps).
  scrub "$DFD/Video 1.mp4" dfd-arrival v01 0.5 29 1.5:1.5:4:4
  # Transformation: three exterior → raw interior → fitted-out sequences (café, studio, workspace),
  # joined with 0.5 s dissolves into one 25.1 s master so a single video scrubs the whole chapter.
  MASTER="$(mktemp -d)/dfd-transformation.mp4"
  ffmpeg -v error -y -i "$DFD/Video 4.mp4" -i "$DFD/Video 3.mp4" -i "$DFD/Video 2.mp4" -filter_complex \
    "[0:v]fps=24,format=yuv420p,settb=AVTB[a];[1:v]fps=24,format=yuv420p,settb=AVTB[b];[2:v]fps=24,format=yuv420p,settb=AVTB[c];\
[a][b]xfade=transition=fade:duration=0.5:offset=7.5417[ab];[ab][c]xfade=transition=fade:duration=0.5:offset=17.0834[v]" \
    -map "[v]" -an -c:v libx264 -preset fast -crf 12 -pix_fmt yuv420p "$MASTER"
  scrub "$MASTER" dfd-transformation v01 0.5 30 1.5:1.5:4:4
  frames "$MASTER" dfd-transformation 1 3.6 6.8 13.5 23.5
  rm -f "$MASTER"
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
