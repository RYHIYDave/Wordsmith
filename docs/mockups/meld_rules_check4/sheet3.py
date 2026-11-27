#!/usr/bin/env python3
# One sheet per meld: a row each for front, behind and on a monster, 4 frames each, picked at the moments told in that part
# (a few frames after each), else spread through it. Each frame cropped round the hero, labelled.
#   python3 sheet3.py <films dir> <out dir> <ids...>
import sys, json, subprocess, os
d, out, ids = sys.argv[1], sys.argv[2], sys.argv[3:]
for m in ids:
    j = json.load(open(f'{d}/{m}.json'))
    s = j['sides']; told = dict(j.get('told', {})); told.update({k: v for k, v in (j.get('foe_told') or {}).items()})
    parts = [('front', s.get('front', 0), s.get('behind', 0)), ('behind', s.get('behind', 0), s.get('foe', 0)), ('foe', s.get('foe', 0), s.get('end', 0))]
    frames = []
    for name, a, b in parts:
        ks = sorted(set(v for v in told.values() if a <= v < b))
        pick = []
        for v in ks:
            for off in (3, 9):
                if v + off < b: pick.append(v + off)
        pick = sorted(set(pick))[:4]
        while len(pick) < 4:
            pick.append(a + int((b - a) * (len(pick) + 1) / 5))
        frames += [(name, f) for f in sorted(pick)[:4]]
    tmp = f'/tmp/s3_{m}'; os.makedirs(tmp, exist_ok=True)
    for i, (name, f) in enumerate(frames):
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', f'{d}/{m}.mp4', '-vf', f"select=eq(n\\,{f}),crop=480:340:160:100,scale=400:283,drawtext=text='{m} {name} {f}':x=6:y=6:fontcolor=white:fontsize=16", '-frames:v', '1', '-vsync', '0', f'{tmp}/{i:02d}.png'], check=True)
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', f'{tmp}/%02d.png', '-vf', 'tile=4x3', '-frames:v', '1', f'{out}/{m}.jpg'], check=True)
    print(m, frames)
