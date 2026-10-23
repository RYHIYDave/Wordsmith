# The rivers flowing, in the mill race's look, and a livelier water wheel (the art chat, 23 Oct 2026)

Branch `mockup/rivers`, from the main chat's `exits` at 361e997. Behind `FLOW` in `src/art/flowing.ts`, off. Off, the
ground and the wheel are painted exactly as before (checked here: the Millrace's ground, the Pinewood's and the wheel's 8
frames, painted on this branch and on 361e997, the same to the byte).

## His words (Pacific time)

- To the main chat, 23 Oct, 11:42, with a picture from his phone of floor 13: “The water wheel and the river are pretty
  boring.  I’d like the rivers to look a little better and flow, and have the same look and design as the waterwheel
  stream.  Also that chest is inaccessible.  I would love to be able to swipe move over rivers or flat paths”. Asked who
  should do it, “The art chat (Recommended)”; which rivers, “Every river (Recommended)” (offered as floor 13's and the rivers
  on floors 8 and 9). The chest and the swiping are the main chat's.
- Floor 8 (Echo Canyon) is a dry riverbed: no water there, nothing changed. Floor 9's river (the Pinewood) and floor 13's
  river and race are the rivers.
- Shown films from the game (before above, now below: floor 13's wheel and race, floor 13's river, floor 9's river), asked
  “Are the rivers and the water wheel right now?”, by 15:23, 23 Oct: “Yes, send to main (Recommended)”.

## What it is

- **The water**, every river's and the race's, painted as the mill race is: deep blue to light, foam streaks drawn out long
  along it, standing waves across it in broken chevrons pointing downstream, white water at its banks, glints; and
  **flowing**: `FLOW_FRAMES` (18) frames going round at `FLOW_FPS` (12), a round of 1.5 seconds, the foam and ripples carried
  downstream at each water's speed (the race 4 tiles a second, floor 13's river 1.6, floor 9's 2). Its bed (deep and shallow)
  stands still under it. The last frame runs into the first as any frame into the next.
- **Floor 13's river** banked as the race is, in its dressed stone kerbs (`riverKerb`), its water the race's. The race as it
  was, now running. All of it quietened as Act 2's places are (`quietRGB`).
- **Floor 9's river** in its own slate water and the same design, banked with rounded, mossy river boulders, wet near the
  water (`boulders`), in place of the mud bank.
- **The water wheel** (floor 13's pieces, `waterWheel2`): an eighth of a paddle a frame (`WHEEL_STEPS`, 8, to a paddle) so it
  turns smooth, faster (`WHEEL_TURN`, 32 frames a second: a paddle in a quarter second); sheets of water lifted off its
  paddles on the rising side and pouring off, drips, spray thrown off in arcs, the race churned white where the paddles bite.
  Nothing on it glows.

## For the game (the main chat's)

1. **The lands' new fields** (optional; `render/outdoor.ts` `landLook`, on the page and in the painter's worker), sampled as
   the others are (`gridField(W, H, 4, ...)`):
   - the Millrace: `riverAlong: lineAlong(land.river)`, `raceAlong: lineAlong(land.race)`, `riverSide: lineSide(land.river)`,
     `raceSide: lineSide(land.race)`;
   - the Pinewood: `riverAlong: lineAlong(river)`, `riverSide: lineSide(river)`.
   `lineAlong` (how far along the line, tiles, from its first point) carries what moves; `lineSide` (which side and how far)
   lays the streaks along the water round its bends. Without them the streaks are reckoned on the picture, which breaks
   into dots on a big floor. The lines run downstream as they are: on floor 13 the race leaves the river at its headgate
   ten tiles upstream of where it comes back in (checked on 12 seeds).
2. **The water over the ground**: each floor's `FlowLayer` (`millraceFlow(land)`, `pinewoodFlow(land)`, given the same land
   its look is). For a ground piece with water in it, `paintFlow(layer, x0, y0, w, h, frame)` for each of the `FLOW_FRAMES`
   frames gives the water alone (clear elsewhere; `box`, the part of it with any). Lay
   `frames[floor(game.time * FLOW_FPS) % FLOW_FRAMES]` over the ground's piece and under everything on it (the footbridges,
   figures). The ground's own piece already has frame 0's look under it. Both floors are all at one height (rise 0), so a
   picture pixel shows the world where it is.
3. **The wheel** (`render/act1_pieces.ts`): with `FLOW` on its frames are four rounds of `WHEEL_STEPS`: along +y turning
   forward, the same turning back, along +x forward, along +x back. Index:
   `(variant & 4 ? 2 : 0) * WHEEL_STEPS + (variant & 8 ? WHEEL_STEPS : 0) + step`, where
   `step = floor(turned * WHEEL_TURN / WHEEL_FPS) mod WHEEL_STEPS`. Its time as now (paused, slowed with the game).
4. **The switch**: `FLOW.on` decides at the time each look, flow and piece list is made.

`docs/mockups/rivers/scratch_hooks.diff.txt`: the lines that drew it in the scratch copy for his films (a guide only; never
pushed). The copy's `stepOnce` in `main.ts` and its short floor-name card were for filming only.

## Room and time

A ground piece (128 picture pixels square) with the river through it, its 18 frames of water: about 0.18 to 0.24 seconds
to paint with the fields sampled as the game samples them (measured here on a two-core machine busy with tests), about 13
thousandths of a second a frame. In the scratch copy they were painted on the page, the first time a piece was drawn; the
worker, or a few frames at a time, would keep that off the frame the player sees. Each frame of a piece kept whole is 64
thousand bytes, 18 of them about 1.2 million; only its `box` need be kept.

## Checks

- `tests/flowing.test.ts`, 5: the switch off, and only the Millrace's ground, the Pinewood's and floor 13's pieces import it,
  each behind the switch; along a line and across it (round a bend, its sides kept); the water only where water is,
  opaque, every frame moving on, the last into the first no more than any other, carried downstream, nothing cyan or pink,
  the Millrace's as quiet as Act 2's places; the river banked anew on the switch (dressed stone; boulders) and as before off
  it; the wheel's four rounds of `WHEEL_STEPS`, one size, a step each frame, round without a jump, nothing cyan or pink.
- The floors' own tests (`act2_millrace`, `floor9`, `floor11`, `floor13`, `floor14`, `millrace`, `pinewood`): 50 of 50.
