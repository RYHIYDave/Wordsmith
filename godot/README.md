# Wordsmith in Godot (branch `godot/port`)

The game being rebuilt in Godot 4.7 as a real app, alongside the TypeScript game on `main`. Nothing here touches
`main` or the published game: this branch is its own, as CLAUDE.md asks of every chat but the main one.

Asked for 14 Nov 2026, the owner's words: “id like to try and make wordsmith with godot.  can you work on porting some
things in parallel with my regular build?” and “we dont need to keep anything under 30MB” (read as: files no longer go
through chat, so the art and sounds go into the project whole).

## What is in it (the first slice)

- **Floor 1 of the Crypt**, laid out by the game's own map-maker (`game/level.ts makeDungeon`, seed 1) and painted in
  its own stone: the floor's flagstones, the wall faces (every wall standing, as on floors 1 to 5), the shadow of a wall
  on the floor at its foot, and the walls between the eye and the hero fading round him.
- **The Warrior**, from the released game's baked pictures, in all eight painted facings: standing, running, his two
  swings. He moves at the game's speed (4.6 tiles a second) and slides along walls as the game has him do.
- **Sound**: his steps on stone, his swing, and floor 1's background (its loop and its drips), from `assets/sound`.
- An approximation of the dungeon's dark round the edges of the screen (not yet the game's own lighting).

Keys: WASD or the arrows to walk; Space or the left mouse button to swing, Shift or the right button for the second
swing. A controller: the left stick, A and B.

## Not in it yet

Monsters (their baked pictures are in `assets/monsters` and `assets/colossus`, held back from Godot with `.gdignore`
until they are wired in), the floor's own dressing (render/pieces.ts, its looks), raised and sunken floor, the tiles cut
corner to corner (drawn whole for now), doors, props, the rest of the heroes, combat, words, the town, menus, music (its
12 tracks are `.mp4`, which Godot does not play: they need making into `.ogg`).

## How it is made

| Part | From |
| --- | --- |
| `assets/heroes`, `assets/monsters`, `assets/colossus`, `assets/townsfolk` | the released game's baked folders on `gh-pages` (marks in `assets/MARKS.txt`) |
| `assets/sound` | `assets/sound` on `main` |
| `assets/floor1` | `npx tsx tools/godot_export.ts 1` (from the repository's root, with `npm install` done): the game's own painter and map-maker |
| `scripts/` | GDScript, each file saying which TypeScript it follows |

Checking it without hands on the keys: `godot --path godot -- --shots=<folder>` stands the hero, walks him four ways,
swings, saves a picture of each and quits.
