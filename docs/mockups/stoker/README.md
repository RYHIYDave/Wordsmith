# Floor 3's side boss, THE STOKER, and his furnace room (a mock-up; branch `art/stoker`)

Made for the art chat, from `origin/work-f4` (dcb229d5, the main chat's release branch, with floor 3's black iron prison). NOTHING
HERE IS IN THE GAME: nothing of the game imports it (its test proves it), and it is all behind one switch, `STOKER_ON`
(src/art/stoker.ts), off.

## His words

- To the main chat, 4 Nov 2026, 00:27: “I want a quest given to go to the chained one’s area and turn off the furnace.  Maybe by
  the armorer when you turn in the first runestone quest.  You go down to level 3, and there will be a side area you go into, it
  can be pretty short, then a flamey boss guy who drops a missing gear to the forge crank to turn it off, allowing you access to
  the chained one’s boss area which was blocked by fire, and then you get a reward from the armorer.”
- Read back to him: “Yes, that's it (Recommended)”. Who draws it: “The art chat, pictures to you first (Recommended)”.
- To the art chat, 4 Nov, which look for the flamey boss: “The Stoker (Recommended)”, offered as: the prison's huge fire-stoker,
  fused with the furnace: an iron firebox for a chest, coals glowing through its grate, a great shovel. Hurls burning coal, rakes
  fire across the floor.
- His rules: Movement 9 (24 Oct: “Like the wind up and wind down are big but the actual punch is lightning quick”; for the
  enemies, 28 Oct: “Start from now on, but every enemy is going to need that change eventually.  And bigger AOE to compensate for
  the extra time the player gets to evade”), Monsters 9 (“Action, like a movie”), Animations 1 (“as big and wild and kinetic and
  weighty as possible.  I’d rather it be a notch too high than a notch too low.”), and “I’d rather have to pull back from a 10 then
  build up from a 1.”

## The pictures (docs/mockups/stoker/pictures/)

- `stoker_sheet.png` (1200 by 7478): him beside the knight from in front and from behind, three times as big; in his furnace room
  at the game's size (one phone screen); the key moments of each attack from in front and behind; the coals' marks and fires, the
  rake's sheet of fire and the furnace's ring over the whole room; struck and his death, the gear before him; the furnace lit and
  out; the fire in the Chained One's way burning and going out; the crank without its gear, with it, turned; the gear as an item.
- `stoker.mp4` (1200 by 872, 30 fps, H.264 yuv420p, captioned, under 60 s): his stand, his walk, each attack from in front and
  behind in a stand-in furnace room on floor 3's own floor and walls with the knight; the coals and the rake over the whole room;
  each strike at half speed; struck; his death and the gear falling out; the crank (gear missing, set in, turned), the furnace
  going out, the fire in the Chained One's way going out.

## What he is (src/art/stoker.ts)

On the heroes' bones (`ST_BODY`), so every boss check holds for him. **His crown 114.6 to the knight's 58: twice the knight.** A
hulking figure fused with the furnace:

- HIS FIREBOX, his trunk: a great pot belly of soot-black cast iron (`ST_IRON`), two riveted bands round it, a seam down it, soot
  streaked up it, rust bled from the bands; its domed top between his shoulders; an iron collar round his neck; great riveted
  pauldrons.
- HIS FIRE-DOOR on its front (`DOOR`): a grate of iron bars, his coals glowing through it an honest orange (`ST_COALS`, the props'
  own embers), brighter to white as he winds up (`heat`); the iron about it glowing a dull red (`ST_HOT`). Hinged on his left: it
  swings open (112 degrees) on its own as he scoops, bursts and dies, the fire within seen through it.
- HIS FLUE: a stove-pipe out of his back behind his left shoulder, banded, capped, up past his head, venting smoke and sparks
  (more as he breathes out, pouring out of him when he is spent).
- His arms huge: the upper arms wrapped in scorched leather (`ST_LEATHER`) over a bulging muscle, iron bracers, fists of iron.
- HIS FURNACE MASK: a squat iron head, riveted, a brow; a GRILLE for a mouth, the fire behind its bars; two slits for eyes in which
  the enemy's pink burns (gold, `FLAME[3]`, as he winds up). From behind, iron only.
- A heavy skirt of scorched leather over his thighs, its hem burnt ragged; iron cops at his knees, greaves; iron-shod boots.
- THE GREAT SHOVEL (`SHOVEL`): an iron haft 60 from its D-grip to its socket, a broad scoop 27 long and 23 across with walls on
  three sides, bent up 22 degrees off the haft; its lip glowing from the fire. Always in his right fist (his fist runs down the
  haft to choke up on it, `hold`); his left fist takes the haft or lets it go smoothly, never leaping (worked out every frame).
- The enemy's pink rim round him while he lives; nothing cyan on him (tested).

His picture `ST_CANVAS` 560 by 440, his floor point at 272, 316. `trueBack`: from behind as the game truly sees him.

## His moves (src/art/stoker_moves.ts), and their numbers

Frames are the game's thirty a second; tiles are the game's (`TILE3`, 39.2 of his lengths). Every attack: a big held wind-up (his
eyes flaring gold, the warning), a strike of **two frames** smeared with its after-images (a swept band of the scoop's lip, the
lines of the arms), a big wind-down; and its area marked on the floor in the enemy's pink before it comes.

- HIS STAND (2.4 s, 24 frames at 10): heavy on bent knees, breathing: his chest rising 3, his weight shifting; his firebox's glow
  swelling and sinking; smoke puffed out of his flue as he breathes out; the shovel's scoop resting on the floor at his right.
- HIS WALK (`ST_PACE` **1.4 tiles a second**, 12 frames at 10, two steps): long heavy strides, his bulk dropping onto each foot as
  it comes down (soot puffed up under it; `ST_SHAKE`: the game's camera shaken **1 game pixel for 0.1 s** at each footfall), feet
  gripping the floor; the shovel dragged at his right, its lip scraping sparks off the floor; his left fist swinging.
- THE SHOVEL OF COALS (`attack`, `ST_COALS`, **3.1 s**, 93 frames):

| | |
|---|---|
| the door | flung open of itself, 0.1 to 0.28 s, sparks bursting out |
| INTO HIS FIREBOX | his fist run down the haft, the scoop driven into his own firebox by **0.38 s**, HELD and rocked, scooping, to **0.86 s**: the coals white-hot |
| out | torn out heaped; the door slammed 0.92 to 1.02 s |
| HELD HIGH | swung out round his right shoulder and up and back, the coals blazing over his head (his grip 124 up), his left arm flung out at you: **1.32 to 1.70 s** |
| THE MARKS | from **1.0 s**: where each coal will come down marked on the floor |
| hips first | 1.70 to 1.77 s |
| THE STRIKE | **frames 53 to 55** (1.77 to 1.83 s): whipped over the top in two frames, smeared; the coals flung at **1.833 s** (`hit`) |
| down | carried on down to the floor before him by 2.15 s; at his stand again by 3.1 s |
| THE COALS (`COALS`, art/stoker_fx.ts) | **seven**, arcing out (2.4 tiles high at the top), each coming down on its own spot round where the hero stood (`COAL_SPOTS`, out to 1.9 tiles from it) **0.62 s** after the hit, each 0.035 s after the last; thrown at a hero up to 8 tiles off |
| THE FIRES (`COAL_FIRE`) | each **1.2 tiles across** (0.6 round), a splash of sparks as it lands, burning **3.0 s**, dying over its last 0.8, then a smoking scorch |

- THE FIRE RAKE (`rake`, `ST_RAKE`, **3.0 s**, 90 frames):

| | |
|---|---|
| heaved up | turned away to his right, the shovel heaved up along his right side to high over his shoulder by 0.42 s |
| HELD | **0.42 to 0.90 s**, trembling; the arc marked on the floor before him from **0.3 s** |
| hips first | 0.90 to 0.97 s |
| THE STRIKE | **frames 29 to 31** (0.97 to 1.03 s): slammed down onto the floor at his right in two frames, smeared; the blade lands at **1.033 s** (`hit`) |
| THE DRAG | 1.03 to **1.50 s**: dragged round before him across **135 degrees** (`RAKE_ARC`, 75 to his right to 60 to his left), his whole bulk turning with it, fastest at first, sparks off the blade |
| THE SHEET OF FIRE (`RAKE_FIRE`) | fire springing up off the floor behind the blade as it passes each way (`rakePasses`): a band from **1.5 to 4.2 tiles** before him, burning **3.6 s**, dying over its last 1.0, then scorched. That floor is taken away; in close under him, or behind him, is safe |

- THE FURNACE BURSTS (`burst`, `ST_BURST`, **3.4 s**, 102 frames: HIS FINISHER, when he is low on life):

| | |
|---|---|
| wide | his arms flung wide (the shovel out to his right), his chest thrown out, his head back; his fire-door bursts open of itself 0.3 to 0.46 s |
| HELD, ROARING | **0.55 to 1.33 s**, his fire white-hot, shaking; marked from **0.4 s**: a ring round him, and its three gaps marked out along the floor |
| hips first | 1.33 to 1.40 s |
| THE STRIKE | **frames 42 to 44** (1.40 to 1.47 s): he hurls himself forward and down, smeared; the fire belches out of his door (out to 2.8 tiles) at **1.467 s** (`hit`) |
| THE RING (`RING`) | rolling out from **1.2 to 6.0 tiles** round him at **8 tiles a second** (0.6 s), 0.8 tiles deep; **three gaps**, 34 degrees each, at 60, 180 and 300 degrees off his forward (the way through); the floor it passed scorched and smoking 1.4 s |
| spent | to 2.2 s, heaving, his fire burnt low, smoke pouring out of him (the moment to hit him); the door clanged shut 2.55 to 2.75 s; at his stand by 3.4 s |

- STRUCK (`ST_REEL`, 0.4 s): jolted back, his door banged open a crack, sparks burst out of it.
- HIS DEATH (`ST_DIES`, **3.2 s**): struck; his fire flares white and his door bursts open as he rears back (to 0.6 s); the shovel
  flung down at **0.7 s** (it falls and lies at his right: `fall`); he sinks to his knees by **1.3 s** and slumps (1.9 s); his fire
  goes out, cooling to black iron and ash (0.7 to 2.7 s), smoke rising thin off him; **THE GEAR** clatters out of his open grate at
  **1.55 s**, falls, bounces twice, rolls over flat and lies still before him by **2.45 s**, at `GEAR_REST` (88 of his lengths
  forward, 14 to his left: **2.25 tiles before him**).

## What his fire does on the floor (src/art/stoker_fx.ts)

`coalsFloor`, `rakeFloor`, `ringFloor` paint each on a picture with his floor point where it is, seen from in front or from behind
(`fxAt`: a spot in tiles along his forward and to his left, as the picture has it); `fxPainted(which, t, view, aim)` paints one
alone on `FX_CANVAS` (900 by 560, his floor point at 450, 260). `coalAt(i, since, from, aim)` is where coal `i` is in the air
(tiles, and up), and `coalInAir` paints one, a trail of sparks behind it. Marks in the enemy's pink (`FX_PINK`); fire the props'
own embers; crisp, nothing soft.

## The furnace room's pieces (src/art/stoker_room.ts), and their anchors

All through `STOKER_ROOM` (made the first time each is asked for and kept; `forgetMade()` lets them go, the main chat's rule), in
floor 3's own colours (look B: the prison's stone, black iron and rust, said again here and tested to be the same):

- THE FURNACE, `STOKER_ROOM.furnace(alongX, 'lit' | 'out' | 'going', frame)`: four tiles of a wall (`FURNACE`: 128 along it, 176
  up), as **a gate's strips** (art/gates.ts `Strip`: `t` tiles along the wall from its start, each strip anchored as the gate's
  arch strips are); its stone surround strapped in riveted iron, an arched iron mouth (72 across) with two doors of grates, a hood
  and a flue, the damper's rod out of its side toward the crank. Lit: roaring (6 frames at 10 a second, `FURNACE_ROAR`), its
  light `FURNACE_LIGHT`; going out: 16 frames over 1.6 s (`FURNACE_OUT`); out: cold, a thread of smoke.
- THE FORGE CRANK, `STOKER_ROOM.crank('missing' | 'set' | 'turning' | 'turned', frame)`: **a standing piece**, its floor point
  the anchor (`CRANK_CANVAS` 180 by 220, anchor 88, 170). A stone foot, an iron gearbox, a great wheel on its side, a train of
  three gears on its front: the middle one MISSING (its bare axle and the bright ring worn where it turned); SET IN (the wheel's
  handle glowing the cyan of what is the player's to use, as floor 3's levers do: its light in the sprite's `lights`); TURNING
  (18 frames over 1.2 s, the wheel 1.25 times round, the gears and the damper's rod turning: `CRANK_TURN`); TURNED.
- THE GEAR on the floor, `STOKER_ROOM.gearDropped(frame)`: lying flat, a glint running round it (8 frames at 8 a second,
  `GEAR_GLINT`), its middle the anchor (`GEAR_CANVAS` 48 by 32, anchor 24, 18). Lay it at `GEAR_REST` when his death ends.
- THE GEAR AS AN ITEM, `STOKER_ROOM.gearIcon()`: **32 by 32** at the heroes' grain, the middle the anchor, in the new items'
  style A (five tones, dark seams, the shadow down and to the right, the ink outline): a cog of blackened steel, a brass hub. **A
  quest item: a plain white rim** (Normal's, the game's own `RARITY_COLOR[0]`), no rarity of its own.
- THE FIRE IN THE CHAINED ONE'S WAY, `STOKER_ROOM.fireWall(alongX, 'burning' | 'going' | 'gone', frame)`: a wall of fire filling
  his gateway's way (his gate's own: art/prison_gate.ts, `prisonInWay`), **as his portcullis's strips** (the same plane and
  anchors: laid at the back of the arch, the portcullis drawn up), up to its crown (114); burning 8 frames at 12 a second, its
  light `FIRE_WALL_LIGHT`; going out 18 frames over 1.5 s, down to embers and smoke; gone: a bed of ash.

## How the main chat brings it in

(No stand-ins for the furnace quest were on origin/work-f4 when this was made: nothing named furnace, crank, gear or Stoker; the
names here are the art's own, for the main chat to match or rename.)

- HIM: `makeStokerArt()` gives `{ front, back }` as the game holds a monster: `idle`, `walk` (at `ST_PACE`), the attack clip (the
  shovel of coals, its `hit`), `clips.moves.rake` and `clips.moves.burst` (each with its `hit`), `reel`, `die`. Shake the camera
  `ST_SHAKE` as each foot comes down (the walk's left at 0, right at 0.6 s of each 1.2 s round).
- THE COALS: at `ST_COALS.mark` take where the hero stands as `aim` (tiles along his forward, and to his left) and keep it; at the
  hit seven coals fly (`coalAt`), each landing at `ST_COALS.hit + coalLands(i)` on `aim + COAL_SPOTS[i]`; a fire `COAL_FIRE.r`
  round burns there `COAL_FIRE.burns` s (the rules' damage: a hero within it as it lands, and while he stands in it).
- THE RAKE: from its hit each patch of `RAKE_PATCHES` (a way and a distance) catches as the blade passes it (`rakePasses`) and
  burns `RAKE_FIRE.burns` s; a hero standing on a burning patch is burnt.
- THE BURST, only when he is low on life (a suggestion: below a third): from its hit the ring's front is `ringAt(since)` tiles
  out; a hero within `RING.deep` of it as it passes, and not in a gap (`inGap`, degrees off his forward), is struck once.
- Draw each with the painters above at his floor point (the ring's far and near halves can be split, `ringFloor(..., half)`, to
  sort with the hero).
- HIS DEATH: play `die`; at its end lay the gear (`gearDropped`) at `GEAR_REST` as the thing to pick up; carried, it is the
  item `gearIcon()`.
- THE ROOM: the furnace lit in the side area's wall; the crank beside it, `missing` until the hero brings the gear, then `set`
  (ready, glowing); used: `turning` (1.2 s), then `turned`; then the furnace `going` (1.6 s) and `out`; and in the Chained One's
  gateway the fire `going` (1.5 s) and `gone` (the way open).

## The checks (tests/stoker.test.ts, 10; all pass)

1. the switch off; nothing of the game imports any of the four files;
2. EVERY MOVE THROUGH EVERY BOSS CHECK (art/boss_checks.ts `checkBoss`: SLIDE, FLOOR, ARM, THROUGH, JERK, JUMP, BLOW, HIPS, ALIVE,
   STRIKE), every frame of all seven moves, from in front and truly from behind, and every handover: **nothing found**;
3. HIS LIGHTNING STRIKES: each of the three in two frames, landing on the second; smeared then and in no other frame;
4. every frame both ways round: nothing cyan, the pink rim while he lives and none as he dies, crisp;
5. nothing cut off; 6. nothing of him in the floor (his boots on their toes, his shins as he kneels, the gear as it rolls flat);
7. the shovel in his fist in every frame he holds it, his left fist on its haft when it holds it; his eyes the enemy's pink; his
   fire an honest orange; the coals blazing on the shovel held high;
8. his size (twice the knight), his walk, each attack held a third of a second and more, each marked before it comes; the coals',
   the rake's and the ring's numbers; the gear out of his grate only as he dies, lying flat where it rests;
9. what his fire does on the floor, painted both ways round: crisp, no cyan, nothing cut off, marked in pink before it comes (no
   fire yet), fire after, burnt out at the last;
10. the furnace room: every picture painted and crisp, no cyan but the crank's handle when it is ready; the furnace lit and out and
    going out (dying down), the fire in the way and its going out and gone; the icon 32 by 32 with its white rim; floor 3's colours
    the same as art/prison.ts's; the made copies let go by `forgetMade`.

Also passing: tests/bosses.test.ts, tests/new_mobs3.test.ts, tests/palace_hands.test.ts, tests/princess.test.ts,
tests/prison.test.ts, tests/rime_shade.test.ts; `tsc --noEmit` clean. Changed outside its own files: only the import checks,
`tests/bosses.test.ts` (tests 1 and 12: its lists of mock-ups built on the bosses' own footwork and checks) and
`tests/new_mobs3.test.ts` (its list of mock-ups built on the new monsters), each told of the Stoker's files as of every mock-up
before them. No shared engine file touched; art/prison.ts and art/prison_gate.ts are not imported by the room (their colours and
the gateway's way are said again in it, and tested to be the same), so floor 3's own import check stands as it was.

## Tools

- `npx tsx tools/stoker_pics.ts look|big <dir> [...]`: frames to look at; `sheet <dir>` then `python3 tools/rime_shade_sheet.py
  <dir> stoker_sheet.png`; `film <dir> [parts]` then `python3 tools/hush_shapes_film.py <dir> stoker.mp4`.

## For him to decide (the art chat's to ask)

- THE FINISHER: the furnace's burst, its ring with three gaps to step into (the thing to learn to read). When it comes (below a
  third of his life suggested), and whether the gaps stay where they are marked or turn each time.
- HOW HARD: seven coals with 3 s fires; the rake's band 1.5 to 4.2 tiles burning 3.6 s; his walk 1.4 tiles a second (heavy, but he
  covers ground). Each is one number.
- A HINT, NOT DRAWN: the gear could be glimpsed glinting among the coals behind his grate while he lives, so you know what he has.
- THE CRANK'S HANDLE glows the player's cyan once the gear is set in (as floor 3's levers do when they are yours to pull).
- The knight stands still in the film (a stand-in for size); the room is a stand-in laid from floor 3's own floor and walls.
