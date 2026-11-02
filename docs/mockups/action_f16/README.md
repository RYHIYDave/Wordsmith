# Floors 16 to 19: more action (mock-ups; branch `art/action-f16`)

An art helper's branch, from `art/action-f14-physician` at 2bdb29c (all the action work before it). Nothing here is in the game until the
main chat puts it there, on his yes. All five are **behind switches that are off**: with them off every frame the game shows of the
Hushed gardeners and grooms, the palace guard, the masked dancers and the king's knights is the same, pixel for pixel (hashes below).

## His words

His review of every enemy for more action, 31 Oct 2026; each offered as below, his answers quoted:

- HUSHED GARDENER (floor 16, small), “Yes (Recommended)” to: “Hedge cut: three quick snips of the shears, stepping in with each, the last
  a scissoring leap.”
- HUSHED GROOM (floor 16, small): offered a muck toss, “I don’t hate it but it’s still pretty similar to what we’ve been adding”; offered
  Loose the horse (he whistles and a ghostly palace horse gallops across the garden down a marked line, a little cousin of the Princess's
  steed) or a halter rope: “Loose the horse (Recommended)”.
- PALACE GUARD (floor 16, medium), “Yes (Recommended)” to: “The drill, in place of the sweep: an overhead chop, a spin back round, then
  the partisan or sword driven tip-first into the ground with a shockwave.” Its long thrust tightened by Movement 9.
- MASKED DANCER (floor 17, small), “Yes (Recommended)” to: “Partner throw: a waltzing pair whirls round, and one flings the other spinning
  across the floor at you like a top, down a marked lane.”
- KING'S KNIGHT (floor 19, large): offered a greatsword combo in place of the sweep, “Didn’t we just do this for a different enemy?”; told
  yes, the palace guard's drill; asked: “Something unique”; offered Guard and riposte or The rallying banner (he plants a royal banner in
  the floor; while it stands, every enemy near it hits harder, until you cut it down): “The rallying banner”. The cleave stays, tightened
  by Movement 9.
- Under his rules already given: his rulebook's Monsters 9, Action, like a movie; Movement 9, 24 Oct (“Like the wind up and wind down are
  big but the actual punch is lightning quick”), and for the enemies, 28 Oct (“Start from now on, but every enemy is going to need that
  change eventually.  And bigger AOE to compensate for the extra time the player gets to evade”). Small mobs keep one attack, medium two
  (his rule of 9 Oct); the knight his cleave and the banner. The Hushed keep their grey breath and dull pink eyes; the friend's cyan is on
  none of it.

## The pictures (`pictures/`)

- `action_f16.mp4` (1200 × 676, 56.4 s, 30 fps, H.264 yuv420p, captioned): each new move with the knight, from in front and from behind,
  then its strike at half speed: the gardener's hedge cut, the groom's whistle and his horse, the palace guard's thrust and drill on a
  stand-in for the Swan Gardens (a striped lawn, a gravel walk); the dancers' partner throw on a stand-in for the masque's ballroom (the
  blue room's dark boards); the king's knight's banner on a stand-in for the King's hall (cold stone flags). The horse's whole line and the
  banner's reach are also shown whole, from higher up (the game's own angle, drawn out wide: the game has no straight-down view). The
  knight is struck by the horse and by the dancer (in front) and gets out of their way (from behind); the banner is cut down at the end.
- `action_f16_sheet.png` (1200 × 7474): each move's key moments; each in its scene with the knight; the horse galloping from in front and
  behind; the banner on the knight's back, standing, struck and cut down; and EACH OLD MOVE BESIDE ITS NEW at the same scale (the snap and
  the hedge cut, the fork jab and the whistle, the old thrust and the new, the sweep and the drill, the spin and the throw, the knight's
  sweep and the banner).

## THE HUSHED GARDENER: THE HEDGE CUT (`GARDENER_HEDGE`, art/action_f16_gardener.ts)

The shears up over his right shoulder and opened wide, HELD, shaking, glinting pink; in TWO FRAMES slashed down and out at you and SNAPPED
SHUT, the left foot stepping in, smeared; flung open again up over his left shoulder; in TWO FRAMES the backhand snip down across him, the
right foot stepping in past the left; crouched, the shears up over his hat, opened their widest, HELD; in TWO FRAMES a LEAP, his legs
scissoring in the air, and the blades SCISSORED SHUT down into the lawn as he lands in a deep lunge: a burst of cut grass and turf flung up,
a ring rolling out with the enemy's pink at its edge, the clippings lying strewn. Wrenched out, straightened, on where he landed. His one
attack (small), in place of the snap.

| | |
|---|---|
| the move (`clips.attack`) | **2.95 s**, 89 frames; its `hit` the leap, **1.867 s** (frame 56) |
| the wind-up | up and open by 0.3 s; **HELD**, shaking, to 0.6 s (0.3 s; the snap's 0.22 s) |
| SNIP ONE, SNIP TWO (`HEDGE_STRIKES[0, 1]`) | **two frames** each, smeared: frames 18 to 20 (0.667 s) and 32 to 34 (1.133 s) |
| crouched | by 1.6 s; **HELD** to 1.8 s |
| THE LEAP (`HEDGE_STRIKES[2]`) | **two frames**, smeared, frames 54 to 56 |
| the wind-down | wrenched at to 2.15 s; out of the turf by 2.4 s; straightened by 2.95 s |
| stepping in (`HEDGE.travel`, `hedgeOn(t)`) | **0.77 tiles** on through it (0.14, 0.36 and 0.74 at the three blows); the game moves him on by it as it ends |
| struck by each snip (`HEDGE.snip`; `hedgeStrikes(0 or 1, …)`) | a strip **to 2.0 tiles** before him, **1.0** to either side (the snap's: to 1.72, 0.8 to either side) |
| struck by the leap (`HEDGE.r`, `scissorAt()`) | within **1.6 tiles** of where the blades go in (1.76 tiles on from where he began) |
| what it leaves (`clippingsPainted(t, layer, side, big)`) | a spray of cut grass at each snip (`big` 0.4), the burst at the leap (1), gone by 1.8 s |

## THE HUSHED GROOM: LOOSE THE HORSE (`GROOM_HORSE`, art/action_f16_groom.ts)

His fork left standing at his side in his right fist; his left hand up to his mouth, two fingers in it, his head thrown up, and he
WHISTLES, HELD, shaking, the grey breath streaming out shrill, while THE LINE is marked across the garden (from behind him at his left,
through where you stood, on far past: dashed edges and chevrons of the enemy's pink). In TWO FRAMES his arm is flung out down the line,
smeared, and THE HORSE bursts out of a puff of the Hush's mist behind him and gallops down the line past him, through where you stood, and
on, and is gone into mist at its end. His one attack, in place of the fork jab.

THE HORSE, the Princess's steed's little cousin, not a copy (its own making, from the steed's way of painting fog): a palace cart-horse,
SMALLER (0.86 of the steed's 1.15 build), heavy and short in the leg, a broad chest and a deep round barrel, a thick neck, a big plain
head, feathered fetlocks of mist, a cropped mane, the padded collar of its harness still on it with its brass hames; the Hush's pale glow
where it is thick, thinning to mist at its legs, its tail and mane smoke streaming back, mist streaming off its feathers; its eyes the
enemy's pink, its edge the enemy's pink. Never cyan. It gallops (a stride every 0.32 s, its hoofs each down a moment and going back under it
as fast as it gallops, so they grip).

| | |
|---|---|
| the move (`clips.attack`) | **2.1 s**, 63 frames; its `hit` the arm flung out, **0.833 s** (frame 25) |
| the wind-up | the hand to his mouth by 0.3 s; **WHISTLING, HELD**, to 0.767 s (0.47 s); the line marked from 0.3 s (`LOOSE.aim`) |
| the strike (`WHISTLE_STRIKE`) | **two frames**, smeared: frames 23 to 25, the hips first |
| the wind-down | his arm held out after it to 1.25 s; lowered by 1.7 s; at rest 2.1 s |
| THE LINE (`LOOSE.from`, `lane`, `half`; `lineOf(hx, hy)`) | from **2.6 tiles behind him and 1.3 to his left**, through where the hero stands at 0.3 s, **14 tiles** long, **1.9 wide** (the jab's strip: 2.17 long, 1.2 wide) |
| THE HORSE (`LOOSE.pace`, `fade`; `horseGone(t)`, `horseFormed(t)`) | out of the mist at the line's start at the hit, **11 tiles a second** (the hero runs 4.6): down the line in 1.27 s; formed in 0.18 s, gone into mist over its last 2.5 tiles |
| struck (`horseStrikes`; `LOOSE.body`, `knock`) | a hero on the line within **0.9 tiles** of its middle as it comes by: struck and knocked **0.8** |
| painted (`horsePainted(t, view)`, `mistPainted(t)`) | the horse on its own canvas, galloping the way it is drawn facing (in front, behind); the mist it bursts out of and goes into |
| near, far | begun at a hero from 1.5 to 7 tiles off |

## THE PALACE GUARD (`GUARD_DRILL`, art/action_f16_guard.ts): both looks, the partisan guard and the sword guard

**THE LONG THRUST, BY MOVEMENT 9** (their basic blow): brought down level by 0.14 s, drawn far back by 0.3 s; **HELD**, shaking, its point
glinting pink, to 0.6 s (0.3 s; was 0.2 s); in **two frames**, smeared (frames 18 to 20: the hips turned first, then thrust out its whole
length, its `hit` **0.667 s**; was three frames, unsmeared); carried on to 0.8 s, held out to 1.05 s, drawn back, stood again by **1.9 s**.
Its line (`thrustStrikes`): from 0.2 behind him to the point's reach and **0.9** beyond, **0.85** to either side: the partisan's **3.6 tiles**
long and 1.7 wide (the game's 3.3 and 1.3), the sword's 2.4 (the game's 2.2).

**THE DRILL** (in place of the wide sweep), a combo of three, each its own Movement 9:

| | |
|---|---|
| the move (`clips.moves.drill`) | **3.65 s**, 110 frames; its `hit` the drive, **2.4 s** (frame 72) |
| THE CHOP | heaved up over his head by 0.4 s, **HELD** to 0.6 s; **two frames** (18 to 20, 0.667 s): over the top and down before him, smeared; struck, a strip **to 3.2 tiles** before him, **0.8** to either side (`DRILL.chop`) |
| THE SPIN | wound round to the left, the weapon held out flat, by 1.0 s, **HELD** to 1.133 s; **two frames** (34 to 36, 1.2 s): whipped round to his right on the ball of his left foot, **200 degrees in the two**, smeared, his right foot swung round off the floor; carried on round the whole turn by 1.65 s (`drillTurn(t)`), facing you again by 1.85 s; struck, **all round him to 3.0 tiles** (`DRILL.spin`) |
| THE DRIVE | raised high, point down, in both hands (the sword in his fist, the shield up), by 2.1 s, **HELD** to 2.333 s; **two frames** (70 to 72, 2.4 s): driven tip-first into the ground before him (1.3 tiles on for the partisan, 1.1 for the sword: `driveAt()`), smeared; THE SHOCKWAVE: a hero within **2.6 tiles** of it struck and knocked **0.7** (`DRILL.wave`, `knock`); its ring of dust, the floor cracked (art/action_f6_golem.ts `smashPainted(t, layer, 2.6, true)`) |
| the wind-down | held in the ground, wrenched at, to 2.8 s; out by 3.05 s; stood again by 3.65 s |
| (the game's sweep) | a fan 3.3 tiles out, 250 degrees round (the sword's 2.06): the drill reaches about as far, in three different shapes, all round him once |

## THE MASKED DANCERS: THE PARTNER THROW (`DANCER_THROW`, art/action_f16_dancer.ts)

A pair's attack, each with a part, played together, each drawn at its own spot (the lady at the gentleman's right, both facing you as they
begin). HIS (`THROW_GENT`): he turns to her and takes both her hands, and the pair WHIRL ROUND, he turning on the spot on the balls of his
feet (a step every sixty degrees, each foot pivoting as he turns over it), she swung round him off her feet at the full length of their
arms, leaning back, her skirt flying out; faster, then **HELD** at full speed, a whole turn, while THE LANE is marked from her place on at
you; as she comes round to where she began, in **TWO FRAMES** he FLINGS her, his arms thrown open and up, smeared; his whirl stopped dead,
he turns slowly on round to face you and stands. HERS (`THROW_LADY`): flung, she comes down on the point of her right foot and SPINS LIKE A
TOP, her arms drawn in across her breast, her left foot drawn up to her knee, her skirt flared flat, the grey breath whipped round her,
while the game carries her DOWN THE LANE at you, fast, slowing; the spin slows; she comes down off her point and stands, posed, at the
lane's end. Their one attack, in place of the whirling spin.

| | |
|---|---|
| the moves (`clips.attack`, each) | his **2.3 s** (69 frames), hers **2.9 s** (87 frames); their `hit` the fling, **1.2 s** (frame 36) |
| taking | turned to each other, her hands in his, by 0.3 s |
| THE WHIRL (`pairTurn(t)`) | round him at **0.66 tiles** (her middle from his), faster to **527 degrees a second** (1.46 turns) by 0.6 s, **HELD** at full speed to 1.133 s, a whole turn: she is back where she began as she is flung |
| THE FLING (`THROW_STRIKE`) | **two frames**, smeared, frames 34 to 36 |
| her spin (`ladyTurn(t)`) | **4 turns a second** as she goes, slowing to a stop by 2.51 s (2 3/4 turns); she stands at 2.9 s |
| THE LANE (`THROW.pace`, `stop`, `half`; `topGone(u)`, `LANE_LONG`) | the game carries her from the fling: **14 tiles a second** at once, slowing to a stop at 1.3 s: **9.1 tiles** (the spin's lunge: 1.25); marked **1.7 wide** from 0.3 s |
| struck (`topStrikes`; `THROW.r2`, `knock`) | a hero within **0.85 tiles** of her as she comes by, knocked **0.7** (the spin's: 1.5 round where it landed) |
| his end | turned on round to face you by 1.93 s; he stands at 2.3 s |
| near, far | begun at a hero from 2 to 8.5 tiles off |

## THE KING'S KNIGHT: THE RALLYING BANNER (`KNIGHT_BANNER`, art/action_f16_knight.ts)

THE BANNER: a royal gonfalon of the King's colours (the knights' own blue and old gold: a blue cloth hung from a crossbar, its border gold,
the royal swan white on it, cut to three points below), on a tall staff of dark wood with gold bands, a gold finial and an iron spike at its
foot. **He carries it on his back**, furled round its staff (a roll of blue bound with gold cord), slung upright behind his left shoulder,
rising high over it, in every move while he has it (a change to all his frames: his look with the banner, `BANNER_KNIGHT`). THE MOVE (in
place of the wide sweep): his right hand keeps his planted sword's grip; his left lets go of it, reaches up over his left shoulder and draws
the banner off his back, out wide of him and up, unfurling, and holds it aloft, the staff upright, **HELD**, shaking; in **TWO FRAMES** he
drives it straight down into the floor before him to his left, smeared: a SHOCKWAVE; his fist driven on down the staff; he lets go and takes
his sword's grip again. IT STANDS (`bannerPainted`), the cloth stirring, the enemy's GOLD GLOW on the floor round it to its reach, slowly
turning, gold motes drifting over it, its light (`rallyPainted`); struck, it shudders; cut down, its staff splinters half way up, the top
half falls and lies, the glow goes out, splinters fly, and by 1.6 s it is gone. ONE BANNER A KNIGHT: after the move he is his look without
it (`CLEAVE_KNIGHT`: the game's own knight, his cleave his blow).

**THE CLEAVE** stays his blow (`clips.attack`, frame for frame the game's own `moves.cleave`): it was drawn by Movement 9 on 29 and 30 Oct
already (heaved up over his helm, **HELD** 0.4 s, down in **two frames**, frames 32 to 34, smeared, its `hit` 1.133 s; a 1.17 s wind-down;
the floor cracked on in a line 8 tiles long and 2.1 wide), so it is kept as it is: nothing in it was slow or small to tighten.

| | |
|---|---|
| the move (`clips.moves.banner`) | **2.6 s**, 78 frames; its `hit` the plant, **1.367 s** (frame 41) |
| the wind-up | his hand off the grip and to the banner by 0.42 s; drawn and raised, unfurling, by 0.9 s; **HELD** aloft, shaking, to 1.3 s (0.4 s) |
| the strike (`BANNER_STRIKE`) | **two frames**, smeared: frames 39 to 41 |
| the wind-down | his fist on it, driven on, to 1.75 s; let go; on his sword's grip by 2.15 s; at rest by 2.6 s |
| where it stands (`BANNER_AT`) | **1.08 tiles** before him, **0.76** to his left; its staff **150** of his lengths tall (3.8 tiles; he is 116) |
| THE SHOCKWAVE (`BANNER.wave`, `knock`; `waveStrikes`) | a hero within **2.2 tiles** of it as it is planted, knocked **0.6** |
| ITS REACH (`BANNER.reach`; `inRally`) | while it stands, every enemy within **3.5 tiles** of it hits harder (how much, and how many blows cut it down, the rules') |
| (the game's sweep) | 4.6 tiles round the half-circle before him |

## The switches, and bringing it in

- `GARDENER_HEDGE`, `GROOM_HORSE`, `GUARD_DRILL`, `DANCER_THROW`, `KNIGHT_BANNER`, all `{ on: false }`. The makers: `makeHedgeArt()`
  (`HEDGE_GARDENER`), `makeWhistleArt()` (`WHISTLE_GROOM`), `makeDrillGuardArt(mob)` (`DRILL_PARTISAN`, `DRILL_SWORD`), `makeThrowArt(mob)`
  (`THROW_DANCERS[who][room]`, every room's lady and gentleman), `makeBannerKnightArt()` and `makeCleaveKnightArt()`: each the game's own
  figure with only its new moves put in (tested frame for frame), but the knight with his banner, who carries it in every move.
- Hashes of every frame the game shows of the five (tools/action_f16_hash.ts, through art/act1_figs/): gardener `76fefe169ef5110e`, groom
  `5b28c43f7c65296d`, the partisan guard `e225c6a011ec5b46`, the sword guard `6a656bce0cf2c467`, the dancer (its first look) `d8b44ea2582bf4a3`,
  the king's knight `f62a48cef195f610` (tested). No game file changed (`git diff 2bdb29c -- src` is only this branch's new files).
- To bring it in (the main chat's; the files are mock-ups: move what each needs into the game's own as the art chat's work is brought in):
  - THE GARDENER: art/act1_figs/gardener.ts `make: () => GARDENER_HEDGE.on ? makeHedgeArt() : ...`; in game/act1_rules/gardener.ts the snap
    becomes the hedge cut, `long` 2.95, `hit` the leap, `far` 2.8: at each of `HEDGE_HITS` strike by `hedgeStrikes(k, …)` (the snips each a
    blow; the leap the biggest), the burst `clippingsPainted` at `scissorAt()` (the snips' sprays at the shears, `big` 0.4); as it ends, move
    him on `HEDGE.travel` the way he faces.
  - THE GROOM: art/act1_figs/groom.ts `make: () => GROOM_HORSE.on ? makeWhistleArt() : ...`; in game/act1_rules/groom.ts the jab becomes the
    whistle, `long` 2.1, `hit` `WHISTLE_HIT`, `near`/`far` 1.5/7: at `LOOSE.aim` lay the line (`lineOf` through the hero; art/action_f6_golem.ts
    `lanePainted(…, LOOSE.lane, LOOSE.half)`); from the hit a horse runs down it by `horseGone(t)`, drawn by `horsePainted(t, view)` facing
    its way (front or back, flipped as the line goes), `mistPainted` at its start and end, striking a hero by `horseStrikes` once, knocked
    `LOOSE.knock`. A cooldown of its own (say 5 s) and `after` as the jab's.
  - THE PALACE GUARD: art/act1_figs/pguard.ts `make: () => GUARD_DRILL.on ? makeDrillGuardArt(DRILL_PARTISAN) : ...`, its look with
    `DRILL_SWORD`; in game/act1_rules/pguard.ts the thrust's `long` 1.9, `hit` `THRUST9_HIT`, its line by `thrustStrikes` (or PGUARD's own,
    `half` 0.85, `more` 0.9); the sweep's act becomes the drill, clip `drill`, `long` 3.65, three hits (`DRILL_HITS`) each by
    `drillStrikes(mob, k, …)`, the shockwave `smashPainted` at `driveAt(mob)`; marks through each hold (the chop's strip, the spin's ring,
    the drive's ring). Its cooldown the sweep's (6 s).
  - THE DANCERS: art/act1_figs/dancer.ts `look` with `makeThrowArt(THROW_DANCERS[who][room])`; in game/act1_rules/dancer.ts the spin's act
    becomes the throw, made by a PAIR together (the lady at the gentleman's right, as they stand in the waltz's hold: from the waltz, or as
    they notice you): both act at once, `long` 2.3 his, 2.9 hers, `hit` `THROW_HIT`; the lane from her place along the pair's way to the
    hero, marked from `THROW.take`; from the fling carry her `topGone(t - THROW_STRIKE[0])` down it (to a wall), striking by `topStrikes`.
    A dancer with no partner near keeps to whirling at you (or the game's own spin: the main chat's and his to say).
  - THE KING'S KNIGHT: art/act1_figs/kknight.ts `make: () => KNIGHT_BANNER.on ? makeBannerKnightArt() : ...` and a look with
    `makeCleaveKnightArt()` for after the banner; in game/act1_rules/kknight.ts the sweep's act goes; the cleave his blow on `clips.attack`
    (its numbers the game's own); the banner act, clip `banner`, `long` 2.6, `hit` `BANNER_HIT`, once a knight, `near`/`far` 1.5/6: at the
    hit a standing banner thing at `BANNER_AT` (`bannerPainted(t, view, struck, cut)`, its floor `rallyPainted`), the shockwave by
    `waveStrikes`, knocked `BANNER.knock`; while it stands, enemies `inRally` hit harder; the hero's blows cut it down; from the move's end
    the knight is drawn with his look without it.
  - Damage, knock, how much harder the rally makes them, the banner's life and cooldowns are the rules'.

## The checks

`tests/action_f16.test.ts` (5 tests, all pass):

1. the switches off; nothing of the game imports the mock-ups; the game's frames of the five hash as on 2bdb29c; with the new art, every list
   the game's own but the new moves (the knight's cleave, now his blow, the game's own frame for frame); the drill in place of the sweep, the
   banner in place of the knight's sweep;
2. every frame of every new move (and the banner knight's stand, walk, setting off, stopping, cleave and struck, with the banner on his
   back), both ways round, of the gardener, the groom, both guards, both dancers and the knight: paints, wears the enemy's pink edge, is
   crisp, has no cyan, nothing cut off;
3. **all five (eight figures) through the bosses' review** (art/boss_checks.ts `checkBoss`, every move of theirs and every handing over,
   from in front and from behind; their shapes the game's own with their strikes and smears, in tests/action_f16_shapes.ts; the hedge cut
   and the drill combos of three blows, each reviewed as one; the hedge cut ending 0.77 tiles on where the game hands it back to the stand;
   the banner a thing he carries, on his back and in his fist): **nothing found**; Movement 9 (two-frame strikes, held wind-ups, big
   wind-downs);
4. what they send and leave (the cut grass, the horse galloping and its mist, the banner standing, struck and cut down, its shockwave and its
   reach): crisp, no cyan, not cut off; the horse's hooves grip as it gallops;
5. the numbers above (bigger areas than the game's own: the gardener's rules imported; the guard's thrust written down, its rules and the
   game's monsters' index importing each other).

Also passing: the figures' own tests (`palace_hands`, `palace_guard`, `masque_dancers`, `kings_knights`), `act2_palace_hands`,
`act2_pguard`, `act2_kknight`, `bosses`, `new_mobs3`, and all of `action_f6` and `princess` but one check each that already failed on the
branch this one came from, for files not of this branch: `action_f6` 1 (art/ratking_action.ts, the Rat King helper's, imports its
art/action_f6_fx.ts and is not let through) and `princess` 1 (game/act1_rules/rshadow.ts and render/act1_fx/rshadow.ts, floor 20's shadows,
import her and are not on its list); `tsc` clean. Changed outside this branch's own files (only to let
the new mock-ups through their checks that nothing else imports them): tests/palace_hands.test.ts, tests/palace_guard.test.ts,
tests/masque_dancers.test.ts, tests/kings_knights.test.ts, tests/princess.test.ts (art/action_f16_*.ts let through), tests/bosses.test.ts 1
(the same, for art/bosses3.ts), tests/new_mobs3.test.ts (the five added to its list of mock-ups), tests/action_f6.test.ts (built on its
art/action_f6_fx.ts and art/action_f6_golem.ts). No art or game file changed.

Made by: `tools/action_f16_film.ts` (the film), `tools/action_f16_sheet.ts` and `tools/action_f16_captions.py` (the sheet),
`src/dev/action_f16_scene.ts` (the scenes, on stand-ins for floors 16, 17 and 19's grounds in their own colours), `tools/action_f16_hash.ts`
(the hashes), `tools/action_f16_review.ts` and `tools/action_f16_raw.ts` (the reviews said), `tools/action_f16_peek.ts` and
`tools/action_f16_thing.ts` (strips of frames, while drawing).

## For him to decide (the art chat's to ask)

- THE BANNER ON HIS BACK: the knight had none, so with his banner he carries it on his back in every move (a picture change to all his
  frames), and after planting it he is drawn without it: one banner a knight. Another one after the first is cut down would need it to
  come from somewhere (a second on his back, or none).
- THE CLEAVE was already Movement 9 (two frames, held, smeared, an 8-tile crack): kept frame for frame, not changed.
- THE HORSE comes from behind the groom (2.6 tiles behind, 1.3 to his left) and runs 14 tiles: through walls and hedges the game must stop
  or fade it. It is drawn from in front or behind only (as the game draws everything), turned the way it gallops.
- THE THROW needs the pair together (the waltz's hold): a dancer whose partner is gone has no throw; what it does then is his to say.
- THE DRILL'S SPIN strikes all round the guard at 3 tiles: running behind him is no escape from it (the chop and the drive are before him).
- THE HEDGE CUT carries the gardener 0.77 tiles on; the game moves him on by it as it ends.
- Sizes: the banner's staff stands 3.8 tiles tall (above the knight, as a standard should); its reach 3.5 tiles; the horse 0.86 of the
  steed's build.

## 2 Nov 2026: THE SHEAR LUNGE and THE JAVELIN, in place of the hedge cut and the drill (branch `art/action-fixes`)

**Where this and the text above differ, this holds.** The groom, the dancers and the king's knight are as they were.

His words, 2 Nov 2026, 07:32: “Okay now I need you to look at how many enemies do a small hit, small hit, slam combo.  I feel like you over corrected to that a little too much.” Asked which keep it: “Chained One and troll (Recommended)” (offered as: the first two to get it; the Amalgamation, Crier, reapers, gardener and guard each get something new). Asked what each gets in its place (answered by 07:46):

- THE GARDENER: “Shear lunge”, offered as: a long held crouch, then one lunge 3 tiles across the lawn, the open shears snapping shut on you.
- THE PALACE GUARD: “Javelin (Recommended)”, offered as: he hurls the partisan; it sticks quivering where you stood with a burst of turf.
  He draws a sword till he pulls it out.

### THE SHEAR LUNGE (`GARDENER_HEDGE`; art/action_f16_gardener.ts `LUNGE`, `LUNGE_GARDENER`, `lungeStrikes`, `snapAt`)

His one attack. He sinks into a deep crouch, the shears out low before him OPENED THEIR WIDEST, the lane marked before him across the lawn:
HELD long, shaking, glinting pink; in TWO FRAMES he LUNGES, flung low and long through the air, smeared (after-images of him and the blades
all the way), the blades SNAPPING SHUT at its end in a spray of cut grass; stumbling on, bent double, the shut shears dragged along the
turf, a second stumbling step; straightened. (`makeHedgeArt()` now gives it; the hedge cut's code is kept, out of his set.)

| | |
|---|---|
| the move | **2.8 s** (frames 0–84) |
| the crouch | by 0.35 s; the lane marked from **0.15 s**; **HELD to 1.1 s** (0.75 s) |
| THE LUNGE | **strike f33–f35**, the blades shut at **1.167 s** (`LUNGE_HIT`); flung **3.1 tiles** in the two frames |
| struck | a hero in **the lane** (**3.8** long, **0.85** to either side) as he goes through it, or within **1.2** of where the blades shut (4.2 tiles on) |
| wind-down | stumbling, the shears dragged, to 1.85 s; straightened by 2.4 s; his stand by 2.8 s, **3.36 tiles** on (the game moves him on by `LUNGE_TRAVEL_TILES` as it ends) |

For the rules: `attack` long 2.8, hit `LUNGE_HIT`, `near`/`far` 1.5/3.6; the lane marked from `LUNGE.mark`; `lungeStrikes(x, y)`; the
spray `clippingsPainted(t, 'air', side, 0.75)` at `snapAt()`. His canvas for it 380 × 280.

### THE JAVELIN (`GUARD_DRILL`; art/action_f16_guard.ts `JAV`, `JAV_PARTISAN`, `JAV_PARTISAN_SWORD`, `JAV_SWORD`, `JAV_SWORD_AFTER`, `PULL`)

Their second attack (the long thrust by Movement 9 stays their first).

- THE PARTISAN GUARD (`JAV_PARTISAN`): **a sword in a scabbard at his left hip now, in every frame of his set** (his frames change by it).
  The partisan HAULED BACK over his right shoulder, his left hand pointed at you, where you stand MARKED on the turf: HELD, shaking, its
  blade glinting pink; in TWO FRAMES HURLED, smeared; it flies (`spearFlying`) and STICKS QUIVERING where you stood (`spearStuck`), a BURST
  OF TURF 1.6 tiles round; he DRAWS HIS SWORD from his hip. With it (`JAV_PARTISAN_SWORD`: the sword guard's stand, march and thrust by
  Movement 9, no shield) he fights until he has walked to his partisan; then THE PULL-OUT (`moves.pullOut`): his sword put up, both fists
  high on the shaft, HEAVED, held, WRENCHED OUT in a spray of turf, swung over and up: the partisan guard again.
- THE SWORD GUARDS (`JAV_SWORD`): **a light javelin across their back now, and a scabbard at the hip, in every frame of their set**
  (their frames change by them). The same throw: their sword put up in the scabbard, the javelin drawn off their back over the right
  shoulder, hauled back, HELD, hurled in two frames; their sword drawn again; then the sword guard as they are (`JAV_SWORD_AFTER`: no
  javelin on their back; nothing to fetch).

| | |
|---|---|
| the partisan's throw (`moves.javelin`) | **2.25 s**: hauled back by 0.45 s, **HELD to 0.9 s**; **strike f27–f29**, it leaves his hand at **0.967 s**; the sword drawn 1.62–1.87 s |
| the sword guard's | **2.55 s**: sword put up by 0.32 s, the javelin off his back at 0.5 s, hauled back by 0.85 s, **HELD to 1.167 s**; **strike f35–f37**, away at **1.233 s**; sword drawn at 1.95 s |
| its flight (`javAt`) | `javFly(d)` = 0.22 + 0.035·d s (over 4.6 tiles, 0.38 s), `javArc(d)` = 14 + 4·d of their lengths high |
| where it sticks | where the hero stood as it left the hand: struck within **1.6** as it lands (`javStrikes`), the burst of turf 1.6 round; it quivers 0.8 s, then stands |
| THE PULL-OUT (`moves.pullOut`) | **2.65 s**, begun standing 1.12 tiles short of it (`STUCK`): sword put up by 0.42 s, fists on it 0.72 s, heaved to 1.32 s, **wrenched out 1.48 s**, upright by 2.02 s, the partisan's stand by 2.65 s |

For the rules: the partisan guard's second attack `moves.javelin` (hit `JAV.partisan.hit`), the weapon away from his hand from then;
fly it to where the hero stood (`javAt`, `spearFlying`), stick it there (`spearStuck`, and `clippingsPainted(t, layer, side, 1)` for the
turf), strike by `javStrikes`; he is `JAV_PARTISAN_SWORD` after it (sword in hand) until he has walked to it (stopping 1.12 tiles short)
and played `pullOut`, taking it off the floor as it begins; then `JAV_PARTISAN` again. The sword guard: `JAV_SWORD` until it throws, then
`JAV_SWORD_AFTER`. Their canvas 560 × 380.

### Checks

`tests/action_f16.test.ts` updated: test 1 (the guard's lists are new now: the scabbard in every frame; the javelin in place of the drill,
the pull-out in the sword set); test 2 every frame of the new moves and the guards' new sets both ways round; test 3 the whole bosses'
review of the lunge (its one blow, ending on where the game hands it back) and of the javelin, the sword set and the pull-out, the sword
guard's throw (each set handing over to the next: `after`): nothing found; test 4 the javelin flying and stuck, both guards', both ways:
crisp, no cyan, not cut off; test 5 the numbers. The game's frames hash as before.

## 2 Nov 2026 (third round): THE DANCERS' OLD SPIN KEPT, AND THE BANNER'S REACH TWICE AS BIG (branch `art/action-fixes`)

**Where this and the text above differ, this holds.** Going through the night's films with the art chat, 2 Nov 2026:

- THE MASKED DANCERS: asked what a dancer whose partner is gone does, his yes to: a dancer whose partner is gone just spins into you as
  before.
- THE KING'S KNIGHT'S BANNER: his words, 08:01: “The banner buff AOE probably needs to be much bigger or it won’t affect much”; asked how
  big (it was 3.5 tiles), his pick: “About twice, 7 tiles (Recommended)” (offered as: a wide gold ring on the floor; most of a fight
  happens inside it, but you can still pull enemies out).

### THE DANCERS: THE OLD SPIN KEPT FOR A DANCER ALONE (`DANCER_THROW`; art/action_f16_dancer.ts)

No new art. The set with `DANCER_THROW` on (`makeThrowArt(THROW_DANCERS[who][room])`) now holds THE GAME'S OWN WHIRLING SPIN as well, by
its own name, **`clips.moves.spin`**: the game's `attack` clip, frame for frame (its 1.8 s, its hit at 0.8 s, its lunge 1.25 and its
area 1.5 round where it lands: `DN_SPIN`, `SPIN`), in every room's lady and gentleman, from in front and from behind. The throw stays
the set's `attack`.

**How the main chat chooses** (game/act1_rules/dancer.ts): when a dancer's partner (the other of its pair: the lady's gentleman, the
gentleman's lady) is alive and near enough to take the waltz's hold (a suggestion: within 3 tiles), the pair make THE THROW together
(`attack`, as above); when its partner is gone (dead, or none in the room), it plays `moves.spin` with the spin's act as the game has it
now (its numbers, its strike, its cooldown: unchanged).

### THE BANNER'S REACH: 7 TILES (`KNIGHT_BANNER`; art/action_f16_knight.ts `BANNER.reach`, `inRally`, `rallyPainted`, `RALLY_CANVAS`)

| | |
|---|---|
| ITS REACH (`BANNER.reach`; `inRally`) | while it stands, every enemy within **7 tiles** of it hits harder (was 3.5; how much, the rules') |
| drawn on the floor (`rallyPainted(t, 'floor')`) | **a ring of the enemy's gold at its edge**, 7 tiles round: a thick dashed band (3 pixels and its dark under it) turning slowly, its dashes bright, a fine line just inside it, **twelve chevrons** pointing in round it; within it **a faint glow**: a sparse twinkle of gold over the floor (about 1.4 in 100 of its pixels, thinning toward the ring) and motes of gold drifting up, the floor plain to see under it; the light round the banner as before |
| its floor picture (`RALLY_CANVAS`) | **700 × 372**, its anchor (350, 186) where it stands (was 640 × 360) |
| the rest | as approved: the plant, the shockwave 2.2 round, the banner standing and cut down |

For the rules: `inRally(x, y)` as before (now 7 round); the floor picture at its new size.

### Checks

`tests/action_f16.test.ts` (5 tests, passing): test 1 adds THE OLD SPIN KEPT: in every room's lady and gentleman, both ways round, the
set's `moves.spin` the game's `attack` (as many frames, the same hit and speed), and frame for frame the same pixels (the violet lady,
the blue gentleman); test 3 reviews the kept spin too, in the throw set, as the game's own review reviews its spin (`throwShape`, its
strikes, smears and handings over): nothing found; test 5 the banner's reach exactly 7 (within it, and only within: 6.9 out, 4.9 and 4.9
across, not 7.1 or 7.2) and its gold drawn to match (the ring at 7 round, inside its picture: over 1200 pixels of it, about 4600 drawn; a faint glow
within: between 1 and 6 in 100 of the floor's pixels inside it, about 1.4 drawn); test 4 the floor's gold every tenth of a second from
0 to 4 s crisp, no cyan, not cut off. The
game's frames hash as before (test 1).

The scene: src/dev/action_f16_scene.ts `bannerWideScene` (from higher up, the game's own pixels: the king's knight plants it among three
of his fellows; the hero at its edge steps back out of it and one of them follows him out).

Pictures: docs/mockups/action_fixes/pictures/action_fixes3.mp4 and action_fixes3_sheet.png.
