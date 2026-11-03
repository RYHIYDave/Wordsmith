# Floors 11 to 15: more action (mock-ups; branch `art/action-f11`)

An art helper's branch, from `art/action-f9-stag` at 3162e05 (floors 1 to 10's new moves). Nothing here is in the game until the main
chat puts it there, on his yes. All four are **behind switches that are off**: with them off every frame the game shows of the Hushed
watch, the reapers and gleaners, the orderlies and the Bookwardens is the same, pixel for pixel (hashes below).

## His words

His review of every enemy for more action, 31 Oct 2026; each offered as below, his answers quoted:

- THE HUSHED WATCHMAN (floor 11, medium), “Yes (Recommended)” to: “His basic becomes a halberd chop. Lantern throw, in place of the spin:
  he hurls his lantern, which smashes into a spreading pool of burning oil.”
- THE HUSHED REAPER AND GLEANER (floor 13, small), “Yes (Recommended)” to: “Harvest: three sweeping sickle cuts, stepping in with each. The
  last is a leap that hooks the sickle into the ground in a burst of chaff.”
- THE ORDERLY (floor 14, medium), “Yes (Recommended)” to: “Gurney charge, in place of the leap: shoves an iron gurney down a marked lane
  at you. It careers on and crashes into whatever it hits.” Its mallet blow tightened by Movement 9.
- THE BOOKWARDEN (floor 15, medium): offered “Book barrage, in place of the page fan: hurls an armful of heavy books high, and they rain
  down over a marked patch where you stood”, he answered “I like the book barrage but it’s more just a rapid series of projectiles”.
  Read as: books flung at you one after another in a rapid stream, not a rain on a patch. Its tome slam tightened by Movement 9.
- Under his rules already given: his rulebook's Monsters 9, Action, like a movie; Movement 9, 24 Oct (“Like the wind up and wind down are
  big but the actual punch is lightning quick”), and for the enemies, 28 Oct (“Start from now on, but every enemy is going to need that
  change eventually.  And bigger AOE to compensate for the extra time the player gets to evade”). Small mobs keep one attack, medium two
  (his rule of 9 Oct). The Hushed keep their grey breath and dull pink eyes, and are people again when the Hush leaves them (the game's
  own deaths, kept).

## The pictures (`pictures/`)

- `action_f11.mp4` (1200 × 676, 58.9 s, 30 fps, H.264 yuv420p, captioned): each new move with the knight, from in front and from behind,
  then its strike at half speed: the watchman's chop and lantern throw on a stand-in for floor 11's streets (setts); the reaper's harvest
  on floor 13's fields; the orderly's mallet blow and gurney charge on floor 14's ward (deal boards: the gurney crashes on the knight from
  in front, and from behind he gets out of the lane and it crashes at the lane's end); the Bookwarden's tome slam and book barrage on
  floor 15's library (dark boards, a carpet runner: the knight runs across the stream and the books pass behind him).
- `action_f11_sheet.png` (1200 × 7412): each move's six key moments; each in its scene with the knight (from in front and from behind);
  and EACH OLD MOVE BESIDE ITS NEW at the same scale (the sweep and the chop, the round sweep and the throw, the slash and the harvest, the
  old mallet blow and the new, the quake and the gurney charge, the old tome slam and the new, the page storm and the barrage).

## THE HUSHED WATCHMAN (`WATCH_LANTERN`, art/action_f11_watch.ts)

**THE HALBERD CHOP** (their basic blow, in place of the sweep). He takes the halberd up in both hands and heaves it back over his head,
its head far back, his body arched back, his left foot stepped forward, and HOLDS it there, shaking, its blade glinting pink (its reach
marked on the floor). In TWO FRAMES it comes over the top, smeared (after-images of its head and spike), and its head BITES THE FLOOR
before him: a flash and sparks off the blade, cracks starring out, a ring of grit to its reach with the enemy's pink at its edge, and the
floor SPLITS on from the bite along the way it fell, jagged, black, its lips pink, stones thrown up all along it. Stuck, he wrenches at it
twice, wrenches it out, and stands it again.

| | |
|---|---|
| the move (`clips.attack`) | **2.1 s**, 64 frames; its `hit` the bite, **0.867 s** (frame 26) |
| the wind-up | taken up by 0.14 s, heaved back by 0.4 s; **HELD**, shaking, to 0.8 s (0.4 s; the sweep's warning 0.3 s) |
| the strike (`CHOP_STRIKE`) | **two frames**, smeared: over the top (frame 25), in the floor (frame 26) |
| the wind-down | stuck, wrenched at, to 1.2 s; out by 1.36 s; upright 1.7 s; at rest 2.1 s |
| THE BITE (`biteAt()`, `CHOP.r`) | its blade in the floor **2.0 tiles** before him; a hero within **1.3 tiles** of there is struck |
| THE SPLIT (`CHOP.from`, `split`, `half`; `chopStrikes`) | on from **0.4 to 4.0 tiles** before him, **0.7** to either side (the sweep reached 2.6 round its arc); knocked `CHOP.knock` 0.6 |
| what it leaves (`bitePainted`) | the split and cracks, fading by **1.6 s** |

**THE LANTERN THROW** (in place of the round sweep). He keeps his halberd standing in his right hand; his left takes the LANTERN off his
belt (a little iron-and-horn lantern, lit, hung behind his left hip in every move now) and swings it back and up high behind his head,
his body wound away, and HOLDS it there, the lantern flaring, sparks spitting off it. In TWO FRAMES his arm whips over and it is lobbed
high, smeared. It flies high, turning over, its flame streaming, its shadow on the floor under it and where it will come down marked; it
SMASHES (a flash, its horn and iron flung, a ball of oil-fire bursting up and out) and the oil SPREADS into a pool of burning oil: black,
a carpet of fire licking up off it, taller at its ragged edge, embers and smoke rising, its edge dotted with the enemy's pink; burning a
good while, then dying down. Ground taken away. Warm oil-fire orange and the enemy's pink, never cyan. He reaches behind his back for
another lantern and hangs it at his hip.

| | |
|---|---|
| the move (`clips.moves.lantern`, in place of `round`) | **2.4 s**, 73 frames; its `hit` the throw, **0.933 s** (frame 28) |
| the wind-up | off the belt by 0.34 s; swung back high by 0.52 s; **HELD**, flaring, to 0.867 s (0.35 s) |
| the strike (`LOB_STRIKE`) | **two frames**, smeared: over (frame 27), lobbed (frame 28) |
| the wind-down | his arm on down after it to 1.12 s; another lantern from the back of his belt at 1.6 s, hung by 1.92 s; at rest 2.4 s |
| its flight (`lobFrom()`, `lobFly(d)`, `lobArc(d)`) | from his hand (0.57 tiles before him, 43 picture pixels up); **0.5 + 0.06 d s** (0.8 s at 5 tiles); **50 + 6 d** picture pixels over the straight way (80 at 5); aimed where the hero stands as it leaves his hand |
| THE SMASH (`POOL.burst`) | a hero within **1.4 tiles** as it lands is struck |
| THE BURNING OIL (`POOL.r`, `spread`, `burn`, `fade`; `inOil`, `oilPainted`) | spreading to **1.9 tiles** round in 0.35 s; burning **6 s**, dying down over its last 1.0 s; a hero in it burned tick by tick (the rules') |
| near, far | thrown at a hero from 2 to 8 tiles off |

## THE HUSHED REAPER AND GLEANER: THE HARVEST (`FIELD_HARVEST`, art/action_f11_field.ts)

The sickle raised over the right shoulder, the body wound round, HELD, glinting pink. In TWO FRAMES a sweeping cut down and across, right
to left, the left foot stepping in, smeared; carried through low; whipped up over the left shoulder, a beat; in TWO FRAMES the backhand,
left to right, the right foot stepping in past the left, smeared; carried through; then crouched deep, the sickle up high over the head,
HELD; in TWO FRAMES a LEAP, both feet off the floor, and the sickle HOOKED DOWN INTO THE GROUND before them as they land in a deep lunge,
smeared: a burst of CHAFF (straw, husks and grain flung up in a fountain, the corn's dust, a ring rolling out with the enemy's pink at its
edge, the chaff lying strewn). Wrenched at, wrenched out, straightened, on where they landed. Their one attack (small, his rule).

| | |
|---|---|
| the move (`clips.attack`, in place of the slash) | **2.95 s**, 89 frames; its `hit` the hook, **1.833 s** (frame 55) |
| the wind-up | raised by 0.28 s; **HELD**, shaking, to 0.6 s (0.32 s; the slash's 0.2 s) |
| CUT ONE (`HARVEST_STRIKES[0]`) | **two frames**, smeared (frames 19 and 20, 0.667 s); carried through to 0.79 s |
| a beat | up over the left shoulder by 1.0 s, held to 1.1 s |
| CUT TWO (`HARVEST_STRIKES[1]`) | **two frames**, smeared (frames 34 and 35, 1.167 s); carried through to 1.29 s |
| crouched | by 1.62 s; **HELD** to 1.767 s |
| THE LEAP AND THE HOOK (`HARVEST_STRIKES[2]`) | **two frames**, smeared (frames 54 and 55, 1.833 s) |
| the wind-down | wrenched at to 2.1 s; out by 2.38 s; straightened, on where they landed, by 2.95 s |
| stepping in (`HARVEST.travel`, `harvestOn(t)`) | they go **0.77 tiles** on through it (at each blow 0.15, 0.41 and 0.74 tiles on); the picture goes on within its own canvas, and the game moves them on by `HARVEST.travel` as it ends |
| struck by each cut (`HARVEST.cut`; `harvestStrikes(0 or 1, …)`) | a strip from them **to 1.9 tiles** before them, **1.0** to either side (the slash's: to 1.4, 0.7 to their right and 0.45 to their left) |
| struck by the hook (`HARVEST.r`, `hookAt()`) | within **1.5 tiles** of where it goes in (1.26 tiles on from where they began) |
| what it leaves (`chaffPainted`) | the chaff, gone by 1.8 s |

## THE ORDERLY (`ORDERLY_GURNEY`, art/action_f11_orderly.ts)

**THE MALLET BLOW, BY MOVEMENT 9** (their basic blow, kept): lifted off the shoulder and raised high over the head in both hands, the left
foot stepped in, by 0.36 s; **HELD**, shaking, its hoops glinting pink, to 0.8 s (0.44 s; was 0.28 s); in **two frames** over the top and
into the floor, smeared (frames 25 and 26, its blow and the floor at **0.867 s**; was the blow at 0.833 s, in the floor at 0.9 s, five
frames down); bent over it to 1.4 s; heaved up by 1.8 s; on the shoulder by **2.3 s**. Its head goes into the floor 1.44 tiles before
him (`blowAt()`); a hero within **1.5 tiles** of there (`BLOW9.r`; the game's 0.75), or in its way there (0.3 tiles on, 0.7 to either
side), is struck and knocked back 0.6 (`blowStrikes`). Its dust and splinters, and the game's mark, as before.

**THE GURNEY CHARGE** (in place of the quake). An iron gurney stands before him (the House of Quiet's: an iron frame, a grey sheet and
leather straps over it, braced legs on casters, a push-bar). THE LANE is marked from it, through where you stood, to its end (dashed edges
and chevrons of the enemy's pink, the golem's). Both hands on his mallet, he swings it back and up behind him, wound round to the right,
crouched on the back foot, and HOLDS, its hoops glinting. In TWO FRAMES he swings it down past his hip and its head SLAMS into the gurney's
end, smeared. The gurney careers off down the lane at once, heavy, rattling (jolting on its casters, its wheels spinning), FAST, and
CRASHES into whatever it hits (pitched up over its front end and flung onto its side, a flash and sparks of iron, a caster, bolts and
splinters flung, a ring of dust with the enemy's pink at its edge), or at the lane's end. He follows through, bent after it, and heaves
the mallet back up onto his shoulder.

| | |
|---|---|
| the move (`clips.moves.gurney`, in place of `quake`) | **2.3 s**, 70 frames; its `hit` the slam, **0.967 s** (frame 29) |
| the gurney (`GURNEY.at`, `long`, `wide`; `gurneyPainted`) | stands before him, its middle **1.67 tiles** on, **1.48 long**, 0.61 across; its end where the mallet's head strikes |
| its aim (`GURNEY.aim`) | where the hero stands at **0.3 s**: the lane is marked from then, **0.67 s** before the slam |
| THE LANE (`GURNEY.lane`, `half`) | **10 tiles** long from him, **1.6 wide** |
| the wind-up | the mallet off the shoulder by 0.2 s; swung back by 0.5 s; **HELD**, to 0.9 s (0.4 s) |
| the strike (`GURNEY_STRIKE`) | **two frames**, smeared: down past his hip (frame 28), into the gurney (frame 29) |
| its run (`GURNEY.pace`, `slow`; `gurneyGone(t)`) | off at **9 tiles a second** at once (he runs 4.6), slowing a little: 4.3 tiles in 0.5 s, 8.1 in 1 s |
| struck (`gurneyStrikes`) | a hero in the lane as it comes by is struck and it CRASHES on him |
| THE CRASH (`GURNEY.r`, `knock`; `crashPainted`) | a hero within **1.5 tiles** is struck and knocked back a whole heavy blow's step; its wreck lies 1.6 s |
| the wind-down | bent after it to 1.3 s; heaved up by 1.75 s; on the shoulder by 2.3 s |
| near, far | begun at a hero from 2.5 to 8 tiles off |

## THE BOOKWARDEN (`WARDEN_BARRAGE`, art/action_f11_warden.ts)

**THE TOME SLAM, BY MOVEMENT 9** (their basic blow, kept): the game's own whirl over the head, the body **HELD** while the tome whirls, to
0.8 s (a breath slower, so that all its speeding over the top is in the strike); its over-the-top, five frames in the game's (0.8 to 0.967
s), now **two frames**, smeared (frames 25 and 26: flat on the floor at **0.867 s**, its `hit`); the rest the game's own, from the floor:
held there, dragged back up, hanging again by **2.1 s** (`slamWarp(t)`: the game's moment for each of this one's). Its dust: a hero within
**1.7 tiles** of the book's middle (the game's 1.2), stretched as the game's (1.15 of it out of its sides, 0.8 along their way), is
struck (`SLAM9`, `slamStrikes`).

**THE BOOK BARRAGE** (in place of the page storm). His left hand thrown up and drawn back over his shoulder, and THE BOOKS are torn up
off the floor round him (nine heavy books: black, oxblood and dull green leather, brass at their corners), the Hush pouring grey and pink
from his hand into them; they wheel round him at head height, faster and faster, and he HOLDS, trembling, their brass glinting pink. In
TWO FRAMES he thrusts his hand out at you, smeared, and the books are FLUNG AT YOU ONE AFTER ANOTHER, a rapid stream, each straight at
where you are as it goes (so the stream follows you), a little fanned, each turning over and smeared (after-images along its way, its
leading edge the enemy's pink); you dodge across the stream. They come down, skid and lie a moment.

| | |
|---|---|
| the move (`clips.moves.barrage`, in place of `storm`) | **2.5 s**, 76 frames; its `hit` the thrust, **1.067 s** (frame 32) |
| the wind-up | his hand up by 0.4 s; the books rising from 0.12 s, wheeling by 0.6 s; **HELD** to 1.0 s (0.6 s) |
| the strike (`BARRAGE_STRIKE`) | **two frames**, smeared: thrust (frames 31 and 32) |
| THE STREAM (`BARRAGE.n`, `every`, `pace`, `fan`, `far`; `bookAt(i, t, aim)`, `bookGoes(i)`) | **9 books**, one every **0.08 s** from the thrust (the last at 1.71 s); each at where the hero is as it goes, fanned up to 4° off it; **11 tiles a second**, to **8.5 tiles**; then down, skidding, lying 1.2 s |
| struck (`BARRAGE.r`; `bookStrikes`) | a hero within **0.5 tiles** of a book as it comes by is struck by it (each book a blow of its own: how hard, the rules') |
| the wind-down | his hand out, trembling, to 1.75 s; lowered by 2.1 s; at rest 2.5 s |
| near, far | begun at a hero from 2 to 8 tiles off |

## The switches, and bringing it in

- `WATCH_LANTERN` (art/action_f11_watch.ts), `FIELD_HARVEST` (art/action_f11_field.ts), `ORDERLY_GURNEY` (art/action_f11_orderly.ts),
  `WARDEN_BARRAGE` (art/action_f11_warden.ts), all `{ on: false }`. The makers: `makeLanternWatchArt(mob)` (`LANTERN_WATCHMAN`,
  `LANTERN_SERGEANT`), `makeHarvestArt(mob)` (`HARVEST_REAPER`, `HARVEST_GLEANER`), `makeGurneyOrderlyArt()`, `makeBarrageWardenArt()`: each
  the game's own figure (from its own maker) with only its new moves put in (tested frame for frame), but the watch, who wear the lantern
  at the belt in every move now. Their old moves stay in their own files, out of the new sets.
- Hashes of every frame the game shows of the four (tools/action_f11_hash.ts, through art/act1_figs/), on 3162e05 and on this branch, the
  same: watch `c3413bcd1a90928e`, fieldhand `daaa89f2fb62922b`, orderly `e439e6af0e3c0014`, bookwarden `e163b6c454bcb810` (tested).
- To bring it in (the main chat's; the files are mock-ups: move what each needs into the game's own as the art chat's work is brought in):
  - THE WATCH: art/act1_figs/watch.ts `make: () => WATCH_LANTERN.on ? makeLanternWatchArt(LANTERN_WATCHMAN) : ...`, its `looks` the same
    with `LANTERN_SERGEANT`; in game/act1_rules/watch.ts the sweep's act becomes the chop, `long` 2.1, `hit` `CHOP_HIT`: at the hit,
    `chopStrikes` (the bite within `CHOP.r` of `biteAt()`, the split to `CHOP.split`, `CHOP.half` aside), knocked `CHOP.knock`; the mark
    `bitePainted(t, 'floor' | 'air', fx, fy, side)` at the bite for `CHOP.seen`. The round's act becomes the lantern, clip `lantern`,
    `long` 2.4, `hit` `LOB_HIT`, `near`/`far` 2/8: the lantern from `lobFrom()` to where the hero stands then, `lobFly(d)`, `lobArc(d)`,
    drawn by `lanternFlying(t)` over `lanternShadow(u)`, where it lands marked (`POOL.burst`); struck within `POOL.burst` as it lands; the
    oil a peril `POOL.r` round for `POOL.burn` (`inOil`), burning tick by tick as the firepot's floor; drawn by `oilPainted`. Its cooldown
    the round's (7 s).
  - THE FIELDHANDS: art/act1_figs/fieldhand.ts `make: () => FIELD_HARVEST.on ? makeHarvestArt(HARVEST_REAPER) : ...`, its look with
    `HARVEST_GLEANER`; in game/act1_rules/fieldhand.ts the slash's act becomes the harvest, `long` 2.95, `hit` `HARVEST_HIT`, `far` 2.6;
    at each of `HARVEST_HITS` strike by `harvestStrikes(k, …)` (the cuts each a blow; the hook the biggest), the chaff `chaffPainted` at
    `hookAt()`; and as it ends, move them on `HARVEST.travel` tiles the way they face (the picture has gone on within its canvas).
  - THE ORDERLY: art/act1_figs/orderly.ts `make: () => ORDERLY_GURNEY.on ? makeGurneyOrderlyArt() : makeOrderlyArt3()`; in
    game/act1_rules/orderly.ts the blow's `long` 2.3, `hit` and `floor` both `BLOW_HIT`, `r` 1.5 (`blowStrikes`), knock 0.6; the quake's act
    becomes the gurney, clip `gurney`, `long` 2.3, `hit` `GURNEY_HIT`, `near`/`far` 2.5/8: at `GURNEY.aim` take the way to the hero and lay
    the lane (art/action_f6_golem.ts `lanePainted(..., GURNEY.lane, GURNEY.half)`); a gurney drawn by `gurneyPainted` standing `GURNEY.at`
    before him; from the hit carry it down the lane by `gurneyGone(t)` (to a wall or the lane's end), striking a hero by `gurneyStrikes`,
    crashing there (`gurneyPainted(…, crash)`, `crashPainted`), struck within `GURNEY.r` and knocked `GURNEY.knock`. Its cooldown the
    quake's (7 s).
  - THE BOOKWARDEN: art/act1_figs/bookwarden.ts `make: () => WARDEN_BARRAGE.on ? makeBarrageWardenArt() : makeBookwardenArt3()`; in
    game/act1_rules/bookwarden.ts the slam's `long` `SLAM9.long` (2.1), `hit` and `floor` both `SLAM_HIT`, its dust `SLAM9.reach` 1.7 (the
    same stretch; `slamStrikes`); the storm's act becomes the barrage, clip `barrage`, `long` 2.5, `hit` `BARRAGE_HIT`, `near`/`far` 2/8:
    each book `i` from `bookGoes(i)` at where the hero is then (`bookAt(i, t, aim)`), drawn by `bookPainted(spin, cover, lying, glint)` at
    its height with `bookStreak` behind it, each striking by `bookStrikes` once. Its cooldown the storm's (7 s).
  - Damage, knock and cooldowns are the rules'.

## The checks

`tests/action_f11.test.ts` (5 tests, all pass):

1. the switches off; nothing of the game imports the mock-ups; the game's frames of the four hash as on 3162e05; with the new art, every
   list the game's own but the new moves (the watch: the lantern now in every move); the throw in place of the round sweep, the gurney in
   place of the quake, the barrage in place of the page storm;
2. every frame of every new move (and the watch's stand, walk and struck, with the lantern), both ways round, of all six figures (the
   watchman and the sergeant, the reaper and the gleaner, the orderly, the Bookwarden): paints, wears the enemy's pink edge, is crisp, has
   no cyan, nothing cut off;
3. **all four through the bosses' review** (art/boss_checks.ts `checkBoss`, on the heroes' bones; their shapes the game's own, with their
   strikes and smears, in tests/action_f11_shapes.ts; the lantern as a thing they carry; the harvest a combo of three blows, each reviewed as one, ending 0.77 tiles on
   where the game hands it back to the stand; the slam's tome where the game's warped time puts it), from in front and from behind, every
   move of theirs and every handing over: **nothing found**; Movement 9 (two-frame strikes, held 0.3 s and more, big wind-downs);
4. what they send and leave (the bite and the split, the lantern in flight, the burning oil, the chaff, the gurney standing, rolling and
   crashed, the crash, the books): crisp, no cyan, not cut off; the oil-fire's colours warm;
5. the numbers above (bigger areas than the game's own, from its rules' own files: the fieldhand's, the orderly's and the Bookwarden's
   rules imported; the watch's sweep reach written down, its rules and the game's monsters' index importing each other).

Also passing: the four figures' own tests (`hushed_watch`, `fieldhands`, `orderlies`, `bookwardens`), `act2_watch`, `act2_fieldhand`,
`act2_orderly`, `act2_bookwarden`, `new_mobs3`, `bosses`, the models' `action_f6`, `action_f9` and `palace_hands`; `tsc` clean. Changed
outside this branch's own files (only to let the new mock-ups through their checks that nothing else imports them):
tests/hushed_watch.test.ts, tests/fieldhands.test.ts, tests/orderlies.test.ts, tests/bookwardens.test.ts (art/action_f11_*.ts let through),
tests/bosses.test.ts 1 (art/action_f11_*.ts let through its check that nothing of the game uses the bosses' footwork, art/bosses3.ts, as
the act's mobs are), tests/new_mobs3.test.ts (the four added to its list of mock-ups), tests/action_f6.test.ts (art/action_f11_*.ts, built on its
art/action_f6_fx.ts and art/action_f6_golem.ts, let through). No art or game file changed.

Made by: `tools/action_f11_film.ts` (the film), `tools/action_f11_sheet.ts` and `tools/action_f11_captions.py` (the sheet),
`src/dev/action_f11_scene.ts` (the scenes, on stand-ins for floors 11, 13, 14 and 15's grounds in their own colours),
`tools/action_f11_hash.ts` (the hashes), `tools/action_f11_review.ts` (the reviews said), `tools/action_f11_peek.ts` (strips of frames,
while drawing), `tools/action_f11_rest.ts` (their rests measured).

## For him to decide (the art chat's to ask)

- THE LANTERN: the watch had none, so they now wear one at the belt in every move (a picture change to all their frames). After throwing
  it, he takes another from the back of his belt (it is in his hand from behind his back: an endless supply, as the firepot thrower's
  pots).
- THE GURNEY: the film has one standing before the orderly as he begins. Where the game's comes from (one by each orderly in the ward, one
  he wheels with him, or the ward's own beds) is the main chat's and his to say.
- THE CHOP'S SPLIT runs on along the floor to 4 tiles before him (a strip 1.4 wide): so the chop reaches as far as the old sweep did and
  further, in a line, where the sweep went round.
- THE HARVEST carries them 0.77 tiles on; the game moves them on by it as it ends. The hook's chaff is 1.5 tiles round.
- THE BARRAGE: 9 books, one every 0.08 s, each at where you are as it goes: running across the stream beats it; standing still does not.
  Each book is a blow of its own (a suggestion: a fifth of a blow each).
- The burning oil 1.9 tiles round for 6 s; the gurney's lane 10 tiles at 9 a second; the mallet's ring 1.5; the slam's dust 1.7.

## 2 Nov 2026: THE SICKLE BOOMERANG, in place of the harvest (branch `art/action-fixes`)

**Where this and the text above differ, this holds: the reaper's and the gleaner's one attack is now the sickle boomerang** (the harvest's
code is kept, out of their set, for the picture of it beside the new: `HARVEST_REAPER`). `makeHarvestArt()` now gives `BOOM_REAPER`.

His words, 2 Nov 2026, 07:32: “Okay now I need you to look at how many enemies do a small hit, small hit, slam combo.  I feel like you over corrected to that a little too much.” Asked which keep it: “Chained One and troll (Recommended)” (offered as: the first two to get it; the Amalgamation, Crier, reapers, gardener and guard each get something new). Asked what the reapers get in its place (answered by 07:46): “Sickle boomerang
(Recommended)”, offered as: the sickle thrown spinning out in a wide curve and back to the hand. Dodge it going out and coming back.

THE SICKLE BOOMERANG (art/action_f11_field.ts `BOOM`, `boomAt`, `boomCurve`, `boomStrikes`, `sicklePainted`, `curvePainted`): the sickle
DRAWN BACK far behind them at the shoulder, the body wound right round, the left hand pointed at you, the way it will fly MARKED on the
ground (a loop out to their left, round, and back on their right, its edges dotted as far as it strikes): HELD, shaking, glinting pink;
in TWO FRAMES FLUNG, the arm whipped round and across, smeared; the sickle SPINNING out along the curve, crisp, glinting pink, a blur of
its blade round it; round; and BACK; caught, the reaper STAGGERING A STEP BACK with the catch (their hand open while it is away); straightened.

| | |
|---|---|
| the move | **3.0 s** (frames 0–90) |
| drawn back | by 0.32 s; the curve marked from **0.12 s**; **HELD to 0.7 s** (0.38 s) |
| THE THROW | **strike f21–f23**, it leaves the hand at **0.767 s** (`BOOM_HIT`) |
| its flight | **1.5 s** (`BOOM.fly`), **14.2 tiles** of curve (9.4 tiles a second): out to **6 tiles** before them, 1.7 to their left going out, 2.5 to their right coming back; spinning 5 turns a second, dipping to the knight's waist |
| the catch | **2.267 s** (`BOOM_CATCH`); staggered a step back (5 of their lengths: `BOOM_BACK`); straightened by 3.0 s |
| struck (`boomStrikes`) | a hero within **0.75** of it, once going out and once coming back |

For the rules (a suggestion): `attack` long 3.0, hit `BOOM_HIT`, `near`/`far` 2/6; the sickle's place `boomAt(t)` (tiles from where they
stand, and its height), drawn by `sicklePainted(t, view)` (`SPIN_CANVAS`, its anchor the floor under it) over a small shadow; the curve
`curvePainted(k, view)` from `BOOM.mark`; strike by `boomStrikes(t, x, y)` (each pass once); move them back `BOOM_BACK` as it ends.

Checks: `tests/action_f11.test.ts` updated: test 3 (the bosses' review, both, both ways, their throwing hand the end they strike with, the
sickle not theirs to carry while it is away): nothing found; test 4 the sickle in flight both ways round and its curve: crisp, no cyan,
not cut off; test 5 its numbers (six tiles out, a wide curve, struck going out and back, held, a stagger). The game's frames hash as before.
