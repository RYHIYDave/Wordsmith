# The Drowned Eye redone: the Swamp Colossus (stage 1: his look and the new arena, in pictures)

A MOCK-UP: NOT IN THE GAME. The art chat's, branch `art/eye-redo`. His new look is `src/art/eye_colossus.ts`, behind
`EYE2 = { on: false }`; nothing of the game imports it (`tests/eye_colossus.test.ts` holds it). Nothing of the old Eye
(`src/art/drowned_eye.ts`, `art/act1_figs/eye.ts`, `game/act1_rules/eye.ts`) is used in it. Nothing moves yet: these are
stills, for his yes before anything is animated.

## His words, 7 Nov 2026

- 00:07: “if you get time, i think the whole sunken eye fight needs to be redone.  hes just not scary or intimidating.  the arena doesnt really work, and his entrance is not epic.”
- 00:08: “maybe instead of a circle its a big rectangle and hes in the water in front of you.”
- 00:08: “well, like up on the screen above you”
- 00:10: “start with just tentacles coming up, kill both of them, then he emerges with three.  kill the three with extra attacks from the main body, final phase he uses the magic, maybe keep three tentacles.  kill the tentacles and his body.  flasks reset in between each phase for now”
- 00:11: “but lets get new art for the whole thing”
- 00:13: “just scrap his look and start fresh.  big ancient gross eldritch horror swamp monster with tentacles and a big eye.”
- Asked which take to draw first, his pick: “Swamp colossus (Recommended)”, offered as: “A rotting hill of moss-grown flesh filling the top of the screen; one huge bloodshot eye under a heavy brow; a split maw of teeth below; slime, weed and old bones on it; thick slimy tentacles.”

## The pictures (`pictures/`)

- `eye_look.png`: his look. Risen, from in front, at the game's size, the Warrior on the stone before him twice (from behind
  and from in front) for scale; his eye and maw at twice the size, the maw shut and torn open; one tentacle at twice the size;
  under the water (phase 1), only his eye's fire and the dark hill of him through the black water; from behind, at half size.
- `eye_arena.png`: the new arena as the player sees it, a phone held sideways (the game's own 507 x 234 game pixels, two
  picture pixels to each). Phase 1: the black water across the top, his eye's fire under it, two tentacles up out of it, the
  hero on the stone below. Phase 2: him risen, filling the top of the screen, three tentacles, the hero below. Each again at
  twice the size, in two halves. At the foot, small: today's fight from the game itself, and the new one beside it.

Everything round him is the game's own: the fen's paving and black water from the fen's terrain painter (`art/fen.ts`,
`art/terrain.ts`), the fen's pieces (`art/floor10.ts`: broken columns, cattails, sedge, mossy stones, column drums, lily
pads), and the Warrior as the game paints him (`art/heroes3.ts`).

## What he is

A hill of rotting flesh risen out of black water, facing the camera always. Hung in folds and sagging rolls, wet and slick,
grey-green and bruised violet in his creases; moss on what faces up; slime running down him with a wet glint where the light
takes it; boils. Old bones grown into his hide: a horned beast's skull on his left shoulder, the great ribs of something across
his right, the skulls of the drowned; a drum of a fallen column and a broken slab of the fen's ruin sunk in his crown;
barnacles crusting him at the waterline; leeches; weed and slime hanging off every overhang. At his heart one huge eye under a
heavy overhanging brow: yellowed, bloodshot, its iris the enemy's pink burning to gold round a black slit, set between thick
raw-rimmed lids, looking at you. Below it his maw: a wide gash, its lower jaw split down the middle; shut, a row of fangs
locked over his lip and a seam down his chin; torn open, the jaw's two halves drop and part, fangs all round the gape. His
tentacles: thick, tapering, slick, mottled and scarred along their backs, pale beneath, suckers in two rows along the inside
of each curl; each an enemy of its own, rising out of the water. An enemy: the pink edge round him; pink and gold his only
glow; nothing cyan.

How he is painted: his own solids, smooth-joined, in his own space (his own lengths, as the game's figures', TILE3 to a
tile), looked at ray by ray as the game's camera looks (from above at 30 degrees), two picture pixels to a game pixel; lit
from the upper left in five tones a material, with the light's own shadow (his brow shades his eye) and the dark of every
fold; the indigo seam where one part ends before another; what of him is under the water seen through it, darker the deeper.

## His numbers

- The phone's screen: 507 x 234 game pixels (`engine/screen.ts`; the game's own playtest logs it on a phone held
  sideways). That is 15.8 tiles across and 14.6 tiles top to bottom (a tile 32 x 16 game pixels); along the floor, about 22
  tiles across and 21 deep.
- Him risen, with his arms: 424 x 263 game pixels (848 x 526 picture pixels): five sixths of the screen's width. Over the
  water at his crown he stands 167 game pixels; the knight stands 29. His eye 66 of his lengths in radius: about 76 game
  pixels across, two and a half times the knight's height.
- Today he is about 127 x 61 game pixels on the same screen (measured from the game, `tools/scenarios/eye_today.mjs`), his
  eye about 32 across.
- The arena (`tools/eye_redo_pics.ts` ARENA): the stone a rectangle the width of the screen and on down past its foot; the
  black water across the top from 8.4 half-tiles (134 picture pixels) below his middle. In the pictures the camera leans
  toward him 69 game pixels, as it leans toward the Moth (`render/render.ts` MOTH_LEAN: at most 0.3 of the screen, 70), so
  the hero stands low on the screen; even so the top of his crown runs off the top of the screen, about 60 game pixels.
- Under the water (phase 1) he lies 272 of his lengths down (his crown just under the surface) and 200 further out.

## Why the fight today is not scary (the audit)

1. His size: about 127 x 61 game pixels on a 507 x 234 screen, his eye about 32 across: about the hero's own height.
2. Where he sits: flat in a pool in the middle of a round ring, seen from above, with the hero right beside him; nothing of him looms over the hero.
3. How he moves: he never moves or turns (`game/act1_rules/eye.ts`); risen he only sits higher in his pool; his arms come up from cracks round the ring.
4. His frame rate: his frames are up to 860 x 790 picture pixels, so he is held at 15 frames a second and his surfacing and death at 10 (`EYE_MOVES`; `EYE_COST`, 676 frames, 320 MB): his biggest moments are his choppiest.
5. His entrance: a 4.2-second surfacing at 10 frames a second; the screen shakes twice (7 at the break, 5 at the roar) with a slam, a wave and his roar; the camera does not move and the screen does not darken.

## An epic entrance, within the game as it is (choices to put to him)

- What rises first: the water goes still and black; rings spread; his eye opens under the water and its fire swells; then his
  crown breaks the surface with weed and muck pouring off him, then his brow, and the eye comes up out of the water already
  looking at you; last, his maw tears open in the roar.
- The screen darkens: the fen's dusk drops to near night for the rise, so that his eye's fire and the hero's own light are
  all that is lit; it comes back as he roars.
- The screen shakes: a low rumble growing all through the rise, a big shake as he breaks the water, another at the roar.
- The camera: glides up toward the water as he rises and settles leaned toward him (the Moth's lean), so the hero drops to the
  foot of the screen and he fills the rest.
- The water: a wave rolls off him over the stone's edge as he comes up; muck and weed rain down.
- The sound's cue (for the sound chat, whose rules these are now): the music cuts to silence; a deep rumble; a wet tearing
  groan as he rises; his roar on the maw opening; then his music.
- Recommended to put to him: the eye first, then the rise in the dark, the roar, the camera leaning.

## What he costs

- A frame of him risen, his arms with him: about 860 x 540 picture pixels, at 4 bytes a pixel 1,857,600 bytes (1.77 MB).
- Baked at 30 frames a second: 53.1 MB for each second of him; a stand of 3 seconds, 159 MB; ten moves of about 3 seconds
  each, about 1.6 GB. Too much to hold whole. Ways to afford him (for the main chat): his body painted once a few times a
  second and only what moves (his eye, his maw, his arms, each a small picture of its own) at 30; or baked to files and read
  as they are needed (his word of 6 Nov: the game may carry files).
- Painting a frame, here without a browser: about 36 seconds risen, 23 under the water (this container, one core). Not to be
  painted while the game runs: baked.

## How to make the pictures again

```
node tools/playtest.mjs --touch --size 844x390 --dpr 3 --scenario tools/scenarios/eye_today.mjs --out shots/eye_today/x
npx tsx tools/eye_redo_pics.ts look shots/eye_redo/look
npx tsx tools/eye_redo_pics.ts arena shots/eye_redo/arena
python3 tools/eye_redo_sheet.py look shots/eye_redo/look docs/mockups/eye_redo/pictures/eye_look.png
python3 tools/eye_redo_sheet.py arena shots/eye_redo/arena shots/eye_today/x_risen.png docs/mockups/eye_redo/pictures/eye_arena.png
```

## Checks

`tests/eye_colossus.test.ts`: the switch off and nothing of the game importing him, nothing of the old Eye in him; his
pictures (risen from in front and from behind, his maw torn open, under the water, a tentacle alone) with nothing cyan, the
pink edge round him, his iris pink burning to gold; his lengths the game's, a frame's cost. `tsc --noEmit` clean. Stage 1
only: no moves, so the boss checks (`art/boss_checks.ts`) come with his moves.
