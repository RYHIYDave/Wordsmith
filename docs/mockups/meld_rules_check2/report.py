# python3 report.py <ranking before.json> <measure after.json> <out report.json>: the report the page is made from: how they were
# scored, what was fixed for all, and for each of the weakest why it was weak (by his Art Rulebook) and what was done.
import json, sys, statistics as st, os
HERE = os.path.dirname(os.path.abspath(__file__))
before = json.load(open(sys.argv[1]))
after_m = json.load(open(sys.argv[2])) if len(sys.argv) > 3 else {}
out = sys.argv[-1]
D = json.load(open(HERE + '/../../../godot/assets/words/melds52.json'))
B = {x['id']: x for x in before}
weak = [x['id'] for x in before if x['group'] != 'first23'][:30]
first23 = [x['id'] for x in before if x['group'] == 'first23']

# (the first 23's medians, as the ranking took them, for the after films)
def pct(v):
    return f'{round(v * 100)}%'

KIND = {
    'stilling': ('its slow in time was drawn as a dial of twelve single dots, five or six pixels across, over what it slowed',
                 'the dial of slowed time is now a real dial: its rim doubled, its quarters bold, its hand lit, at least 11 pixels across'),
    'hexing': ('its curse was three short thorns over what it struck',
               'the curse is now five longer thorns, with the curse\'s light behind them, and its hex circle stands up in twelve spikes, not eight'),
    'binding': ('its hold was one thin rope loop, little wider than what it held',
                'what it holds is bound in two rope loops, wider, drawing tight; its snare on the floor is bigger and doubled'),
    'pulling': ('its drag was a thin streak, its stagger three 3-pixel stars',
                'the stagger is five four-pointed stars turning round its head, twice the size'),
    'splitting': ('on a monster it showed only a soft ball of light on you (How art is made, rule 9: never a plain ball)',
                  'on a monster its shards burst off you instead'),
}
GROUND = ('as it laid its ground behind the Strike, all that showed was a soft glow on the floor, a plain ball of light (rule 9)',
          'as it lays its ground, a flash and its sparks; the ground\'s edge rolls out to where it will stand and its light rises off it')
SPECIAL = {
    'standstill': (['its heavy pulse did not freeze as it landed (Movement 7, heavy blows land with a freeze)', 'on a monster it showed only a soft ball of light on you (rule 9)'],
                   ['its pulse now holds a tenth of a second as it lands', 'on a monster, the dial of slowed time over you, in the enemy\'s colours']),
    'respite': (['in front its moment never showed in its film: it waits on a blow on your shield, and none came (Animations 7, every word its look in front)'],
                ['its film now has a skeleton strike your shield in front, so its moment is seen']),
    'talisman': (['in front its moment never showed in its film: it waits on a blow on your shield, and none came (Animations 7)'],
                 ['its film now has a skeleton strike your shield in front; the curse on the one that struck it is five thorns, and the shield is half again as big']),
    'lasso': ([], ['its rope is thrown in a thicker line and drops over what it hits as two loops drawing tight']),
    'torpor': (['its drowse was three 6-pixel puffs'], ['its drowse is four rolling curls, with the curse\'s thorns and a dial of slowed time over it']),
    'stagnation': (['its held poison was five 1-pixel sparks and a small puff'], ['its poison hangs still round what it holds as bubbles and two curls of fumes, under a dial']),
    'witchknot': (['its knot was a thin loop with two small thorns'], ['a knotted cord binds it twice over, with four thorns out of the knot']),
    'anchor': (['its stun was three 2-pixel sparks circling'], ['its stun is five stars, twice the size; its snare\'s anchor on the floor is half again as big']),
    'stasis': (['its hold was a 5-pixel dial'], ['its hold is a 12-pixel dial over what it holds, with a bigger glow']),
    'whisper': (['as you passed an enemy, its curse was two small thorns'], ['as you pass one, a wisp curls from you to it and four thorns rise on it']),
    'scatter': (['each quick use was counted by a 2-pixel spark'], ['each quick use is counted by a chevron of speed over you, with streaks off you']),
    'omen': (['its curse falling was a short streak'], ['the curse falls on it from high above, a thicker stroke, and flashes as it lands']),
    'pall': (['its curse was three thorns, however many were cursed near it'], ['a veil of shadow is drawn over what it curses, in five dark curls, with five or more thorns']),
    'sap': (['the life it drank was 2-pixel dots'], ['the life it drinks flies to you as drops of blood twice the size']),
    'thrall': (['the life it drained was 2-pixel dots'], ['the life it drains flies to you as drops of blood twice the size']),
    'gullet': (['the life it drank was 2-pixel dots; its life orbs a soft glow'], ['its drink is drops twice the size; its orbs rise in two streams of drops']),
    'eternity': (['its clock was a 9-pixel face'], ['its clock is a 13-pixel face, its rim doubled, its hours bold; its clock on the floor has a second rim and a lit hand']),
    'quickening': (['its after-image was a few grey boxes (rule 9)', 'its ripple was three plain dotted rings (rule 9)'],
                   ['its after-image is your own picture, pixel for pixel, as Blink\'s are', 'its ripple goes out as breaking waves of sound, with streaks off it']),
    'vendetta': (['its flourish was six short slashes 14 to 22 pixels out'], ['its flourish is eight slashes, 20 to 34 pixels out, each with an edge of light']),
    'fetch': (['its spirit\'s moments were small grey wisps and a 7-pixel skull'], ['the skull of the doomed is a sculpted skull twice the size, sockets lit']),
    'undying': (['the hand rising from the ground was a box with four 1-pixel lines (rule 9)'], ['the hand bursting up is a sculpted dead hand: forearm, palm, jointed fingers clawing then closing, thumb, the earth thrown up']),
    'snag': (['its hook and cuff were small'], ['its cuffs on you are doubled; its snare\'s rope is bigger and doubled']),
    'stockade': (['its shield face was 11 pixels tall'], ['its shield face is 18 pixels tall with a lit rim and its boss glinting']),
    'doldrums': (['its slow spreading was a 6-pixel dial'], ['its slow spreading is an 11-pixel dial over it']),
    'rewind': (['its turn back was a 5-pixel dial'], ['its turn back is an 11-pixel dial turning backward']),
    'stutter': (['its caught moment was a 5-pixel dial'], ['its caught moment is an 11-pixel dial, its hand stopping']),
    'whiplash': (['its yank\'s stagger was three 3-pixel stars'], ['its yank\'s stagger is five stars twice the size']),
    'harpoon': (['its yank\'s stagger was three 3-pixel stars'], ['its yank\'s stagger is five stars twice the size']),
    'pinpoint': (['on a monster it showed only a soft ball of light on you (rule 9)'], ['on a monster its shards burst off you']),
    'plague': (['its hex circle stood in eight small spikes'], ['its hex circle stands up in twelve spikes, taller']),
}
STATUS_DONE = ('as it lays its curse, slow or hold, a moment of its own: a flash in its colour, its sparks thrown wide, a front of its kind '
               'rolling out (the curse\'s jagged, slowed time\'s rippling, a hold\'s ringing), and its own symbol, its stone\'s, flaring over what '
               'it struck and rising off it (Pillar 5: wordsmithing glows)')
FOE_DONE = ('on you from a monster, its sparks thrown off you and a front at your feet, in the enemy\'s colours where it curses or slows you, '
            'its mark bigger and lifted clear of your head')
def cap(x): return x[:1].upper() + x[1:]
items = []
for m in weak:
    b = B[m]
    of = D['of'][m]
    why = [f'How much of its own it shows, against the game\'s first 23 (Forking, Siphon, Eruption, Shatter and the rest): {pct(b["front"])} in front, {pct(b["behind"])} behind, {pct(b["foe"])} on a monster (Animations 1: as big, wild, kinetic and weighty as it can be)']
    done = []
    sw, sd = SPECIAL.get(m, ([], []))
    why += sw
    for r in of:
        if r in KIND and r not in ('splitting',):
            why.append(KIND[r][0])
            done.append(KIND[r][1])
    if 'splitting' in of and m not in ('pinpoint',):
        why.append(KIND['splitting'][0]); done.append(KIND['splitting'][1])
    if m in D['city'] or m in D['city2']:
        why.append(GROUND[0]); done.append(GROUND[1])
        done.insert(0, STATUS_DONE)
        done.append(FOE_DONE)
    done += sd
    items.append({'id': m, 'why': [cap(x) for x in dict.fromkeys(why)], 'done': [cap(x) for x in dict.fromkeys(done)]})
SHOW = {
    'bedrock': (['On a monster, its rock never burst up under you: its own stagger had already set your wait before the next hold (Animations 7)', 'Its stone was a plain box (rule 9)'],
                ['Every second blow on you, the rock bursts up, as its words say', 'Its stone is a standing stone heaving up, with dust rolling off its foot; it lands with a kick and a freeze']),
    'doom': (['Its hammer was a box on a stick (rule 9), its kick a fifth of a pixel'], ['A great iron maul with a band of runes drops out of the dark with speed lines over it, lands with a kick and a freeze, and bounces']),
    'transfusion': (['Its orb was a square (rule 9); its pool two plain rings'], ['A globe of blood swirls over you, dripping, then bursts into drops; its pool is a puddle of blood with ripples']),
    'amber': (['Its amber was a flat box (rule 9)'], ['A lump of amber seals what it holds, its faces lit, cracking as it goes']),
    'duelist': (['Its crossed blades were 18 pixels across'], ['Two swords cross over what it challenges and flash where they meet; its duel circle is ringed with blades planted in the floor']),
    'sunder': (['Its torn plates were 6-pixel boxes'], ['Plates of armour tumble off what it strikes, rivets and all, with a flash']),
    'wraithstep': (['Its after-image was a few grey boxes (rule 9)'], ['Its after-image is your own picture, pixel for pixel, as Blink\'s are']),
    'deathwatch': (['The reaper\'s shadow was 26 pixels tall'], ['The hooded reaper stands half again as tall, its eyes burning; its scythe sweeps wider']),
    'pitchfork': (['Its pitchfork was 14 pixels across'], ['A pitchfork drives down onto what it strikes, its tines tapering to bright points, sparks where they bite; on a monster, no glow near your cyan']),
    'crusher': (['Its heavy landing did not freeze, and kicked half a pixel'], ['It lands with a freeze and a 3-pixel kick']),
    'condemn': (['Its curse\'s eye was 11 pixels across'], ['The curse\'s eye is 21 pixels across, with lids and lashes']),
    'limbo': (['Its dial of slowed time was 6 pixels across'], ['Its dial is twice the size, and the soul it raises rises bigger']),
    'gravebind': (['Its chain was four 4-pixel links'], ['A cuff and a chain of links lying flat and on their edge, twice the size']),
    'haven': (['On a monster it glowed cyan-grey, near your friend\'s cyan (Pillar 4)'], ['On a monster it shows in Frost\'s deep blue']),
}
shown = []
for m, (w, d) in SHOW.items():
    d = list(d)
    b = B.get(m)
    w = ([f'How much of its own it shows, against the first 23: {pct(b["front"])} in front, {pct(b["behind"])} behind, {pct(b["foe"])} on a monster'] if b else []) + list(w)
    shown.append({'id': m, 'why': w, 'done': d})
def mean(xs): return sum(xs) / len(xs)
SUMMARY = ''
if after_m:
    SUMMARY = (f' Measured again after the fixes, the 30 weakest rose from {pct(mean([B[m]["score"] for m in weak]))} of the first 23 to '
               f'{pct(mean([after_m[m]["score"] for m in weak]))} on average: in front {pct(mean([B[m]["front"] for m in weak]))} to '
               f'{pct(mean([after_m[m]["front"] for m in weak]))}, behind {pct(mean([B[m]["behind"] for m in weak]))} to '
               f'{pct(mean([after_m[m]["behind"] for m in weak]))}, on a monster {pct(mean([B[m]["foe"] for m in weak]))} to '
               f'{pct(mean([after_m[m]["foe"] for m in weak]))}.')
rep = {
    'checked': len(before),
    'scoring': ('How each was scored: every film set frame by frame beside a film of the plain Strike with no meld, so what is counted is what the meld '
                'itself adds: how much of the screen its light and shapes cover, at its peak and over time, in front, behind and on a monster. '
                'Each meld is set against the game\'s first 23 (the ten, Volatile\'s five and the eight: Forking, Siphon, Eruption, Shatter and the '
                'rest), in front and behind counted twice. Then the painters were read for the rest of the rulebook: plain balls, boxes and rings '
                '(rule 9), the freeze on heavy blows (Movement 7), the screen\'s kick, nothing covering the hero (none did), each look in front, behind '
                'and on a monster (Animations 7), and the friend\'s cyan on a monster (Pillar 4). The weakest by far are the city\'s melds that slow, '
                'curse or hold: what they do is real, but all you saw was a tiny mark. '
                'The measure counts every bright pixel, so fire, lightning and blasts score highest; a curse or a slow will never burn like Eruption, '
                'so the numbers move less than the films do. Watch the films.' + SUMMARY),
    'for_all': [
        'The screen kick on the High City\'s and the redone melds\' big moments was less than one pixel (0.2 to 0.55), so you never felt it. It is now 1.2 to 3.3 pixels, as the game\'s own melds kick (Volatile\'s 3 to 11, the city\'s 1.5 to 3).',
        'Heavy blows land with a freeze (Movement 7): the High City\'s Heavy and Volatile melds (Battering Ram, Fuse, Mangle, Bloodburst, Tombstone, Soulburst, Crusher, Deathburst, Seismic, Overload) and Standstill now hold a tenth of a second as they land, as the rest do; so do the things the redone melds drop (Doom\'s maul, the weights, Pin\'s spike, Bedrock\'s stone).',
        'The redone melds\' own things were plain boxes and rings (rule 9). Now each is drawn as the thing it is, and bigger: Doom\'s great iron maul with a band of runes; iron weights with their rings for Doom and Burden; Duelist\'s crossed swords and a ring of blades planted in the floor; a lump of amber cracking; a globe of blood over you, then a pool of blood; boils swelling and bursting; armour plates with rivets tumbling off; standing stones heaving up; darts with flights; a target\'s face; Ambush\'s sight closing in; the roars as breaking waves; Windward\'s whirl as ribbons of wind.',
        'The marks the High City\'s and the redone melds share were 3 to 8 pixels across. Now about twice the size and shaped: four-pointed stun stars, the curse\'s eye with its lids and lashes, a sculpted skull, the dial of slowed time, the cuff and chain, drops of blood, the shield\'s face, the bell and its toll. A cloud is now rolling smoke, not three soft balls of light; speed is streaks with bright heads; the life drawn is six bigger drops.',
        'After-images (Wraithstep, Quickening, Timeslip, Blur) are now your own picture, pixel for pixel, as Blink\'s are, not a few grey boxes.',
        'The High City\'s named things drawn bigger and bolder: the pitchfork, the shears, the fangs, the stake, the needle and its thread, the ghoul\'s maw, the thorns, the whirl of blades, the reaper\'s hood and scythe, the slashes, the row of spears, the barb. The wail and the flood of light are breaking waves and rays now, not plain rings.',
        'The city\'s marks (both groups) made bigger: the curse\'s thorns, the dial of slowed time (a real dial, not twelve dots), stun stars, rope loops, snares and anchors; the moment each lays its ground now rolls out its edge with a flash, not a soft glow; and a monster carrying one now lays its own mark on you, never a plain ball of light.',
        'Nothing over you (Animations 4): the shields\' faces now stand over your head, not across your body; Pitchfork\'s fork drives down ahead of you, where its second prong goes, not on you; Bedrock\'s rock bursts up round your feet; the dials and thorns a monster lays on you sit clear above your head.',
        'No glow near a friend\'s cyan on a monster (Pillar 4): Haven and Hydra now show in Frost\'s deep blue when a monster carries them, as the icy ones already do, and Pitchfork, Tremor, Last Rites, Revenants, Rewind and Scissors in a deep green.',
        'Faults found on the way, each a moment on a monster that never came (Animations 7): Bedrock\'s rock never burst up under your feet, and Pin\'s spike and Amber\'s seal never came, because the rune\'s own stagger or root had already set your wait before theirs. Fixed: Bedrock staggers you again, Pin\'s spike holds you longer and Amber seals your feet, as their words say. And Talisman\'s and Respite\'s films now have a skeleton strike your shield, so their moment in front is seen.',
    ],
    'your_call': [
        'Two melds\' own colours sit close to the enemy\'s pink on your side: Doom (#a03850) and Rimeblood (#c83c50). Bloodbloom and Mayhem were moved to a blood red at your yes on 23 Nov. Should these two go the same way, with their stones redrawn?',
    ],
    'weakest': items,
    'shown': shown,
}
json.dump(rep, open(out, 'w'), indent=1)
print('weakest', len(items))
