#!/bin/bash
# films the 20 (two runs side by side) into $OUT; godot's output to $OUT/log_<half>.txt
OUT=${OUT:-/home/claude/films/w20a}
mkdir -p $OUT
cd /home/claude/Wordsmith/godot
A=${A:-lifeline,secondwind,juggernaut,marrow,hornet,aftermath,staccato,whipcrack,pressurepoint,conduit}
B=${B:-rampage,parry,haunting,gravewarden,feedingfrenzy,quickdraw,riptide,eddy,seeker,lancet}
timeout 1700 xvfb-run -a godot --path . --rendering-driver opengl3 --fixed-fps 30 -- --only=words --cases=m52film:$A --shots=$OUT > $OUT/log_a.txt 2>&1 &
[ -n "$B" ] && timeout 1700 xvfb-run -a godot --path . --rendering-driver opengl3 --fixed-fps 30 -- --only=words --cases=m52film:$B --shots=$OUT > $OUT/log_b.txt 2>&1 &
wait
echo "FILMED $(ls $OUT/film/*.mp4 2>/dev/null | wc -l)"
