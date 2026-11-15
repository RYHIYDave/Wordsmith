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

- **The Warrior's other two attacks** (at his pick, "Warrior's other moves", 14 Nov 2026; defs.ts SKILLS, talents.ts):
  the WHIRLWIND, the right button held, and his swipe, the LUNGE, Space.
  - The WHIRLWIND: he spins for as long as it is held, 2.4 s at most, cutting all round him every 0.3 s (x0.55, 2 tiles),
    walking at 90% and through enemies; ready again after 3.5 s, less after a short spin (defs.ts SKILLS.whirlwind, game.ts
    updateChannel). At first this was the game's starting WHIRL, one overhead slam all round him (x1.4, every 3 s), as the
    game shows it; told “It doesn’t do the whirl”, and that in the game the spin is the greatsword's talent (gswhirlwind:
    "Whirl becomes WHIRLWIND"), his pick, 14 Nov 2026: "Give him the Whirlwind spin".
  - The LUNGE: flung up to 6 tiles toward the pointer, not to be harmed in the air, through monsters and the Lockdown's
    bars, a blow 1.6 round where he lands, ready again after 4 s.
  In the game Whirl opens at level 2 and the Lunge at 5: here all three are open, to try them.
- **Loot, levels and the first word** (at his pick, "Words and loot", 14 Nov 2026; `scripts/loot.gd`, `inventory.gd`):
  what falls as the game's dropLoot has it (gold, life orbs, gear: a leader's, a guardian's and the Warden's more and
  better), every piece one the game itself rolled (`tools/godot_loot.ts`: its own rollGear, its pictures, its names and
  properties); gold and orbs flying to him, gear taken by walking over it, worn at once where a slot is empty; his
  stats from his gear as the game's derive makes them; three flasks (Q), one back every 18 kills; experience and levels
  by the game's curve, each +12 life and +5 to Str, Dex or Int, his pick. THE GEAR SCREEN (I or Tab): his ten slots, the
  bag of 24, his stats, a piece's card, and the Power word put in Strike's front slot (+33% and bigger, half splashing)
  or behind it from level 4, or burned into a worn piece (the game's own outcome for that piece). In the game no word
  falls on floor 1: the fallen wordsmith's Master Rune-stone is carried to the wordsmith in town, who gives Power
  (the town, below).
- **The town, where a new game begins** (at his pick, "The town", 14 Nov 2026; `scripts/town.gd`, `tools/godot_town.ts`:
  game/level.ts makeTown and Game.enterTown, painted by the game's own art/town.ts, ring3.ts, props.ts, town_ways.ts).
  The walled square in the vault's stone with its braziers, pillars, barrels and urn; the smithy and the ARMOURER at his
  forge; the bazaar and the MYSTIC at her table; the WORDSMITH in his ring of six standing stones; the STRANGER in the
  dark corner; the Lexicon, the stash, the stairs down and the shaft's head. Its people from the released game's baked
  pictures, each at his work and what he does in turn (the anvil, the crystal, the rune, the coin heard as they do it),
  turned to the hero when he comes up to them. THE FIRST QUEST as the game has it: E by the wordsmith, and he asks for
  the Master Rune-stone; the stairs down to floor 1 (in at its gate, its stairs up drawn in the arch); the fallen
  wordsmith searched for the stone; floor 1's gate back up; E by the wordsmith, and the stone is laid in his slab and the
  ring lights (its runes catching, the light running round the circle stone by stone, all flaring, 4.7 s), and he gives
  the word POWER, the gear screen opening on it. The guide's prompts in the game's own words (MOVE, the WORDSMITH, the
  STAIRS, Someone fell here, You carry the stone, Bring it, Put POWER on STRIKE, then what it does). THE VENDORS: E by
  the armourer or the mystic, their shelves as the game rolls them on his first day (Game.rollShop), each piece at its
  price (itemValue), bought into the bag; a piece in the bag sold for a quarter of its worth. Coming into town fills his
  life and flasks; floor 1 is laid again, its monsters fresh, each time it is come into.
- **The new looks** (his words, 14 Nov 2026: “And what you’re building is all old looks for the town and level 1”): floor 1
  as THE KING'S TOMB (the roots breaking in: daylight shafts, tombs, torches, the stairs up in its stone) and the town as
  THE CASTLE'S HALL (its roof, sun through the windows, ivy, pots, the owl, the barred gate), as the game puts them on
  as it starts (game/floor_looks.ts). Recorded from the game's own renderer (`scripts/look.gd` lays them out), the dark
  and its lights included. My first versions of both were the old looks: the export tools had not put the game's
  startup switches on.
- **A desktop icon**, "Wordsmith (Godot)", opens this project to play (it needs the `wordsmith` folder on this branch).

Keys: WASD or the arrows to walk; the left button to Strike, the right to Whirl, Space to Lunge (the mouse aims; from
the keys he aims at the nearest monster close by); E to use (talk, trade, give); Q a flask; I or Tab the gear screen.
A controller: the left stick, RT, LT, A, B, X.

- **The monsters' own moves** (at his pick, "Monsters' own moves", 14 Nov 2026; game/defs.ts MONSTER_MOVES with the
  first floor's MORE ACTION, `scripts/monster_moves.gd`): each makes the biggest of its moves that is ready and in reach,
  as game.ts pickMove does. The bone archer's ARROW RAIN (a gold ring where he stood, struck 1.5 s later); the
  marksman's GREAT SHOT (his line of aim run out and following him till 0.4 s before the loose, then an arrow through
  whoever it meets); the red troll's SWING, SLAM (the red circle) and CHARGE (his line marked, then run at 10 tiles a
  second, the hero knocked aside, only where he has a clear run past him); the Warden's SWING, his fan of seven BOLTS,
  the LOCKDOWN (the bars' shadows across his hall, then the bars crashing down in rows, a cell safe, standing 1.5 s as a
  cage the hero cannot walk through) and the DEAD HE CALLS (four skeletons crawling up out of the floor, no more while six
  stand). The champion's cleave; his rallying cry is heard only by minions carrying his words, and on floor 1 none do.

## Not in it yet

The game's own pictures of the moves' marks (the rings, lines and bars here are plain stand-ins drawn on the floor, the
bars under the figures), the Warden's spoken lines as he makes them, the moves' level locks, talents; in the town: its
gate in the back wall (barred on a new game, drawn as wall here), the stone floating from him to the slab, the letters
swirling round the ring and its column of light, the wordsmith's words for sale, the stranger's gamble, the stash, the
Lexicon, buying back, the town's own lighting and music; words other than Power, uniques, magic find, the game's own
lettering and frames for the screens (these use Godot's plain letters), chests, barrels and urns, the floor's own
dressing (render/pieces.ts, its looks), raised and sunken floor, the tiles cut corner to corner (drawn whole for now),
doors, props, the rest of the heroes, menus, music (its 12 tracks are `.mp4`, which Godot does not play: they need
making into `.ogg`). The Colossus pictures are in, held back from Godot with `.gdignore` until they are wired in.

## How it is made

| Part | From |
| --- | --- |
| `assets/heroes`, `assets/monsters`, `assets/colossus`, `assets/townsfolk` | the released game's baked folders on `gh-pages` (marks in `assets/MARKS.txt`) |
| `assets/sound` | `assets/sound` on `main` |
| `assets/floor1` | `npx tsx tools/godot_export.ts 1` (from the repository's root, with `npm install` done): the game's own painter, a new Warrior's game into its first dungeon (its layout and its monsters) |
| `assets/monsters/*.json`, `*-N.png` | the packs unpacked: `node tools/godot_unpack_monsters.mjs` |
| `assets/monsters/lists.json` | each figure's lists named, from the game's art: `npx tsx tools/godot_monster_lists.ts` |
| `assets/loot` | the game's own gear rolled on floor 1, the vendors' shelves, prices, its pictures, the fallen wordsmith: `npx tsx tools/godot_loot.ts 1` |
| `assets/town` | the town a new game begins in, its pictures, floor 1's gate up: `npx tsx tools/godot_town.ts 1` |
| `assets/looks` | floor 1 as THE KING'S TOMB and the town as THE CASTLE'S HALL, recorded from the game's own renderer and painters with its startup switches on (every picture, where, how deep, its light): `npx tsx tools/godot_looks.ts town` and `... floor1` (all the tools put the game's startup switches on first: tools/godot_switches.ts) |
| `scripts/` | GDScript, each file saying which TypeScript it follows |

Checking it without hands on the keys: `godot --path godot -- --shots=<folder>` sets the hero down, unharmed, in sight
of each monster that has moves and pictures each move the moment it shows (the troll's charge line, run and slam; the
rain's ring and its arrows; the marksman's aim and great arrow; the Warden's bolts, the Lockdown's shadows and bars, the
dead he calls), says which moves were made, and quits. (Neither lair on this floor leaves the troll a clear run, so for
the charge he is set down in the floor's biggest hall.)
