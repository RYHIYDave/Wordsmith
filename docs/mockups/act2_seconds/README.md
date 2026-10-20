# Act 2's five medium kinds: their second attacks (mock-ups, handed back to the main chat)

The art chat's branch `mockup/act2-seconds`, from the planning chat's `act2/build` at a0dadf2 (floors 11 to 15 in the
game behind `ACT2`, off). Nothing here is in the game until the main chat puts it there: every kind's switch is still
off, and nothing of the game imports the new pieces. No file of the game's is touched; only the five kinds' art files,
their floor marks, their dev pages and their tests, and tests/new_mobs3.test.ts's list of the art chat's mock-ups (the
three new floor-mark files, carter_shots.ts, dredger_shots.ts and watch_shots.ts, added to it).

## What he asked, in his words

The planning chat's post on the board, 19 Oct, 19:47 Eastern: its question to him, “Shall I tell the art chat to start
drawing their second attacks now?”, and his answer at 16:47 Pacific: “Yes”. His word to this chat at 17:10 Pacific:
"Art chat has new tasks". Read as (the planning chat's post): a second attack each for the act's five medium kinds, the
Hushed watch, the dredgers, the night carters, the orderlies and the Bookwardens, by his rule of 9 Oct (a medium monster
two attacks, a basic blow first and the bigger hit cooling down longer: their first moves stay their basic blows); each
a move of its own, its timings and reach here, on a branch of this chat's own, handed back to main. The emptied book and
the Knell were not part of his yes, and are not here.

**EACH MOVE IS THE ART CHAT'S OWN PICK**, made as the descent's mediums' second moves were (big, wild, kinetic, weighty,
a held warning with its mark on the floor, then the blow), and sent him as a video as it was made (MP4s now: GIFs do not
play on his phone, his words of 08:23 Pacific, 19 Oct). He has not answered any of the five yet. How hard each hits,
how often, what it does to the hero and how long it cools down are the main chat's.

Each is a move of its own in the mob's `more` (as the descent's): `ORDERLY.more.quake`, `CARTER.more.lashes`,
`DREDGER.more.net`, `WATCHMAN.more.round` and `WATCH_SERGEANT.more.round`, `BOOKWARDEN.more.storm`. Times below are
seconds from the move's start; a "frame" is the game's thirty a second. Where on the floor: tiles; their forward and
their left as they face (on the floor, facing +x, their left is -y); heights in the game's pixels.

## The orderlies: THE QUAKE (src/art/orderlies_moves.ts `OD_QUAKE`; src/art/orderly_shots.ts)

The mallet raised high in both hands, crouched and coiled under it, its iron hoops glinting pink (THE WARNING); a dip,
and they leap, both feet off the floor (8.9 of their lengths up at the top, 1.06 s), the mallet swung over the top as
they come down; it and their feet hit the floor together; the floor shaken out round it.

- `OD_QUAKE = { long: 2.7, raised: 0.5, warn: [0.5, 0.86], jump: [0.93, 1.23], apex: 1.06, hit: 36/30, floor: 37/30, held: 1.62 }`.
- THE BLOW at 36/30 s; the mallet's head on the floor at 37/30 s, 1.48 tiles before them, 0.12 to their right.
- ON THE FLOOR, round where the mallet struck: `drawQuakeWarn(g, at, x, y, k)`, through the warning, a ring of pink at
  `QUAKE_REACH` 2.2 tiles, the floor inside it darkening; `drawQuake(g, at, x, y, t)`, `t` after it struck: a ring of
  dust and splinters rolling out to `QUAKE_REACH` in `QUAKE_FOR` 0.7 s, the boards jumping as it passes, cracks run out,
  gone by `QUAKE_CRACKS_FOR` 2.0 s. (Their basic blow's `drawMalletSlam` is unchanged.)
- The painter's own dust where it strikes: `quakeAt(t)`, 1 at the floor, 0 by 0.7 s after.

## The night carters: THE DRIVER'S LASH (src/art/carters_moves.ts `CT_LASHES`; src/art/carter_shots.ts)

The whip raised over the head and the lash whirled round above it, its cracker glinting pink (THE WARNING); then three
cracks, a step in with each, each further out before them, pink sparks off the floor at each; drawn back and the feet
stepped back.

- `CT_LASHES = { long: 3.05, up: 0.3, warn: [0.36, 0.94], cracks: [33/30, 45/30, 57/30], reach: [1.3, 1.95, 2.55], hit: 33/30, draw: [2.2, 2.65] }`.
- THE BLOW (the first crack) at 33/30 s; the cracker on the floor a frame after each crack's time, measured: 1.29, 1.93
  and 2.50 tiles before them, 0.08 to 0.09 to their right (under the whip hand).
- ON THE FLOOR: `lashSpots(x, y, fx, fy)`, the three places (`LASH_REACH` out, `LASH_RIGHT` 0.10 to their right);
  `drawLashesWarn(g, at, x, y, fx, fy, k)`, three small rings of pink, nearest first (`LASH_MARK_R` 0.2 tiles);
  `drawLashCrack(g, at, x, y, t)` at each: pink sparks (`LASH_SPARKS_FOR` 0.3 s), dust, a scuff, gone by
  `LASH_CRACK_FOR` 0.8 s.
- Mended since its video (f9feb86): the warning rings had been drawn 0.18 tiles to their left of the cracks; now on them.

## The dredgers: THE CAST NET (src/art/dredgers_moves.ts `DR_NET`; src/art/dredger_shots.ts)

Still leaning on the boathook in the right hand (its butt where it stood, leaned forward as they lunge on it), the left
reaches back over the shoulder into the creel and drags out a cast net, a bell of tarred cord hanging from the fist, a
hem of lead weights glinting pink; whirled round at their left side, forward at the bottom, a turn and three quarters,
flung open as it goes; swung far back and held (THE WARNING); then, hips first, the right foot stepping in, heaved
underhand out and up before them. It opens as it flies, spinning, and falls spread over the floor.

- `DR_NET = { long: 2.5, grip: 0.35, out: [0.35, 0.52], warn: [0.6, 1.12], whirl: [0.6, 0.98], hit: 38/30, step: [1.04, 1.18] }`.
- In the hand from 0.35 s; LET GO at the blow, 38/30 s, its middle 0.76 tiles before them, 0.41 to their left, 12.4
  pixels up (`netLetGo()`, their own lengths; `netFrom(x, y, fx, fy, p)` turns that into tiles and pixels).
- IT FLIES `NET_FLIES` 0.5 s (an arc `NET_ARC` 22 pixels over the straight line) and FALLS at 38/30 + 0.5 s, its middle
  `NET_REACH` 3.0 tiles before them (`netSpot(x, y, fx, fy)`), `NET_R` 0.85 tiles wide (radius).
- ON THE FLOOR: `drawNetWarn(g, at, x, y, k, t)`, through the warning to its fall, a pink ring the net's width with its
  lattice faint inside; `drawNetFlying(g, at, from, x, y, t)`, `t` after it is let go: opening and spinning, the
  weights round its edge, its shadow under it; `drawNetLying(g, at, x, y, t)`, `t` after it falls: the weights striking
  up dust, the net lying spread, its weights' glint going out, fading at `NET_LIES` 1.6 s (how long it holds in the game,
  and what it does, are yours).

## The Hushed watch (watchman and sergeant): THE ROUND SWEEP (src/art/hushed_watch_moves.ts `WA_ROUND`; src/art/watch_shots.ts)

The halberd lifted, slid down through the right hand to its butt, taken in both hands and hauled back low to their
right, the body wound away with it, crouched, held shaking, its blade glinting pink (THE WARNING); then, hips first,
they spin round to their left, all the way round, the halberd out at the end of their arms at a man's hips, their feet
stepping round under them a third of a turn at a time; carried on past where they began, slowing; the halberd brought
back round before them and up, and stood where they began, once round.

- `WA_ROUND = { long: 2.6, warn: [0.4, 0.88], spin: [0.9, 1.68], hit: 33/30, wound: -46, home: 406, past: 436 }`.
- THE BLOW at 33/30 s: the blade straight before them (11 degrees to their right). The blade goes round from 127
  degrees to their right (wound back) through before them and all the way round to 66 degrees past where it began
  (about 550 degrees in all); the spike 2.36 to 2.58 tiles out.
- WHERE THE BLADE IS, each frame of the spin (`roundBladeAt(t)`: its bearing to their left of the way they began
  facing, radians, unwound; and how far the halberd's top spike reaches, tiles), as the watch's sweep is written down in
  game/act1_rules/watch.ts:
  [27/30, -2.220, 2.355], [28/30, -2.196, 2.355], [29/30, -2.079, 2.356], [30/30, -1.884, 2.357], [31/30, -1.582, 2.359],
  [32/30, -1.069, 2.376], [33/30, -0.189, 2.434], [34/30, 0.900, 2.507], [35/30, 1.965, 2.565], [36/30, 2.753, 2.565],
  [37/30, 3.261, 2.565], [38/30, 3.730, 2.565], [39/30, 4.200, 2.565], [40/30, 4.670, 2.565], [41/30, 5.140, 2.565],
  [42/30, 5.609, 2.565], [43/30, 6.051, 2.551], [44/30, 6.437, 2.536], [45/30, 6.768, 2.525], [46/30, 7.042, 2.519],
  [47/30, 7.254, 2.525], [48/30, 7.386, 2.543], [49/30, 7.431, 2.565], [50/30, 7.395, 2.579].
  (It whips fastest just as it comes before them, frames 33 to 35, about 60 degrees a frame; then on round at 27.)
- ON THE FLOOR: `drawRoundWarn(g, at, x, y, k, t)`, through the warning, a ring of pink all the way round them at
  `ROUND_REACH` 2.5 tiles, the floor inside darkening toward it; `drawRoundWake(g, at, x, y, fx, fy, t)`, `t` seconds
  into the move (fx, fy their facing as they began), from `ROUND_WAKE` 1.0 to 1.68 s: the dust whipped up under the
  blade where it has passed, gone `ROUND_DUST_FOR` 0.5 s after, and a streak of pink just behind it.
- They end facing as they began, where they began: nothing moves them.

## The Bookwardens: THE PAGE STORM (src/art/bookwardens_moves.ts `WB_STORM`; src/art/bookwardens.ts; src/art/bookwarden_shots.ts)

The haft yanked up and the tome swung up on its chain into the left hand, caught by the foot of its spine, its chain
slack from the haft; drawn back before the chest, its fore-edge toward you, the body wound back, its brass and clasps
glinting pink (THE WARNING); then, hips first, a step in, the book thrust out in both hands and thrown open, and the
stolen words tear out of it in a storm of pages, pink and cream, across the floor before them, held into it, leaning;
snapped shut, and let drop on its chain, swinging.

- `WB_STORM = { long: 2.8, caught: [0.16, 0.38], warn: [0.5, 1.0], hit: 33/30, open: [1.05, 1.17], pour: [1.1, 1.95], shut: [1.95, 2.08], drop: [2.12, 2.4] }`.
- THE BLOW at 33/30 s: the book 1.07 tiles before them, about 24 pixels up, thrown open to a wide V by 1.17 s; the pages
  pour out of it 1.1 to 1.95 s.
- ON THE FLOOR: a fan from their feet, `STORM_REACH` 3.4 tiles out and `STORM_HALF` 0.45 radians either side of the way
  they face. `drawStormWarn(g, at, x, y, fx, fy, k, t)`, through the warning: its edges and far arc in pink dashes, the
  floor in it darkening; `drawPageStorm(g, at, x, y, fx, fy, t)`, `t` after the book is thrown open: pages flung out
  across the fan from `STORM_FROM` 1.1 tiles at `STORM_SPEED` 6 tiles a second, low over the floor, for `STORM_POUR`
  0.85 s, the last gone `STORM_TAIL` 0.45 s after. (Their basic blow's `drawTomeSlam` is unchanged.)
- New in the tome's drawing (only this move uses it): `TomeWay.held` (the book in the left hand, and how far open),
  `bookHalves`, `pagesStorm` (the pages near the book, laid as grains: test 6 now lets the storm have grains).

## How each was checked

- EVERY MOVE AND EVERY HANDOVER OF ALL FIVE KINDS THROUGH EVERY BOSS CHECK (src/art/boss_checks.ts), from in front and
  behind, both of the watch: 0 findings.
- Their tests, each with a test of its own for the new move (the move whirled or spun as said, where it strikes, its
  floor marks drawn only in their time and only where they should be, nothing cyan): orderlies 9 of 9, carters 9 of 9,
  dredgers 9 of 9, hushed_watch 9 of 9, bookwardens 10 of 10; and the game's own for them, act2_watch, act2_dredger,
  act2_carter, act2_orderly and act2_bookwarden, all passing.
- `tsc --noEmit` clean.
- THE WHOLE UNIT SUITE on this branch's head: see the board post that hands it back.
- NOT RUN: the regression, his room, a real phone.

Each kind's dev page films its new move and its floor marks (`film:<move>` and `shots`: src/dev/preview_orderlies.ts,
preview_carters.ts, preview_dredgers.ts, preview_watch.ts, preview_bookwardens.ts with `shots:storm`).

## For the main chat

- tests/monster_attacks.test.ts holds the five to one attack only while ACT2 is off (`ACT2_ONE_MOVE`). With these, each
  has its second move's picture; the rules that use them (game/act1_rules/<kind>.ts: the second move, its cooldown
  longer than the basic's, its harm) are yours or the planning chat's, as you say.
- Nothing moves any of them across the floor: each ends where it began.
