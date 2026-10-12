# The first five floors as one version: the build's working notes

Written by the main chat as it builds (from 11 Oct 2026, 19:45, his words: "Please add all the new
assets and finish the game up to level 5 and the mineshaft leading back up to town"). What is done
is ticked. Nothing here is live until he has seen it from the game and said yes.

## Where the work is

- Branch `first5` (local; this chat could not get permission to push: the classifier's refusal of
  11 Oct 19:47). It has the art chat's two chains merged: `mockup/floor5-lair` (5e8f9cc: floors 1 to 5,
  the stairwell's opening, floor 5's look, the mine shaft) and `mockup/cultists` (3fb4cdc: the three
  bosses, the bone beast, the fleshmancer, the two cultists). The unit suite on the merge, before any
  change of mine: 1200 of 1200 (19:49:54 to 19:59:01), tsc clean.

## What it costs to paint (this container, 11 Oct, src/dev/measure_first5.ts)

| what | frames | seconds | room (MB of canvas) |
| --- | --- | --- | --- |
| Headsman | 1116 | 16.8 | 66 |
| Chained One, each of his three states | 1088, 1088, 700 | 26.6, 24.2, 14.4 | 67, 65, 38 |
| amalgamation | about 902 | about 40 | about 75 |
| bone beast | 310 | 1.1 | 3 |
| fleshmancer | 968 | 9.6 | 22 |
| dagger cultist, mini fleshmancer | 210, 546 | 0.8, 3.1 | 2, 7 |
| a floor's pieces | 47 to 50 | 0.2 to 0.55 | 4 |
| floor 1's moments (all 3) | | 1.2 | 57 |
| floor 2's | | 2.2 | 71 |
| floor 3's | | 3.6 | 16 |
| floor 4's: skull wall, cart, bones | 168, 190, 172 | 13.3, 4.8, 11.0 | 147, 154, 63 |
| floor 5's: roof, winch, rift | 170, 129, 150 | 1.9, 1.1, 0.7 | 88, 48, 52 |
| the cage down, the ride up | 129, 101 | 1.7, 1.5 | 57, 45 |
| the stairwell's opening, one place one way | about 100 | 3.4 to 4.4 | 25 |

So: none of it may be painted where the game is being played (a film is seconds in one call), and
not all of it may be held at once (floor 4's three films are 365 MB).

## How it is built

1. THE PAINTER (render/painter.ts, a worker made from the page's own script as a blob; the page
   contract says blob workers are allowed in an artifact). It paints ahead and hands the pictures back;
   where it cannot be made (an old phone), the game paints a little at a time itself and does without
   the films it could not make in time. The rules never wait on a picture.
2. THE BOSSES BY FLOOR (game/bosses.ts, rules; render: figure by gait and move): 1 the Warden, 2 the
   Headsman, 3 the Chained One, 4 the amalgamation (and its bone beasts), 5 the Fleshmancer; past 5 the
   Warden as before. Each move's times are the pictures' own (tests hold them equal).
3. FLOOR 5: the lair's look, no stairwell: the mine shaft at the back of his hall, the cage down as
   he dies, the ride up to town.
4. THE STAIRWELL'S OPENING on floors 1 to 4, its place chosen when the floor is made.
5. EVERY FLOOR'S PIECES laid by rules, last, by dice of their own; its gates; its breakables and chest.
6. THE MOMENTS: three a floor, each at a host laid for it, set off as he comes near.
7. THE CULTISTS on floors 4 and 5: packs of dagger cultists, a mini fleshmancer leading the yellow ones.

## His words while it was being built

- 11 Oct 2026, 20:37: "Don’t forget the level titles when you enter the level and the boss titles when you
  enter the boss room". Read back to him (20:38) as: coming into a floor, its name with "Prison Level N"
  under it; coming into a boss's room, his name across the screen and his line as his gate falls; both
  built from his idea of 10 Oct (FLOOR_NAMES, BOSS_INTRO, on), each new boss with his own name and lines.

- 11 Oct 2026, 21:33: "ETA for the completed 5 levels?" Answered (21:34): early tomorrow morning, around
  5 or 6 a.m. his time, a guess from how the work had gone; what was done and what was left; a try-out
  page of the four boss fights offered for that night if he wanted one.

## Calls made for him (to tell him, each his to change)

- The bosses' lines (game/defs.ts BOSS_LINES): the Headsman, the Chained One, the amalgamation, the
  Fleshmancer, three each, mine.
- A fifth floor's boss is named "Greater" only if he is a Warden: the Fleshmancer is "Fleshmancer".
- Every number of every fight (game/bosses.ts): what each move hurts, how far, how often.
- The Headsman's throw reaches as far as the hero stands (to 9 tiles; the film's loop was 4.2), and the
  Chained One's hook to 7.5 (the film's 4.5): so that standing far off is no safe place.
- The Chained One is half as fast again with his left chain off, and more than twice as fast free of the ball.
- The cult: about one pack in eight on floor 4 is dagger cultists; about half of floor 5's packs are the
  cult's; a pack of dagger cultists is led by a mini fleshmancer one time in five on floor 4, one in three
  on floor 5. The mini fleshmancer goes at 1.6 tiles a second (his glide was painted for 1), the bone
  beast at 2.6 (painted for 1.5).

## Progress

- [x] the art merged, measured
- [x] 1 the painter (render/painter.ts; tools/scenarios/first5_painter.mjs: floors 2 to 5 at 60 frames
  a second while the boss is painted beside the game; with no painter, `#painter=off`, the game paints
  for itself, one heavy frame every fourth world drawn)
- [x] 2 the bosses (tests/first5_bosses.test.ts)
- [x] 3 floor 5 and the shaft (game/ways.ts placeShaft, SHAFT; render/dress.ts; tests/first5_floors.test.ts 1 to 4;
  tools/scenarios/first5_shaft.mjs)
- [x] 4 the stairwell's opening (STAIR_OPENING; tools/scenarios/first5_stair.mjs; test 5)
- [x] 5 the pieces (game/first5.ts; render/pieces.ts; art/floors.ts; tests 6 to 8; tools/scenarios/first5_floor.mjs)
- [x] 6 the moments (render/pieces.ts; the same playtest: every floor's three play)
- [x] 7 the cultists (tools/scenarios/first5_cult.mjs: a mini fleshmancer's pack on floor 5; his raised dead)
- [ ] tests, playtests, the regression
- [ ] pictures and a page for him; the notes

## More calls made for him

- Floor 5's shaft stands a tile off the back walls of the Fleshmancer's hall, as on the art chat's review
  page; it is walked into from before its gate only (its timbers either side and behind it are solid).
- When the Fleshmancer dies, the dead he raised fall with him (and a mini fleshmancer's with him).
- The stairwell takes 3.5 s to break open (its film is 3 to 3.5 s); its top step takes nobody down until then.
- How much of each floor is laid with its pieces: about one wall face in four; a floor tile in 22; a
  thing that stands for every 38 tiles of a room, at most three; each moment once, as he comes within
  five and a half tiles and sees where it is.
- The quest pieces (the Warden's horn, the Headsman's hood, the face-cage, the eldest skull, his book) are
  not laid: there is no quest for them yet.
