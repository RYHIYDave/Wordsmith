# Floor 1, the Warden's Tomb: more action (mock-ups; branch `art/action-f1`)

An art helper's branch, from `high-city` at 538d570. Nothing here is in the game until the main chat puts it there, on his yes.
The two new moves are drawn in the live rigs **behind switches that are off**; with them off every frame the game shows of the
skeleton, the bone archer, the shieldbearer and the Warden is the same, pixel for pixel (hashes below). What the moves leave on
the floor is a mock-up file nothing of the game imports.

## His words

- His review of every enemy for more action, 31 Oct 2026: “I want buried battles when you’re fighting enemies and then once you
  fight them enough, I want you to be able to recognize what’s going to happen and which enemies to be aware of and what they do”.
- THE BONE ARCHER: offered "Arrow rain: it shoots high into the dark, a ring on the floor where you stand fills with falling
  shadows, and a second and a half later arrows rain down there"; his pick “Both shots” (offered as: keep its straight arrow too,
  the rain now and then).
- THE WARDEN: offered "Lockdown, in place of the slam: iron bars crash down across the room in rows, shadows first. Stand in the
  cells between them"; his pick “Yes (Recommended)”.
- Under his rules already given: Movement 9, 24 Oct (“Like the wind up and wind down are big but the actual punch is lightning
  quick”), and for the enemies, 28 Oct (“Start from now on, but every enemy is going to need that change eventually.  And bigger
  AOE to compensate for the extra time the player gets to evade”).

## The pictures (`pictures/`)

- `action_f1.mp4` (1200 × 676, 26 s, captioned): the arrow rain from in front and from behind (three times the game's pixels, the
  knight in the ring); the rain at half speed (the draw and loose framed on the archer, then the strike framed on the ring, four
  times); the Lockdown in his whole arena from in front and from behind (the game's pixels, the knight in the next cell); again
  from in front, closer (twice); and at half speed (three times).
- `action_f1_sheet.png` (1200 wide): the archer's seven key moments from in front and from behind; the ring filling and the
  strike; the Warden's five key moments from in front and from behind; a row of bars, shadow to crash to rising.

## THE ARROW RAIN (the bone archer's second attack)

**What it is.** The archer nocks, swings the bow up out in front of it and draws almost straight up (aim 68°, leaning back, the
arrow up past its face, not through it), and HOLDS (the warning: the spark on the arrowhead spitting); looses in ONE frame (the
arrow a streak up off the string, the string hand snapping back past the jaw, the bow kicking up); holds the bow up a moment
(the follow-through); brings it down, the bow arm long, while the other hand goes back over the shoulder for a fresh arrow and
lays it on the string. What it loosed flies on up into the dark over it. Where the hero stood at the loose a ring of the enemy's
pink comes down on the floor and fills with the shadows of falling arrows, more and darker as they come, pink points where each
will land in the last moments. 1.5 s after the loose the rain strikes in TWO frames: every arrow a streak coming down; then
struck, the ring flashing, splinters and dust thrown up; the arrows stand in the stones 0.6 s, then crumble away.

**Its numbers** (all checked in `tests/action_f1.test.ts`):

| | |
|---|---|
| the move (`clips.moves.rain`) | 1.72 s, 53 frames at 30 a second |
| the wind-up | hand to the string by 0.14 s; bow swung up by 0.30 s; drawn by 0.50 s; **held 0.40 s** (0.50 to 0.90) |
| the loose (`RAIN_LOOSE`, the clip's `hit`) | **0.90 s, frame 27: one frame** |
| the wind-down | bow held up to 1.07 s; down, a fresh arrow by 1.37 s; laid on the string 1.56 s; at rest 1.72 s |
| the ring (`RAIN.radius`) | **2.0 tiles** round its middle (drawn and tested from 1.8 to 2.2: the main chat may set it); on the floor from the loose |
| the strike (`RAIN.delay`) | **1.5 s after the loose** (2.4 s into the move): frames 1.467 s (streaks) and 1.5 s (struck: the hit) |
| what is hit | a hero whose middle is inside the ring at the strike |
| arrows | 26 in the ring; stuck 0.6 s, crumbling 0.25 s; nothing left 2.35 s after the loose (`RAIN_LONG`) |
| what flies up | seen 0.15 s over the archer (`RAIN.rise`) from the frame after the loose, then gone into the dark |

The archer is today's (art/monster_bones.ts, the one the game shows), not the mock-up on the heroes' bones (ARCHER3, off).

## THE LOCKDOWN (the Warden's, in place of the slam)

**What it is.** He plants the maul on its head (as for his bolts) and his other hand goes to his hip and comes up with his great
ring of keys, swung out wide and up over his helm; HELD there, the keys rattling, every fire in him burning up to white heat (the
warning). As the keys go up, the bars' shadows lie across his arena in rows both ways: a soft dark band first, then darker and
sharper, the enemy's pink at its edges (exactly the width the bars strike), pulsing faster. In ONE frame he wrenches the ring down
to his hip, the keys' fire smeared up the way they came; in the same moment the bars crash down in TWO frames (a streak, then
planted), sparks off every foot, chips and dust. The keys stream after his fist and swing back and forth as it holds there; he
hooks them back on his belt and takes up the maul. The bars stand as a cage, cells between them to stand in (he stands in the
middle of one); then they rise away and are gone.

**Its numbers:**

| | |
|---|---|
| the move (`clips.moves.lockdown`) | 2.15 s, 66 frames at 30 a second |
| the wind-up | keys taken at his hip by 0.18 s; swung out wide by 0.30 s; up over his helm by 0.52 s; **held 0.65 s** (to 1.17) |
| the strike (`LOCKDOWN_HIT`, the clip's `hit`) | **1.2 s, frame 36: one frame** (the keys wrenched down: the crash) |
| the wind-down | keys swinging at his hip to 1.64 s; hooked back on his belt, the maul taken up by 1.92 s; at rest 2.15 s |
| the rows (`LOCKDOWN.cell`) | **2.75 tiles apart, along both of the floor's ways**, laid so that he is in the middle of a cell (`lockRows`) |
| what is struck (`LOCKDOWN.band`) | a hero whose middle is within **0.42 tiles** of a row's line at the crash; the rest of each cell (a square of 1.91 tiles) is safe |
| the shadows (`LOCKDOWN.warn`) | on the floor from **1.0 s before the crash** (0.2 s into his move, as he takes the keys); pink-edged from about 0.45 s before |
| the crash (`LOCKDOWN.strike`) | two frames: the frame before the hit (streak) and the hit (planted) |
| standing (`LOCKDOWN.stand`) | **1.5 s** after the crash (the cage); then rising away (`LOCKDOWN.rise`) **0.4 s**; nothing left 1.9 s after the crash |
| the bars | 52 picture pixels to the top rail, their points a little over it (26 game pixels: to the knight's brow, so he is seen in his cell over the bars in front of him), 3 bars a tile |

## How the game can lay them (all in art/action_f1_fx.ts; picture pixels, two to a game pixel; each picture has its canvas and the floor point it stands on)

- `floorPx(x, y)`: a floor point `x`, `y` tiles off as the game lays the floor (engine/iso.ts: x down-right, y down-left).
- THE RAIN: `rainRisePainted(t, view)` on `RISE_CANVAS`, anchored at the archer's floor point (mirror it with the archer when it
  faces left); `rainPainted(t, view, 'floor' | 'air', radius, side)` on `RAIN_CANVAS`, anchored at the ring's middle (where the
  hero stood at the loose). The floor layer goes under the figures; the air layer by halves, `'behind'` before a figure standing
  at the ring's middle and `'before'` after it. `t` is seconds from the loose; `view` 'front' or 'back' (which way the archer shot).
- THE LOCKDOWN: `lockRows(hisCell, reach)` gives the rows' lines (tiles; `x` rows lie at fixed y, `y` rows at fixed x);
  `lockStrikes(rows, x, y)` whether a hero there is struck. Lay each row a tile at a time: `lockShadowPainted(way, t, 1)` under
  the figures and `lockBarsPainted(way, t, 1, seed)` sorted with them by the tile's floor point (rows of any length join up; one
  picture of a whole row, `tiles` long, also works where sorting is coarse). `lockCanvas(tiles)` is the canvas, its anchor the
  row's middle on the floor. `t` is seconds from the crash (from `-LOCKDOWN.warn`).

## The switches, and bringing it in

- `ARCHER_RAIN` (art/monster_bones.ts) and `WARDEN_LOCKDOWN` (art/monster_warden.ts), both `{ on: false }`. With one on,
  `makeArcherArt()` has `clips.moves.rain` and `makeWardenArt()` `clips.moves.lockdown` (beside his swing, bolts, slam and
  summon), each a clip whose `hit` is its strike. The bestiary paints `clips.moves` ahead of need as it does the others.
- Nothing else of the live files changes a frame: the archer's rig paints a streak only for a pose with `sweep`, the Warden's
  the keys only for `prop` 3; each reports its joints only when a review sets `BONES_SEEN.see` / `WARDEN_SEEN.see` (null). Hashes
  of every frame (tools/action_f1_hash.ts), on 538d570 and on this branch, the same: bestiary skeleton `abc1d9c1b4a6a4b4`, archer
  `532609ae4c7ee40d`, Warden `1647e198c79b4ddb` (the game's switches); Warden without his moves `1435a3bd22d755e1`; skeleton
  without the crawl `85afa468a8b380b2`; the archer as it was `d33685e3dfce7ebb`; the shieldbearer `3f1a2daba10b5d9f`.
- To bring it in (the main chat's): turn the switches on with the rules; give the archer its second move (its one shot stays its
  basic attack; the rain now and then: a cooldown of about 6 to 8 s, from 3 to 8 tiles off, is a suggestion) and the Warden the
  Lockdown in place of the slam in `MONSTER_MOVES.warden` (windup 1.2 s, the slam's cooldown of 8 s; it fills the arena, so any
  range); at the archer's `hit` put the rain where the hero stands and hit inside the ring `RAIN.delay` later; at the Warden's,
  hit within `LOCKDOWN.band` of a row, and (his call) let the bars stand as walls for `LOCKDOWN.stand`.

## The checks

`tests/action_f1.test.ts` (8 tests, all pass): the switches off, nothing of the game importing the mock-up, every old frame the
same with the switches on; the clips and their blows; every frame painted, crisp, the enemy's pink edge, no cyan, nothing cut off
by its canvas; **every frame through the bosses' review, from in front and from behind, with its handing over from every frame of
the stand into the move and from its end back**; the arrow past the archer's face (never through it) and the keys never in the
Warden's head; Movement 9 (the draw held 0.4 s, the keys held over 0.5 s, each strike one frame); the rain (its numbers, nothing
cut off at radius 1.8, 2.0 and 2.2 either way, crisp, no cyan, the pink ring, the shadows denser as it comes, a two-frame strike,
the arrows stuck then gone, nothing after; where the loosed arrow leaves the frame is where it flies on); the bars (rows 2.5 to
3 tiles apart, a safe square in each cell, the Warden mid-cell, nothing cut off at 1, 3 and 7 tiles either way, crisp, no cyan,
shadows first with pink edges, no bars before the crash, a streak then planted to their full height, risen away, nothing after).

THE REVIEW: `checkBoss` (art/boss_checks.ts) reads a figure built on the heroes' bones (a 3D `Mob`); the archer and the Warden are
older 2D rigs of the painter's kit with no bones in space to give it. So `art/action_f1_checks.ts` (`checkKit`) makes the same
checks with the same limits (SLIDE_MAX, SINK_MAX, JUMP_MAX imported from boss_checks.ts) on what the two rigs report of every
frame they paint (head, hips, both hands and elbows, both soles, the maul's head, the end they strike with): SLIDE, FLOOR, JERK,
JUMP (every stand frame into the move, its end into the stand), BLOW (drawn back, held, carried on: the loosed arrow carried on
by its flight), HIPS, STRIKE (one or two frames, the blow inside it, smeared, far faster than the wind-up and wind-down). ARM
and THROUGH ask of bodies in space; for these two moves they are asked as the arrow past the face and the keys clear of the
head. Neither rig had any such review before (tests/warden_moves.test.ts and tests/archer3.test.ts check what is painted).
Also passing: `tests/palace_hands.test.ts`, `tests/bosses.test.ts`, `tests/warden_moves.test.ts`, `tests/archer3.test.ts`,
`tests/monsters.test.ts`; `tsc` clean. One line changed in `tests/bosses.test.ts` (its test 12, which lists the mock-ups allowed
to import the checks): `art/action_f1_checks.ts` added to that list, as every reviewed mock-up before it.

Made by: `tools/action_f1_film.ts` (the film), `tools/action_f1_sheet.ts` and `tools/action_f1_captions.py` (the sheet),
`src/dev/action_f1_scene.ts` (the stand-in tomb floor and the scenes), `tools/action_f1_hash.ts` (the hashes).

## For him to decide (the art chat's to ask)

- The bars' height: drawn to the knight's brow so the cells read and he is seen in his; taller bars (a true portcullis) bury
  the figures behind a wall of iron at the game's size (tried first, at 74 pixels: unreadable).
- The keys come into his hand at his hip (no ring is painted at his belt today; his one belt key stays).
- Whether the standing bars are walls (no passing between cells for 1.5 s) or only the crash hurts.
- The ring at 2.0 tiles, or bigger (2.2).
