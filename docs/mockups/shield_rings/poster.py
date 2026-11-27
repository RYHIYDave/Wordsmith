# Each film's still taken from the moment its ward circle is laid (its rules' telling + 14 frames), so the page shows the ring.
#   python3 poster.py <before films dir> <after films dir> <page out dir>   (after page.py)
import json, subprocess, sys
before, after, out = sys.argv[1], sys.argv[2], sys.argv[3]
keys = {'redoubt': 'redoubt:inner', 'sanctuary': 'sanctuary:ward', 'aegis': 'aegis:wide', 'minefield': 'minefield:ward',
        'riposte': 'riposte:ward', 'shieldwall': 'shieldwall:ward', 'carapace': 'carapace:ward'}
for m, k in keys.items():
    for tag, d in (('before', before), ('after', after)):
        j = json.load(open(f'{d}/{m}.json'))
        f = j.get('told', {}).get(k)
        f = (f + 14) if f else j['sides']['behind'] + 30
        subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', f'{d}/{m}.mp4', '-vf', f'select=eq(n\\,{f})', '-frames:v', '1', '-q:v', '3',
                        f'{out}/film/{m}_{tag}.jpg'], check=True)
