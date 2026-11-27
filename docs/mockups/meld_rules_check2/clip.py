#!/usr/bin/env python3
# The monster part of each film (from its json's sides: foe to end), as its own clip, with a poster at its first moment.
#   python3 clip.py <films dir> <out dir> <ids...>
import sys, json, subprocess, os
d, out, ids = sys.argv[1], sys.argv[2], sys.argv[3:]
for m in ids:
    j = json.load(open(f'{d}/{m}.json'))
    a, b = j['sides']['foe'], j['sides']['end']
    ft = j.get('foe_told') or {}
    poster = (min(ft.values()) + 6 if ft else a + 40) - a
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', f'{d}/{m}.mp4', '-vf', f'select=between(n\\,{a}\\,{b}),setpts=N/30/TB',
                    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '26', '-movflags', '+faststart', '-an', f'{out}/{m}.mp4'], check=True)
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', f'{out}/{m}.mp4', '-vf', f"select=eq(n\\,{max(0, poster)})", '-frames:v', '1', '-vsync', '0', f'{out}/{m}.jpg'], check=True)
    print(m, a, b, poster)
