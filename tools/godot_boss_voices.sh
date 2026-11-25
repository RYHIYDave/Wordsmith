#!/bin/bash
# THE GODOT PORT: THE BOSSES' CALLED LINES IN REAL VOICES (his word, 25 Nov 2026, after the Warped Wordsmith's: “Go ahead and do the
# voices for the other speaking bosses as well”; asked how many takes, “Two takes each (Recommended)”). Every line the thirteen
# talking bosses call out (assets/voices/voices.json, the game's BOSS_CALL_LINES) spoken by ElevenLabs (eleven_v4, a library voice
# for each boss, each line played its own way with the model's audio tags; the words said are the line's own), two takes of each;
# then here: the silence at either end trimmed, the boss's own touch, as loud as the bosses' roars, Vorbis:
#   tools/godot_boss_voices.sh <dir of the takes as <boss>_<n>_<1|2>.mp3> <sessions.txt>
#     -> godot/assets/voices/real/<boss>_<n>_<take>.ogg, and real/voices.json { boss: { line: [file, file] } }
#   (sessions.txt: a line a line, `boss|n|line|take1 take2`, the line as the game writes it)
# The voices: the Warden “Villain - harsh, abrasive, and volatile”; the Headsman “Silas - Weathered Villain”; the Chained One
# “Parasyte - Whispers from the Deep Dark”; the Amalgam “Lord Nyx - Deep, Demonic Villain”, and three of him at once, one lower and
# one higher (many bodies, one voice); the Fleshmancer “Ezekiel Wren – The Voice Beneath the Floorboards”; the Unfinished
# “Mossbeard | The God of the Wild”, a little lower, in a stone hall; the Cantor “Medraut - Theatrical Villain & Sardonic
# Sovereign”, under a cathedral's echo; the Drowned Eye “Parasyte - Dweller in the Deep-Dark”, as under water; the Rat King
# “Creature - Goblin Mythical Monster”; the Physician “Jerry B. - Dark Villain | Horror & Thriller”; the Prince “Victor - The
# Cunning Villain - Posh British Character”; the Glass Queen “Kristen – Cold Evil Queen Villain”, a glassy shimmer on her; the King
# “Desmond (UK) - Distinguished Persuasion”, played old and rasping.
set -e
SRC="$1"
SESSIONS="$2"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/godot/assets/voices/real"
mkdir -p "$OUT"
TRIM="silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.03,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.08,areverse"
LOUD="loudnorm=I=-16:TP=-1.5:LRA=11"
for f in "$SRC"/*_[0-9]_[12].mp3; do
  b=$(basename "$f" .mp3)
  boss=${b%%_*}
  case "$boss" in
    amalgam)
      ffmpeg -v error -y -i "$f" -filter_complex "[0:a]$TRIM,asplit=3[a][b][c];[b]asetrate=44100*0.82,aresample=44100,atempo=1.2195[lo];[c]asetrate=44100*1.12,aresample=44100,atempo=0.8929[hi];[a][lo][hi]amix=inputs=3:weights=1 0.7 0.45:normalize=0,apad=pad_dur=0.3,aecho=0.8:0.7:50:0.2,$LOUD" -ac 1 -ar 44100 -c:a libvorbis -q:a 4 "$OUT/$b.ogg"
      continue ;;
    eye) FX=",apad=pad_dur=0.4,lowpass=f=2200,flanger=delay=2:depth=3:speed=0.25,aecho=0.8:0.7:60|110:0.35|0.2" ;;
    unfinished) FX=",asetrate=44100*0.9,aresample=44100,atempo=1.1111,apad=pad_dur=0.4,aecho=0.8:0.75:90|170:0.3|0.18" ;;
    cantor) FX=",apad=pad_dur=0.6,aecho=0.8:0.85:120|260|420:0.4|0.28|0.18" ;;
    gqueen) FX=",apad=pad_dur=0.3,chorus=0.7:0.9:45|60:0.4|0.32:0.3|0.45:2|2.3,aecho=0.8:0.6:35:0.15" ;;
    *) FX="" ;;
  esac
  ffmpeg -v error -y -i "$f" -af "$TRIM$FX,$LOUD" -ac 1 -ar 44100 -c:a libvorbis -q:a 4 "$OUT/$b.ogg"
done
# (the table: each boss's lines, as the game writes them, and their two takes)
python3 - "$SESSIONS" "$OUT/voices.json" <<'EOF'
import json, sys
out = {}
for row in open(sys.argv[1], encoding="utf-8"):
    row = row.rstrip("\n")
    if not row:
        continue
    boss, n, line, _ = row.split("|")
    out.setdefault(boss, {})[line] = ["real/%s_%s_1.ogg" % (boss, n), "real/%s_%s_2.ogg" % (boss, n)]
json.dump(out, open(sys.argv[2], "w", encoding="utf-8"), ensure_ascii=False, indent=1)
EOF
ls "$OUT"/*.ogg | wc -l
