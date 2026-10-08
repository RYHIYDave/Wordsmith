#!/bin/sh
# A close look at some frames of one move: tools/review_heroes/zoom.sh <move> <first>-<last> [crop x0,y0,x1,y1] [S] [out]
move=$1; range=$2; crop=${3:-46,40,126,140}; S=${4:-4}; out=${5:-shots/rv/zoom_${move}_${range}.png}
x0=$(echo $crop | cut -d, -f1); y0=$(echo $crop | cut -d, -f2); x1=$(echo $crop | cut -d, -f3); y1=$(echo $crop | cut -d, -f4)
a=$(echo $range | cut -d- -f1); b=$(echo $range | cut -d- -f2); n=$((b - a + 1))
w=$((6 + n * ((x1 - x0) * S + 6))); h=$((34 + 2 * ((y1 - y0) * S + 18 + 6 + 22)))
node tools/preview.mjs src/dev/preview_review.ts $out $w $h "$move:$S:$n:1:$range:$crop" | tail -1
