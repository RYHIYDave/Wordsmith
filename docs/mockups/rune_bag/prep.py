import json, sys, random, base64, io
from PIL import Image
S = sys.argv[1]
D = S + '/data/'
words = json.load(open(D + 'words.json'))
m52 = json.load(open(D + 'melds52.json'))
hud = json.load(open(D + 'hud.json'))
icons = json.load(open(D + 'icons.json'))
atlas = Image.open(D + 'icons.png').convert('RGBA')
msheet = Image.open(D + 'melds52.png').convert('RGBA')
pos = {e['key'][5:]: e for e in icons if e['key'].startswith('word:')}
GROUP = {}
for p in words['lexPages']:
    for w in p['words']:
        GROUP[w] = p['name']
runes = []
order = []
def add(w, d, color, img):
    runes.append(dict(id=w, name=d['name'], kind=d.get('kind', ''), color=color, of=d.get('of'),
                      about=d.get('about', ''), front=d.get('frontText', ''), behind=d.get('behindText', ''),
                      monster=d.get('monsterText', ''), attr=d.get('attr')))
    order.append(img)
for w, d in words['words'].items():
    e = pos[w]
    img = atlas.crop((e['x'], e['y'], e['x'] + e['w'], e['y'] + e['h']))
    add(w, d, hud['word_color'][w], img)
for w, d in m52['words'].items():
    x, y = m52['stones'][w]
    img = msheet.crop((x, y, x + 24, y + 24))
    add(w, d, m52['color'][w], img)
# rank: base word and level
rankOf = dict(words['melds']['rankOf']); rankOf.update(m52['rankOf'])
for r in runes:
    ro = rankOf.get(r['id'])
    if ro:
        r['rankOf'] = ro['word']; r['rank'] = ro['rank']; r['group'] = GROUP[ro['word']]; r['of'] = None
    elif r['id'] in GROUP:
        r['group'] = GROUP[r['id']]
    else:
        r['group'] = 'MELDS'
        if not r['of']:
            r['of'] = words['melds']['of'].get(r['id']) or m52['of'].get(r['id'])
    r['city'] = r['id'] in m52.get('city', [])
# sheet: 16 per row
n = len(order); cols = 16; rows = (n + cols - 1) // cols
sheet = Image.new('RGBA', (cols * 24, rows * 24))
for i, img in enumerate(order):
    sheet.paste(img, ((i % cols) * 24, (i // cols) * 24))
    runes[i]['s'] = i
buf = io.BytesIO(); sheet.save(buf, 'PNG')
json.dump({'runes': runes, 'sheet': 'data:image/png;base64,' + base64.b64encode(buf.getvalue()).decode(), 'cols': cols,
           'dust': words['melds'].get('dust', '#7af8f0')}, open(S + '/mock/runes.json', 'w'))
from collections import Counter
print(n, Counter(r['group'] for r in runes))
print([r['name'] for r in runes if r['group']=='MELDS' and not r['of']])
