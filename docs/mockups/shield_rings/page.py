# The page of the seven shields' own rings, before and after (27 Nov 2026), from the films the check makes
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
        shutil.copy(f'{d}/{m}.jpg', f'{out}/film/{m}_{tag}.jpg')
        vids.append(f'<figure><figcaption>{tag.capitalize()}</figcaption><video src="film/{m}_{tag}.mp4" poster="film/{m}_{tag}.jpg" controls muted playsinline loop preload="none"></video></figure>')
    of = D['of'].get(m, [])
    cards.append(f'<article class="card"><header><b>{html.escape(name_of(m))}</b><span>{" + ".join(nm(w) for w in of)}</span></header>'
                 f'<div class="pair">{"".join(vids)}</div><dl class="does"><dt>Before</dt><dd><ul>{li(item["why"])}</ul></dd>'
                 f'<dt>Done</dt><dd><ul>{li(item["done"])}</ul></dd></dl></article>')
page = open(HERE + '/page.html').read()
page = (page.replace('@@ASKED@@', html.escape(REP['asked'])).replace('@@PICKED@@', html.escape(REP['picked']))
        .replace('@@CHECKS@@', li(REP['checks'])).replace('@@CARDS@@', ''.join(cards)).replace('@@FOUND@@', li(REP['found']))
        )
open(out + '/index.html', 'w').write(page)
print('cards', len(cards))
