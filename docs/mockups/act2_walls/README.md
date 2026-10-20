# Act 2's walls standing whole, floor 11's roofs, and the ground at a floor's start (handed back to the main chat)

The art chat's branch `mockup/act2-walls`, from `v23` at d9c0bcb (23.2 as live). Unlike the art chat's other mock-ups,
THIS ONE CHANGES THE GAME and its switch is ON, at his word (below): it is for the main chat to take into the next
version, with the release's tests.

## What he asked, in his words

To the art chat, 20 Oct 2026, 07:41 Pacific: “Level 11 needs some work.  The doorways are very hard to see, the roof and
ground textures are hard to distinguish between.  All the 11-15 levels have weird slanting walls that I hate.  I know
it’s so they don’t hide the character when he goes behind them but I just want that wall piece to go transparent when
you walk behind it.” And: “Floor textures weren’t loaded at the beginning of levels”.

He was sent pictures (the walls now and new, floor 11's doorways now and new) and a video of the hero walking behind the
walls. His answer: “Put everything in but the doorways.  With the new walls I think it’ll look fine”. So the walls,
floor 11's new slate and the loading fix are in; the doorways are exactly as they were.

## 1. The ground at a floor's start (329dbc3; no switch: a fix)

The ground's worker paints the floor's monsters' pictures and the Gate Ward's shells too (wanted at 2); the ground's
pieces round the screen were wanted at 4 to 9, so after all of them, and a piece asked for ahead was never asked for
again as it came on the screen, so the screen showed the floor's deep colour there for tens of seconds.

- render/outdoor.ts: the pieces round the screen wanted at `1 + min(0.99, d/64)`, nearest first; one on the screen and
  not yet come wanted again at 0; one on the screen that the worker has not sent within `LATE` (150 ms) painted by the
  game itself (a few a frame, inside the frame's budget).
- render/painter.ts: the worker takes a piece wanted again as the same piece wanted sooner.
- Measured, `tools/scenarios/floor_start_holes.mjs` (the test bot playing from the floor's start, 10 s, headless on a
  two-core machine): frames with part of the screen unpainted, v23: floor 11 289 of 304 frames (to the end), floor 14 339
  of 373, floor 8 470 of 472; with the fix: 41 of 285 (none after 6.0 s), 21 of 372 (3.4 s), 46 of 472 (3.7 s). With the
  walls on as well (f50fdbd, `dist` built from it): floor 11 29 of 77 frames (the last at 8.8 s), 12 64 of 139 (10.1 s),
  14 20 of 179 (4.3 s), 15 122 of 273 (7.8 s). The first seconds of floors 11 and 12 are slow headless here with the walls
  off as well (their monsters' pictures and houses being painted); NOT MEASURED on a phone.

## 2. The walls standing whole, seen through round whoever is behind them (behind `ACT2_WALLS`, ON)

render/act2_walls.ts `ACT2_WALLS = { on: true }`. Off, everything is as in v23.

- WHICH FLOORS (`wallsThick`): floor 11, the Gate Ward, every house roofs and all (`Infinity`); 12, 14 and 15 (the
  Undercity, the House of Quiet, the Great Library) a wall a tile thick round the floor (`1`); 13, the Millrace, none (it
  has no walls toward the eye). Floors 1 to 10 are untouched.
- art/standing.ts: what stands whole that the ground (cut down to the floor's level, the "slanting walls" he hated) does
  not show, painted a piece at a time with the ground (`paintWithStanding`: the ground exactly as art/terrain.ts paints
  it, tested equal, with the standing walls over it), cut into bits (`standingBits`), one for each line of tiles across
  the screen; a top's far edge a line of shadow. `nearOf`: only rock near the floor stands.
- render/outdoor.ts and the worker (render/painter.ts) paint the bits with each piece; render.ts stands each bit among
  the figures at its tiles' depth (x + y + 1), as a wall tile, so it hides what is behind it and not what is in front.
- SEEN THROUGH: where the hero, or a monster in sight, is behind a bit, a soft oval is cut in it round him
  (`HERO_WINDOW` half widths 56 by 58 game pixels, its middle 18 over his feet), the wall left at `WINDOW_FAINT` 0.15 at
  its middle and fading to whole at its edge; it opens and shuts over `OPEN_FOR` 0.2 s (`WallWindows`, `drawHoled`).
- render/act2_houses.ts: on floor 11, a house walked into stands whole over the street behind it too
  (art/gateward.ts `houseShellWhole`), seen through likewise; its shell painted nearest the hero first, before the
  monsters' pictures, and painted by the game itself when it is on the screen and the worker has not sent it within
  `SHELL_LATE` 0.3 s.
- FLOOR 11'S ROOFS (“the roof and ground textures are hard to distinguish between”): with the switch on
  (`GateWardLand.fresh`), the roofs' slate is `GW_SLATE_FRESH`, a cold blue-black, darker and bluer than the street.
- THE DOORWAYS: art/gateward.ts `doorway()` exactly as in v23 (his “but the doorways”).
- main.ts: `__dbg.act2Walls` (the switch, for the playtests).

## Tests

- tests/act2_walls.test.ts (8): the switch and which floors; what stands is rock, in front of what it covers, a tile
  thick on the floors of rooms, one bit a line of tiles; the Millrace has none; a window opens and shuts over
  `OPEN_FOR`; floor 11's slate darker and bluer than the street, only with the switch; a house walked into stands over
  the street behind it and never the street before it; the ground round the screen wanted before the monsters and the
  houses, a piece on the screen wanted again only sooner; the ground painted with the walls equal to the ground alone.
- THE WHOLE UNIT SUITE at f3f11c6 (the switch on): 2270 of 2270. After it, f50fdbd (the walls painted with the ground in
  one pass, a speed-up only): tsc clean; the nearest tests run again (terrain, ground, gateward, act2_gateward, floor11,
  act2, new_mobs3, undercity, housequiet, library, act2_walls, act2_bells): 89 of 89; on its page, bells on each of
  floors 11 to 15, act1_floor (floor 8) and dungeon: all finished clean.
- Playtests of its own: tools/scenarios/floor_start.mjs, floor_start_holes.mjs (the measure above), act2_walls.mjs (the
  walls and a window, pictures), walls_film.mjs (the video he saw), gw_doors.mjs (floor 11's doorways, pictures).
  tools/bench_act2_ground.ts times each floor's ground; tools/standing_look.ts pictures one piece.
- NOT RUN: the regression; a real phone.

## For the main chat

Take `mockup/act2-walls` into the next version (it is from v23 and touches the game's render files: outdoor.ts,
painter.ts, render.ts, act2_houses.ts; art/gateward.ts; main.ts). Tell him when it is live: he asked for it.
