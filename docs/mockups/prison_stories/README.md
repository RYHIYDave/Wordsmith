# The prison's stories, floors 1 to 4 (BEHIND A SWITCH THAT IS OFF: NOT IN THE GAME UNTIL HIS YES)

Branch `build/prison-stories`, from `main` at b09cfabf. Built 12 Nov 2026 by a chat of his working from the queue (its item
"Pick the stories prison floors 1 to 4 tell", `pick-stories-for-prison-floors-1-to-4`). The switch is `STORIES` in
`src/game/stories.ts` (off); the pictures here are from the game with it on (`__dbg.stories.on = true`).

## His words

- 7 Nov 2026, 12:34: “What other stories can we tell throughout the prison?” (after floor 5's, his 12:00; that one is the main
  chat's, the queue's `lay-floor-5-as-story-scenes`). Offered then, rooms only, pictures first; no answer until today.
- 12 Nov 2026, asked by pop-up in this chat, one question a floor, his picks:
  - floor 1, the Warden's Tomb: “The night it fell (Recommended)”, offered as: guard post overrun, cells burst open, jailers
    fallen, the Warden still at his post;
  - floor 2, the Headsman's Yard: “The endless line (Recommended)”: pens where the condemned waited, the line along the walls,
    gallows and wheel, ending at his block;
  - floor 3, the Chained One's Pit: “The thing below (Recommended)”: jailers' rooms, the Stoker's furnace forging ever bigger
    chains, cells torn open as it grew, the great winch, his pit;
  - floor 4, the Ossuary: “The miners dig in (Recommended)”: their breach into the bones, tools dropped, bones heaped, the cult's
    candles among them, then the Amalgamation.
- And, asked whether two threads should run through all five floors: “Both threads (Recommended)”, offered as: the cult's
  candles, a few on floor 1 and more each floor down to its temple on 5; the Sunken Eye's black water seeping in from floor 3
  down.
- Told how they were read (a plain message), and that it would be built behind an off switch with pictures from the game first.

## What it does (`src/game/stories.ts`, laid by `src/game/first5.ts` `dress`)

The rooms of the way, the map-maker's main path from the first room after the way in to the last before the boss's hall
(`Room.path`; no cell), are laid in order with the floor's story, a beat to a room or two (each beat's share of the rooms in
proportion, every beat at least one). Each beat has scenes tried in order: a full one, and last a trace of the beat (a piece or
three) that fits nearly any room, so that no room of the way is skipped. A scene is laid about the room's middle where it can be,
else about a tile near it (the middle is often kept clear for a pack); its pieces each where asked, or a tile or two off; a row
along a wall keeps its spacing; never the same piece on two neighbouring tiles of a wall. Everything laid is held to the rules
the floors' scenes already keep (first5.ts: nothing on the way in or out, a trap, a lever, a pack's place, before a door; nothing
that cuts the floor in two). The rooms off the way keep what they have: floors 1 and 2 their scenes (`SCENES`), floors 3 and 4
their things laid about. Rooms only, no text.

| floor | beats, from the way in to the boss's hall |
|---|---|
| 1, the night it fell | the way in overrun (the jailers' rack, a guard fallen before it, his helm, their banner pulled down) · the cells thrown open (shackles hanging empty along the wall, a chain dragged out, the keys dropped, a barred window) · the tombs burst open (every sarcophagus open, its niche broken, its slab sunk, a great crack; by one, a few of the cult's candles) · the last stand (the jailers fallen together, helm and banner, shield and mauls on the wall, part of it come down) |
| 2, the endless line | the pens (a row of stocks, bones in irons before them, a chain from the dark, a stool kicked over, a lantern) · the line (bones in their irons one after another along the wall, room after room, chains and hoods over them) · the gallows and the wheel (the gallows and its trapdoor, a noose, the cult's black candles either side, a broken wheel, rope, the grindstone) · the block (the block in sawdust, its gutter, skulls, a broken axe, the long stain, his axes, the chute with bones in irons at its foot) |
| 3, the thing below | the jailers' room (the feed trough, their bench, goad and catch-pole, their lamp, its bowls, one kicked over) · the forge of chains (the anvil and a fire, chains heaped, a ball and chain, balls on their rack, rings and chains) · the cage it outgrew (the cage, its pallet and straw, a cuff burst, bars bent out, stone clawed, the cult's candles before it) · the chains it broke (the post, a chain snapped, a ring torn out of the wall, a bar torn out, the wall bowed, its muzzle in the floor, candles; the black water) · the great winch (the winch, the chain port, the wall winch, ball grooves, candles either side and under the port; the black water) |
| 4, the miners dig in | the quiet dead (bone-lined niches along the wall, a garland of skulls, a bone floor, skulls stacked) · the dead dug out (the charnel layer cut open, an arm hanging out, ribs on a spike, the drag where they were pulled out, raked earth and bones, a rib cage and an arm; the black water) · the cult among the bones (its altar where the look has it, its candles and daub on the wall, a robe dropped, skulls stacked; the black water) · the miners' last camp (a timber crib, their tools and lantern, drill steels, a broken ladder, a snapped prop, their boots standing empty; the black water) · the breach (the miners' breach and its heap, the rock shored up either side, the seam of ore, ore spilled, the windlass, their ladder; the black water) |

THE THREADS, counted over seven seeds a floor (floors in the looks the game has): the cult's candles 1.7 clusters a floor on floor
1 (and floor 1's own candles in a corner), the black candles 11 on floor 2, 8.7 clusters on floor 3, the cult's candle 9.7 on
floor 4 (and its temple on 5); the black water none on floors 1 and 2, 3.3 a floor on floor 3, 5.1 on floor 4.

## The new pieces (`src/art/prison_story.ts`; with STORIES on, art/floors.ts `lookPieces` adds them to floors 3 and 4's own)

Only what no floor had, all from pieces he has said yes to:
- `the cult's candles` (floor 3, on the floor): floor 1's candles in their old wax (art/floor1.ts `candles`), four frames and
  their light, in the prison's colours as floor 3's own pieces are (art/prison.ts `gradedB`), the flames as they are.
- `black water down the wall` (floors 3 and 4): floor 5's (art/lair_story.ts `seepOn`, his yes of 11 Nov), its lit lip the
  wall's own stone; in the prison's and the chapel's looks without the damp between the runs (their faces are carved), and
  with the wet catching the light down each run's lit side in the fen's dull green, so that it reads on their dark stone.
- `black water pooled, at a wall along x` / `along y` (floors 3 and 4, floor tiles): floor 5's pool (art/lair_story.ts
  `poolAt`) over the look's own flags (`floorAt`), laid on the floor tile before the face the water comes down.
art/lair_story.ts is changed only so that its painters take a stone and a floor (`seepOn`, `poolAt`, `tileOf` exported): its
own pictures are the same, pixel for pixel.

## Checks

- `tests/prison_stories.test.ts` (5): off, nothing laid and no new pieces; on, nearly every room of the way laid, the beats in
  order, every beat there; every piece laid is one of the floor's own in its look or the threads'; nothing cut off; the threads
  (candles more on floor 3 than floor 1, black water only from floor 3 down, each pool before its own face; the pieces in both
  looks, the swamp's colours kept, nothing cyan).
- `node tools/unit.mjs --only prison_stories,lair_story,first5_floors` at c366cd0e: 24 of 25 files; lair_story's own test 1
  (nothing of the game imports it) now lets art/prison_story.ts borrow its painters (no piece of floor 5's is made there); its
  test 7 (Colour 4, the drag marks and the mine's pools 75 against the darkest word's 61) fails the same on main b09cfabf: not
  this branch's (its pictures are the same pixel for pixel).
- `tools/scenarios/story_look.mjs`: a still of each room of the way, in order (DEPTH 1 to 4, SEED; STORIES=0 for the same rooms
  without it; FIND="a piece|another" for a still of the first of each laid). The pictures in `pictures/`: `floor1_story.png`
  to `floor4_story.png`, one room for each beat in order (floor 1 seed 33, the others 7919), at 1.3 times the game's size on
  a phone (844 x 390), the scene in the middle; `threads_close.png`, the threads' new pieces at 1.7 times. Floor 2's wall
  pieces are quiet in the night's grounds, floor 4's on the chapel's niched walls: what reads there is what stands and lies.
- Measured against main (b09cfabf) with the switch off: every floor 1 to 5 laid the same (props, dress and walk, four seeds,
  both with the floors' looks and without), floor 5's story pieces the same pixel for pixel, and the bakes' marks the same
  (monsters 46328e6bc77d, heroes 433864008c88, townsfolk d4c898fe370d).

## For the main chat: bringing it in

1. Merge `build/prison-stories`. With STORIES off nothing changes; first5.ts's `dress` has the story's hook before its scenes,
   and its scenes' helpers moved out of their `if` (unchanged); the lair's story pieces (art/lair_story.ts) are untouched in
   what they draw.
2. On his yes to the pictures, `STORIES.on = true` (src/game/stories.ts). No bake changes: the pieces are painted with the floors'.
3. Floor 5's own story (the queue's `lay-floor-5-as-story-scenes`) can be laid the same way: a `STORY_SETS[5]` of its beats.
