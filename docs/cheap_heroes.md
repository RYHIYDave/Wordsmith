# The new classes as cheap to paint as the Warrior: what was found, what was done

The art chat's helper, 1 Nov 2026, on the branch `art/cheap-heroes` (from `heroes6` f915eab). For the art chat and the main
chat; nothing here is for the owner as it stands.

## The order

The owner, 31 Oct, through the main chat: the Warlock, the Tinkerer and the Brawler each as cheap to paint as the Warrior, the
Warlock first. His words: 20:07 "Warlock still has massive performance issues with animations loading correctly"; 20:08 "Show
up late mostly"; told every move of the man showed about 45 s into a run, "Is 45 seconds bad?  It feels bad"; asked how to fix
it for good, he picked "Art chat only" (over saving painted frames on the device); 21:31 "He needs to be able to be played by
anyone, what are we talking about"; the Tinkerer and the Brawler the same: "Yes, all three (Recommended)".

The rule over all of it: every frame was shown to him and given his yes, so HOW THEY LOOK MUST NOT CHANGE. Every change here
keeps every frame the same to the pixel, proved by hashing every frame of every set before and after (below).

## The answer, short

- **Every frame is the same picture.** All 8,197 frames the game holds of the three (with the Tinkerer's Golem and
  Contraption; every list of every place, both ways round; 4,925 different pictures) hash the same before and after.
- **The Warlock now paints about 1,514 frames in a run where he painted 2,036** (dungeon, blazing and the demon), and 1,557
  in all where he painted 3,299 (with town and his class card): a list that is the same in two places, or the same with his
  arm blazing or not, is now one list, painted once: his frames painted in town are no longer painted all over
  again in the dungeon, and his spells, his smoke step, being struck, his fall and the change are no longer painted twice (as
  a man and blazing). The Tinkerer paints 56 fewer, her Golem and Contraption 198 fewer and the Brawler 26 fewer: a frame
  that is another's very picture, by the very same sums, is not painted again. In time, his run's frames about 376 s of
  painting on this machine where they were 441 s; every place, about 378 s where they were 518 s.
- **A frame costs what it did.** A frame of theirs is a figure sculpted in distance fields and drawn by sending a ray through
  each pixel (`src/dev/sculpt.ts`); the Warrior is painted another way (`art/heroes3.ts` over `hero3_knight.ts`, solids on
  sheets). The ray march must take the very same steps to give the very same pixels, and no way was found to make its steps
  cheaper without changing a picture (what was tried is below). **No frame of the three is yet as cheap as a Warrior's; with
  the pictures kept, none can be made so here.** What would do it, each changing pictures or the way the game is made, is
  at the end, for the art chat and the owner.

## What a frame costs, and where its time goes

The measure is the main chat's: `node`, `paintWithoutCanvas`, `makeHeroArt3().of(cls, lookOfPlace(place))`, the median of 8
frames spread over a list, after its first, each list in a process of its own (`tools/cheap_heroes.ts measure <list>`). It
includes the engine warming up, so it is higher than a frame costs once the side painter has been at it a while; the warm cost
(each list painted whole in one long run, `tools/cheap_heroes.ts hash`) is given beside it. This machine: 2 cores, shared and
busy, so every number is good to perhaps a fifth.

Per frame, in thousandths of a second (from in front; the main chat's figures are his, on heroes6 ab85909 on his machine):

| a frame of | the main chat's | before, here | after, here | warm, here (before) |
|---|---|---|---|---|
| the Warrior standing | 22 | 18 | 17 | 16 |
| the Warrior's attack | 23 | 19 | 20 | 6 |
| the Warlock standing | 128 | 134 | 112 | 62 |
| his bolt | 93 | 119 | 92 | 66 |
| his curse | 105 | 91 | 103 | 68 |
| his bolt, blazing | 94 | 106 | 102 | 71 |
| the change | 764 | 646 | 539 | 345 |
| the demon standing | 677 | 654 | 630 | 516 |
| its rake | 750 | 683 | 621 | 457 |
| its Damning | 738 | 555 | 667 | 475 |
| the Tinkerer standing | 87 | 75 | 63 | 62 |
| the Brawler standing | 92 | 113 | 90 | 78 |

A frame is painted by the very same sums before and after (nothing in the painting of one frame was changed: see below), so
the two middle columns differ only by this machine's noise, one row up and the next down.

All of each class's frames, painted (the warm run, every list whole; time is painting only, not making the moves; "after" is
the time the frames still painted took in the run before, the run after having been made on a busier machine, where even the
Warrior's took half as long again):

| | frames painted before | after | different pictures | painting before | after |
|---|---|---|---|---|---|
| the Warrior | 404 | 404 | 388 | 3 s | 3 s |
| the Warlock in a run (a man, blazing, the demon) | 2,036 | 1,514 | | 441 s | about 376 s |
| the Warlock, every place (and town, his card) | 3,299 | 1,557 | 1,469 | 518 s | about 378 s |
| the Tinkerer | 710 | 654 | 630 | 42 s | about 39 s |
| her Golem and Contraption | 2,280 | 2,082 | 1,740 | 79 s | about 71 s |
| the Brawler | 1,168 | 1,142 | 1,086 | 171 s | about 167 s |

Of the Warlock's run (after), the demon is about 292 s (624 frames, about half a second each, its burning out with them), the
change 33 s (96 frames), the man 37 s (706 frames) and his standing and running blazing 12 s (184 frames).

Where a frame's time goes (the Warlock standing, and the demon standing; profiled and timed by phase, warm):

| | the man | the demon |
|---|---|---|
| pixels whose rays are marched / that meet him | 1,736 / 1,410 | 12,366 / 11,550 |
| steps a ray takes | 14 (23 on a ray that misses) | 17 (32 on a ray that misses) |
| solids weighed at each step | about 9 of 105 | about 6 of 491 |
| the march, rays that meet him | 34 ms | 230 ms |
| the march, rays that pass close by and miss | 19 ms | 63 ms |
| proving the rest of the canvas clear | 6 ms | 71 ms |
| the way the skin faces (6 more sums a pixel) | 5 ms | 51 ms |
| its creases (2 more) | 7 ms | 33 ms |
| whose it is, and its colour | 3 ms | 35 ms |
| ink, cleaning, the edge of light | 2 ms | 15 ms |
| all of a frame | about 78 ms | about 500 ms |

So nearly all of it is the sculpture being drawn, and most of that the ray march. The demon costs six to seven times the man
because it is eight times the pixels (it is drawn on a 360 by 320 canvas, the man on 176 by 176) and five times the solids.
The Warrior's frame is a few thousandths of a second warm, on the man's canvas: the demon, painted as cheaply a pixel as the
Warrior is, would still cost several times a Warrior's frame, for it covers about eight times the pixels the man does. A frame
"no more costly than a Warrior's" is not to be had for the demon or the change without changing what is painted or how.

## What was changed (every frame the same)

1. **The Warlock's lists, one for every place** (`src/art/warlock_art.ts` `WarlockShare`, held by each `makeHeroArt3`):
   his standing and running, his bolt, his curse, his smoke step, struck, struck from behind and his fall are the same calls
   in a dungeon, in town and on his card, so each is made once and every place's set holds that list. Blazing, his standing
   and running are his own (the only moves of his that blaze); every other list of the blazing set is the man's, and the
   change is one list for both. Each set's clips are its own objects; only their frames are shared. 3,299 frames before,
   1,557 after (every place); 2,036 and 1,514 in a dungeon. The side painter (`render/painter.ts`) needs no change: a frame
   it has painted for one list is there for every list that shares it, and it sends a frame shared by two lists once.
2. **The demon burning out** (`warlock_art.ts` `demonSet`): as it crumbles it is one picture of it, sagged its last, that
   crumbles, and one of him on one knee under it; each is painted once now, not for every frame of the crumbling (about 7 of
   the 44 frames each way; half a second each).
3. **The Tinkerer's Contraption thrown down** (`src/art/tinkerer_art.ts` `sameHold`, `sameAs`): it is her vial toss but for
   what is in her hand, and drawn by `drawTinkerAt` from nothing else of the move, so its frames before she has it in her hand
   and after she lets it go (28 of 37 each way) are the vial toss's own.
4. **The Golem in a pose it has been painted in** (`tinkerer_art.ts` `golemOnce`): `golemAt` reads nothing of a moment but
   its pose (every number of it, to the last bit), so its rest pose at the start of each of its moves, and its winding down
   held on the floor, are painted once in each set (2,082 painted where 2,280 were, with the Contraption's).
5. **The Brawler at a moment alike to one painted** (`src/art/brawler_art.ts`; `src/dev/brawler_moves.ts` split into
   `brawlerAt`, all a moment is drawn from, his pose and how his coat swings and lies, and `drawBrawlerOf`, which draws it;
   `drawBrawlerAt` is the two, as before): his guard as each punch, struck and his fall begin, and his standing breath coming
   round, are painted once (26 frames: 1,142 painted where 1,168 were; 1,086 of his frames are different pictures; the
   other 56 come out alike from moments that are not alike, which nothing short of painting them can tell).

## Tried, and not kept (every frame was the same with each; none was worth having)

- **The cells' sizes** (`sculpt.ts` `CELL`): the lists each cell of space keeps are proved, so any size gives the same
  pictures (checked on frames of the man and the demon). Seven sizes tried: none was faster by more than the machine's own
  noise.
- **Proving a near miss clear piece by piece**: a ray that passes close by the figure and misses it is marched step by small
  step to the end (a quarter of the man's time). Bounding each piece of it in depth, halved again and again, proved most of
  them clear, but cost more than marching them.
- **A cheaper proof that the canvas is clear, and the ink and cleaning looked for only where something is drawn**: the same
  pictures and the same work to within a percent (the work counted: as many bounds worked out before and after). Put back, to
  leave the engine as it was.

## The hashes

`tests/cheap_heroes.hashes.json` pins every frame's hash: its pixels, its size, its anchor, its lights, its pool of light, its
tails and its charge, for all 285 lists (8,197 frames) of the Warlock (man, blazing, the change, the demon, its burning out; in
a dungeon, in town and on his card; both ways), the Tinkerer, her Golem (its three arms, and their charged shots), her
Contraption (its three loads) and the Brawler (every run of his punches), as painted on heroes6 f915eab before any of this.
`tests/cheap_heroes.test.ts` paints the first, middle and last frame of every list and holds each to its hash (some three
minutes; with `CHEAP_HEROES=all`, every frame, some fifteen), and checks that the lists are shared as said.
`tools/cheap_heroes.ts` makes the hashes (`hash`), compares two runs frame for frame (`same`), spot checks (`check`) and
measures (`measure`).

The last run, on the branch as committed: every list of every place painted whole and hashed (`tools/cheap_heroes.ts hash`),
then held against the run made before any change (`same`): **8,619 frames compared (the Warrior's 422 with them), 0 differ.**

## Not done, and why: what it would take to reach the Warrior

Each of these changes what the game shows, or how it is made, so none is made; each would need pictures for the owner first
(the art chat's), or a word from the main chat. The savings are estimates from the profile above, not measured.

1. **Paint fewer frames.** The fewest change to any picture: each frame stays as he saw it, there are only fewer. The demon's
   run (42 frames each way at 60 a second) and his own (26) at 30 a second; the change (48 each way) and the burning out (44)
   in fewer. A half of each list halves its time. The motion is less smooth where it is cut.
2. **Begin each ray nearer the figure.** About a third of the man's steps and two fifths of the demon's are taken more than
   two lengths from any skin, on the way in. Begun at the first solid along the ray, a frame would cost perhaps a fifth less;
   but a ray would stop at a slightly different point within the last fiftieth of a length, so here and there a pixel would
   take the next tone or lose a pixel of ink. Not built.
3. **Paint the demon smaller, or with fewer solids.** Its cost goes with its pixels and its solids; it would look otherwise.
4. **A painter other than the ray march** (each solid laid down as the Warrior's are, nearest wins): the only way a frame of
   the demon could cost what a Warrior's does. Every frame would look different: the solids would not melt into each other,
   which is what the owner asked for ("make sure the characters don’t just look like circles and squares slapped together").
5. **Frames painted once, kept in the game's file.** Exactly his pictures, painted in no time at all, but not "all art painted
   in code" as the game is made, and close to what he chose against when he picked "Art chat only" (over saving painted
   frames on the device). Packed (a colour list and deflate, as a PNG is), a frame of the man is about 1 KB, of the change
   about 3 KB, of the demon about 6 KB (a few of each measured): the Warlock's 1,514 about 5.5 MB, with the Tinkerer and the Brawler (not her
   Golem) about 7 MB, a third more again as text in `Play.html` (4 MB now; a page published on claude.ai may be 16 MB).
6. **Painting on more cores.** The side painter has a second worker where there are cores for it (`Painter.heroLane`); a third
   would make them ready sooner but cost as much. The main chat's.
