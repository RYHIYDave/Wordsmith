# The page of the third 20 weak melds against his Art Rulebook, before and after (27 Nov 2026), from the films the check makes
# (godot: --only=words --cases=m52film, each <id>.mp4 and <id>.jpg) and report.json (this folder: why each was weak, what was done).
#   python3 page.py <before films dir> <after films dir> <out dir>
import json, sys, os, shutil, html
HERE = os.path.dirname(os.path.abspath(__file__))
before, after, out = sys.argv[1], sys.argv[2], sys.argv[3]
REP = json.load(open(HERE + '/report.json'))
D = json.load(open(HERE + '/../../../godot/assets/words/melds52.json'))
os.makedirs(out + '/film', exist_ok=True)
NAME = {'fire': 'Flame'}
def nm(w): return NAME.get(w, w.capitalize())
def name_of(m): return D['words'].get(m, {}).get('name', m.capitalize())
def li(xs): return ''.join(f'<li>{html.escape(x)}</li>' for x in xs)

cards = []
for item in REP['weakest']:
    m = item['id']
    vids = []
    for tag, d in (('before', before), ('after', after)):
        shutil.copy(f'{d}/{m}.mp4', f'{out}/film/{m}_{tag}.mp4')
        # (its still: the moment that changed, as the after film tells it)
        k, plus = REP['posters'][m]
        at = json.load(open(f'{after}/{m}.json'))['told'].get(k, 30) + plus
        import subprocess
        subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', f'{d}/{m}.mp4', '-vf', f'select=eq(n\\,{at})', '-frames:v', '1', '-q:v', '3', f'{out}/film/{m}_{tag}.jpg'], check=True)
        vids.append(f'<figure><figcaption>{tag.capitalize()}</figcaption><video src="film/{m}_{tag}.mp4" poster="film/{m}_{tag}.jpg" controls muted playsinline loop preload="none"></video></figure>')
    of = D['of'].get(m, [])
    cards.append(f'<article class="card"><header><b>{html.escape(name_of(m))}</b><span>{" + ".join(nm(w) for w in of)}</span></header>'
                 f'<div class="pair">{"".join(vids)}</div><dl class="does"><dt>Why weak</dt><dd><ul>{li(item["why"])}</ul></dd>'
                 f'<dt>Done</dt><dd><ul>{li(item["done"])}</ul></dd></dl></article>')
page = open(HERE + '/page.html').read()
page = (page.replace('@@ASKED@@', html.escape(REP['asked'])).replace('@@PICKED@@', html.escape(REP['picked']))
        .replace('@@CHECKS@@', li(REP['checks'])).replace('@@CARDS@@', ''.join(cards))
        .replace('@@LEFT@@', ''.join(f'<li><b>{html.escape(name_of(m))}</b>: {html.escape(w)}</li>' for m, w in REP['left'])).replace('@@NOTE@@', html.escape(REP['note'])))
open(out + '/index.html', 'w').write(page)
print('cards', len(cards))
