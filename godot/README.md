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
- **Floor 1's monsters** (added at his "Yes, monsters next", 14 Nov 2026): the 66 the game itself spawns on this floor
  (28 skeletons, 23 bats, 11 bone archers, a marksman, two troll guardians in the lairs, the Warden in his hall), each
  where the game puts it, with its life, damage (the first floor's halving in it) and speed, in its baked pictures with
  their named lists (`assets/monsters/lists.json`). They sleep until they see him within 9 tiles, wake their pack, come
  down the flow field, wind up and strike or shoot (arrows fly and hit), recover, flash when struck, show their life for
  4 s, fall and lie 30 s. Their voices, blows and deaths sound.
- **The Warrior's Strike** as he starts: the blow lands a third of a second in, on the one monster in front within 1.7
  tiles, 8 to 12.5; every 0.92 s, the second swing of the combo if pressed again soon enough, a step forward each. His
  life (102, 0.6 a second back) over his head in a fight; fallen, he is back where he came in.

Keys: WASD or the arrows to walk; Space or the left mouse button to swing (the mouse aims; from the keys he aims at the
nearest monster close by). A controller: the left stick, A.

## Not in it yet

The monsters' own moves (the guardian's slam and charge, the archer's rain, the marksman's pierce, the champion's rally,
the Warden's summons: they use their one attack for now), the Warrior's other moves (Whirl from level 2, Leap), words,
loot, levels, potions, the floor's own dressing (render/pieces.ts, its looks), raised and sunken floor, the tiles cut
corner to corner (drawn whole for now), doors, props, the rest of the heroes, the town, menus, music (its 12 tracks are
`.mp4`, which Godot does not play: they need making into `.ogg`). The Colossus and townsfolk pictures are in, held back
from Godot with `.gdignore` until they are wired in.

## How it is made

| Part | From |
| --- | --- |
| `assets/heroes`, `assets/monsters`, `assets/colossus`, `assets/townsfolk` | the released game's baked folders on `gh-pages` (marks in `assets/MARKS.txt`) |
| `assets/sound` | `assets/sound` on `main` |
| `assets/floor1` | `npx tsx tools/godot_export.ts 1` (from the repository's root, with `npm install` done): the game's own painter, a new Warrior's game into its first dungeon (its layout and its monsters) |
| `assets/monsters/*.json`, `*-N.png` | the packs unpacked: `node tools/godot_unpack_monsters.mjs` |
| `assets/monsters/lists.json` | each figure's lists named, from the game's art: `npx tsx tools/godot_monster_lists.ts` |
| `scripts/` | GDScript, each file saying which TypeScript it follows |

Checking it without hands on the keys: `godot --path godot -- --shots=<folder>` pictures the hero where he comes in, sets
him down near a pack of skeletons swinging at what comes (pictures as they wake, close in and fall), then near the
archers and in sight of the Warden, says how the fight went, and quits.
