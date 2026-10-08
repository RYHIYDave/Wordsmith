#!/bin/sh
# Stills of one move of the painted heroes, for looking at: four moments to a sheet, a row a view.
#   tools/look_moves3.sh <move> <f,f,f,f> [name] [crop x0,y0,x1,y1] [S] [views: front,back]
# Writes shots/mv_<move>_<name>.png (1800 wide at the usual crop and S = 4).
move=$1; frames=$2; name=${3:-a}; crop=${4:-29,12,139,152}; S=${5:-4}; views=${6:-front,back}
n=$(echo "$frames" | tr ',' '\n' | wc -l); rows=$(echo "$views" | tr ',' '\n' | wc -l)
x0=$(echo $crop | cut -d, -f1); y0=$(echo $crop | cut -d, -f2); x1=$(echo $crop | cut -d, -f3); y1=$(echo $crop | cut -d, -f4)
w=$((8 + n * ((x1 - x0) * S + 8))); h=$((48 + rows * ((y1 - y0) * S + 32)))
node tools/preview.mjs src/dev/preview_skin.ts shots/mv_${move}_${name}.png $w $h "${move}:still:${frames}:1.3:${S}?crop=${crop}&views=${views}" | tail -1
