#!/bin/bash
# Fetches the three free instrument packs the band is played on. All three are CC0 1.0 (given to the
# public domain by their maker, Karoryfer Samples) and kept at github.com/sfzinstruments.
#
#   tools/sound/fetch_packs.sh <packs dir>
#
# About 1 GB comes down: the whole guitar and the whole bass, and of the drum kit only the hits that
# tools/sound/make_bank.py takes. Then make the bank:
#
#   python3 tools/sound/make_bank.py <packs dir> <bank dir>
#
# DRY=1 fetches only the lists of files, to see that the three can be reached.
set -eu
dir="${1:?usage: fetch_packs.sh <packs dir>}"
mkdir -p "$dir"
cd "$dir"
export GIT_TERMINAL_PROMPT=0

get() {
  if [ ! -d "$1/.git" ]; then
    git clone -q --depth 1 --filter=blob:none --no-checkout "https://github.com/sfzinstruments/$1" "$1"
  fi
  # (no housekeeping: on a clone without its files it would fetch them one by one)
  git -C "$1" config gc.auto 0
}
out() {
  if [ "${DRY:-0}" = 1 ]; then
    echo "   reached: $1 at $(git -C "$1" rev-parse --short HEAD), $(git -C "$1" ls-tree -r --name-only HEAD | wc -l) files listed"
  else
    git -C "$1" checkout -q "$2"
    echo "   $(find "$1" -iname '*.wav' -o -iname '*.flac' | wc -l) recordings, $(du -sh "$1" | cut -f1)"
  fi
}

echo "== the guitar (karoryfer.emilyguitar)"
get karoryfer.emilyguitar
out karoryfer.emilyguitar master

echo "== the bass (karoryfer.growlybass)"
get karoryfer.growlybass
out karoryfer.growlybass master

echo "== the drums, a part (karoryfer.big-rusty-drums)"
get karoryfer.big-rusty-drums
git -C karoryfer.big-rusty-drums sparse-checkout init --no-cone
cat > karoryfer.big-rusty-drums/.git/info/sparse-checkout <<'PAT'
/LICENSE
/*.pdf
/Samples/kick_24/kick/kick/
/Samples/kick_24/kick/oh/
/Samples/snare_14/center/
/Samples/snare_14/rimshot/
/Samples/snare_14/sidestick/
/Samples/hihat_14/tc/
/Samples/hihat_14/cl/
/Samples/hihat_14/open/
/Samples/hihat_14/ho/
/Samples/hihat_14/chik/
/Samples/ride_22/rd/
/Samples/ride_22/bl/
/Samples/crash_17/cr/
/Samples/crash_sizzle_17/cr/
/Samples/china_18/cn/
/Samples/tom_14/center/
/Samples/tom_15/center/
/Samples/tom_18/center/
/Samples/tom_22/center/
PAT
out karoryfer.big-rusty-drums main
echo "== done"
