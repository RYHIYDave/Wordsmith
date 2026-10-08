# Mock-up: decorations in the dungeon (NOT IN THE GAME)

**What it is.** Pictures for the owner of four things, shown in real rooms of the dungeon:

- tattered tapestries and gargoyle heads on the back walls;
- broken and missing flagstones in the floor;
- a soft dark shadow at the foot of every standing thing.

A fifth thing has a sheet of its own: a figure standing between a fire and the eye, drawn a step darker.

The art chat made it on 8 Oct 2026, on the branch `mockup/decorations`, on top of Version 18.8 (`4e052cc`).

**EVERYTHING OF IT IS BEHIND ONE SWITCH, AND IT IS OFF.** The switch is `DECOR.on` in `src/game/decor.ts`. With it off, every dungeon is exactly what it was, and nothing new is drawn; `tests/decor.test.ts` checks this. Nothing of it goes into the game until he has seen the pictures and said yes, and the main chat has put it in.

**State.** The pictures have NOT been shown to him yet: the art chat shows them to him. The sheets are not in the repository (`previews/` is kept out of it):

- `previews/decorations_mockup.png` (1302 x 4976): the four things.
- `previews/decorations_fire_darker.png` (1302 x 1653): the separate idea.

## His words it answers

- **5 Oct 2026, 12:43:** "I'd like the layout as whole to be less uniform. The floors and walls just need more variation. And more doodads around like molted tapestries or gargoyle heads or missing broken floors tiles. That kind of thing. I know it's a tomb but I'd like it to look more alive if that makes sense"
- **12:44:** "And everything looks too flat"
- At 12:46 and 12:47 he was told how these were read. "Molted" was read as moth-eaten (`docs/NEXT_VERSION.md`).
- **7 Oct 2026, 11:32**, asking for the walls to be done first: "I’d like a solution before we decorate the dungeon so we have a better idea of what we can and can’t fit on the walls".
  - The walls have been settled since Version 18.4: his "3" at 13:39 that day, then "Good" at 14:55.
  - A wall is now its faces alone, 40 game pixels tall, with its top 12 fading into the dark.
  - Only a room's two back walls are drawn, so whatever hangs on a wall hangs on a back wall, within its solid 28 game pixels.
- **6 Oct 2026, 19:08**, about figures (the foot shadows extend this to the things that stand): "ENTITY SHADOWS: Draw a soft, semi-transparent black oval/circle on the floor directly beneath the Player and the Monsters to anchor them into the 3D space."
- The handoff for 18.8 lists this half of his 5 Oct wish as ON HOLD, because he has not asked for it again: floors and walls that vary, tapestries, gargoyles, broken tiles.
  - This is a mock-up the main chat asked for, so that he can see it and decide.
  - The main chat's brief says that on 8 Oct at 00:53 he told the art chat to carry on down its list. His words for that are not in this branch's records, so they are not quoted here.
- **Not in this mock-up**, though they are in the same words:
  - floors and walls that vary in themselves;
  - "more alive" in the sense of things that move.

## What the pictures show

`previews/decorations_mockup.png`:

1. A real room as it is now: run seed 6 (`__dbg.run('warrior', 6)`), Dungeon 2, room 0. It is shown at the size it has on his phone (1x of a 3x screen).
2. The same room with the decorations:
   - a gargoyle head on the left back wall;
   - a tapestry (oxblood, a faded sun) on the right back wall;
   - a flagstone gone from the floor;
   - a soft shadow at the foot of every barrel, urn and brazier.
3. Close, at 3x: the gargoyle head and the tapestry.
4. Close, at 3x: the flagstone gone, the dark under it, the one beside it cracked, and bits of stone about.
5. Close, at 2x: barrels and an urn, as they are now and with their shadows.
6. Another real room, close at 2x: run seed 290, Dungeon 2, room 11, a treasure vault. A gargoyle hangs on the lit wall and throws its shadow on it. The hero stands in front of a tapestry, which is drawn behind him.

`previews/decorations_fire_darker.png`:

- The hero just in front of a brazier, close at 3x, as now and a step darker. Time was stopped between the two shots, so the pose and the flames are the same in both.
- The same room at phone size.

## What is in the code, and the switch

Every piece is marked MOCK-UP in the code.

- **`src/game/decor.ts`** (new):
  - **THE SWITCH**, `export const DECOR = { on: false, near: false }`. `near` counts only with `on`.
  - `layDecor`: where the map-maker puts the decorations.
  - `footShadow`: the shadow at the foot of a standing thing. It is null for everything while the switch is off.
  - `nearSide`: how much darker a figure in front of a fire is drawn. It is 0 unless both `on` and `near` are set.
- **`src/game/dungeon.ts`**: a Step 7 at the end of `generateFloor`, after the doors: `if (DECOR.on) floor.decor = layDecor(floor, new RNG((mixSeed(d, seed) ^ 0x0dec0a7e) >>> 0))`. The decorations use dice of their own, so a dungeon with them is the same dungeon, apart from the decorations.
- **`src/game/types.ts`**: `DecorKind`, `DecorSpot`, and `Floor.decor?`, which is absent while the switch is off.
- **`src/art/decor.ts`** (new): the pictures, all painted in code at the heroes' grain (`GRAIN` 2), lit from the upper left.
  - **`makeTapestry`**:
    - Two cloths, each about 25 game pixels wide and 20 tall over two blocks of wall: oxblood with a faded sun, and moss green with a faded tree.
    - Moth holes, bites out of the edges, a torn corner, a ragged hem with fringe, broad folds.
    - Hung from an iron rod, flat in the wall's plane.
    - Cut into strips like a door's lintel (`Flat.strips`). On the shade wall it is one step darker.
  - **`makeGargoyle`**:
    - An original grotesque: brow bosses, deep eyes, a snout, a jaw with four fangs, and small horns or pointed ears (2 kinds).
    - Built as a lit solid by `src/art/skin.ts`, like the heroes, in the stone of the theme greyed a little.
    - Built separately for each of the two back walls, not mirrored: on a wall facing game +x it faces its own +x; on a wall facing +y it faces its own -y.
    - On the lit wall it throws its shadow on the wall. On the shade wall the light is behind the wall, so it throws none.
  - **`makeCrack`** (a flagstone cracked across, one piece sunk) and **`makeHole`** (a flagstone gone, the dark under it, its neighbour cracked): 3 of each, with loose bits.
  - **`makeDecorArt`**: keeps each picture once it is painted, and paints nothing until a picture is asked for.
- **`src/render/render.ts`**, all of it only with `DECOR.on`, and `near` where it says:
  - `standDecor` stands the tapestries (strips in the wall's plane, at their blocks' depth) and the gargoyles (half a tile out from their block).
  - `flat()` lays the broken flagstones first. It lays the foot shadows before the figures' own: a pillar, a chest, a brazier, and a barrel or urn that is not broken.
  - `nearDark` darkens a monster or the hero standing just in front of a fire, by up to 40% toward near-black. The hero's scarf and feather are darkened with him (`Stand.tailsDark`).
- **`src/engine/tails.ts`**: `Tails.draw` can take a flat colour to lay over the tails. Only the mock-up passes one.
- **`src/main.ts`**: `art.decor = makeDecorArt()`, and `__dbg.decor` (the switch, for dev pages and playtests).
- **`src/art/gates.ts`** (`Flat`) and **`src/art/props.ts`** (`lump`) are now exported. What they do is unchanged.
- **`tests/decor.test.ts`** (new, 7 tests):
  - the switch is off, and with it off nothing changes;
  - laying decorations takes no dice of the map-maker;
  - the wall rules and the floor rules below;
  - a couple per room;
  - the foot shadows and the darkening;
  - the pictures.
- **`tools/scenarios/decor.mjs`** (new): the stills.
- **`docs/mockups/decorations/close_ups.py`**: the close-ups for the sheets.

**Where a decoration may go** (`layDecor`; the tests check every rule):

- **Wall pieces:**
  - Only on a room's two back walls, on blocks whose face to the room is painted and not left out, and never at the room's corners.
  - The wall must run on unbroken for two blocks past each end of the piece, with no stone beside a door among those blocks.
  - No door tile within 2 tiles, and no floor of a doorway's surroundings within 2.
  - Level floor in front of it, with nothing standing right in front of it.
  - No brazier within a tile of the floor in front of it, and no pillar within 3.
- **Floor pieces:**
  - Whole flagstones of the room's own level floor, clear of the walls and of everything that stands or lies there.
  - At least 3 tiles from where the hero comes in and from where the boss waits.
- **How many:**
  - At most 2 on a room's walls and 2 on its floor, 3 in all.
  - At least 3 tiles apart.
  - Some rooms have none.

## How to see it

```
node node_modules/typescript/bin/tsc --noEmit -p tsconfig.json
node tools/build_to.mjs dist/decor.html

# Real rooms, before and after. The scenario turns the switch on before the dungeon is laid, photographs
# each room with it off (the room as it is in the game) and on, and puts the switch back.
SEED=6 DEPTH=2 ROOMS=0 AT="0:5,5.5,0.7,0.7" node tools/playtest.mjs --file dist/decor.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/decor.mjs --out shots/decor/final/a
SEED=6 DEPTH=2 ROOMS=0 AT="0:3.5,3.2,-0.2,0.9" node tools/playtest.mjs --file dist/decor.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/decor.mjs --out shots/decor/final/b
SEED=290 DEPTH=2 ROOMS=11 AT="11:6,1.35,0.6,0.8" node tools/playtest.mjs --file dist/decor.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/decor.mjs --out shots/decor/final/c
# The hero in front of the room's furthest-up brazier, without `near` and with it
SEED=6 DEPTH=2 FIRE=0 node tools/playtest.mjs --file dist/decor.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/decor.mjs --out shots/decor/final/d

# The close-ups, then the two sheets
python3 docs/mockups/decorations/close_ups.py shots/decor/final shots/decor/final/comp
python3 tools/sheet_shots.py previews/decorations_mockup.png "Decorations: a mock-up, not in the game" "A real room of Dungeon 2, as it is now and with the decorations,|shown at the size they are on your phone." \
  "shots/decor/final/a_room0_before.png;1. The room as it is now.;880,30,2146,1005;1" \
  "shots/decor/final/a_room0_after.png;2. The same room with the decorations: a tapestry and a gargoyle head on the back walls, a broken flagstone by the hero, a soft shadow at the foot of every barrel, urn and fire.;880,30,2146,1005;1" \
  "shots/decor/final/comp/close_wall.png;3. Close: the gargoyle head, built in 3D like the heroes, and the moth-eaten tapestry with its faded sun." \
  "shots/decor/final/comp/close_floor.png;4. Close: a flagstone gone, the dark under it, the one beside it cracked, bits of stone about." \
  "shots/decor/final/comp/close_shadows.png;5. Close: barrels and an urn, as now and with their shadows." \
  "shots/decor/final/comp/close_room11.png;6. Another real room, a treasure vault: here the gargoyle is on the lit wall and throws its shadow on it. The hero stands in front of the tapestry."
python3 tools/sheet_shots.py previews/decorations_fire_darker.png "A separate idea: darker in front of a fire" "The hero stands just in front of a fire, so we see the side of him|the fire does not light. A mock-up, not in the game." \
  "shots/decor/final/comp/close_fire.png;Close: the hero in front of a fire, as now and a step darker." \
  "shots/decor/final/d_fire0_near.png;The room with it (and the decorations), at its size on your phone. Monsters would darken the same way.;880,340,2146,1005;1"
```

**Options:**

- Without `ROOMS`, the scenario lists every room of the dungeon, with what stands in it and its decorations.
  - A wall piece is written like `gargoyle1@121,4y`: kind, variant, its block, and the wall it hangs on. `x` is the wall at y = room.y - 1, the back wall to the right on the screen. `y` is the wall at x = room.x - 1, the back wall to the left.
  - A floor piece is written like `hole0@204,5`: its flagstone, counted 1.6 to a tile.
- Other options: `ONLY=after`, `NEAR=1`, `AHEAD=` (how far in front of the fire), `CLS=`.
- `AT` gives where the hero stands, from the room's corner in tiles, and the way he faces.

**In a dev page** (`dist/decor.html`), in the console:

- Set `__dbg.decor.on = true` BEFORE going down into a dungeon. The map-maker lays the decorations when it makes the dungeon, so if you turn the switch on in a dungeon that already exists, only the shadows show.
- Set `__dbg.decor.near = true` as well for the darkening in front of fires.

## What I looked at

- **Reading:**
  - `CLAUDE.md`, `docs/handoff.md`, and his words in `docs/NEXT_VERSION.md` and `docs/DESIGN_NOTES.md`.
  - The research report, `/home/claude/reports/3D art in 2D isometric games.md`, and its notes on this game's art, `/home/claude/research_notes/3D art in 2D isometric games/wordsmith_current_art_pipeline.md`. Both are outside the repository.
  - In the code: `src/art/gates.ts` (the lintel's strips, `standDoors`), `src/art/skin.ts` (the heroes' solids), `src/render/walls.ts` (which walls are drawn), `src/art/ground.ts` and `src/art/props.ts`.
- **Finding rooms:** the rooms on the sheets were found by scanning the dungeons of 300 run seeds at 3 depths, for rooms that show all of it.
- **Looking:** every still was looked at by eye, at phone size and close, and worked on until each thing read at phone size:
  - the gargoyle's eyes were cleared from behind its snout;
  - the tapestry was widened to two blocks with broad folds and a bolder design;
  - the cracks were made wider and brighter at the lip;
  - the foot shadows were made bigger and darker.
- **What the tests counted** (switch on, in the test only):
  - 72 dungeons were the same with the decorations as without; 1872 decorations were laid in them.
  - In 56 dungeons: 239 tapestries, 329 gargoyles, 508 cracked flagstones and 389 gone.
  - 897 of 1062 rooms (84%) had at least one.
- **Checks with the switch off:**
  - `tsc --noEmit` is clean.
  - The whole unit suite passes, 620 of 620 (613 before, plus these 7).
  - `tools/scenarios/dungeon.mjs` on `dist/decor.html` gives "dungeon: ok" and finishes clean (frames: median 16.4 ms, worst 42.3 ms in this run).
- **Cost of painting**, measured in node on this machine:
  - the 4 gargoyle pictures take 66 to 200 ms;
  - all 12 pictures take 89 to 330 ms, slowest the first time.
  - Not measured on a phone.
- **Not checked:** a real phone.

## What the main chat would need to do to build it for real

1. **His yes first.** The four things on the first sheet are one yes. The darkening in front of fires is a separate one; the art chat recommends leaving it out for now.
2. **Turn it on.**
   - Set `DECOR.on = true`, or take the switch away and always lay decorations. Keep Step 7 on its own dice, so that no dungeon changes otherwise.
   - Set `DECOR.near` only on its own yes.
   - Turn round the first test in `tests/decor.test.ts`, which holds that the switch is off. Keep the others.
3. **Paint the pictures when a dungeon is entered, or at start-up, not the first time each is drawn.**
   - In the mock-up, `makeDecorArt` paints each picture on first sight. That can cost a frame on the phone (see the cost of painting above).
   - So ask for every kind once, ahead of time: `art.decor.gargoyle(true/false, 0/1)`, `art.decor.tapestry(true/false, 0/1)`, `art.decor.slab('crack'/'hole', 0..2)`.
4. **Gone flagstones are only a picture:** a hero or a monster walks over one as over floor. If he wants them to matter (to trip on, to go round), that is a change to the game, and it wants his word.
5. **The town's hall.** On 5 Oct he was told the hall would have the same as the dungeon. This mock-up does the dungeon only: `layDecor` reads a dungeon's rooms, and the hall would need its own places.
6. **Release work:**
   - Take the MOCK-UP labels out of the comments.
   - Add the files to the code map in `docs/DESIGN_NOTES.md`.
   - Test as section 8 says: the whole suite, the full regression on a frozen copy, and the published page's playtests.

## Not sure of

- The cracked flagstone is quiet at phone size. The gone one reads better.
- The tapestry's faded design (the sun, the tree) is small at phone size. It reads as old patterned cloth, and the design shows only close.
- At phone size, the gargoyle with horns and the one with ears look much alike.
- Something in 84% of rooms may be more, or less, than he wants. The odds are two lists in `layDecor`, easy to change.

## Sent to the owner (8 Oct 2026, 02:55, by the art chat)

previews/decorations_mockup.png (from this branch's worktree), with these words: "1 of 4: decorations, a mock-up, not in the game. A real room as it is now, then with them: a moth-eaten tapestry, a gargoyle head built like the heroes, a missing flagstone, and soft shadows under barrels, urns and fires. Is this what you meant by tapestries, gargoyle heads and broken floor tiles?" **HIS ANSWER: NOT YET IN.** The sheet of the darker figure in front of a fire (`previews/decorations_fire_darker.png`) was NOT sent: he did not ask for it. Before these went, at 00:53 on 8 Oct he wrote "If I’m not around to test phone speed continue on.  Keep going down the list", read as: leave the phone test until he is around and carry on down the art chat's list (decorations, the skeleton on the heroes' bones, true left-facing heroes, the two films of weight). He was told so at 00:54. Nothing of this is in the game; the main chat builds whatever he says yes to.
