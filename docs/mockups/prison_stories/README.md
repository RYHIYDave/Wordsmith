# The prison's stories, floors 1 to 4 (HIS YES TO THE PICTURES: ON, FOR THE MAIN CHAT TO BRING IN)

Branch `build/prison-stories`, from `main` at b09cfabf. Built 12 Nov 2026 by a chat of his working from the queue (its item
"Pick the stories prison floors 1 to 4 tell", `pick-stories-for-prison-floors-1-to-4`). The switch is `STORIES` in
`src/game/stories.ts`, ON at his word (below); the pictures here are from the game with it on.

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
- Shown the five pictures (`pictures/`), told that floors 2 and 3 read best, floor 1's pieces are small and dark, the candles
  stand out and the black water is quiet like floor 5's; asked by pop-up “The prison stories for floors 1 to 4 (...): are they
  right?”, his pick, 12 Nov 2026: “Yes, hand it to main (Recommended)” (offered as: it goes on the ready-to-ship list; the main
  chat turns it on in the next update). The others offered: “Yes, but bolder floor 1”, “Make the black water louder”, “Close,
  change something”. SO `STORIES.on = true` on this branch.

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
- With it ON (aa77d350): `node tools/unit.mjs --changed`, 24 of 24 files (what changed and the core); the floors' own playtest
  `tools/scenarios/first5_floor.mjs` on floors 1 to 4 (phone size, a page of the branch), all four clean, their moments played.
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
2. `STORIES.on` is true on the branch already (his yes). No bake changes: the pieces are painted with the floors'. Floors 1 to 4
   are laid a little differently from today wherever the way's rooms are (their things now the story's): a playtest that
   counted on a piece in a room of the way may want looking at.
3. Floor 5's own story (the queue's `lay-floor-5-as-story-scenes`) can be laid the same way: a `STORY_SETS[5]` of its beats.

## Floor 5's rooms (branch `build/floor5-story`, from `build/prison-stories` at 55996660)

The queue's `lay-floor-5-as-story-scenes`, pulled at his word in this chat, 12 Nov 2026: asked by pop-up whether to start it
next, “Yes, start it (Recommended)”; asked at 16:10 “You’ve just done this right?” and told it was not done (its pieces drawn
11 Nov, placed nowhere), his pick “Yes, keep going (Recommended)”. BEHIND ITS PIECES' OWN SWITCH, `LAIR_STORY` (art/lair_story.ts,
off), in the mine that becomes his temple (`LAIR_TEMPLE`, on in the game).

His words, 7 Nov 2026, 12:00: “showing the boring into the ossuary, the take over of the mines, and the creation of the cultist
temple under the prison and the dark power the fleshmancer has gained from the sunken eye to raise all the dead in the prison”;
12:32: “The breakthrough would be where you enter the mine from the ossuary after you beat the amalgamation”; “Rooms only, no text
(Recommended)”. Laid as floors 1 to 4 are (game/stories.ts `STORY_SETS[5]`), each beat in its part's rooms of the way (the mine's
ten or so, the temple's one, the room before his hall: game/lair_way.ts `partsOf`), every piece in its own part:

| beat | where | what |
|---|---|---|
| the breakthrough | the mine, the first rooms | the rock come down where they broke through (the cave-in and its heap), the drilled face either side, spoil spread, their props piled, a miner dead under it, his lantern dropped |
| the mine as it was left | the mine | the cart on its side, its ore spilled, the sump pump and the black water it was set against, the kibble on its rope, the pulley, a miner's candle, the lagged wall, the plank walk |
| the cult's takeover | the mine, the last rooms before the temple | empty shackles along the rock (the prison's dead brought down), drag marks from under one, a miner dead, a lantern dropped, the adit boarded up, the black water |
| the temple under the prison | the room before his hall | the shrine, candle ledges either side, the cult's banner, bones on cords, the effigy and the skull standard, the cult's ring in the floor, skulls given to him; THE SUNKEN EYE in the side wall (a bay's second tile), the black water beside it (a pilaster's bare stone), pooled |
| his hall (first5.ts) | his hall | THE EYE on his back wall by the rift (a bay's second tile), the black water on the next pilaster with no crack up it; THE DRAG MARKS from the way into the temple, through his gate, to one of the bone heaps he raises his dead from |

The pieces: floor 5's own, and art/lair_story.ts's (his yes of 11 Nov: art he approved needs no pictures again; the rooms do). The
temple's versions are given their own names (`…, in the temple`: game/stories.ts `inTemple`) so that the game draws each part's
from its name alone (art/prison_story.ts adds them to floor 5's pieces with LAIR_STORY on).

CHECKED: `tests/prison_stories.test.ts` test 6 (off: none; on: the beats in their parts, the Eye in his hall, the drag marks to
beside a bone heap, every piece its part's, nothing cut off; 80% or more of the way's rooms laid); with LAIR_STORY off floors 1
to 5 are laid exactly as on build/prison-stories (55996660), the bakes' marks the same. PICTURE: `pictures/floor5_story.png`
(seed 7919: rooms 1 and 6, the first empty shackles, the Eye in the temple's room, the way into his hall with the drag marks).
HIS YES: shown the picture, asked by pop-up “Floor 5's story (picture floor5_story: breakthrough, mine as left, cult's takeover,
the temple with the Sunken Eye, drag marks into his hall): is it right?”, his pick, 12 Nov 2026: “Yes, hand it to main
(Recommended)”. SO `LAIR_STORY.on = true` (art/lair_story.ts) on the branch.

WITH IT ON (17093f65): `node tools/unit.mjs --changed`, 24 of 25 files (lair_story's test 7, Colour 4, fails the same on main
b09cfabf: not this branch's); the floor's own playtest `first5_floor` on floor 5 and `first5_shaft` (his hall's way out), both clean
at phone size.

## For the main chat: bringing in floor 5's (build/floor5-story)

It holds build/prison-stories whole (floors 1 to 4): merge this branch alone, or that one first. `LAIR_STORY.on` is true here (his
yes). Its first5.ts hook lays floor 5 only with STORIES and LAIR_STORY on, in the mine and temple look (LAIR_TEMPLE). No bake.
