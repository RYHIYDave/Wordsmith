# The stairs cave in behind him (pictures first)

His words, 26 Nov 2026, 22:06: “id like the stairs to cave in when you go down into the first level, then change the wordstone quest
to have it say "push deeper into the prison"”. Asked, his picks: “First time only (Recommended)” (after that floor 1 begins with
the rubble already there) and, asked whether the town's stairs should still take him down to floor 1, “Yes, still lead down
(Recommended)” (so a hero who falls there before finding the stone can always go back for it).

Shown its first film, his word: “Eh I feel like you can do better.” So, the second: a harder fall, real masonry (three great blocks of
the stairwell's roof first, then a cascade of broken cut stone and rough rubble), the heap darker the deeper it lies in the stairwell
with a black gap left under the crown, a mound of it spilling out over the floor (each piece standing in the depth's order with the
arch's piers and with him), a burst of dust along the floor and up out of the arch, the stairwell's daylight put out on the floor
too, and he turns to look.

## What it is (branch `game/stairs-cave-in`, from `main` b8427ed2)

- `godot/scripts/cave_in.gd`: floor 1's stairwell up, in its arch behind him where he comes in. The first time, as the floor's
  name goes (2 s after the curtain): grit trickling from the arch and the screen shaking (`f1_stone`); the roof of the stairwell
  gives way (`ledge_crumble`, `slam`, a hard kick of the screen), the stones falling into the arch from its top, the lowest first,
  a jumble filling it nearly to the crown, a few spilling forward onto the floor (`step_stone` as some land, `stone_death` as it
  settles); the daylight from the town going out behind them; a cloud of dust rolling out into the room and clearing (4.2 s).
  Every time after: the heap and the dark behind it, no film. Drawn in the art's own grain (two picture pixels to a game pixel),
  each stone a little picture of its own in the stairwell's greens and greys, lit from the top left, its edge dark.
- `godot/scripts/main.gd`: `CAVE_IN` (off until his yes; `--cavein=1` on, `--cavein=0` off; not in the checks' runs unless asked);
  `_cave_in` lays it (in `flats`, under the arch's piers and its frame; its dust over everything), shuts the gate's three tiles to
  him and his walk up through them; "The stairs cave in behind you." as the roof gives way; `caved_below()`: below ground, the
  stairs fallen, no waypoint up reached yet (way_depth under 2), the film settled.
- `godot/scripts/guide.gd`: the stone quest's line, his words: on floor 1 before the stone is found, "Push deeper into the prison /
  Find the fallen wordsmith and the stone."; carrying the stone, "Push deeper into the prison / You carry the MASTER RUNE-STONE.
  The stairs up are gone."; once floor 2's waypoint is reached, "You carry the MASTER RUNE-STONE / The waypoint takes you up to the
  wordsmith in town." (shown again for 6 s on each floor he comes into while he carries it). In town, as before.
- `godot/scripts/loot.gd` `stairs_caved`, kept by the save (`save.gd`, "caved").

## Checked

`--only=cavein --cavein=1 --shots=<dir>` (in Godot 4.7.2, the second): 9 of 9: the stairs marked fallen; the line said; the save keeps it; the
banner his words; the gate's doorway shut to him; set in it, still on floor 1; the stone taken, the banner his words with the stone;
up by the waypoint; down the town's stairs again, no second cave-in. And its pictures at its moments.

## Pictures

`stairs_cave_in.mp4` (the second): Godot's own recording (`--only=cavein_film --cavein=1 --shots=<dir>`, `--write-movie
<file.avi> --fixed-fps 30`), with its sound, 11.5 s: down the town's stairs, the floor's name, the cave-in, its line and the banner.
`stairs_before_after.png`: the stairwell as he comes in, and after it has fallen.
