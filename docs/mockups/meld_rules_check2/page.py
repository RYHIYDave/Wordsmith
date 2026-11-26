# The page of the weakest melds against his Art Rulebook, before and after (26 Nov 2026), from the films the check makes
# (godot: --only=words --cases=m52film, each <id>.mp4 and <id>.jpg) and report.json (this folder: the ranking, each one's reasons, what
# was done; made by report.py).
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


def cards(items):
    out_cards = []
    for item in items:
        m = item['id']
        vids = []
        for tag, d in (('before', before), ('after', after)):
            if os.path.exists(f'{d}/{m}.mp4'):
                shutil.copy(f'{d}/{m}.mp4', f'{out}/film/{m}_{tag}.mp4')
                shutil.copy(f'{d}/{m}.jpg', f'{out}/film/{m}_{tag}.jpg')
                vids.append(f'<figure><figcaption>{tag.capitalize()}</figcaption><video src="film/{m}_{tag}.mp4" poster="film/{m}_{tag}.jpg" controls muted playsinline loop preload="none"></video></figure>')
        of = D['of'].get(m, [])
        why = ''.join(f'<li>{html.escape(w)}</li>' for w in item['why'])
        did = ''.join(f'<li>{html.escape(w)}</li>' for w in item['done'])
        out_cards.append(f'<article class="card"><header><b>{html.escape(name_of(m))}</b><span>{" + ".join(nm(w) for w in of)}</span></header>'
                         f'<div class="pair">{"".join(vids)}</div><dl class="does"><dt>Why weak</dt><dd><ul>{why}</ul></dd><dt>Done</dt><dd><ul>{did}</ul></dd></dl></article>')
    return ''.join(out_cards)


allfix = ''.join(f'<li>{html.escape(x)}</li>' for x in REP['for_all'])
asks = ''.join(f'<li>{html.escape(x)}</li>' for x in REP.get('your_call', []))
page = open(HERE + '/page.html').read()
page = (page.replace('@@CARDS@@', cards(REP['weakest'])).replace('@@SHOWN@@', cards(REP.get('shown', []))).replace('@@ALL@@', allfix)
        .replace('@@ASK@@', asks).replace('@@COUNT@@', str(REP['checked'])).replace('@@N@@', str(len(REP['weakest'])))
        .replace('@@SCORING@@', html.escape(REP['scoring'])))
open(out + '/index.html', 'w').write(page)
print('cards', len(REP['weakest']), '+', len(REP.get('shown', [])))
