# Mock-up: the Crypt, less finished the deeper it goes; the stairwell down, the waypoint, the town's gate (NOT IN THE GAME)

**What it is.** The look of the Crypt's first four floors, each a step less finished than the one
above it, from old and crumbling stone on the first to half earth and rock with rusted mining gear
on the fourth; the stairwell that leads down from each floor; the waypoint at the start of every
floor but the first; and the town's gate made one of the levels' gates, opening as the hero comes.
As pictures and films in the game, for the owner. NOTHING OF IT IS IN THE GAME: it is behind two
switches that are off (`CRYPT`, art/crypt.ts; `CRYPT_LITTER`, game/dungeon.ts), and where the
stairwell, the waypoint and the gate stand, and what they do, are the main chat's to build once he
has said yes.

**HE HAS SAID YES to all of it as shown (10 Oct, by 07:29; his words below).** It is the main
chat's to build in. With it he set a new rule for every floor (his art rulebook, Places 7): each
floor themed after its boss, with 40 to 50 pieces of its own. Those are still to be made; what is
here is the Crypt as shown to him.

**State of this branch (`mockup/crypt`):** on `main` at Version 20.0 (`aaa8310`). Made by THE ART
CHAT, 10 Oct 2026, from 04:55, while he slept.

## His words

- His outline of the first five floors, in the main chat, 9 Oct 2026, 22:47 (posted to the chat
  board at 22:52), the parts that are this: "The gate on the wall with be turned to a gate from the
  levels.  It will open automatically as you approach it and go through.  you will enter floor 1 of
  the Crypt.  You find the dead wordsmith and the quest item to turn the altar on, kill the warden
  and find a stairwell leading down.  At the bottom of the stairs is Crypt floor 2.  There is a
  waypoint that will warp you to town and back at the beginning over every floor except the first
  as you could just walk back through the gate." And: "Now, the idea is that the deeper you go, the
  less finished the crypt.  The top floor, while old and crumbling, is all stone.  As you go down,
  there’s more and more missing and more just dirt around.  By floor 4 it’s about half dirt and
  rocks with discarded and rusted mining equipment around."
- To the art chat, 10 Oct 2026, 01:58: "I’m going to trust you that these are sick after all the
  tests and just throw them in.  Finish the amalgamation and throw that in to.  AFTER the checks
  tho.  Going to bed.  Work on the environments after.  Apply the checks."
- His art rulebook (approved 8 Oct 2026, 08:23; his doc at rev 41), the rules this is held to:
  Colour 1 to 5 (a palette per place; a dark base; glows reserved, "the town's friendly magic, such
  as the wordsmith's circle and the gate" cyan; a place darker and duller than any word's colour;
  "never mud-brown all over"); Places 1 to 6 (rich detail; a step quieter; solid, not flat; "Old,
  broken and burnt": "flagstones cracked or gone"); Pixels 1 to 7.
- His answers in this chat, 10 Oct 2026, to the review page "Crypt Review"
  (https://claude.ai/artifact/K2KBZoF2RnnYZWVZMfNqAa), asked as pop-ups, our pick first:
  - "The Crypt's four floors, as on the Crypt Review page: good to build as shown?" ("Yes, as shown
    (Recommended)": "The main chat builds them into the game."; "Some need work"). By 07:29, in
    his own words: "Yes.  I’d also like each floor to be themed after the boss.  Add this to the
    ruleset.  We need somewhere between 40-50 unique assets on each floor for each boss.  That can
    include wall tiles, floor tiles, breakables, stuff on the walls, on the floor, obstacles, the
    looks of doors and gates, traps, and quests." Read as: yes to the four floors as shown; and a
    new rule in his art rulebook (Places 7, his doc at rev 43): every floor takes its theme from its
    boss, with between 40 and 50 pieces made for it alone.
  - "The stairwell, the waypoint and the town's gate: good to build as shown?" ("Yes, as shown
    (Recommended)": "The main chat builds them in, and your rulebook's line on the gate's cyan
    changes with it."; "Some need work"). By 07:29: "Yes, as shown (Recommended)". So Colour 3 of
    his rulebook now names the waypoints as friendly magic, and no longer the gate (rev 43).
  - "The bone beast (the skull on four bony arms that bursts out of the amalgamation) needs a sound
    brief for the sound chat. What should it sound like?" ("Clacking jaw, skittering claws
    (Recommended)": "Bony claws ticking on stone as it scuttles, fangs snapping, a shriek as it
    dies."; "Echo of the hundred jaws"; "An insect's chitter"). By 07:29: "Clacking jaw, skittering
    claws (Recommended)". Posted to the sound chat.

## What was read, and what is shown

- **The floors.** Read as: the Crypt keeps the vault's indigo stone (it is the dungeon he knows:
  every dungeon is the vault today), and what changes floor by floor is how much of it is there.
  The earth is a dark plum and the rock a grey violet, so that neither is mud brown, both darker
  than the stone.
  - FLOOR 1, "old and crumbling, is all stone": every flagstone there, but one in six of them has
    lost a corner and one in six is cracked across (the vault: one in fourteen of each), earth
    showing in the gaps; the walls' stones chipped at their corners and cracked down. About 1% of
    the floor earth.
  - FLOOR 2: here and there a flagstone gone, in patches, earth and stones where it lay, the edges
    of the stones round it broken raggedly; one in eight of the walls' stones fallen out, rough rock
    behind. About 16% earth.
  - FLOOR 3: a third of the floor earth; more rock in the walls; the stone that is left dirtier.
    About 33% earth.
  - FLOOR 4, "about half dirt and rocks": half the floor earth and half the walls' stones rough
    rock. About 52% earth. Its pillars are a miner's pit props: a squared post on a flat stone, a
    cap-block across its head, a strut set slanting against it, an iron band, an old lantern on a
    nail, long out.
  - DEEPER THAN THE FOURTH, as the fourth (floor 5 is not briefed yet).
  - WHAT LIES ON THE FLOOR: the vault's dressed rubble on the first; rocks coming in on the second;
    on the third a pick and a bucket among them; on the fourth "discarded and rusted mining
    equipment": a pick, a shovel (rusted through), a sledgehammer, a bucket on its side, a length of
    track, each lying on the grid. The iron is the monsters' IRON and the rust their RUST
    (art/mkit.ts), a step duller; the wood the dungeon's plum, old. With `CRYPT_LITTER` on, the
    deeper floors have more lying about: for each of the usual things, 0.3 more on the second, 0.7 on
    the third, 1.2 on the fourth (all of it what the art draws as rubble). It is laid last of
    everything, by dice of its own, where nothing else is (no stair, no trap, no doorway, nothing
    standing or lying, not near the start or the boss), so that nothing else of a dungeon changes:
    its shape, packs, doors, traps and stairs are the same with it on (tests/crypt.test.ts, test
    3). (The one thing that may move: the fallen wordsmith, where he lies on a deeper floor because
    he was not found on the first, keeps off what lies on the floor, so he may lie a tile over.)
- **The stairwell down.** An opening in the floor 2.4 tiles long and 1.25 across, a kerb of
  dressed stone round three sides of it a few pixels high, the fourth side (the top of the steps)
  open to the floor; a flight of steps goes down it toward the eye and on under the floor, into the
  dark. Painted as the eye sees it, each pixel looking down through the opening until it meets a
  step, the end of the shaft or its side; the deeper, the darker (as a pit's sides are). In each
  floor's own stone; chipped as its stones are; on the deeper floors rock in the shaft's sides.
  Each way: going down to the lower right of the screen ('x') or to the lower left ('y').
- **The waypoint.** Friendly magic, so its light is the friend's cyan. A round dais of the floor's
  stone a step high (1.5 tiles across, 4 game pixels high), a ring cut in its top with eight marks
  round inside it and a disc in the middle. Asleep (not yet found) its cuts are dark. Awake (read
  as: woken when the hero first comes near it) the cuts are alight, a brighter light goes round the
  ring and lights each mark as it passes, the disc brightens and dims, and motes of light rise off
  it, and it lights the floor round it. Warping: a column of light stands up out of the disc,
  flares white, wider than the hero, and thins away to nothing; a ring of light goes out across the
  dais; its light rises and goes with it. THE FILM IS CUT AT THE FLARE, the column hiding him, and
  faded to black: that fade is the film's, not the game's. The hero's going (the game has a warp
  of its own, the mage's phasing out and in, render.ts `PHASE_OUT`) and where he comes out are the
  main chat's. The whole warp, every frame of it: `shots/crypt/warp_strip.png`.
- **The town's gate.** Read as: the field of light in the town's back wall goes, and one of the
  levels' gates stands there (art/gates.ts as it is: two pillars, a plain arch, the portcullis,
  as a lever's gate has them), in a doorway of three tiles open to the dark beyond; it rises at
  the game's own pace (GATE_RISE, 1.1 s) as the hero comes within 6 tiles of it, and he walks up
  and under it at his own pace (TUNE.heroSpeed, 4.6 tiles a second). It has to begin that far
  off: he is at its bars a little over a second after, and it is then 95% up, its spikes over his
  head; begun nearer, he would walk into them. The film ends, faded to black, as he goes into the
  dark; going through to floor 1 is the main chat's. (With the cyan field gone the gate is no longer the town's friendly magic: his rulebook's
  Colour 3 names "the gate" as one; it would need his word to change, with the gate.)

## The pictures (not in the repository: `previews/` and `shots/` are ignored)

- `shots/crypt/game_d1_now_*.png` and `game_d<k>_crypt_*.png`: rooms of dungeons 1 to 4 in the game
  at a phone's size (844 x 390 points, 3 pixels to a point), the first as the game has it now and
  then each floor of the Crypt; `tools/scenarios/crypt_floors.mjs`.
- `shots/crypt/ways_stairs_d<k>.png`: the hero at the top of the stairwell on each floor;
  `ways_d<k>.png`: a room of each floor with the stairwell and the waypoint in it;
  `tools/scenarios/crypt_ways.mjs` (MODE=stairs, MODE=photos).
- `previews/crypt/waypoint.gif`: the waypoint film, on floor 2 (MODE=film).
- `previews/crypt/town_gate.gif`: the town's gate film; `tools/scenarios/crypt_gate.mjs`.
- `shots/crypt/pieces.png`, `stairs.png`, `way.png`, `warp_strip.png`, `floors.png`, `room1.png`
  to `room4.png`: the pieces by themselves; `src/dev/preview_crypt.ts` (modes floors, room:k,
  sheet, pieces, stairs, way:k, warp:k).

The pages for the films are built with `node tools/build_to.mjs dist/crypt.html`, and each
scenario run with `node tools/playtest.mjs --file dist/crypt.html --touch --size 844x390 --dpr 3
--scenario <scenario> --out <prefix>`.

## In the code

- `src/art/ground.ts`: `Theme.earth` (`Earth`: `gone`, `raw`, `broken`, `dirt`, `rock`). A theme
  without it (the vault) is painted exactly as before: every one of its pictures checked against
  `aaa8310`, the same to the pixel (tests/crypt.test.ts, test 1). With it: flagstones gone to earth
  in patches, the exact share (`goneOf`), the stones round them broken raggedly, earth in the lost
  corners; walls' stones gone to rough rock (`raw`), and chipped and cracked down (`broken`).
- `src/art/crypt.ts`: `CRYPT` (the switch, off; and `CRYPT.marks`, where a picture puts the
  stairwell and the waypoint), `CRYPT_FLOORS` (the four themes), `cryptFloor(depth)`,
  `cryptGround(k)`, `cryptProps(k)` (each floor's litter, named by `cryptLitter(k)`, and its
  pillar), `cryptWays(k)` (its stairwell
  each way and its waypoint), `cryptPieces(k)`, `forgetCrypt()`. Each made the first time it is
  asked for, and kept.
- `src/art/crypt_ways.ts`: `makeStairwell(theme, way)` (anchored at the opening's corner up the
  screen: STAIR_LONG, STAIR_WIDE, STAIR_KERB); `makeWaypointArt(theme)`: `asleep`, `awake`
  (WAY_FRAMES, 12, a loop at 10 a second), `motes` (12, over it), `warp` (WARP_FRAMES, 12 at 20 a
  second: the column up by frame 3, flaring at 4 and 5, thinning away, gone at 11). The dais is
  anchored at its middle; WAY_R its reach in tiles.
- `src/game/dungeon.ts`: `CRYPT_LITTER` (off) and `moreLitter`, laid at the end of
  `generateFloor`: with it off every dungeon is as it was (150 checked against `aaa8310`, the
  same; test 2).
- `src/main.ts`: with `CRYPT` on, each floor's ground and props are swapped in as the hero goes
  down (the vault's in town); `__dbg.crypt(on)` (both switches), `__dbg.cryptMarks({stair, way})`.
- `src/render/render.ts`, behind `CRYPT` only: `flatCrypt` and `standCrypt` draw the stairwell and
  the waypoint where `CRYPT.marks` puts them; and a town with a door in it has no field of light in
  its gate (for the gate's film, which puts one of the levels' gates there itself).

## For the main chat (his yes by 07:29, 10 Oct)

- HIS RULEBOOK changed with it (his doc at rev 43; `docs/art/RULEBOOK.md` here is the copy, with
  the change of 9 Oct from `mockup/bosses` in it too): Colour 3 names the waypoints as friendly
  magic, not the gate; Places 7, each floor themed after its boss, 40 to 50 pieces of its own.
  The pieces are the art chat's to make, pictures to him first. Breakables, obstacles, traps and
  quests are things of the game as well as pictures: their rules are yours.

- WHERE THEY GO is yours: the stairwell (after the boss: in the boss's hall, or a room beyond it),
  the waypoint (at the start of floors 2 on), the town's gate (its doorway in the town's wall, and
  going through it to floor 1). The rule that lays what lies on the floor (`CRYPT_LITTER`) is a
  suggestion; the share of each kind is the art's (the lists in `cryptProps`).
- THE STAIRWELL is drawn here flat, before anything that stands; its kerb stands a few pixels
  over the floor, so a figure standing just behind its near side should be hidden by it there (as a
  raised floor's edge hides what is behind it). Its opening is no floor to walk on, but for the top
  of the steps.
- THE WAYPOINT: its dais flat (a figure behind it stands on the floor, not on it), its motes and its
  column standing at its middle, the column a little in front of the hero on it.
- THE PAINTING: each floor's pictures are painted when it is first reached, and kept. Measured
  here (tsx, `shots/crypt_cost.ts`): a floor's ground about 0.4 s (the vault's, painted as the
  game starts, 0.35 s), its props 0.02 to 0.13 s, its stairwell and waypoint 0.18 to 0.35 s; a
  phone several times that. Worth painting the next floor's while the hero is on this one, or
  behind the screen that comes up as he goes down the stairs.

## The checks (his word at 01:58: "Apply the checks.")

`tests/crypt.test.ts`, 13 tests, all through, and the whole unit suite with them:
1. With the switches off, the vault's every picture as at `aaa8310` (one hash of them all).
2. With the switches off, every dungeon the map-maker makes as at `aaa8310` (150 of them).
3. With it on, only what lies on the floor changes: the shape, the packs, the doors, the traps,
   the stairs as they were; what is added is rubble, on no stair and no trap and nowhere taken; more
   of it floor by floor, none more on the first.
4. Each floor as much earth as he said: the first under 3%, the second 8 to 24%, the third 26 to
   42%, the fourth 44 to 60% ("about half").
5. The walls go to rough rock floor by floor, and the first floor's have none.
6. Crisp pixels: every pixel whole or not there, but the four steps the top of a wall fades out
   in; painted at the heroes' grain.
7. Glows reserved: no cyan and no pink in the places, the gear, the stairwell or the dais asleep;
   the waypoint alight with the friend's cyan, and never pink.
8. Darker than any word's colour (99 in 100 of every floor's pixels), and nothing brighter than
   the vault's brightest.
9. Light from the upper left: each floor's walls lighter on the face turned to the left; every
   rock lit on its left edge; the pit prop lit on its left.
10. The floor's tiles exactly their diamonds, the pattern coming round every ten tiles.
11. What lies on each floor: the vault's rubble alone on the first, rocks from the second, a pick
    and a bucket on the third, all the gear on the fourth; each laid by its middle; the stone pillar
    on the first three (the vault's own, to the pixel, on the first), the pit prop on the fourth.
12. The stairwell: its kerb's edge lit; darker going down; the dark at the bottom.
13. The waypoint: asleep, no light; awake, every frame its own and its light going round, all one
    way, once round in a loop; a warp's column rising, flaring and thinning away.

And a second look with fresh eyes (one who had not made it) found thirteen faults; all are mended
and checked again: more litter moved the traps and stairs (it is laid last now); the gate's film
walked him slower than the game does (it is at his pace now, and the gate begins to rise further
off); the broken corners of the walls' stones were lit the wrong way round; cracks ran through
rough rock; two of the waypoint's eight marks were dots; the warp's light stayed after its column;
the column did not hide him; the bucket was not on the grid; the pit prop's faded top could read as
holding up what stood behind it (it has a cap now); the stairwell's kerb edge was in shade and the
rock in its sides was a checker; and some tests and notes said more than they checked.
