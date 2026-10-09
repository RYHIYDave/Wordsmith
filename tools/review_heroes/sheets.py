#!/usr/bin/env python3
"""Every frame of every one of the heroes' moves on sheets, from in front and from behind, for the
review (src/dev/preview_review.ts):  python3 tools/review_heroes/sheets.py <out dir> [move ...]"""
import subprocess, sys, os, json
out = sys.argv[1]
os.makedirs(out, exist_ok=True)
ORDER = ['rear', 'krun', 'strike', 'kslash', 'slam', 'whirl', 'leap', 'kreel', 'klurch', 'kfall', 'ktown', 'ktownrun', 'klook', 'kdraw', 'rstand', 'rrun', 'shot', 'volley', 'roll', 'rreel', 'rlurch', 'rfall', 'squirrel', 'sighting', 'rtown', 'rtownrun', 'tsquirrel', 'tsighting', 'rdraw', 'mstand', 'mrun', 'wave', 'orb', 'beam', 'beamend', 'mreel', 'mlurch', 'mfall', 'mlight', 'reading', 'mready']
# frames at 30 a second in each (tools/review_heroes/bones.ts says so): long ones are shown every 2nd or 3rd
LONG = {'rear': 60, 'kfall': 46, 'ktown': 36, 'klook': 162, 'kdraw': 91, 'rstand': 36, 'rfall': 46, 'squirrel': 162, 'sighting': 162, 'rtown': 36, 'tsquirrel': 162, 'tsighting': 162, 'rdraw': 87, 'mstand': 36, 'mfall': 46, 'mlight': 162, 'reading': 162, 'mready': 60, 'leap': 27}
S, COLS = 2, 7
for key in (sys.argv[2:] or ORDER):
    n = LONG.get(key, 20)
    every = 1 if n <= 28 else 2 if n <= 60 else 6
    shown = len(range(0, n + 1, every))
    rows = (shown + COLS - 1) // COLS
    w = 6 + min(COLS, shown) * (132 * S + 6)
    h = 34 + 2 * (rows * (148 * S + 18 + 6) + 22)
    r = subprocess.run(['node', 'tools/preview.mjs', 'src/dev/preview_review.ts', f'{out}/{key}.png', str(w), str(h), f'{key}:{S}:{COLS}:{every}'], capture_output=True, text=True)
    print(key, r.stdout.strip().splitlines()[-1] if r.stdout.strip() else r.stderr[-300:])
