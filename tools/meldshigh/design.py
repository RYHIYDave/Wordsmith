# THE HIGH CITY'S RUNES MELDED (his "Then we gotta get back to these melds.  I'd like to finish them today.", 24 Nov 2026): the last
# group, the High City's five meldable runes (Piercing, Bleeding, Reaping, Culling, Surging) with every other rune and with each
# other, and each one's level 2. Plundering and Greed never meld (his word); Mirroring, now the rare copier of items, is left out.
# Reaping with the five damage runes was made already (tools/meldsreap: Cinderbrood, Wintergrave, Stormwake, Bogborn, Charnel).
#
# EACH ONE'S TWIST, ONE RULE FOR ALL: the High City rune's own act (Piercing's line through them and its lance, Bleeding's wounds
# and thorns, Reaping's soul and spirit, Culling's killing blow and its mark, Surging's shockwaves) CARRIES the other rune: what it
# strikes is set burning, chilled, poisoned, stunned, cursed, dragged...; or it quickens, shields or heals him. Two of the High
# City's own carry each other.
# THE STONES: the High City rune's mark on the left (its glow) and the other's on the right, so every stone reads as its two runes.
#   python3 tools/meldshigh/design.py   (writes docs/mockups/meld_runes6/runes.json and tools/meldshigh/docs_high.txt)
import json, os, colorsys
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
COLOR = json.load(open(ROOT + '/godot/assets/loot/items.json'))['words']['color']
W = json.load(open(ROOT + '/godot/assets/words/words.json'))['words']

HIGH = ['piercing', 'bleeding', 'reaping', 'culling', 'surging']
LOW = ['power', 'poison', 'frost', 'fire', 'lightning', 'swift', 'heavy']
WILD = ['twin', 'leech', 'volatile', 'precise', 'frenzied', 'guarding', 'lasting', 'fleeting', 'vast']
CITY = ['pulling', 'splitting', 'hexing', 'stilling', 'binding']
DONE = {('reaping', w) for w in ['power', 'poison', 'frost', 'fire', 'lightning']}
NICE = {'fire': 'Flame'}

# (each rune's mark, three wide and seven tall)
MARK = {
    'power': ['.X.', 'XXX', 'X.X', '.X.', '.X.', '.X.', '.X.'],
    'poison': ['.X.', '.X.', 'XXX', 'XXX', 'XXX', '.X.', '...'],
    'frost': ['...', 'X.X', '.X.', 'XXX', '.X.', 'X.X', '...'],
    'fire': ['..X', '.X.', 'XX.', 'XXX', 'XXX', '.X.', '...'],
    'lightning': ['..X', '.X.', 'X..', 'XXX', '..X', '.X.', 'X..'],
    'swift': ['X..', '.X.', 'X..', '...', 'X..', '.X.', 'X..'],
    'heavy': ['...', 'XXX', 'XXX', '.X.', 'XXX', 'XXX', '...'],
    'twin': ['X.X', 'X.X', 'X.X', 'X.X', 'X.X', 'X.X', 'X.X'],
    'leech': ['XXX', 'XXX', 'X.X', 'X.X', '.X.', '.X.', '...'],
    'volatile': ['...', 'X.X', 'XXX', '.X.', 'XXX', 'X.X', '...'],
    'precise': ['.X.', '.X.', 'XXX', 'X.X', 'XXX', '.X.', '.X.'],
    'frenzied': ['..X', '.X.', 'X.X', '.X.', 'X.X', '.X.', 'X..'],
    'guarding': ['XXX', 'XXX', 'XXX', 'XXX', '.X.', '.X.', '...'],
    'lasting': ['XXX', '.X.', '.X.', 'XXX', '.X.', '.X.', 'XXX'],
    'fleeting': ['..X', '.XX', '.X.', 'XX.', 'X..', '...', '...'],
    'vast': ['...', '...', 'XXX', '...', 'XXX', '...', 'XXX'],
    'pulling': ['.XX', '..X', '..X', 'X.X', 'XXX', '...', '...'],
    'splitting': ['X.X', 'X.X', '.X.', '.X.', '.X.', '.X.', '...'],
    'hexing': ['...', '.X.', 'X.X', 'XXX', 'X.X', '.X.', '...'],
    'stilling': ['XXX', 'X.X', 'XX.', 'X.X', 'XXX', '...', '...'],
    'binding': ['XXX', 'X.X', 'XXX', '.X.', 'XXX', 'X.X', 'XXX'],
    'piercing': ['.X.', 'XXX', '.X.', '.X.', '.X.', '.X.', '.X.'],
    'bleeding': ['.X.', 'XXX', 'XXX', '.X.', '...', '.X.', '...'],
    'reaping': ['XXX', '..X', '..X', '.X.', '.X.', 'X..', 'X..'],
    'culling': ['XX.', 'XXX', 'XX.', '.X.', '.X.', '.X.', '.X.'],
    'surging': ['...', '.X.', 'X.X', '...', '.X.', 'X.X', '...'],
}

NAMES = {
    'piercing': {'power': 'Impaler', 'poison': 'Stinger', 'frost': 'Icelance', 'fire': 'Sunspear', 'lightning': 'Stormlance',
                 'swift': 'Dart', 'heavy': 'Battering Ram', 'twin': 'Pitchfork', 'leech': 'Bloodlance', 'volatile': 'Shrapnel',
                 'precise': 'Bodkin', 'frenzied': 'Barrage', 'guarding': 'Spearwall', 'lasting': 'Longspear', 'fleeting': 'Flicker',
                 'vast': 'Broadspear', 'pulling': 'Gaff', 'splitting': 'Trident', 'hexing': 'Witchpin', 'stilling': 'Stake',
                 'binding': 'Skewer'},
    'bleeding': {'power': 'Gore', 'poison': 'Gangrene', 'frost': 'Rimeblood', 'fire': 'Bloodfire', 'lightning': 'Galvanic',
                 'swift': 'Lacerate', 'heavy': 'Bludgeon', 'twin': 'Fangs', 'leech': 'Bloodfeast', 'volatile': 'Bloodburst',
                 'precise': 'Artery', 'frenzied': 'Bloodrage', 'guarding': 'Thornshield', 'lasting': 'Hemorrhage',
                 'fleeting': 'Papercut', 'vast': 'Bramble', 'pulling': 'Fishhook', 'splitting': 'Thornspray', 'hexing': 'Thorncurse',
                 'stilling': 'Clot', 'binding': 'Briar'},
    'reaping': {'swift': 'Banshee', 'heavy': 'Tombstone', 'twin': 'Revenants', 'leech': 'Ghoul', 'volatile': 'Soulburst',
                'precise': 'Deadeye', 'frenzied': 'Macabre', 'guarding': 'Gravewarden', 'lasting': 'Undying', 'fleeting': 'Fetch',
                'vast': 'Legion', 'pulling': 'Undertow', 'splitting': 'Poltergeist', 'hexing': 'Haunting', 'stilling': 'Limbo',
                'binding': 'Gravebind'},
    'culling': {'power': 'Guillotine', 'poison': 'Nightshade', 'frost': 'Coldcut', 'fire': 'Cremate', 'lightning': 'Smite',
                'swift': 'Coup', 'heavy': 'Crusher', 'twin': 'Scissors', 'leech': 'Bloodprice', 'volatile': 'Deathburst',
                'precise': 'Mercy', 'frenzied': 'Massacre', 'guarding': 'Last Rites', 'lasting': 'Deathwatch', 'fleeting': 'Quietus',
                'vast': 'Purge', 'pulling': 'Gallows', 'splitting': 'Decimate', 'hexing': 'Condemn', 'stilling': 'Final Hour',
                'binding': 'Noose'},
    'surging': {'power': 'Tremor', 'poison': 'Pestilence', 'frost': 'Blizzard', 'fire': 'Nova', 'lightning': 'Thunderclap',
                'swift': 'Rush', 'heavy': 'Seismic', 'twin': 'Pulse', 'leech': 'Heartbeat', 'volatile': 'Overload', 'precise': 'Lens',
                'frenzied': 'Crescendo', 'guarding': 'Bastion', 'lasting': 'Resonance', 'fleeting': 'Spark', 'vast': 'Tsunami',
                'pulling': 'Vortex', 'splitting': 'Ricochet', 'hexing': 'Hexwave', 'stilling': 'Lull', 'binding': 'Tangle'},
}
PAIR_NAMES = {('piercing', 'bleeding'): 'Harrow', ('piercing', 'reaping'): 'Wraithspear', ('piercing', 'culling'): 'Deathblow',
              ('piercing', 'surging'): 'Breakthrough', ('bleeding', 'reaping'): 'Bloodharvest', ('bleeding', 'culling'): 'Butcher',
              ('bleeding', 'surging'): 'Bloodwave', ('reaping', 'culling'): 'Harvest', ('reaping', 'surging'): 'Soulstorm',
              ('culling', 'surging'): 'Deathknell'}

# WHAT THE OTHER RUNE BRINGS, CARRIED: "carrying ___"; its idea "with ___"
CARRY = {'power': 'more force', 'poison': 'poison', 'frost': 'a chill that freezes on the second',
         'fire': 'fire that sets them burning', 'lightning': 'lightning that arcs on to the next enemy', 'heavy': 'a stun',
         'twin': 'a second strike', 'volatile': 'a burst', 'precise': 'a certain critical',
         'lasting': 'a lingering that makes what ails them last longer', 'vast': 'a wider strike', 'pulling': 'a pull toward you',
         'splitting': 'a split to two more enemies', 'hexing': 'a curse', 'stilling': 'a stillness that slows their attacks',
         'binding': 'a root that holds them', 'bleeding': 'bleeding', 'piercing': 'a strike through to the one behind',
         'reaping': "death's hold, so that any it kills rises as a spirit", 'culling': 'a cull of the weak',
         'surging': 'a shockwave'}
# (what it gives him, where the other rune is one that gives him something: "gives you ___")
SELF = {'swift': 'haste', 'leech': 'life back', 'frenzied': 'frenzy', 'guarding': 'a shield', 'fleeting': 'time off your waits'}
WITH = {'power': 'force', 'poison': 'poison', 'frost': 'frost', 'fire': 'fire', 'lightning': 'lightning', 'swift': 'speed',
        'heavy': 'weight', 'twin': 'a second blow', 'leech': 'a thirst', 'volatile': 'a blast', 'precise': 'certainty',
        'frenzied': 'frenzy', 'guarding': 'a shield', 'lasting': 'a lingering', 'fleeting': 'haste', 'vast': 'reach',
        'pulling': 'a pull', 'splitting': 'a split', 'hexing': 'a curse', 'stilling': 'a stillness', 'binding': 'a binding',
        'bleeding': 'blood', 'piercing': "a spear's reach", 'reaping': 'the dead', 'culling': 'the cull', 'surging': 'a surge'}
TAG = {'piercing': 'Through them all', 'bleeding': 'Open wounds', 'reaping': 'The dead rise', 'culling': 'The weak end',
       'surging': 'A wave round you'}
FRONT = {'piercing': ('goes through everything in its path, carrying {c} into each enemy it goes through',
                      'goes through everything in its path, and each enemy it goes through gives you {s}'),
         'bleeding': ('makes enemies bleed, worse while they move; each fresh wound carries {c}',
                      'makes enemies bleed, worse while they move; each fresh wound gives you {s}'),
         'reaping': ('kills leave a soul that takes time off your cooldowns and flies at the nearest enemy, carrying {c}',
                     'kills leave a soul that takes time off your cooldowns and gives you {s}'),
         'culling': ('enemies left nearly dead by its hit die outright, and the killing blow bursts out to those near, carrying {c}',
                     'enemies left nearly dead by its hit die outright, and each one culled gives you {s}'),
         'surging': ('every third use releases a shockwave round you, carrying {c}',
                     'every third use releases a shockwave round you that gives you {s}')}
BEHIND = {'piercing': ('a lance of light strikes down its line a moment later, carrying {c}',
                       'a lance of light strikes down its line a moment later, and each enemy it strikes gives you {s}'),
          'bleeding': ('leaves thorns that cut whatever walks through, carrying {c}',
                       'leaves thorns that cut whatever walks through; each cut gives you {s}'),
          'reaping': ('kills raise a spirit that fights for you; its blows carry {c}',
                      'kills raise a spirit that fights for you; its blows give you {s}'),
          'culling': ("leaves a reaper's mark that culls the first weak enemy to cross it, and the cull bursts out to those near, carrying {c}",
                      "leaves a reaper's mark that culls the first weak enemy to cross it; each one culled gives you {s}"),
          'surging': ('your dodge releases a surge, carrying {c}', 'your dodge releases a surge that gives you {s}')}


def says(t, hc, p):
    f = t[hc][1] if p in SELF else t[hc][0]
    return f.format(c=CARRY.get(p, ''), s=SELF.get(p, ''))


def foe(a, b):
    return W[a]['monsterText'] + ' ' + W[b]['monsterText']


RANK2 = {'piercing': ('Goes through everything in its path, farther, and strikes what it goes through harder.',
                      'A lance of light strikes down its line a moment later, wider and harder.',
                      'Its shots fly through walls to reach you, and strike harder.'),
         'bleeding': ('Makes enemies bleed half as hard again, worse while they move.',
                      'Leaves wider thorns that cut half as hard again.',
                      'Its blows make you bleed, half as hard again.'),
         'reaping': ('Kills leave a soul that takes more time off your cooldowns.',
                     'Kills raise a spirit that fights harder.',
                     'Rises once after it dies, with more of its life.'),
         'culling': ('Enemies left low by its hit die outright, from higher.',
                     "Leaves a reaper's mark that culls from higher.",
                     'Hits much harder still when you are low.'),
         'surging': ('Every third use releases a greater shockwave round you.',
                     'Your dodge releases a greater surge.',
                     'Sends out a greater shockwave every few seconds.')}


def name_of(w):
    return NICE.get(w, W[w]['name'])


def mix(a, b, t):
    a = [int(a[i:i + 2], 16) for i in (1, 3, 5)]
    b = [int(b[i:i + 2], 16) for i in (1, 3, 5)]
    c = [round(a[i] + (b[i] - a[i]) * t) for i in range(3)]
    # (nothing of his side in the enemy's pink: a pink drawn back to red or violet)
    h, l, s = colorsys.rgb_to_hls(*[x / 255 for x in c])
    deg = h * 360
    if 300 <= deg <= 345 and s > 0.35:
        h = (290 if deg < 322 else 355) / 360
        c = [round(x * 255) for x in colorsys.hls_to_rgb(h, l, s)]
    return '#%02x%02x%02x' % tuple(c)


def glyph(a, b):
    ga = [r.replace('X', 'o') for r in MARK[a]]
    return [ga[k] + '.' + MARK[b][k] for k in range(7)]


def key(n):
    return n.lower().replace(' ', '').replace("'", '')


R6, DOC = {}, []
DOC += ["The High City's Runes Melded", '·',
        "The last group: Piercing, Bleeding, Reaping, Culling and Surging with every other rune and with each other, and each one's level 2. Plundering and Greed never meld; Mirroring, now the rare copier of items, is left out. Reaping with the damage runes was made already (Cinderbrood, Wintergrave, Stormwake, Bogborn, Charnel).",
        "Each one does the work of both its runes, and the High City rune's own act carries the other: what it strikes is set burning, chilled, poisoned, stunned, cursed, dragged, or it quickens, shields or heals you.",
        "Each meld below has its idea in a line, its names on a move, and what it does in front, behind and on enemies, as before."]
for hc in HIGH:
    for p in LOW + WILD + CITY:
        if (hc, p) in DONE:
            continue
        nm = NAMES[hc][p]
        k = key(nm)
        R6[k] = {'name': nm, 'of': [hc, p], 'color': mix(COLOR[p], COLOR[hc], 0.35), 'glyph': glyph(hc, p)}
        on_move = '%s Strike, Strike of the %s' % (nm, nm)
        DOC += [nm, '%s and %s. %s, with %s. On a move: %s.' % (name_of(hc), name_of(p), TAG[hc], WITH[p], on_move),
                'In front: ' + says(FRONT, hc, p) + '.', 'Behind: ' + says(BEHIND, hc, p) + '.', 'On enemies: ' + foe(hc, p)]
for (a, b), nm in PAIR_NAMES.items():
    k = key(nm)
    R6[k] = {'name': nm, 'of': [a, b], 'color': mix(COLOR[b], COLOR[a], 0.5), 'glyph': glyph(a, b)}
    DOC += [nm, '%s and %s. %s, with %s. On a move: %s Strike, Strike of the %s.' % (name_of(a), name_of(b), TAG[a], WITH[b], nm, nm),
            'In front: ' + says(FRONT, a, b) + '; and ' + says(FRONT, b, a) + '.',
            'Behind: ' + says(BEHIND, a, b) + '; and ' + says(BEHIND, b, a) + '.', 'On enemies: ' + foe(a, b)]
for hc in HIGH:
    f, b, m = RANK2[hc]
    DOC += ['%s II' % W[hc]['name'], '%s and %s. %s at level 2. On a move: %s II Strike, Strike of %s II.' % (W[hc]['name'], W[hc]['name'], W[hc]['name'], W[hc]['name'], W[hc]['name']),
            'In front: ' + f[0].lower() + f[1:], 'Behind: ' + b[0].lower() + b[1:], 'On enemies: ' + m[0].lower() + m[1:]]

names = [v['name'] for v in R6.values()]
assert len(names) == len(set(names)), [n for n in names if names.count(n) > 1]
out = ROOT + '/docs/mockups/meld_runes6'
os.makedirs(out, exist_ok=True)
json.dump(R6, open(out + '/runes.json', 'w'), indent=1)
open(ROOT + '/tools/meldshigh/docs_high.txt', 'w').write('\n'.join(DOC) + '\n')
print(len(R6), 'melds,', len(HIGH), 'level 2')
