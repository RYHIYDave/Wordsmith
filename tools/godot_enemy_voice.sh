#!/usr/bin/env bash
# AN ENEMY FAMILY'S VOICE FROM ITS TAKES (the Godot game, godot/assets/sound/<family>_<aggro|hurt|death>_<n>.mp3).
# Usage: tools/godot_enemy_voice.sh <takes dir> <family>
#   <takes dir> holds aggro_1.mp3, aggro_2.mp3, hurt_1.mp3, ... as ElevenLabs made them. Each is trimmed of its silences; a
#   hurt keeps only its first sound (the grunt, as a hurt on a big hit is short), a shout whole (its word with it, to 2.3 s) and a death cry its
#   first 1.8 s, the last 60 ms faded; then brought to the other families' loudness (about -18 dB mean) and written as they
#   are (mp3, 48 kHz, mono, 128 kbps).
set -euo pipefail
src="$1"; fam="$2"
out="$(cd "$(dirname "$0")/.." && pwd)/godot/assets/sound"
for f in "$src"/*_[0-9].mp3; do
  b=$(basename "$f" .mp3); kind=${b%_*}; n=${b##*_}
  case "$kind" in hurt) most=0.75;; aggro) most=2.3;; death) most=1.8;; *) continue;; esac
  tmp=$(mktemp --suffix=.wav)
  # (its silences off, front and back)
  ffmpeg -v error -y -i "$f" -af "silenceremove=start_periods=1:start_threshold=-40dB,areverse,silenceremove=start_periods=1:start_threshold=-40dB,areverse,highpass=f=70" -ac 1 -ar 48000 "$tmp"
  len=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$tmp")
  if [ "$kind" = hurt ]; then
    # (its first sound alone: up to its first gap of 0.1 s)
    cut=$(ffmpeg -hide_banner -i "$tmp" -af silencedetect=n=-40dB:d=0.1 -f null - 2>&1 | grep -oE "silence_start: [0-9.]+" | head -1 | awk '{print $2}')
    [ -n "$cut" ] && len=$cut
  fi
  keep=$(python3 -c "print(min($len, $most))")
  mean=$(ffmpeg -hide_banner -i "$tmp" -af "atrim=0:$keep,volumedetect" -f null - 2>&1 | grep -oE "mean_volume: [-0-9.]+" | awk '{print $2}')
  gain=$(python3 -c "print(round(-18.0 - ($mean), 2))")
  ffmpeg -v error -y -i "$tmp" -af "atrim=0:$keep,afade=t=out:st=$(python3 -c "print(max(0, $keep - 0.06))"):d=0.06,volume=${gain}dB,alimiter=limit=0.89" \
    -ac 1 -ar 48000 -b:a 128k "$out/${fam}_${kind}_${n}.mp3"
  rm -f "$tmp"
  echo "${fam}_${kind}_${n}.mp3  $(ffprobe -v error -show_entries format=duration -of csv=p=0 "$out/${fam}_${kind}_${n}.mp3") s  gain ${gain} dB"
done
