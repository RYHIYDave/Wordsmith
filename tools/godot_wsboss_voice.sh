#!/bin/bash
# THE GODOT PORT: THE WARPED WORDSMITH'S VOICE (his pick, 25 Nov 2026: real speech, asked “Can eleven labs do emotion?  I’d like him
# to sound crazed.  Not cold.  If not, I guess he can be cold, and let’s say Scottish.  With some phaser distortion from the
# magic”; of the two samples, “Take 1, use it (Recommended)”). Each of his lines spoken by ElevenLabs (eleven_v4, the library voice
# “Arkadius - Old Storyteller”, an old Scottish storyteller, played [crazed] [strong Scottish accent] and each line's own way), two
# takes of each; then here: the silence at either end trimmed, the phaser of his magic on it (a phaser, a slow flanger, a short
# echo), as loud as the bosses' roars, Vorbis:
#   tools/godot_wsboss_voice.sh <dir of the takes as <line>_<1|2>.mp3>   -> godot/assets/voices/wsboss/<line>_<take>.ogg
# THE BOAR'S DEATH (fall) is said from the moment it is killed and must be done by his slam: played a third again as fast. HIS DEATH
# (death), a scream cut short as he implodes: 1.08 seconds of it, from the blow that overwhelms him to the implosion, and no more.
set -e
SRC="$1"
OUT="$(cd "$(dirname "$0")/.." && pwd)/godot/assets/voices/wsboss"
mkdir -p "$OUT"
MAGIC="aphaser=in_gain=0.7:out_gain=0.95:delay=3.5:decay=0.55:speed=0.7:type=t,flanger=delay=1:depth=2:regen=-6:width=60:speed=0.4,aecho=0.8:0.6:40:0.18"
TRIM="silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.03,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.08,areverse"
for f in "$SRC"/*_[12].mp3; do
  b=$(basename "$f" .mp3)
  line=${b%_*}
  extra=""
  tail=""
  [ "$line" = "fall" ] && extra=",atempo=1.3"
  [ "$line" = "death" ] && tail=",atrim=0:1.08,afade=t=out:st=1.06:d=0.02"
  ffmpeg -v error -y -i "$f" -af "$TRIM$extra,$MAGIC$tail,loudnorm=I=-16:TP=-1.5:LRA=11" -ac 1 -ar 44100 -c:a libvorbis -q:a 5 "$OUT/$b.ogg"
done
ls "$OUT"/*.ogg | wc -l
