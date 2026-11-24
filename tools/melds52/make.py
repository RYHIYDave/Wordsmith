# THE 52 DESIGNED MELDS AND THE 11 LEVEL 2 RUNES, as a table the Godot game reads (godot/assets/words/melds52.json) and their
# stones in one sheet (godot/assets/words/melds52.png). From his approved docs (Twin's Melds, Floor 6-10 Melds: docs_twin.txt,
# docs610.txt, their texts as he said "Good" to them, 23 Nov 2026) and the approved stones (docs/mockups/meld_runes/runes.json).
#   python3 tools/melds52/make.py
import json, re, os
from PIL import Image
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
G = ROOT + '/godot/assets/'
RUNES = json.load(open(ROOT + '/docs/mockups/meld_runes/runes.json'))
# (the last floor 1-10 group: his doc The Last Floor 1-10 Melds and its runes, "Good" to both, 23 Nov 2026)
RUNES2 = json.load(open(ROOT + '/docs/mockups/meld_runes2/runes.json'))
RUNES.update(RUNES2)
# (THE CITY'S MELDS: his doc Floor 11-15 Melds, its runes and their animations, "Good", "Yep good", "Good to go", 24 Nov 2026; their
# text tools/meldscity/docs_city.txt; behind melds52.gd CITY_ON until his yes to the films)
RUNES3 = json.load(open(ROOT + '/docs/mockups/meld_runes3/runes.json'))
RUNES.update(RUNES3)
CITY = ['pulling', 'splitting', 'hexing', 'stilling', 'binding']
# (THE CITY'S RUNES WITH THE FLOOR 6-10 RUNES: his "Then finish the melds", 24 Nov 2026, the next group his Floor 11-15 doc named;
# their text tools/meldscity/docs_city2.txt, their stones docs/mockups/meld_runes4; behind melds52.gd CITY2_ON until his yes)
RUNES4 = json.load(open(ROOT + '/docs/mockups/meld_runes4/runes.json'))
RUNES.update(RUNES4)
# (REAPING WITH THE DAMAGE RUNES: his "Yes and work on reaping", 24 Nov 2026, after his “Like reaping and fire makes little imps
# that throw fireballs instead of the shades.  What would the others be?”; their text tools/meldsreap/docs_reap.txt, their stones
# docs/mockups/meld_runes5, their creatures tools/reap5; behind melds52.gd REAP_ON until his yes)
RUNES5 = json.load(open(ROOT + '/docs/mockups/meld_runes5/runes.json'))
RUNES.update(RUNES5)
# (THE HIGH CITY'S RUNES MELDED, the last group: his "Then we gotta get back to these melds.  I'd like to finish them today.", 24 Nov
# 2026, and, of a first try that cut corners, “I don't need this done quick, I need it done right”; each designed on its own in
# the doc High City Melds, its text tools/meldshigh/docs_high.txt (the doc as text), each its own stone (docs/mockups/meld_runes6,
# design.py and render6.py); behind melds52.gd HIGH_ON until his yes)
RUNES6 = json.load(open(ROOT + '/docs/mockups/meld_runes6/runes.json'))
RUNES.update(RUNES6)
HIGH = ['piercing', 'bleeding', 'reaping', 'culling', 'surging']
W = json.load(open(G + 'words/words.json'))['words']
COLOR = json.load(open(G + 'loot/items.json'))['words']['color']
NAME_ID = {'Power': 'power', 'Poison': 'poison', 'Frost': 'frost', 'Flame': 'fire', 'Lightning': 'lightning', 'Swift': 'swift',
           'Heavy': 'heavy', 'Twin': 'twin', 'Leech': 'leech', 'Volatile': 'volatile', 'Precise': 'precise', 'Frenzied': 'frenzied',
           'Guarding': 'guarding', 'Lasting': 'lasting', 'Fleeting': 'fleeting', 'Vast': 'vast',
           'Pulling': 'pulling', 'Splitting': 'splitting', 'Hexing': 'hexing', 'Stilling': 'stilling', 'Binding': 'binding',
           'Reaping': 'reaping', 'Piercing': 'piercing', 'Bleeding': 'bleeding', 'Culling': 'culling', 'Surging': 'surging'}
RANKS = ['twin', 'leech', 'volatile', 'precise', 'frenzied', 'guarding', 'lasting', 'fleeting', 'vast', 'swift', 'heavy',
         'pulling', 'splitting', 'hexing', 'stilling', 'binding', 'piercing', 'bleeding', 'reaping', 'culling', 'surging']
BY_NAME = {v['name']: k for k, v in RUNES.items()}
for w in RANKS:
    BY_NAME[W[w]['name'] + ' II'] = w + '2'


def parse(path):
    out, cur = {}, None
    for line in open(path):
        line = line.strip()
        if line in BY_NAME:
            cur = BY_NAME[line]
            out[cur] = {}
            continue
        if cur is None:
            continue
        m = re.match(r'^(\w+) and (\w+)\.(.*)On a move: (.+?), (.+?)\.$', line)
        if m:
            out[cur].update(a=NAME_ID[m.group(1)], b=NAME_ID[m.group(2)], line=m.group(3).strip(), onFront=m.group(4), onBehind=m.group(5))
            continue
        for key, tag in (('front', 'In front:'), ('behind', 'Behind:'), ('monster', 'On enemies:'), ('both', 'In front and behind:')):
            if line.startswith(tag):
                out[cur][key] = line[len(tag):].strip()
        if not any(line.startswith(t) for t in ('In front', 'Behind', 'On enemies', 'On gear')) and 'On a move' not in line:
            cur = None if line not in BY_NAME else cur
    return out


D = {}
D.update(parse(ROOT + '/tools/melds52/docs_twin.txt'))
D.update(parse(ROOT + '/tools/melds52/docs610.txt'))
D.update(parse(ROOT + '/tools/melds52/docs_last110.txt'))
D.update(parse(ROOT + '/tools/meldscity/docs_city.txt'))
D.update(parse(ROOT + '/tools/meldscity/docs_city2.txt'))
D.update(parse(ROOT + '/tools/meldsreap/docs_reap.txt'))
D.update(parse(ROOT + '/tools/meldshigh/docs_high.txt'))
missing = [k for k in list(RUNES) + [w + '2' for w in RANKS] if k not in D or 'front' not in D[k] and 'both' not in D[k]]
assert not missing, missing

GEAR = {  # (what each rune gives on gear: weapon, gloves, ring, amulet; and the armour: his Floor 6-10 doc's table)
    'twin': ('Critical Chance or Dexterity', 'Critical Damage or Dexterity'), 'leech': ('Life on Hit or Life on Kill', 'Max Life or Life Regen'),
    'volatile': ('Area of Effect or Intelligence', 'Cooldown Recovery or Intelligence'), 'precise': ('Critical Chance or Dexterity', 'Critical Damage or Dexterity'),
    'frenzied': ('Attack Speed or Strength', 'Movement Speed or Strength'), 'guarding': ('Barrier or Strength', 'Barrier or Strength'),
    'lasting': ('Damage or Intelligence', 'Life Regen or Intelligence'), 'fleeting': ('Cooldown Recovery or Dexterity', 'Cooldown Recovery or Dexterity'),
    'vast': ('Area of Effect or Strength', 'Armour or Strength'), 'power': ('Physical Damage, Added Damage or Strength', 'Armour or Strength'),
    'poison': ('Poison Damage or Poison Resistance', 'Poison Resistance'), 'frost': ('Frost Damage or Frost Resistance', 'Frost Resistance'),
    'fire': ('Fire Damage or Fire Resistance', 'Fire Resistance'), 'lightning': ('Lightning Damage or Lightning Resistance', 'Lightning Resistance'),
    'swift': ('Attack Speed or Dexterity (boots: Movement Speed)', 'Dodge or Dexterity'), 'heavy': ('Chance to Stun or Strength', 'Armour or Strength'),
    # (the city's five: his Floor 11-15 doc's table)
    'pulling': ('Pickup Reach', 'Pickup Reach'), 'splitting': ('Damage or Dexterity', 'Dexterity'), 'hexing': ('Damage or Intelligence', 'Intelligence'),
    'stilling': ('Cooldown Recovery or Intelligence', 'Cooldown Recovery or Intelligence'), 'binding': ('Damage or Strength', 'Armour or Strength'),
    # (Reaping's: its Lexicon page)
    'reaping': ('Life on Kill or Intelligence', 'Cooldown Recovery or Intelligence'),
    'piercing': ('Critical Damage or Dexterity', 'Critical Damage or Dexterity'), 'bleeding': ('Physical Damage or Strength', 'Life Regen or Strength'),
    'culling': ('Damage or Strength', 'Max Life or Strength'), 'surging': ('Area of Effect or Intelligence', 'Cooldown Recovery or Intelligence'),
}

def adj(s):  # "Onslaught Strike" -> "Onslaught"; "Duelist's Strike" -> "Duelist's"
    return s.rsplit(' ', 1)[0]

def behind_of(s):  # "Strike of the Viper" -> "of the Viper"
    return 'of ' + s.split(' of ', 1)[1]

words, of, attr, page, rank_of, stones_at = {}, {}, {}, {}, {}, {}
order = list(RUNES) + [w + '2' for w in RANKS]
for k in order:
    d = D[k]
    rank = k.endswith('2') and k[:-1] in RANKS
    a, b = d['a'], d['b']
    front = d.get('front', d.get('both'))
    behind = d.get('behind', d.get('both'))
    e = {'id': k, 'kind': 'rank' if rank else 'meld', 'name': RUNES[k]['name'] if not rank else W[a]['name'] + ' II',
         'front': adj(d['onFront']), 'behind': behind_of(d['onBehind']), 'attr': W[a]['attr'], 'element': None,
         'about': ('Two %s, melded: %s at level 2.' % (W[a]['name'], W[a]['name'])) if rank else ('%s and %s, melded. %s' % (W[a]['name'] if a != 'fire' else 'Flame', W[b]['name'] if b != 'fire' else 'Flame', d['line'])).strip(),
         'frontText': front[0].upper() + front[1:], 'behindText': behind[0].upper() + behind[1:], 'monsterText': d['monster'][0].upper() + d['monster'][1:],
         'melds52': True}
    # (a damage word's element: the meld carries its damage word's, as the game's melds do)
    for w in (a, b):
        if W[w].get('element'):
            e['element'] = W[w]['element']
    if not rank:
        e['of'] = [a, b]
        of[k] = [a, b]
    else:
        rank_of[k] = {'word': a, 'rank': 2}
    attr[k] = W[a]['attr']
    words[k] = e
    if rank:
        g = GEAR[a]
        page[k] = {'gear': ['Weapon, gloves, ring, amulet: %s.' % g[0], 'Off hand, helm, chest, belt, boots: %s.' % g[1]], 'note': 'Half as strong again as %s.' % W[a]['name']}
    else:
        ga, gb = GEAR[a], GEAR[b]
        # (two runes that give the same (Twin and Precise): each paired with the other's second, so the same never comes twice)
        if ga[0] == gb[0]:
            gb = (gb[1], gb[0])
        page[k] = {'gear': ['Weapon, gloves, ring, amulet: %s, with %s.' % (ga[0], gb[0]), 'Off hand, helm, chest, belt, boots: %s, with %s.' % (ga[1], gb[1])],
                   'note': 'One property of each, each a quarter weaker than alone. Two of a kind never pair.'}

# GREED, THE BETTER-LOOT WORD (his “Yes build greed”, 24 Nov 2026; his words of before, “I really want a QUALITY word where you get
# better loot” and “Yeah but make it GREED”): a plain word, not a meld, kept in this table for its stone and its page (melds52.gd
# add_to, `extra`); its rules words.gd, last_words.gd, loot.gd, foe_words.gd.
EXTRA = {'greed': {'id': 'greed', 'kind': 'shape', 'name': 'Greed', 'front': 'Greedy', 'behind': 'of Greed', 'attr': 'int', 'element': None,
                   'about': 'The word of the hoard. The best of what they hold is yours.',
                   'frontText': 'Kills drop better gear: 50% increased magic find on what they drop.',
                   'behindText': 'Kills sometimes drop an extra item.',
                   'monsterText': 'Carries better loot, and fights harder for it.'}}
EXTRA_LOOK = {'greed': {'color': '#a62a6e', 'glyph': ['...o...', '..XXX..', '.XoXoX.', 'XXXXXXX', '.X.X.X.', '..X.X..', '...X...']}}
EXTRA_PAGE = {'greed': {'gear': ['Weapon, gloves, ring, amulet: Magic Find or Intelligence.', 'Off hand, helm, chest, belt, boots: Magic Find or Intelligence.'],
                        'note': 'It never melds, and drops only on endless levels.'}}

color = {k: RUNES[k]['color'] for k in RUNES}
for w in RANKS:
    color[w + '2'] = COLOR[w]

# THE STONES: the approved pictures (docs/mockups/meld_runes/render.py), two picture pixels to a game pixel, 24 x 24, in one sheet
import sys
sys.path.insert(0, ROOT + '/docs/mockups/meld_runes')
os.chdir(ROOT + '/docs/mockups/meld_runes')
src = open('render.py').read().split("if __name__=='__main__':")[0]
env = {}
exec(src, env)
env['R'].update(RUNES2)
env['R'].update(RUNES3)
env['R'].update(RUNES4)
env['R'].update(RUNES5)
env['R'].update(RUNES6)
def rank_stone(w):
    im = env['base'](w).copy()
    c = env['hexc'](COLOR[w]); gl = tuple(int(c[i] + (255 - c[i]) * 0.55) for i in range(3)) + (255,)
    for x in (3, 4, 7, 8):
        im.putpixel((x, 10), gl)
    return im
PITCH, COLS = 25, 16
rows = (len(order) + len(EXTRA) + COLS - 1) // COLS
sheet = Image.new('RGBA', (COLS * PITCH, rows * PITCH), (0, 0, 0, 0))
for i, k in enumerate(order):
    im = rank_stone(k[:-1]) if k in rank_of else env['stone'](k)
    im = im.resize((24, 24), Image.NEAREST)
    x, y = (i % COLS) * PITCH, (i // COLS) * PITCH
    sheet.paste(im, (x, y), im)
    stones_at[k] = [x, y]
for j, k in enumerate(EXTRA):
    env['colors'][k] = EXTRA_LOOK[k]['color']
    env['R'][k] = {'name': EXTRA[k]['name'], 'of': [k, k], 'color': EXTRA_LOOK[k]['color'], 'glyph': EXTRA_LOOK[k]['glyph']}
    im = env['stone'](k).resize((24, 24), Image.NEAREST)
    i = len(order) + j
    x, y = (i % COLS) * PITCH, (i // COLS) * PITCH
    sheet.paste(im, (x, y), im)
    stones_at[k] = [x, y]
    color[k] = EXTRA_LOOK[k]['color']
    env['stone'](k).save(ROOT + '/docs/mockups/greed/%s.png' % k)
sheet.save(G + 'words/melds52.png')

TUNE = json.load(open(ROOT + '/tools/melds52/tune.json'))
# (ALL MELDS: THE LEAST EXCITING REDONE, his "Next I want you to look at the larger pool of all melds, and redo the 20 weakest.  Then
# do it again.  Then do it a third time.", 24 Nov 2026: each redone's new texts, by round, tools/meldsredo/redo.txt; the game's own
# melds among them by their names in words.json; shown only with melds52.gd REDO_ON)
REDO, ROUNDS = {}, []
NAMES = {v['name']: k for k, v in RUNES.items()}
NAMES.update({v['name']: k for k, v in W.items() if v.get('kind') == 'meld'})
cur = None
for line in open(ROOT + '/tools/meldsredo/redo.txt'):
    line = line.strip()
    if line.startswith('ROUND '):
        ROUNDS.append([])
    elif line in NAMES and ROUNDS:
        cur = NAMES[line]
        REDO[cur] = {}
        ROUNDS[-1].append(cur)
    elif cur and line.startswith('In front: '):
        REDO[cur]['frontText'] = line[len('In front: '):]
    elif cur and line.startswith('Behind: '):
        REDO[cur]['behindText'] = line[len('Behind: '):]
    elif cur and line.startswith('On enemies: '):
        REDO[cur]['monsterText'] = line[len('On enemies: '):]
for k, v in REDO.items():
    assert len(v) == 3, (k, v)
out = {'order': order, 'melds': list(RUNES), 'ranks': [w + '2' for w in RANKS], 'words': words, 'of': of, 'rankOf': rank_of,
       'attr': attr, 'page': page, 'color': color, 'stones': stones_at, 'glyph': {k: RUNES[k]['glyph'] for k in RUNES}, 'tune': TUNE,
       'city': list(RUNES3) + [w + '2' for w in CITY], 'city2': list(RUNES4), 'reap': list(RUNES5),
       'high': list(RUNES6) + [w + '2' for w in HIGH], 'extra': EXTRA, 'extraPage': EXTRA_PAGE, 'redo': REDO, 'redoRounds': ROUNDS}
json.dump(out, open(G + 'words/melds52.json', 'w'), indent=1)
print(len(RUNES), 'melds,', len(RANKS), 'level 2;', 'sheet', sheet.size)
