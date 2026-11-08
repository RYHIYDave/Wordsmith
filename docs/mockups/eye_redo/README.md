# The Drowned Eye redone: the Swamp Colossus (stage 1: his look and the new arena; stage 2: his moves, part 1; stage 3: his moves, part 2, his tentacles; stage 4: his moves, part 3, his shovel)

A MOCK-UP: NOT IN THE GAME. The art chat's, branch `art/eye-redo`. His new look is `src/art/eye_colossus.ts`, behind
`EYE2 = { on: false }`; nothing of the game imports it (`tests/eye_colossus.test.ts` holds it). Nothing of the old Eye
(`src/art/drowned_eye.ts`, `art/act1_figs/eye.ts`, `game/act1_rules/eye.ts`) is used in it. Stage 1 (below the moves) was his look,
in stills; stage 2 is his first moves: his stand, his lurk under the water and his entrance, in `src/art/eye_moves.ts`; stage 3 his
tentacles' moves, in `src/art/eye_arms.ts`; stage 4 his shovel, in `src/art/eye_shovel.ts`.

## Stage 4: his moves, part 3: his shovel, in pictures and a film

His words (7 Nov 2026):

- Shown the tentacles again (5b1456d4): “Yes, on to the shovel (Recommended)”.
- 20:29: “I’d also like it to submerge, and then pop up on a random end of the platform and try to shovel the player into its mouth.  Tentacles scrape down the platform and you find the gap in the top and bottom or dodge over.  If you get hit it knocks you closer to the mouth.  Get too close and it snaps shut for massive damage.  Goes for a few seconds, I’m thinking like a tight waveform pattern gets you through the hitboxes of the incoming tentacles”
- 20:31, with his drawing (`docs/ref/eye_shovel_drawing_from_owner_2026-11-07.jpg`):
  “P is the player, weaves up and down as the tentacles come in”.
- His standing rules for the fight: nowhere safe (“Yes, nowhere safe (Recommended)”); “Action, like a movie”; Movement 9 (a big held
  wind-up, a fast smeared strike, a big wind-down); nothing through anything; and
  “Everything drawn should not just look like shapes.  That’s the rule”.
- Of the old fight, 5 Nov: “You need some more time to dodge those tentacles.” So the tell before he comes up is held over a second.

Read as (he was told; on the board 20:55): he sinks and bursts up at the left or right end of the stone, his V maw turned on its side,
gaping top and bottom along the stone; tentacles come in from the far end toward his mouth, one hugging the top edge with its tip
hooked down, the next the bottom edge with its tip curled up, alternating, so the way through weaves low, high, low (or dodge over
one); a hit knocks you toward his mouth; too close and his jaws snap shut, massive damage; a few seconds, then he sinks back to his
place. ("Top" is the stone's back edge, by the water he lies in; "bottom" its near edge.)

`src/art/eye_shovel.ts` (behind `EYE2`, off; nothing of the game imports it: `tests/eye_shovel.test.ts`) says each frame as poses for
the painter; `tools/eye_moves_pics.ts` paints each layer once and lays the frames together in the arena with what the game would draw
(the boil, the burst's crown and foam, the water pouring off him, the sparks, grit and slime off each scraping tip, the gouges it
leaves in the stone, the spittle and the splinters of the snap, the shakes); `tools/eye_shovel_sheet.py` makes the sheet and the film.
The painter, `src/art/eye_colossus.ts`, can now turn him (`ColossusPose.orient`, his maw on its side) and lean him
(`ColossusPose.lean`, his snap); everything painted before is painted the same (only what is turned is painted differently; the earlier
layers moved to their new names).

FIX 1 (the art chat's close look at 3d20af4b, before he saw it; his rule “Everything drawn should not just look like shapes.  That’s
the rule”, nothing ruled; every beat and number kept):
1. HIS MAW'S INSIDE was ruled: seen from his side, the wall at the back of his throat showed a straight upright seam where his hide
   began, its straight faces and the hollows of his jaws showed straight edges, and the lines drawn where one part of the inside lies in
   front of another made boxes. Now, turned, the wall's face is bowed and lumpy up it and its top sags and swells along it, where his
   hide begins wanders over it, the hollows and faces of his jaws are lumpy where they meet it, and the inside of his mouth folds over
   itself soft and dark with no line drawn (his throat going dark, its edges the jaws' own); his drool strings bow and swing instead of
   hanging ruler-straight. (Turned only: nothing seen from the front is touched.)
2. THE WATER POURING OFF HIM at the burst was ruled hatching. Now: sheets of black swamp water sliding down him at their own paces,
   wandering, ragged at their edges, their leading lips beaded with light; ropes of it pouring off where he overhangs the water,
   wavering and necking, breaking into gobs and drops with slime and weed among them, crashing into foam; thinning over the roar
   (`pourSheet`, `pourRope` in `src/art/eye_shovel.ts`).
3. THE RIPPLE RINGS showed over his body. Now they are on the water round him only, hidden wherever he is, over the water or under it
   (and so the burst's ring of foam).
4. THE STONE SCORED in long straight lines. Now each tip gouges along its own path, frame by frame (`scorePath`): two or three short,
   ragged, broken scratches in each step, here and there across the path, dark with a lit lower lip, grit thrown out of them, a blotch
   or two of wet slime smeared over them fading first (by 1.8 s), the gouges by 4 s; never ahead of where the tip has been
   (`scoreMarks`).
5. THE SNAP held shut read as a mound of frills. Now he slams shut on 203 (where the game's snap lands: its reach unchanged) and holds
   clenched 204 to 211 (open 0.3): his teeth clashed, both rows meeting at the front of the seam, his lips curled back off them, spittle
   and spray bursting out from between them, splinters of his teeth flung and falling on the stone. The close-up is 1.8 times the size
   (twice would cut either his teeth or the Warrior), on his maw as it twitches, panning with the strike onto the clash and the Warrior
   just clear, down with him as he runs on, and back over the maw as it gapes again.

HIS WORD ON IT, 8 Nov 2026 (by 09:03), shown fix 1 (3bb3ca46, `eye_moves3`) and the mirror test (994f9e41, `eye_mirror.png`):
- Asked if the shovel is right: “It’s a little stiff but it’ll do.  I took all night so I’m not looking to redo it at this moment”.
  Read as (told him): it stays as it is; “a little stiff” kept here, for a later pass if he wants it looser.
- Asked “Mirror him at the right end (eye_mirror.png), or keep both ends painted?”: “Mirror it but save the old one just in case.”
  Read as (told him): IN THE GAME THE RIGHT END IS THE LEFT END FLIPPED (him and his tentacles, about his own middle; the stone, the
  water, the hero and the game's effects never flipped; the light on him then from the right there). THE PAINTED RIGHT END IS KEPT
  (its poses in `src/art/eye_shovel.ts`, its pictures) so it can be brought back.
- Asked what happens to the pieces on the stone (the broken columns, mossy stones and fallen drums), in the tentacles' way:
  “Smashed by the first sweep (Recommended)” (offered as: the first shovel breaks them, chunks flying; rubble left after). To draw next.

### Each beat, frame by frame (30 a second; frames from his stand; the same at both ends)

WIND-UP, STRIKE and WIND-DOWN marked (Movement 9). Frame, then seconds.

1. HE SINKS (the wind-down of his stand), 0 to 21 (0.00 to 0.70 s, 0.73 s): out of his stand at his place, his three tentacles going
   down with him, quicker than his rise (his entrance rises over 78 frames: this is 22), the water closing over him, bubbles, the
   swell, the screen rumbling (2 game pixels).
2. THE TELL (THE WIND-UP, HELD), 22 to 55 (0.73 to 1.83 s, 1.13 s): the water boiling and heaving off the chosen end of the stone,
   grit hopping on the stone's end as it shudders, the screen rumbling, more as it goes on; nothing of him seen. The camera follows the
   Warrior to that end through it (160 game pixels across).
3. HE BURSTS UP AT THAT END (THE STRIKE), 56 to 59 (1.87 to 1.97 s): four frames, the last three smeared; his maw on its side (turned a
   quarter round, his front along the stone toward its far end, one jaw along its back edge and the other along its near edge, gaping
   across its whole depth, teeth down both); a crown of water and slime thrown up and a ring of foam out over the water; the screen
   jolted (9 game pixels on 59, dying over 14 frames). Each end painted, not mirrored (each turned its own way round, each seen from the
   camera as it is: `VJ.l`, `VJ.r`).
4. THE ROAR (THE WIND-DOWN), 60 to 83 (2.00 to 2.77 s): settling as the water pours off him (to 106), roaring (the screen shaking, 5
   game pixels at the most), his jaws widest (1.42 open, his stand's 1) 70 to 79, easing to his gape (1.32) by 84; his throat hot.
5. THE SHOVEL, 84 to 299 (2.80 to 9.97 s): his maw gaping (a loop of 1 s), trembling, his tongue-eye weaving in it and looking at the
   Warrior, never still. Four tentacles, one along each edge in turn, each (frames from its first): UP out of the water past the far
   end, 0 to 7 (its wind-up, 0.27 s); THE SCRAPE, 8 to 52 (1.5 s): along the stone toward his maw, the back edge's tip hooked down on
   the stone, the near edge's lying along it and curled up at its end, sparks, grit and slime thrown back off where it drags, the stone
   scored behind it (the line fading from 1.2 to 4 s after); at his maw 53 to 55; its hook DRAWN BACK off the stone into the water 56 to 61, slid back
   along the edge 62 to 85, under 86 to 93 (its wind-down, 1.27 s). Tentacle 1, back edge, from 84 (scraping 92 to 136, 3.07 to 4.53
   s); tentacle 2, near edge, from 128 (scraping 136 to 180); tentacle 3, back edge, from 190 (198 to 242); tentacle 4, near edge,
   from 234 (242 to 286), under by 327. The Warrior weaves: to the near side (9.4 tiles from the back edge) as each back edge's comes, to
   the back (2.2 tiles from it) as each near edge's (at the right end, through all four).
6. THE HIT (the left end's film), 159 (5.30 s): the Warrior caught at the edge of the gap by tentacle 2's curled tip, a flash, the
   screen jolted (5 game pixels), slime flung; knocked flying toward the mouth 161 to 170, from 8.4 tiles off his end to 1.9, 1.8 tiles
   high at the top of it; down 171 to 193, getting up.
7. THE SNAP (the left end's film): THE TWITCH (THE WIND-UP, HELD) 196 to 201 (6.53 to 6.70 s, 0.2 s): drawn back, his jaws flexing
   wider (1.5), his throat glowing; the Warrior up and leaping away 194 to 203. THE STRIKE 202 to 203 (6.73 to 6.77 s): two smeared frames,
   lunging up out of the water 2.04 tiles and on 0.89, tipped 15 degrees, leaning out over the stone's end, slamming shut on 203, the screen jolted (10 game pixels, dying over
   16 frames). HELD CLENCHED 204 to 211 (0.27 s): his teeth clashed, spittle, spray and gobs bursting out from between them along the
   stone and up, splinters of his teeth flung. THE
   WIND-DOWN 212 to 226 (0.5 s): back into the water and gaping again by 227. The Warrior, 3.8 tiles off the end, just clear.
8. HE GOES BACK, 300 to 351: the last tentacle drawn back and under (to 327); he sinks at the end, 300 to 313 (0.47 s), the screen
   rumbling; under, 314 to 317; a short rise at his place (not his entrance), 318 to 347 (1 s), the water boiling over him, the
   screen rumbling, the camera back with him; his stand from 348. The reeds in the water off the end he came up at are crushed under
   him, from his burst on.

### The numbers, for the main chat (in the game's tiles, C_TILE, 39.19 of his lengths; the stone 17 tiles across and 11 deep)

- HIS PLACE AT AN END: his middle 4.72 tiles off the stone's end, at the middle of its depth: as near as he can come up and be clear of
  the stone (his heaps at the water are the widest of him). Gaping there, he spans the stone's whole depth and more (15 tiles at the
  water, about 2 behind the back edge and 2 before the near edge), his front a third of a tile off the stone's end (0.31 at the left
  end, 0.33 at the right): HIS MAW'S REACH ONTO THE STONE, GAPING: NONE (checked).
- THE SNAP: from the end of the stone, his jaws come in over it 2.35 tiles (all their height, from a quarter of a tile over the stone up),
  0.71 tiles at the Warrior's height; across from 1.84 to 9.80 tiles from the back edge (of its 11). Its hit on frame 203, shut to 211.
  The game's snap's area as drawn: the end of the stone 2.35 tiles deep by the middle 8 tiles of its depth (the main chat sets the hit).
  The film's Warrior is down 1.9 tiles off the end and leaps away as it twitches, to 3.8 tiles before it lands.
- THE TENTACLES' SWEEP: each comes up 1.79 tiles past the far end and scrapes along the stone to 0.64 tiles from his end: 18.15 tiles in
  1.5 s, 12 tiles a second; drawn back along the edge in 0.8 s (at the most 1.13 tiles a frame). One along each edge in turn (back,
  near, back, near), the next starting 1.47 s after (44 frames), then 2.07 s (62, the snap between), then 1.47 s; each 3.13 s from up
  to under.
- THE GAPS: a back edge's hook reaches 6.75 tiles across the stone from the back edge, its gap the 4.25 tiles at the near edge; a near
  edge's 6.64 tiles from the near edge, its gap the 4.36 tiles at the back edge. Nowhere else on its line across is safe. Over the
  stone the hook is at the most 1.49 tiles high (its arch over the edge) and 1.30 thick; the back edge's tip is hooked down on the
  stone, the near edge's lies on it and curls up at its end (1 tile up). Its body runs under the water 0.87 tiles outside its edge.
  “Dodge over” one: the game's dodge through it (its hook is on the stone all across).
- THE HIT: knocked 6.5 tiles toward his mouth in a third of a second.
- A SCRAPING TENTACLE AS A LOOP THE GAME SLIDES: its hook (with what of it comes up out of the water over the edge) is a loop of 1 s, 30
  paintings, writhing; its body behind it under the water a loop of 1 s, 15 paintings; each painted with its front at 0 and slid along
  the edge by the game (here, as the film slides them), so that its speed and spacing are the main chat's. Drawn back off the stone: 6
  paintings; drawn back, slid back: a loop of 1 s, 30 paintings; up and under: the same paintings, lowered by the game into the water.
  Each edge and each end its own (the hook's suckers along the inside of its hook).

### The pictures

- `pictures/eye_moves3.png` (1200 x 6580): key frames at the game's size (the phone's screen, two picture pixels to a game pixel): he
  sinks, the tell; the burst and the roar (4); the shovel and the hit (6); the snap (4); the last two, drawn back, he goes back (4); the
  right end (4); then four at twice the size (the burst, a tip scraping with its sparks, the snap shut with the Warrior just clear, his
  maw at the right end). The Warrior is in each tile of the tentacles and of the snap.
- `pictures/eye_moves3.mp4` (26.3 s, 790 frames, 30 a second, H.264 yuv420p, 1014 x 540, captioned beat by beat), all in the arena as
  the player sees it (the stone, the Warrior, the camera following him to the end and lowered there to see the whole depth of the
  stone): THE LEFT END at full speed (352 frames, 11.7 s: the Warrior weaving low and high through the gaps, caught by tentacle 2 on
  frame 159 and knocked toward the mouth, down, up and leaping away as the jaws twitch, just clear as they slam shut on 203; then
  through the last two); THE RIGHT END at full speed (352 frames, 11.7 s: no snap, the Warrior weaving through all four); THE SNAP close
  up, 1.8 times the size, at half speed (frames 188 to 230, 2.9 s), on his maw twitching, panning with the strike onto the clash.
- To make them again (the layers kept on the machine's memory disk, `/dev/shm`):

```
npx tsx tools/eye_moves_pics.ts paint 0 2 s1 s2 & npx tsx tools/eye_moves_pics.ts paint 1 2 s1 s2   (about 70 minutes)
npx tsx tools/eye_moves_pics.ts frames /dev/shm/eye_moves/frames s1      (and s2; about 50 minutes each)
python3 tools/eye_shovel_sheet.py film /dev/shm/eye_moves/frames docs/mockups/eye_redo/pictures/eye_moves3.mp4
python3 tools/eye_shovel_sheet.py sheet /dev/shm/eye_moves/frames docs/mockups/eye_redo/pictures/eye_moves3.png tools/eye_shovel_sheet.json
npx tsx tools/eye_moves_pics.ts cost3                                    (what it costs, as below)
```

- Seen at the game's size, every frame of both ends (24 to a sheet), and the snap, the hit and the burst frame by frame. Seen and
  mended: he now goes on down out of sight under the water between the end and his place (his eye's fire fading into the deep, its glow
  never on the stone), so that nothing of him is seen crossing over; the camera eases down to the stone as it goes to the end (it was a
  jump); the pieces on the stone are left out (below); the reeds in the water off the end he comes up at are under him, and the
  pieces in the water (the reeds, the lily pads) are hidden where he or a tentacle is in front of them, as is the Warrior; the Warrior
  goes deeper into each gap, reels when struck, falls, gets up and leaps clear of the snap. Fix 1 (above): looked at again, every frame
  of both ends and the close-up, at the game's size and at twice.

- `pictures/eye_mirror.png` (1200 x 3330), THE MIRROR TEST. His words, 8 Nov, 06:05:
  “He’s mirrored so you just have to draw the one side right?  Thats one time I feel like mirroring is in good faith”;
  told both ends are painted and that the light (from the left) would come from the wrong side on a flipped him, 06:09:
  “Well keep going how you’re going then. Work on the two drawings and we’ll see if a mirror would work”.
  At the right end, each beat AS PAINTED beside MIRRORED (the left end's layers of him and his tentacles
  flipped left to right about his own middle, over the right end's own stone, water, Warrior and effects; nothing repainted): the burst
  (59), the roar at his widest (74), his gape with a tentacle scraping (120), at the game's size and at twice; the snap held clenched
  (208), painted at the left end only, mirrored only. To make it again:
  `npx tsx tools/eye_moves_pics.ts mirror /dev/shm/eye_moves/mirror 59,74,120,208s` and
  `python3 tools/eye_shovel_sheet.py mirror /dev/shm/eye_moves/mirror docs/mockups/eye_redo/pictures/eye_mirror.png`.

### What it costs

- AS PAINTED HERE: 1,484 new layers (his jaws at an end 125, a painting wherever his jaws are the same: his burst, the roar, his gape's
  loop of a second, the snap; his drool 520 and his tongue-eye 499, a painting each frame, since his eye follows the Warrior; a
  tentacle's hook 280 and its body 60), 342 MB raw (two picture pixels to a game pixel, 4 bytes a pixel, each layer in the box round
  it), 82 MB packed as kept here; his stand's layers at his place, as he sinks and rises, are part 1's (357). A layer on average: his
  jaws 0.56 MB, his drool 0.11, his tongue-eye 0.20, a hook 0.28, a body 0.61. Painted in 68 minutes on two workers, and about 2 hours
  more laying the frames (his drool and tongue-eye repainted where the Warrior's way was mended).
- FOR THE GAME (an estimate, the main chat's to weigh): at each end his jaws 78 paintings (the snap at either end), his drool and
  tongue-eye each a loop of 3 s (his stand's) with the roar and the snap (145 each), the hooks 140 (each edge: its writhe, drawn back,
  slid back) and the bodies 30: 538 an end, 1,076 for both, about 290 MB raw at two picture pixels to a game pixel, 73 MB at one, about
  18 MB packed at one. Not painted while the game runs: baked (his word of 6 Nov: the game may carry files). The boil, the burst's crown
  and foam, the sparks, grit and slime, the scored lines, the spittle of the snap and the shakes are the game's effects drawn over, not
  baked.

### The checks (`tests/eye_shovel.test.ts`)

(1) The switch off, nothing of the game importing the shovel; (2) HIS END VIEWS: each end painted (turned its own way), and in every
other frame he is at an end, and every frame of his burst and his snap, clear of the stone (by 1.6 of his lengths at the least, at the
snap), of the tentacles (7.0) and of the Warrior (28.0: never in him); (3) NOTHING THROUGH ANYTHING: in every frame of both films each
tentacle clear of the stone (2.8 at the least, lying on it), of each other (181.4), and of itself (never folding through itself:
10.3); (4) NOWHERE SAFE: each sweeps from past the far end to his maw, one along each edge in turn, reaching 6.6 to 6.8 tiles across,
its gap 4.3 to 4.4 tiles; the Warrior never on a tentacle low enough to meet him but in the frames he is struck (61 of his lengths at the least),
and knocked toward the mouth; (5) nothing cyan (his roar, his drool, his tongue-eye, his snap, a hook, a body), the sparks white-hot to
gold, the enemy's; (6) NEVER STILL: him in every frame (but under the water, where the water boils), and every tentacle's hook writhing
in every frame; (7) NO LEAPS: the Warrior no faster than a run or a roll but knocked flying; his sinking and rising eased, but his burst;
the camera; the snap eased but in its two frames of strike; each tentacle no faster than drawn back; (8) THE CUES: he sinks quicker than
he rose; the tell held over a second, the water boiling off that end, the screen rumbling; the burst four frames, smeared, the screen
jolted; the roar wider than his gape; each scrape scraping and scoring; the snap's twitch held wider, two smeared frames, shut on the
second,
the clash jolting the screen, held clenched; the Warrior struck, the screen jolted; back at his place, in his stand; (9) THE NUMBERS above, measured
(his maw gaping never over the stone; the snap's reach; the sweep); (10) NOTHING RULED (fix 1): no straight run over 12 game pixels,
exactly across or up, in his maw's inside (its edges with his flesh, and between its own parts or across a line, as he roars at the left
end, gapes at the right and twitches before the snap, painted at the game's size; his teeth, tongue and drool are their own shapes),
in the water pouring off him (its sheets and its ropes) or in the marks scored in the stone, and those never ahead of where the tip has
been (the longest: his maw 11 game pixels, the sheets 11.5, the ropes 10.5, the marks and their smears 11.5). `tests/eye_moves.test.ts`, `tests/eye_colossus.test.ts` and
`tests/eye_arms.test.ts`: their first checks now let `art/eye_shovel.ts` import his moves, him and the tentacles (the smallest
change).

### For the owner to decide (the art chat's to put to him)

1. THE TELL is held 1.13 s (his “You need some more time to dodge those tentacles.”), the water boiling off the end he will come up at.
   More time, or less, is a number.
2. THE GAPS: 4.3 tiles wide, at the far edge from each tentacle in turn, a tentacle every 1.5 to 2 s: the weave of his drawing. Tighter
   (his “tight waveform”) is a number (each hook's reach across).
3. THE SNAP: he lunges up out of the water and leans out over the end of the stone, 2.35 tiles in. Too close is the end of the stone
   (the main chat sets where it is triggered and its damage).
4. THE PIECES ON THE STONE (its two broken columns at the back corners, the mossy stones and the fallen drums) are left out of the
   shovel's film: the tentacles sweep the whole length of the stone, through where each lies. To keep them in the fight, they would have
   to go when he sinks (smashed by the first sweep, or the arena without them): his to see. HIS PICK, 8 Nov: “Smashed by the first
   sweep (Recommended)”.
5. The reeds in the water off the end where he comes up are under him there, crushed, from his burst on.


## Stage 3: his moves, part 2: his tentacles, in pictures and a film

His words (7 Nov 2026 unless said otherwise):

- Shown the roar, asked whether to go on to the tentacles: “Yes, on to the tentacles (Recommended)”.
- 5 Nov, of the old fight (his words as quoted on the board): “You need some more time to dodge those tentacles.” So every warning
  here reads clearly and is held.
- 20:25: “Beyond just slamming down on the platform, I’d also like the tentacles to slam the water on the left sending a wave right
  across the platform, then on the right sending a wave to the left, then both sides simultaneously to send a big crash into the
  middle”.
- Asked how a wave is got past, his answer: “Outrun or dodge through”. Read as: each wave is a wall of black water, tallest at the
  back by the water, thinning toward the front and dying before the front edge; you either dodge through it or run to the front. The
  two waves meeting in the middle crash hard. (Changed by his word below: nowhere safe.)
- Shown a0c0147e: “I don’t like that you can just stand at the back and dodge everything.  We don’t want that.  I’d like the slams to
  have a bit more weighty impact.  Some goo  and stone fragments flying”. ("The back" is the far side of the stone, away from him,
  where the film's Warrior stood and nothing reached him.)
- Asked "Should the slams and the waves reach the whole stone, so there's nowhere safe and you have to dodge through? That changes
  your earlier "Outrun or dodge through": there would be nowhere to run to.", his pick: “Yes, nowhere safe (Recommended)” (offered as:
  slams stretch to the near edge; waves sweep the whole stone; you dodge through).

FIX 1 (a0c0147e seen close; his word above): NOWHERE SAFE. Each slam's line runs from its root toward the hero right across the stone
to where it leaves it (its near edge, or its side), the tentacle stretched out along all of it as it lashes, longer and thinner, lying
along the whole line; drawn for a turn every 3 degrees (every 15 left two thirds of the stone's near half between the lines: 3.3
tiles apart at the near edge, a line 1.1 wide), so that in each phase every spot of the stone lies in some tentacle's line (checked).
Each wave sweeps the stone's whole depth, still a wall a third as tall at the near edge, and spills off it: no outrunning, you dodge
through. THE SLAMS LAND HEAVIER: slapped down flat, squashed, held, rebounding; the screen thrown harder; the stone broken along the
line; chunks of the paving and goo flying. THE WATER REAL (the waves and the crash, which read as a green slab and a white bush). THE
WARRIOR at the far side of the stone, away from him, every slam and wave reaching him, dodging out of each line before it lands and
through each wave, never on a tentacle (checked).

THE MAIN CHAT'S RULES (its post of 7 Nov 00:48; it sets the final numbers): a tentacle stands where it burst up; every 3 to 4 s it
rears, a warning of about 0.9 s, its line on the stone in the enemy's pink, laid from its root toward the hero; it slams along that
line; it is struck and hurt where it stands, and sinks into the water as it dies. All drawn so. EVERY LENGTH HERE IS IN THE GAME'S
TILES (a tile, C_TILE, is 39.19 of his lengths; the stone 17 tiles by 11. Fix 1: an earlier version of this section, and its report,
called the code's `UNIT` a tile; `UNIT` is a tile divided by the square root of 2, 27.7 of his lengths). THE LINE is 1.1 tiles wide
(the main chat's 1.2) and, by his word above, runs across the whole stone (each turn's length below). The tentacles as he has them
(fe166263) are 7.9 to 12.0 tiles long and 2.1 thick at the water (the middle one 1.8); stretched along a line they grow longer and
thinner. THE ROOTS are 1.38 tiles off the stone (the main chat's 1.4): phase 1's two 2.83 tiles either side of the middle (at a third
and two thirds along), phases 2 and 3's three at the middle and 5.66 tiles either side. The films show each slam once or twice, not
every 3 to 4 s.

`src/art/eye_arms.ts` (behind `EYE2`, off; nothing of the game imports it: `tests/eye_arms.test.ts`) says each move frame by frame as a
pose for the painter; `tools/eye_moves_pics.ts` paints each once and lays the frames together in the arena with what the game would
draw (the warnings, the cracks, the slime, the waves, the crash, the splashes, the ichor, the shakes); `tools/eye_arms_sheet.py`
makes the sheet and the film. Each tentacle is a figure of its own, one smooth taper, no sections.

### Each move, frame by frame (30 a second; frames from the move's first)

- ITS STAND (`armStand`, `src/art/eye_moves.ts`): a loop of 1.5 s (45 frames), two of them in his 3 s stand, so they close together;
  never still: a slow wave of sway out along it (22 of his lengths at its tip), its body breathing up and down, its tip curling and
  uncurling, its suckers flexing (each ring swelling and shrinking, a fifth, in a wave along it), slime dripping off its underside
  (up to 7 drips stretching and letting go, the gob falling into the water). It replaces the sway at the root of part 1 (in his stand
  and so in the last beat of his entrance).
- THE SLAM ON THE STONE (`armSlam`), 74 frames (2.47 s):
  - WIND-UP, frames 0 to 26 (0.90 s), HELD: out of its stand fast, slowing into its rear by frame 18; reared back from its line and
    up, an S across the line, its top rolled over into a big coil (fix 1: a little lower, so that the camera down to see the whole
    stone keeps it in the picture); held there quivering, the coil tightening. THE LINE on the stone, right across it,
    all through it, the game's own warning (`render/act1_fx/garden_warn.ts`): its edge dashed in the enemy's pink, marching, the stone
    inside shaded dark and dithered, flaring to the enemy's gold in its last quarter as the blow comes.
  - STRIKE, frames 27 and 28, two smeared frames (each with the frame before it ghosted behind it): 27 flung down out of the rear,
    lashing out along the line, stretching, its outer part still high over it; THE HIT on frame 28 (0.93 s): stretched out along the
    whole line to where it leaves the stone, longer than it stands and thinner (its root as thick as the square root of 1.05 over how
    far it is stretched), lying on the stone, never in it (what lies on the stone is inside its line, at every turn), SLAPPED DOWN FLAT:
    SQUASHED, what lies on the stone flattened to three quarters of its thickness and bulging out half as wide again (`squash` 1.2, the
    painter's own), held so frames 28 to 31, then springing up off the stone taller than round (frames 32 to 36) and settling.
  - A BEAT LYING THERE, frames 28 (the hit) to 42 (0.5 s): the squash held, the rebound, settling, its tip curling.
  - THE IMPACT (the game's effects, drawn over; for the main chat): the screen thrown 8 game pixels (it was 4), dying over 14 frames;
    the stone broken along the line: split along both sides of where it lay (a crack every 1.5 tiles each side), broken across it every
    1.15 tiles, slabs of the paving lifted at an edge and tipped every 1.3 tiles, staying 4 s and fading by 7 s; THROWN UP all along the
    line, 124 in all: 34 CHUNKS OF THE PAVING (broken pieces 4.5 to 10.5 picture pixels across, their tops worn and lit, moss on some,
    their broken sides dark), flung 140 to 360 of his lengths a second up and 50 to 200 out to the sides, tumbling, arcing, bouncing
    twice on the stone (each bounce at a third of the speed, sliding on at half), settling and lying, gone by 3.2 s; GOO, 40 gobs (2.4
    to 5.8 across) and 12 strings and sheets of slime flung off it, 120 to 420 up, splatting on the stone (a lobed splat, flecks round
    it) and lying a moment, soaking away by 1.4 s; 24 drops of water; 14 bits of grit.
  - WIND-DOWN, frames 43 to 73 (1.03 s): dragged back toward the water along its own length, scraping (to frame 52), peeled up off
    the stone from the water out, its tip last (to 60), rising into its stand by 72, at its own clock then, so it stands on with no
    leap; the slime trail it leaves along the line, laid as it drags, fading from 1.2 s and gone 3.2 s after.
  - ITS TURNS: a turn every 3 degrees, each tentacle those of them whose line crosses the stone (phase 1's: 75 to the left to 78 to
    the right, mirrored for the right one; phases 2 and 3's left one 60 to the left to 78 to the right, the right one mirrored, the
    middle one 78 either way); the game takes the turn nearest the hero. Every 15 degrees (as first drawn) leaves the stone's near half
    mostly between the lines (they are 3.3 tiles apart at the near edge and 1.1 wide): every 3 degrees, from each phase's roots, every
    spot of the stone lies in some line (checked). Drawn again for each turn, not one drawing turned by the game: turned, its light
    and its suckers would turn with it and a lying tentacle would not lie on the stone. (A cheaper way, the main chat's to weigh: the
    turns every 15 degrees drawn, and the game turning each up to 7.5 degrees either way.)
  - EACH TURN'S LINE, in tiles from its root to where it leaves the stone (for the main chat; the turn, then the length):
    - phase 1's left one (the right one: the same, its turns mirrored): -75: 5.9, -72: 6.0, -69: 6.1, -66: 6.2, -63: 6.4, -60: 6.5,
      -57: 6.8, -54: 7.0, -51: 7.3, -48: 7.6, -45: 8.0, -42: 8.5, -39: 9.0, -36: 9.6, -33: 10.4, -30: 11.3, -27: 12.5, -24: 13.5,
      -21: 13.3, -18: 13.0, -15: 12.8, -12: 12.7, -9: 12.5, -6: 12.4, -3 to 6: 12.4, 9: 12.5, 12: 12.7, 15: 12.8, 18: 13.0, 21: 13.3,
      24: 13.5, 27: 13.9, 30: 14.3, 33: 14.8, 36: 15.3, 39: 15.9, 42: 16.7, 45: 16.0, 48: 15.2, 51: 14.6, 54: 14.0, 57: 13.5, 60: 13.1,
      63: 12.7, 66: 12.4, 69: 12.1, 72: 11.9, 75: 11.7, 78: 11.6.
    - phases 2 and 3's left one (the right one mirrored): -60: 3.3, -57: 3.4, -54: 3.5, -51: 3.6, -48: 3.8, -45: 4.0, -42: 4.2,
      -39: 4.5, -36: 4.8, -33: 5.2, -30: 5.7, -27: 6.2, -24: 7.0, -21: 7.9, -18: 9.2, -15: 11.0, -12: 12.7, -9: 12.5, -6 to 6: 12.4,
      9: 12.5, 12: 12.7, 15: 12.8, 18: 13.0, 21: 13.3, 24: 13.5, 27: 13.9, 30: 14.3, 33: 14.8, 36: 15.3, 39: 15.9, 42: 16.7, 45: 17.5,
      48: 18.5, 51: 18.2, 54: 17.5, 57: 16.9, 60: 16.4, 63: 15.9, 66: 15.5, 69: 15.2, 72: 14.9, 75: 14.7, 78: 14.5.
    - phases 2 and 3's middle one (the same either way): 0 to 6: 12.4, 9: 12.5, 12: 12.7, 15: 12.8, 18: 13.0, 21: 13.3, 24: 13.5,
      27: 13.9, 30: 14.3, 33: 14.8, 36: 14.5, 39: 13.5, 42: 12.7, 45: 12.0, 48: 11.4, 51: 10.9, 54: 10.5, 57: 10.1, 60: 9.8, 63: 9.5,
      66: 9.3, 69: 9.1, 72: 8.9, 75: 8.8, 78: 8.7.
    - the line is 1.1 tiles wide; it reaches the stone 1.38 tiles from the root (straight on; more at a slant).
- THE WATER SLAM (`armSmash`; the left and right ones in phases 2 and 3), 74 frames, the same beats: WIND-UP 0 to 26 held, reared back
  away from the stone's end and up, lower (so it is seen with the stone), coiled hard, quivering; the game's warning across the back
  of the stone where its wave will run (the same dashed pink, over the whole stone). STRIKE 27 and 28, smeared; THE HIT on 28: a high
  arch flung out over the water and down into it off the stone's end (1.79 tiles off the end, 1.53 onto its depth), a heavy crown of
  water thrown up (fix 1: 320 drops, gobs and sheets of slime, flung 480 to 780 of his lengths a second up, from 200 and 380 to 580),
  the screen thrown 6 game pixels over 12 frames (from 3 over 9). In the water to frame 42, heaving, churning it; drawn back up out of
  it, 43 to 73, into its stand by 72.
- STRUCK (`armFlinch`), 14 frames (0.47 s): flung back from the blow in two frames, shivering out along it, back; lying slammed, it
  jerks up off the stone and slaps back down (the film shows it lying; standing, it is drawn, not filmed). His dark ichor spurts from where it was struck for 8 frames (maroon to black, never
  cyan) and spatters the stone.
- ITS DEATH (`armDeath`), 90 frames (3.0 s): CONVULSING, frames 0 to 19, held (shudders through all of it, its tip curling and
  uncurling hard); THRASHING, 20 to 41 (whipping side to side, flung up off the stone and down, never into it); SINKING, 42 to 89
  (drawn back down into the water through its root, coiling up as it goes; bubbles gurgling up, a slick of ichor spreading, rings, the
  water closing over it).
- PHASE 1: the two burst up at the fight's start out of his lurk (part 1's `armBurst`: the water bulging over each for 10 frames, the
  burst in 2, settling over 20), the right one 6 frames after the left, then stand, slam, are struck and die as above.

### The water slams, for the main chat (in the game's tiles, C_TILE, 39.19 of his lengths; the stone 17 tiles across and 11 deep)

- THE BLOWS: each lands on frame 28 of its move (0.93 s after its wind-up begins). In the film's phase 2: the middle one's slam on the
  stone lands on frame 58; the left's water slam 140; the right's 240; both at once 350.
- EACH WAVE: formed out of the smash over 0.25 s, 1.02 tiles off the stone's end; rolls across at 6.12 tiles a second (the stone's
  17 tiles in 2.78 s; 2.94 s from the smash to the far end), and dies as it goes off the far end (over 3.57 tiles). Its front leads at
  the back (it slants, 0.35 tiles behind for every tile toward the front) and is never ruled straight (its crest surges and lags, up
  to 0.4 tiles either way). ITS HEIGHT along the stone's depth (fix 1, nowhere safe: it sweeps the whole depth): 1.48 tiles at the back
  edge, 1.3 two tiles onto the stone, 1.2 at four, 1.0 at six, 0.8 at eight, 0.6 at ten, 0.49 at the near edge (eleven: a third of
  its height at the back, still a wall), spilling off the near edge to nothing a tile past it. Nowhere to outrun it: it is dodged
  through. Across it: its crest pitching forward in a lip that curls
  down (reaching about half its height ahead of it: 0.74 tiles at the back, surging and drawing back), the hollow under the lip, the
  face falling to its toe; behind the crest its back slope (0.87 tiles). (Fix 1 made its back slope shorter, 0.87 tiles from 1.33, and
  gave it the lip: a wall, not a long ramp; and made it reach the whole depth. Its speed, its height at the back and its times are as
  they were.)
- THE CRASH: the two waves of the both-at-once meet in the middle 1.55 s (46.6 frames) after their smash, frame 75 of the move (the
  film's frame 397): where they meet near the back of the stone (0.87 tiles onto it), a plume of water 5.87 tiles high, 1.79 tiles
  its half-width scale (narrow at its foot, fanning out as it rises), rising in 0.35 s and falling back over 1.4 s, spreading to 2.6
  times as wide as it falls (4.64 tiles); along the line where they meet in front of it a lower wall of spray (0.7 tiles high, lower
  and broken toward the near edge); 420 drops of spray, slime and water flung out of it in arcs to both sides; then a surge of foamy
  water spreading over the stone in a pool up to 6.9 tiles either side of the middle and over the whole depth, draining off by 3.2 s,
  the stone left wet and streaming until 5 s; the screen
  thrown 7 game pixels, dying over 30 frames (1 s).
- What the game draws: the waves and the crash are the game's effects drawn over the stone (as his water is); the smash is the
  tentacle's own frames. Here the pictures' tool draws them as the game would (fix 1, after they read as a green slab and a white
  bush): each wave drawn in slices across the stone's depth, each slice its own shape as the camera sees it, so it is real rolling
  water: the swamp's black water, lit by its curve, a glossy highlight running along it behind the crest; the crest pitching over in a
  lip that curls down, foam riding it, spray torn off it, the lip surging and changing every frame; the hollow under it; foam spilling
  down the face and streaming off the back in streaks; weed and slime rolled in it; thinning toward the front to a film the wet stone
  shows through. The crash: the two walls slamming together and erupting in a plume, dark water at its core with sheets of it
  streaming up and then falling back down it, white foam and torn sheets at its edges, a crown of spouts and spray at its top; arcs of
  drops flung out to both sides; then collapsing into the surge, a pool of foamy water with a ragged rim (nothing ruled, no box),
  draining off and leaving the stone wet.

### The pictures

- `pictures/eye_moves2.png` (1200 x 6318): key frames at the game's size (the phone's screen, two picture pixels to a game pixel):
  phase 1 (14 frames), phase 2 (8), the line at 11 of its turns (every 15 degrees); then four at twice the size (the held coil, the
  hit squashed with chunks flying, a wave's crest, the crash). The Warrior is in every tile of the phases.
- `pictures/eye_moves2.mp4` (44.8 s, 30 a second, H.264 yuv420p, 1014 x 540, captioned beat by beat), all in the arena as the player
  sees it (the stone, the Warrior, the camera lowered 200 picture pixels from the stills' to see the whole stone, the Warrior at its
  far side away from him): PHASE 1 at full speed (380 frames, 12.7 s: the two bursting up out of his lurk; the left one's slams
  hitting on frames 68 and 188, the right one's on 128 and 250, each across the whole stone at its own turn toward the Warrior as he
  steps out of the line; the right one struck lying on 253, struck its last on 263, dying, gone under by 353, the Warrior backing away
  from its thrashing); PHASE 2 at full speed (520 frames, 17.3 s: the middle one's slam hitting on 58 as he steps out of its line;
  the left's water slam 140, its wave sweeping the whole stone and reaching him, he dodging through it; the right's 240, the same;
  both at once 350, he running out of the middle, the crash 397); the both-at-once and the crash again at half speed (frames 322 to
  461, 9.3 s); and the left one's first slam close up, twice the size, at half speed (5.5 s), the view on its coil as it rears and
  holds, panning down onto the stone for the strike, the squash, the chunks and goo flying, and the wind-down.
- To make them again (the layers kept on the machine's memory disk, `/dev/shm`; a tentacle's layer casts its rays only in the box
  round its tube, its drips and what falls off it, checked the same pixel for pixel as without the box):

```
npx tsx tools/eye_moves_pics.ts paint 0 2 p1 p2 fan & npx tsx tools/eye_moves_pics.ts paint 1 2 p1 p2 fan   (about 30 minutes)
npx tsx tools/eye_moves_pics.ts frames /dev/shm/eye_moves/frames p1      (and p2, and fan)
python3 tools/eye_arms_sheet.py film /dev/shm/eye_moves/frames docs/mockups/eye_redo/pictures/eye_moves2.mp4
python3 tools/eye_arms_sheet.py sheet /dev/shm/eye_moves/frames docs/mockups/eye_redo/pictures/eye_moves2.png tools/eye_arms_sheet.json
npx tsx tools/eye_moves_pics.ts cost                                     (what they cost, as below)
```

- Seen at the game's size, every frame of both shots (every fourth laid side by side, and the strikes, the waves and the crash frame
  by frame).

What they cost:

- AS PAINTED HERE (fix 1): 1,021 tentacle layers (standing 225, 45 for each of the five; slams on the stone 327; water slams 296;
  bursting 62; struck 10; dying 90; the fan 11): 178 MB raw (two picture pixels to a game pixel, 4 bytes a pixel, each layer in the box
  round it), 59 MB packed as kept here; fix 1 repainted the 465 that changed (the slams, the struck one's dying, part of the right
  one's water slam) in 15 minutes on two workers. A layer on average: standing 0.19 MB, a slam on the stone 0.13, a water slam 0.24,
  struck 0.11, dying 0.09. (His own layers are part 1's, unchanged.)
- FOR THE GAME, every move of every tentacle baked. With its lines now right across the stone, each root its own lines, so five
  figures, not three. Turns every 3 degrees, as drawn here: 52 for each of phase 1's two, 47 for each of phases 2 and 3's left and
  right ones, 53 for the middle one, 251 in all. Their stands 225 frames; the slams on the stone, 74 frames a turn, 18,574; the water
  slams 148; struck standing and lying at each turn, 3,584; dying from standing and from lying at each turn, 23,040: 45,571 frames,
  about 5.0 GB raw at two picture pixels to a game pixel, 1.2 GB at one, a third of that packed. TOO MUCH for the phone: the cheaper
  way, the main chat's to weigh: the turns every 15 degrees drawn (55 in all) and turned by the game up to 7.5 degrees either way, and
  a tentacle struck its last dying from its stand (dragged back up first): 5,733 frames, about 740 MB raw at two to one, 185 MB at
  one, 61 MB packed at one.
- Not painted while the game runs: baked (his word of 6 Nov: the game may carry files). The waves, the crash, the warnings, the
  cracks, the slime, the splashes and the ichor are the game's effects drawn over the stone, not baked.

### The checks (`tests/eye_arms.test.ts`)

(1) The switch off, nothing of the game importing the tentacles' moves; (2) each one's stand closing on itself, a loop of 1.5 s, two in
his stand, painted the same at the end of its loop as at its start; (3) nothing cyan (the tentacles in every move, his ichor, the
stone's chips and cracks), the warning the game's own colours, the enemy's pink flaring to its gold; (4) NOTHING THROUGH ANYTHING: in
every frame of both shots each tentacle clear of the stone (lying on it, never in it: its tube against the stone's block, the edge's
corner too), of him (what of it is seen) and of each other, and every slam at every turn for each that slams; (5) never still: every
tentacle moves in every frame of both shots, and every frame of its stand; (6) no leaps: frame to frame, but in the strikes, the bursts
and the first frames of a flinch; out of its stand into each move and back into its stand after it, no bigger a step than standing's;
(7) the cues: each wind-up held 0.9 s with its warning drawn all through it, two frames of strike each smeared, the landing along its
line at every turn and stretched out to its line's end, the screen jolted, the water slams' warnings and waves, the crash where the
two meet, ichor when struck, the sinking and the water closing over it; NOWHERE SAFE (fix 1): in each phase every spot of the stone
lies in some tentacle's line at some turn (sampled every 4 of his lengths), turns every 3 degrees; THE HIT HEAVY: squashed flat and
held 4 frames, rebounding, the screen thrown 8 game pixels (6 for a smash); (8) the waves: tallest at the back, sweeping the whole
depth, a third as tall at the near edge, spilling off it, reaching the Warrior at the far side; the two meeting in the middle in a
crash more than two and a half times their height; every length in the game's tiles; (9) THE WARRIOR NEVER ON A TENTACLE (fix 1): in
every frame of both films he is clear of every tentacle low enough to meet him (by 47 of his lengths at the least), and his feet are
never on one lying on the stone. The waves and the crash are drawn by the pictures' tool, as the game would: they are looked at, frame
by frame. `tests/eye_moves.test.ts` and `tests/eye_colossus.test.ts`: their first checks now let `art/eye_arms.ts` import his moves
and him (the smallest change).

### For the owner to decide (the art chat's to put to him)

1. The line: 1.1 tiles wide and the roots 1.38 tiles off the stone, as the main chat set them (1.2 and 1.4); by his word it now runs
   right across the stone (each turn's length above). Its warning flares to the enemy's gold in its last quarter, as all the game's
   warnings do.
2. Nowhere safe (his pick): every slam reaches the near edge and every wave the whole depth, so the film's Warrior, at the far side,
   dodges out of each line before it lands and through each wave. The warning is held the full 0.9 s; if he wants more time, the
   wind-up can be held longer.
3. The heavier hit: the squash held 4 frames, the screen thrown 8 game pixels, chunks of the paving and goo flying (numbers above).
   His to see.
4. The camera in the film is down to see the whole stone with the Warrior at its far side (as the game's would follow him there):
   his tentacles' tops are cut at the top of the screen while they stand; their wind-up coil is kept in it.
5. Not now: his shovel (his drawing of 7 Nov). A tentacle lying along the stone (the slam's landing, `slamKeys`) is the piece it would
   reuse.


## Stage 2: his moves, part 1 (his stand, his lurk under the water, his entrance), in pictures and a film

His words and picks, 7 Nov 2026 (after the stills of stage 1):

- Shown him from his sketch (fe166263) and asked whether to make him taller like the sketch: “Yes, build on this”. So his look stays
  as at fe166263.
- His entrance (the start of phase 2), offered three, his pick: “Rises shut, then splits”. It was offered as: “The jaws rise slowly,
  pressed together like a melting mound, then tear apart down the middle with the roar and the tongue-eye unfurls.”
- Then: “Nice job that’s awesome”.
- Earlier: “And the eye waves around like its own tentacle”; “have him like constantly melting and dripping”; “Spittle and goo all
  over the place”; his entrance today “is not epic”.
- 14:01, the entrance beat by beat: “And we want the screen to rumble and water pour off as it rises in the phase transition.  It
  opens with a big roar, more screen shake, the eye stalk comes out, let the moment breathe for a second, tentacles come up, phase 2.”
- Seeing 7b2a8f49's film: “NOW WE’RE FUCKIN TALKING THATS AWESOME.  I want the roar as it opens tho.  Big rumble, slime and spittle
  going everywhere”. Read as (told him so): the roar starts the moment his jaws begin to part, no quiet strain before it; the screen
  rumbles hard as he tears open roaring; slime and spittle fly everywhere.
- 19:07: “But I want it to roar with the first open, like it needs to be part of the reveal animation.” So the roar belongs to his
  entrance and starts at the very first parting of his seam: nothing opens or cracks before it.

FIX 1 (the art chat's, from these frames seen at the game's size): three things, nothing else, every time, beat, shake and cue kept.
(1) HIS SHUT MOUND, swung shut, read as two round lobes (a brain, or a backside, rising out of the water): now his jaws are PRESSED
shut, his own open jaws pressed together, so he rises as one tall craggy pointed mound, two peaks meeting at its top (the right
the taller), the toothed seam running from between them down to the water, his melting flesh sheeting down his flanks; tearing apart,
the same jaws swing open. (2) THE SHUT EYE on the unfurling stalk read as a pair of red lips, or a mushroom cap: now it is the same
almond as when open, its lids shut in it over the ball (paler, veined, the fold of the upper lid arched over it), meeting along a wet
dark crease dipping to its middle, his burning iris glowing pink through the thin lids and leaking pink and gold through the crease;
it comes facing you as it does when it stands, the stalk hooked into it from the side as when it stands. (3) THE WATER: the boil read as
static and the froth round him as gravel: now the boil is the water heaving in lumps, glossy bubbles swelling and bursting over it,
foam riding the lumps' tops; the froth is wet creamy foam, a mass of bubbles, in clots and lace with the black water between, drawn
out from him in streaks and thinning as it spreads, draining off what lies slumped round him as it comes up.

THE ROAR AS HE OPENS (his word above; the rise before it and all after it as they were, only the opening changed): the strain is gone.
At the top of his rise a short, big WIND-UP (9 frames): the shut mound swells and shudders, the lips of his seam bulging, his throat's
fire glowing through them; nothing opens. Then THE ROAR from the very first parting: his jaws peel apart roaring, fast and then
slower, gaping WIDER than he ever stands (138 per cent open at the height of it against his stand's 95 to 105), roaring on there, his
jaws trembling, his throat flaring and pulsing with the roar; then easing back onto his stand: 44 frames, 1.47 s, from the first
parting to settled. A BIG RUMBLE from the first parting, strongest (8 game pixels) at his full gape, rolling off. SLIME AND SPITTLE
EVERYWHERE: 34 strings across his seam (4 of his raw flesh), slack and drooping, stretching and snapping one after another as he
parts, whipping as they break, the halves hanging off his teeth in ropes, swinging, then dripping away; out of his throat a fan of
spittle spray blown by the roar (460 drops, in gusts with its pulses); 150 gobs and 26 tumbling sheets of slime flung every way off
his jaws and out of his maw, arcing high across the screen and raining down into the water (each its splash: a crown of water, a ring
spreading in broken arcs, drops jumping, a dark slick a moment); 14 coming down on the stone round the hero, splatting (lobed, wet,
flecks thrown round them), lying a moment and soaking away (a picture only: the main chat decides if they matter). And the boil's foam
(frames 35 to 50) no longer one round disc: torn clumps riding the heaving water, parted where his dark lumps are just under it.

The pictures: `pictures/eye_moves1.png` (key frames of each move at the game's size and at twice) and `pictures/eye_moves1.mp4`
(56.3 s, 30 a second: his lurk looped twice; his entrance at full speed, then slowed (half speed, the roar from his wind-up to settled
at a quarter); his stand looped three times; all as the player sees them in the arena, the stone, the Warrior at his spot breathing,
the leaned camera, the rumble and the shakes moving the whole screen as the game's would; then his entrance once more close up, twice
the size, the view panning down onto his maw for the roar and the roar at half speed). Captioned beat by beat.

### His stand (`EYE_STAND`)

A loop of 3 s (90 frames at 30 a second) that begins and ends on the same picture (the test paints the start and the end of the loop
and finds them the same). He is never still:

- HIS FLESH ALWAYS MELTING: three sheets of his flesh, one after another, each welling up over the tops of his jaws, sliding down him
  (from 158 of his lengths over the water to 26, a loop's time: 44 of his lengths a second, about 22 game pixels a second), its drips
  running longer the further it has slid, laid over the sheets under it, and melting into the heaps of him at the water as the next
  comes down: he never runs out. The drips off his overhangs run longer and their bulbs swell until they let go (each on its own round
  of 1, 1.5 or 3 s): the gob falls (gravity 420 of his lengths a second a second) and splashes in the water or splats on the heaps,
  the drip springing back short. Little drips on every lower edge of him run longer and drop their beads; strings of drool hang off his
  lips, teeth, throat and tongue, a bead sliding down each.
- HIS SPITTLE STRETCHING AND SNAPPING across his maw: 9 strands (8 strung between his jaws, 1 held by his tongue to his teeth), each
  on a round of 1.5 s: strung sagging, stretched thinner as his jaws breathe open, necking at the middle and SNAPPING, the halves whipping back
  and hanging off each jaw, dripping, running shorter until they are gone; then knitting across again. Strung only where his tongue
  never weaves through them (checked through his whole loop). Two ropes of drool off the low front of each jaw sway into the water.
- HIS JAWS BREATHING: one slow breath a loop, the V opening and shutting 5 per cent (each jaw swinging about 2 degrees on the line
  under the water where its face meets the other's).
- HIS THROAT'S GLOW PULSING with his breath (0.69 to 1.31 of as drawn), a quicker flicker in it; its light breathing with it.
- HIS TONGUE-EYE ALWAYS WEAVING LIKE A TENTACLE: a wave running up his tongue from its root to the eye, little at the root, most at the
  eye (48 of his lengths at the eye: the eye sways 75 of his lengths across and 29 up and down through his loop); the eye turning to
  keep looking toward the camera and the Warrior (never less than 88 per cent of the way at him).
- His three tentacles sway at their roots (their tips 14 of his lengths), roots unchanged: their own figures; their own moves are for
  later. Their burst up at his entrance (below) is theirs.

### His lurk (`EYE_LURK`, phase 1)

A loop of 3 s (90 frames). The dark shape of him deep under the black water (as the phase 1 still: 215 down, 330 further out), heaving
slowly (6 of his lengths); his eye's fire on his tongue reared before him, drifting (the tongue weaving at 0.8 of his stand's) and
pulsing up through the black water (its fire and its light 0.48 to 1.08 of their brightness, twice a loop); bubbles rising and breaking
over him (glossy domes, the light along their upper left and a glint, bursting in a ring of foam and jumping drops); a slow swell rolling over the water (thin broken lines of light
along its crests); slicks of his goo rising and spreading, dull and oily, the light along their far edges and in streaks across them.
The two phase 1 tentacles are their own figures, with their own moves later; they are not in the lurk's film (at the end of phase 1 they
are dead).

### His entrance (`EYE_ENTRANCE`), his pick, as he set it beat by beat

270 frames: 9.0 s (the main chat planned about 4 s; it is longer, as his 14:01 word asks for more beats). Frames from the first frame after
his lurk's last; it ends on the frame before his stand's first (the test holds both). Times from its start.

| Beat | Frames | Seconds | What |
|---|---|---|---|
| 1. The rise | 0 to 29 | 0.00 to 0.97 | His eye's fire sinks back into him (his tongue drawn down into his throat, its lids shutting, its glow dying), his jaws shut under the water (painted in ten steps, deep and dim); the water stirs (the swell heaving, bubbles), then boils (the water heaving in lumps over him, glossy bubbles swelling and bursting all over it, wet foam riding the lumps’ tops). He gathers himself, sinking 14 of his lengths. |
| 1. He rises shut | 30 to 107 | 1.00 to 3.57 | HE RISES SHUT, his jaws PRESSED together, each pushed upright against the other with every part of it standing taller in its own measure (not swung: swung shut, his outer flanks rose round over his peaks), so that he is one tall craggy pointed mound, two peaks meeting at its top (the right the taller), his seam (their faces 7 of his lengths apart each side of it, never through each other; his teeth meshed in it), a huge melting mound, slowly: 229 of his lengths up and 318 in toward the stone, never faster than 7.9 of his lengths a frame, slow at the start and the end. His top breaks the water at frame 38 (1.27 s). WATER POURS OFF HIM: runs of it sliding down him faster than he rises, a dark wet film, streams falling off his overhangs into the water, foam where they land, each part of him streaming for about two seconds after it comes out; swells rolling off him; the boil dying away. |
| 2. The wind-up | 108 to 116 | 3.60 to 3.87 | Short and big, at the top of his rise: the shut mound SWELLS (5 per cent) and SHUDDERS, the lips of his seam bulging along it, his throat's fire glowing up behind his seam, beating (rising to 1.9 of as drawn). Nothing opens or cracks: his seam stays shut, the strings across it whole. |
| 2. THE ROAR (strike), from the first parting | 117 to 130 | 3.90 to 4.33 | HE ROARS AS HE OPENS: his jaws PEEL APART from the very first frame (10, 28, 45, 60, 75, 87 per cent open over its first six frames, slowing to his full gape, 138 per cent, by frame 130), his throat flaring (2.2 to 2.6 of as drawn) and pulsing with the roar; the 34 strings across his seam stretching, necking and SNAPPING one after another, whipping as they break (all snapped by frame 128); slime and spittle FLUNG EVERYWHERE (the spray, the gobs and the sheets above), the water slammed flat in a ring round him; THE BIG RUMBLE building with it. |
| 2. The roar at his full gape | 131 to 140 | 4.37 to 4.67 | Roaring on at his full gape, WIDER than he ever stands, his jaws trembling, his throat pulsing; the rumble at its strongest (8 game pixels); the snapped strings hanging off his teeth in ropes, swinging; slime still flung out, arcing high and raining down into the water, some onto the stone round the hero. |
| 2. Easing back (wind-down) | 141 to 160 | 4.70 to 5.33 | His jaws easing back from his gape onto his stand's breath (his stand's own jaws from frame 161); his throat's glow dying back to his stand's; the rumble rolling off (still by frame 161); the ropes off his teeth dripping away; the last slime falling, the splats on the stone soaking away; his tongue starting up out of his gullet at frame 156 (the stalk, as before). |
| 3. The eye stalk | 156 to 191 | 5.20 to 6.37 | His tongue unfurls out of his throat (its eye squeezed small and up on its edge as it comes up between his jaws where they are narrowest, swelling to its size and lying down on its side as it clears them), rising bowed over to one side, its tip hooked into its eye from the side as when it stands, rearing up taller than it stands (its eye 258 of his lengths up) and coming down into his stand’s weave; all the while ITS EYE SHUT and facing you: the same almond as open, its lids shut in it over the ball, paler than the raw rim, veined, the fold of the upper lid arched over it, meeting along a wet dark crease dipping to its middle, his burning iris glowing pink through the thin lids and leaking pink and gold through the crease. Its EYE SNAPS OPEN at frames 186 to 188 (shut, 30, 72, 100 per cent), turning to stare at the Warrior. |
| 4. The moment breathes | 192 to 221 | 6.40 to 7.37 | A second with nothing new: he looms, melting and dripping, breathing, his tongue-eye weaving, staring at the Warrior; his spittle knitting across his maw again; the water settling. |
| 5. The tentacles come up | 222 to 269 | 7.40 to 8.97 | His three tentacles, their own move (`armBurst`, for the start of each phase): each coiled deep under the water rising, THE WATER BULGING over it (10 frames, held: a dome of water heaving up, rings running off it, foam breaking on it, its dark shape under it); BURSTING up in two frames (smeared, its last frame behind it), tall and straight, its tip hooked, a crown of water thrown up round it and falling back; curling over into its place with a bounce (20 frames); then swaying as he stands. Left at frame 232, right at 237, middle at 242 (the bursts' first frames). |
| 6. Phase 2 | 270 | 9.00 | His stand, from its first frame. |

#### For the main chat and the sound chat: the screen (`EYE_SCREEN`)

- THE RUMBLE AS HE RISES: from frame 18 (0.60 s) to frame 116 (3.87 s): the screen thrown by up to 2 game pixels (whole pixels, as the
  game's camera moves), weak at first, strongest through his wind-up; its sound from frame 18.
- THE ROAR'S BIG RUMBLE: from frame 117 (3.90 s), his jaws' first parting, thrown every frame both ways, building to its strongest,
  8 game pixels, at his full gape (frames 130 to 140), rolling off to still by frame 161 (5.37 s).
- A JOLT as each tentacle bursts: 2 game pixels for 6 frames, from frames 232, 237 and 242.
- THE DARK: from frame 4 the fen's dusk drops toward night (darkest, 32 per cent darker, from frame 36 (1.20 s)); his eye's fire and his throat's
  glow never darken; it lifts as he roars, from frame 117 to frame 131 (4.37 s).
- THE ROAR'S SOUND starts at frame 117 (3.90 s), the first frame his jaws part: the first frame of the opening, nothing before it. It
  roars on through his full gape and dies as he eases back (by frame 161).
- Nothing hurts the hero in the entrance; the main chat's 2.5 s pause between phases is now 9.0 s.
- THE CAMERA in the film: leaned toward him as the stills have it, but 6 game pixels less (his middle at the water 131 game pixels down
  the 234 of the screen, not 125), so that his eye at the top of its weave stays on the screen (at the stills' lean it would rise 5 game
  pixels off its top); the Warrior's feet then 232 down. The main chat's to set in the game.

### What he costs (`pictures/eye_moves1` as painted here)

- FRAMES: his stand 90 (a loop), his lurk 90 (a loop), his entrance 270: 450 frames at 30 a second. Painted in layers, each its own
  picture: 970 in all (his jaws and throat 149: his stand's 90, his entrance's own 59, the rest of his entrance his stand's own frames;
  his spittle 223; his tongue and eye 238; each tentacle 120). His lurk is one painting of his body moved as he heaves, and his tongue's.
- MEMORY, baked as painted here (two picture pixels to a game pixel, 4 bytes a pixel, each layer in the box round it): a frame of his
  stand, all of him, 1.9 MB (his jaws 1.0, his spittle 0.2, his tongue 0.2, his tentacles 0.5): 56 MB for each second of him at 30 a
  second, 169 MB for his stand's loop. All three moves, every layer once: 272 MB (85 MB packed, as kept here). At one picture pixel to
  a game pixel, a quarter of that: 14 MB a second, 68 MB in all. The water's effects are drawn by the game over him, not baked.
- (With the roar: 975 layers, his jaws 154; his entrance's own jaws now his closing, the shut mound and frames 108 to 160.)
- Painting, here without a browser: 30 to 45 s a frame of his jaws, 5 s of his tongue, 3 s a tentacle, 1 s his spittle; all of it in
  about an hour on two workers. Not to be painted while the game runs: baked (his word of 6 Nov: the game may carry files).

### How the moves are made, and how to make the pictures again

- `src/art/eye_moves.ts` says every frame (`eyeFrame(move, k)`): each layer of him (his jaws and throat, his spittle, his tongue and eye,
  each tentacle) as a pose for `src/art/eye_colossus.ts`, where he is, what the screen and the water do. Behind `EYE2` (off); nothing of
  the game imports it (`tests/eye_moves.test.ts`).
- `src/art/eye_colossus.ts` paints a frame of a move (`ColossusPose.anim`): his jaws swinging on the line under the water (open,
  breathing, flung wide), and pressed shut (`pressOf`, from 0.9 open down: each jaw pushed upright and turned square to the other,
  standing taller, its teeth only turned, moved with their gum), the heaps of him at the water staying where they lie, what slides and drips off him
  running straight down; his sheets sliding, his drips and gobs, his spittle, his tongue and its eye (its lids, shut in its almond along a crease
  his fire leaks through; how it is turned, how big). Without `anim` he is the still exactly as at fe166263 (checked pixel for pixel).
- `tools/eye_moves_pics.ts` paints each layer once (kept on the machine's memory disk, `/dev/shm`, packed: the disk was full), then lays each frame together in the arena with
  the water (its foam a mass of bubbles, `lace`; its bubbles glossy domes, `bubble`; the boil heaving in lumps), the effects, the
  shakes and the lights; after a change to the painter that only touches his jaws pressed shut or his lids shut, `rekey2 <the painter
  as it was>` keeps every other layer (their pictures are the same, checked byte for byte); `tools/eye_moves_sheet.py` makes the sheet and the film:

```
npx tsx tools/eye_moves_pics.ts paint 0 2 & npx tsx tools/eye_moves_pics.ts paint 1 2     (the layers, on two workers; about an hour)
npx tsx tools/eye_moves_pics.ts frames /dev/shm/eye_moves/frames lurk
npx tsx tools/eye_moves_pics.ts frames /dev/shm/eye_moves/frames entrance
npx tsx tools/eye_moves_pics.ts frames /dev/shm/eye_moves/frames stand
python3 tools/eye_moves_sheet.py sheet /dev/shm/eye_moves/frames docs/mockups/eye_redo/pictures/eye_moves1.png
python3 tools/eye_moves_sheet.py film /dev/shm/eye_moves/frames docs/mockups/eye_redo/pictures/eye_moves1.mp4
```

### The checks (`tests/eye_moves.test.ts`)

art/boss_checks.ts `checkBoss` is for a boss with bones; he has none (he is painted as one solid), so its checks are asked of what he is:
(1) the switch off, nothing of the game importing his moves; (2) his stand closing on itself, painted the same at the end of its loop as
at its start, his lurk too; (3) his entrance beginning where his lurk is and ending on the frame before his stand's first, its beats in
his order, nothing opening before the roar, his wind-up short (swelling, shuddering), his jaws peeling apart fast from the first
parting and gaping wider than he stands for 1.2 to 1.8 s before he is back on his stand, dozens of strings across his seam whole until
he parts and all snapped by his full gape, the tentacles' wind-up held and their burst two frames
(BLOW, STRIKE); (4) nothing cyan, the pink edge round him over the water; (5) NOTHING THROUGH ANYTHING (THROUGH, FLOOR): his tongue and
eye clear of his jaws and teeth and his spittle clear of his tongue in every third frame of his stand and every frame of his tongue's
unfurling (but where his tongue holds a strand, and down his gullet), his jaws clear of each other shut and tearing, his tentacles clear
of him and of the stone standing and bursting; (6) never still (ALIVE): his flesh sliding, gobs letting go and splashing, his spittle
snapping and knitting, his jaws breathing, his throat pulsing, his eye waving like a tentacle and always looking at the hero; (7) no leaps
(JERK, JUMP), frame to frame in his loops and where one move hands over to the next; (8) the screen: the rumble through his rise, the
roar's big rumble from the first parting (at least 7 game pixels, strongest at his gape, rolling off), the dark lifting as he roars,
all gone by his stand. `tests/eye_colossus.test.ts`'s first check now lets his own
moves file import him (the smallest change).

### For the owner to decide (the art chat's to put to him)

1. HIS SHUT MOUND (fix 1): his own open jaws pressed together, one tall craggy pointed mound with two peaks meeting at its top and his
   toothed seam down it (it read as two round lobes swung shut). Pressed, each jaw stands taller than it stands open, every part in its
   own measure (his peaks 222 and 224 of his lengths over the water shut, the right the taller, against 154 and 169 open: as tall as
   he rose swung shut, so his top breaks the water at frame 38 as before); as he tears open each settles to its height with the swing. His to see in the film.
2. His entrance is 9.0 s with every beat of his 14:01 word (the main chat planned about 4 s). Shorter is easy: the rise (2.6 s) and the
   moment that breathes (1 s) are where it would come from.
3. THE DARK while he rises (the fen's dusk dropping toward night, lifting as he roars) is from the art chat's brief, not in his 14:01
   words: shown in the film; his to keep or drop.
4. Shut, his teeth are meshed into his other jaw's gum along his seam (they bite in, hidden in it; pressed shut, his teeth are only turned,
   not stretched with his flesh); as he tears open they pull out of it. Said here because it is the one place anything of him is inside anything else; nothing else of him is.
5. His tentacles sway at their roots as he stands, and burst up at his entrance (their own move, `armBurst`); their attacks and their
   phase 1 moves are for later. (Stage 3, above: their stand is now their own loop, and their moves are drawn.) In his lurk the phase 1 tentacles are left out (they are dead by his entrance).
6. The spray and goo of his roar, the splashes, the water pouring off him, the swell, the bubbles and the slicks are drawn here as the
   game would draw them over him (the pictures' tool), not baked into him: the main chat would bring them in as effects.

## His words, 7 Nov 2026

- 00:07: “if you get time, i think the whole sunken eye fight needs to be redone.  hes just not scary or intimidating.  the arena doesnt really work, and his entrance is not epic.”
- 00:08: “maybe instead of a circle its a big rectangle and hes in the water in front of you.”
- 00:08: “well, like up on the screen above you”
- 00:10: “start with just tentacles coming up, kill both of them, then he emerges with three.  kill the three with extra attacks from the main body, final phase he uses the magic, maybe keep three tentacles.  kill the tentacles and his body.  flasks reset in between each phase for now”
- 00:11: “but lets get new art for the whole thing”
- 00:13: “just scrap his look and start fresh.  big ancient gross eldritch horror swamp monster with tentacles and a big eye.”
- Asked which take to draw first, his pick: “Swamp colossus (Recommended)”, offered as: “A rotting hill of moss-grown flesh filling the top of the screen; one huge bloodshot eye under a heavy brow; a split maw of teeth below; slime, weed and old bones on it; thick slimy tentacles.”
- His answer on b0b6fef2, asked whether to build the fight on this look and arena: “His mouth is bad and he needs to slide back a little so the tentacles don’t clip through him or the stage”.
- His answer on 7910b3e9, asked the same: “He’s a little too rectangular.  Less floating island and more eldritch horror.  And there’s a line on the tentacle that kinda cuts it in the middle.”
- Shown 3e7b6844: “Eh.  Still not quite it.  Let’s keep the tentacles, they’re still split up into sections.  But let’s scrap the body.  I want the eye as the end of the tongue and the whole head to split open down the center for the maw.  Spittle and goo all over the place.  And have him like constantly melting and dripping”
- 11:17: “And the eye waves around like its own tentacle”
- Shown the splitting head (bfb16ba3): “That’s pretty good, I like the direction, but I have a drawing of what I was kinda thinking”. Then he sent his drawing: `docs/ref/eye_drawing_from_owner_2026-11-07.jpg`.
- 12:45: “Not EXACTLY like that but that’s kinda what I meant about the maw splitting and the tongue eye”

## His drawing, as it was read (as he was told)

1. His body rises out of the water already split wide open in a deep V, its point down at the waterline: a vast maw opened from
   the water up. The two halves tall and pointed, like great jaws pried apart, each leaning out to a peak (the left a little lower
   and further out, the right taller and sharper). Jagged teeth down both inner edges of the V, crooked and hooked. Inside, a dark
   wet throat glowing faintly pink-gold low down, spittle strung across. The outer flanks rotting, melting flesh, drips running down
   into the water.
2. His tongue rises out of the bottom of the V and twists up in a long S, thick at the root and tapering, smooth wet flesh,
   towering over the jaws.
3. His eye on the tongue's tip, the highest of all: an almond or lens-shaped eye lying on its side (wider than tall), a tall black
   slit pupil, raw lids, the iris the enemy's pink burning to gold. It waves around like its own tentacle.
4. His tentacles curl outward from the water on both sides of him, clear of his body and of the stone.
5. The two small dots high in his drawing: nothing to draw.
6. He is drawn open, as his drawing shows him, the way he stands when risen. Whether the V closes is a question for later (below).

And, after his 12:45 word, his drawing is THE IDEA, not a shape to trace: the split from the water up in a V maw with teeth down both
inner edges; the tongue twisting up out of it, towering; the eye on its tip, the highest of all, waving like a tentacle; tentacles
curling out on both sides. The exact outline, the number of tentacles and the proportions were the art chat's to make look best.
His drawing stands beside the new still at the top of `eye_look.png`, captioned as the idea he sketched.

Kept as they were: the arena (17 by 11, the water), his place in the water (his middle 7.9 tiles out), the tentacles' roots and
their poses, the pillar spots, the melting and goo, the smooth unsectioned tentacles, the enemy's pink and gold, nothing cyan.

## The pictures (`pictures/`)

- `eye_look.png`: at the top, his drawing beside the new still, the same height; him at the game's size with the Warrior on the
  stone before him twice (from behind and from in front) for scale; twice the size (his maw, his tongue and eye); the eye on the
  tongue at three times; his jaws' teeth close (three times); under the water (phase 1); from behind (half size).
- `eye_arena.png`: the arena as the player sees it, a phone held sideways (the game's own 507 x 234 game pixels, two picture pixels
  to each), the camera leaned toward him. Phase 1: the black water across the top, his eye's fire under it, two tentacles up out of
  it. Phase 2: him risen, split open, his eye high on the screen, inside it; three tentacles. Each again at twice the size, in two
  halves. Then, small: today's fight from the game itself, and the new one beside it. Then the camera as the game sets it when the
  hero stands in the middle of the stone (no lean). Last, a plan of the arena from above.

Everything round him is the game's own: the fen's paving and black water from the fen's terrain painter (`art/fen.ts`,
`art/terrain.ts`), the fen's pieces (`art/floor10.ts`), and the Warrior as the game paints him (`art/heroes3.ts`).

## What he is now

THE V. He rises out of the black water already split wide open: two great jaws pried apart, the line their inner faces meet along
just under the water, so that the V's point is at the waterline (43 of his lengths across there at its front, a little over a
tile) and it gapes wide at the top (his peaks 281 of his lengths apart, 7.2 tiles). Each face leans out from upright, his left 44
degrees, his right 39, and is turned a little toward you.

HIS JAWS. Each rises out of the narrow trunk he stands in the water on, leaning out and tapering to a point on the edge of the V:
his left the lower (its peak 128 of his lengths over the water) and further out, heavier and sagging; his right the taller (146)
and sharper. Thinner front to back than across, slabs of a jaw rather than domes. Rotting grey-green flesh, wrinkled and lumpy,
veined, boils and sores, barnacles at the water; heaps of flesh that have run off him slumped round him at the water; a jowl of
melting flesh sagging off each outer flank over the water; tumours bulging out of them.

THE TEETH. Down both inner edges of the V from the water up to each peak, rows of crooked hooked fangs (46 in all): a front row,
the bigger, some long, some broken, and a row behind it, set in raw wet gum, each hooked back toward his throat, smaller toward the
peaks. None goes through his tongue (the nearest 10.6 of his lengths clear of it, risen or under the water).

THE INSIDE OF HIS MAW. Behind each face the jaw is hollow, wet and ribbed, inside a lumpy rim of raw gum; across the back of the V a
wall of wet ribbed throat, its top sagging between the jaws below their peaks, its foot sloping forward to the water as the floor
of his mouth; his gullet a hole in it, low down, glowing pink burning to gold, the throat round it faintly pink low down. Spittle
strung across the V at every height and slant, sagging each its own way, some snapped and hanging; drool in ropes off his jaws'
low front edges into the water. From behind, the back of his throat between his jaws is rounded hide.

HIS TONGUE. Out of his gullet at the bottom of the V and up in a long S, thick at the root (27 of his lengths) and tapering (17)
to where it swells round his eye; one smooth tube, slick, a groove down its back, rough with papillae; towering over his jaws.

HIS EYE, on the tongue's tip, the highest of all of him: lying on its side, 116 of his lengths across and 48 tall (67 game pixels
across: more than twice the knight's height), in a bulb of the tongue's flesh drawn to a point at each corner like a lens, its raw
lids parted round it in an almond with pointed corners; yellowed and bloodshot, redder toward its corners; the iris a round of the
enemy's pink burning to gold round a tall black slit; looking at you; its fire's glow on what is near it.

MELTING AND DRIPPING. Two sheets of his flesh slid down each jaw like melting wax, the upper the thicker, each sheet's edge running
down in drips of every length (122 round him, the longest 91 of his lengths), necked where they leave the sheet, swelling to fat
ends; they run straight down, as wax does, however his jaws lean. Thin runs of goo between; drips hanging off his overhangs (25), a
gob let go and falling, a splash on the water where each lands and where each rope of drool meets it (13); little drips with fat
beads off every lower edge in the picture; goo sheeting down him, bubbles in it.

HIS TENTACLES. As they were: where they rise, their lie, one continuous smooth taper each, the suckers in two rows along the
underside all the way. Left one hooking over outward like a question mark, right one curling out and over, the middle one low
and coiled aside.

An enemy: the pink edge round him; pink and gold his only glow; nothing cyan.

## How he will move (for the next stage)

- His melting never stops: the sheets sliding down, the drips running each down its own path, swelling until they let go; gobs
  falling and splashing, the rings spreading; new flesh welling up as the old runs off; drool always dripping off his teeth and
  tongue.
- His tongue never still: always weaving, swaying and curling like a tentacle, the eye on its tip turning to keep watching the
  hero; it rears back before it strikes.
- His jaws: breathing, the V working a little wider and narrower, spittle stretching and snapping across it.

## A question for later: does the V close?

His drawing shows him open, and he is drawn open. It could close and open: the jaws swinging back to upright on the line under the
water until their faces meet, the teeth meshing down the seam, the tongue drawn down into his throat and the eye hidden; then
gaping again, spittle stretching between the jaws and snapping, the tongue rearing out with the eye on it (a shut state while he
rises, say, or a guard he takes). Not drawn; his to say.

## For the main chat

- The stone: 17 tiles across the screen by 11 deep, its far long edge open on the water. As before.
- His distance out: his middle at the water 7.9 tiles out from the stone's edge (310 of his lengths). As before.
- The tentacles' roots: as before (in the water 1.4 tiles out from the stone's edge; phase 1 at a third and two thirds along it;
  phases 2 and 3 left, middle and right), and their poses as before. Risen, each is clear of all of him (his jaws, his throat, his
  tongue, his eye, his drool, his drips and gobs) by at least 37.8 of his lengths, and 10.6 clear of the stone; under the water
  228.5 clear of him.
- The three pillars of phase 3: where they were (on the plan).
- His size: him alone (his jaws, his tongue and eye) 351 game pixels across and 164 top to bottom at the game's size; his eye's top
  117 over his middle at the water.
- The camera in phase 2 (the pictures' lean, to set as the main chat likes): his middle at the water 125 game pixels down the
  234-pixel screen, so that his eye's top is 8 down from the top of the screen and its middle 26 down; his peaks 40 and 50 down;
  the hero's feet 226 down, a tile onto the stone. The camera leans 97 game pixels toward him (before: 70). With the hero further
  back on the stone, his eye leaves the top of the screen unless the lean follows.
- His tongue and eye are an enemy's weapon of their own when the moves are drawn (the eye can be struck, or can strike): risen,
  the eye is 1.2 tiles before his middle and 5.7 tiles over the water.
- The slam's area (a tentacle's slam toward the hero): as before, yours to say.

## His numbers

- The phone's screen: 507 x 234 game pixels (`engine/screen.ts`; the game's own playtest logs it on a phone held sideways). That is
  15.8 tiles across and 14.6 tiles top to bottom (a tile 32 x 16 game pixels).
- Him alone at the game's size: 351 game pixels across, 164 top to bottom, his eye's top 117 over his middle at the water: the knight
  stands 29.
- The V: his left face leans out 44 degrees, his right 39; 43 of his lengths across at the water at its front; his peaks 281 apart,
  at (-145, -22, 128) and (136, -22, 146) (across, toward you, up).
- His eye: 116 x 48 of his lengths, 67 game pixels across; its middle at (-6, 46, 224).
- Under the water (phase 1): he lies 215 of his lengths down and 330 further back than risen; his peaks 69 under the surface; his
  tongue reared forward in the water before him, the eye on it 95 down, its fire seen in the water before the stone between his two
  arms.

## Why the fight today is not scary (the audit)

1. His size: about 127 x 61 game pixels on a 507 x 234 screen, his eye about 32 across: about the hero's own height.
2. Where he sits: flat in a pool in the middle of a round ring, seen from above, with the hero right beside him; nothing of him looms over the hero.
3. How he moves: he never moves or turns (`game/act1_rules/eye.ts`); risen he only sits higher in his pool; his arms come up from cracks round the ring.
4. His frame rate: his frames are up to 860 x 790 picture pixels, so he is held at 15 frames a second and his surfacing and death at 10 (`EYE_MOVES`; `EYE_COST`, 676 frames, 320 MB): his biggest moments are his choppiest.
5. His entrance: a 4.2-second surfacing at 10 frames a second; the screen shakes twice (7 at the break, 5 at the roar) with a slam, a wave and his roar; the camera does not move and the screen does not darken.

## An epic entrance, within the game as it is (choices to put to him)

- What rises first: the water goes still and black; rings spread; his eye's fire swells under the water; his tongue breaks the
  surface first, the eye on its tip, and rears, looking at you; then the two peaks of his jaws break the surface, melting, muck
  pouring off them, and he rises, the V gaping wider as he comes up; last, his roar out of the open maw.
- The screen darkens: the fen's dusk drops to near night for the rise, so that his eye's fire and the hero's own light are
  all that is lit; it comes back as he roars.
- The screen shakes: a low rumble growing all through the rise, a big shake as he breaks the water, another at the roar.
- The camera: glides up toward the water as he rises and settles leaned toward him, so the hero drops to the foot of the screen
  and his eye is high on it.
- The water: a wave rolls off him over the stone's edge as he comes up; muck and goo rain down.
- The sound's cue (for the sound chat): the music cuts to silence; a deep rumble; a wet tearing groan as he rises; his roar out of
  the maw; then his music.

## What he costs

- A frame of him risen, his arms with him: about 800 x 480 picture pixels, at 4 bytes a pixel 1,536,000 bytes (1.46 MB).
- Baked at 30 frames a second: 43.9 MB for each second of him. Too much to hold whole. Ways to afford him (for the main chat):
  his jaws painted once a few times a second and only what moves (his tongue and eye, his drips, his arms, each a small picture of
  its own) at 30; or baked to files and read as they are needed (his word of 6 Nov: the game may carry files).
- Painting a frame, here without a browser: about 66 seconds risen, about 46 seconds under the water (this container). Not to be
  painted while the game runs: baked.

## How to make the pictures again

```
node tools/playtest.mjs --touch --size 844x390 --dpr 3 --scenario tools/scenarios/eye_today.mjs --out shots/eye_today/x
npx tsx tools/eye_redo_pics.ts look shots/eye_redo/look
npx tsx tools/eye_redo_pics.ts arena shots/eye_redo/arena
python3 tools/eye_redo_sheet.py look shots/eye_redo/look docs/mockups/eye_redo/pictures/eye_look.png
python3 tools/eye_redo_sheet.py arena shots/eye_redo/arena shots/eye_today/x_risen.png docs/mockups/eye_redo/pictures/eye_arena.png
```

(`eye_redo_pics.ts` keeps each painting of him in `shots/eye_redo/cache`, so the arena does not paint again what the look
painted; a change to `eye_colossus.ts` makes them all again. Run the look and the arena one after the other, not at once. The look
sheet reads his drawing from `docs/ref/`.)

## Before (the art chat's notes)

The first pass broke his rule of 6 Nov, 15:18 (“Everything drawn should not just look like shapes.  That’s the rule”); the
second redrew it; the third (3e7b6844) made the body a towering, hunched, lopsided mass and took the line off the tentacles. On
3e7b6844 he scrapped the body; bfb16ba3 made him a huge melting head that split down its seam, its halves swinging apart on a hinge
at the back of his skull, his tongue out of a slit low on the seam when shut. On his drawing of 7 Nov the head became the V: the
shut head, its seam, its slit, the hinge and the round lobes are gone from the file; the eye, once a ball, now lies on its side.
The tentacles, the arena, the water, the melting and the colours stayed.

## Checks

`tests/eye_colossus.test.ts`: (1) the switch off and nothing of the game importing him, nothing of the old Eye in him; (2) his
pictures (risen from in front and from behind, under the water, a tentacle alone) with nothing cyan, the pink edge round him, his
iris pink burning to gold; (3) his lengths the game's, his eye huge and lying on its side, a frame's cost; (4) his arms clear of all
of him (jaws, throat, tongue, eye, drool, drips, gobs) and of the stone, their roots under the water before it, where the main
chat's layout puts them, risen and under the water; (5) his drawing: the V's point at the water and wide at the top, each face
leaning out; his jaws tall, his left the lower and further out; rows of teeth down the V, none through his tongue; his throat
inside it and spittle across it; his tongue from his throat into the eye; the eye's bottom well over his taller peak and the
highest of him in his picture, and on the screen in the phase 2 view; under the water, nothing of him above it; (6) every
tentacle and his tongue one smooth taper: sampled close, no step in its thickness, no twist, the suckers in order; (7) he melts:
drips, gobs, splashes, the sheets running off him in drips, goo on him. `tsc --noEmit` clean. Stage 1 only: no moves, so the boss
checks (`art/boss_checks.ts`) come with his moves.
