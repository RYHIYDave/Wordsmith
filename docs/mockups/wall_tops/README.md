# Wall tops: no black holes where a thick wall's top is

The work queue's item "Paint real wall tops wherever a thick wall's top is left black, on every floor (floor 2 first)". His
words, 28 Nov 2026, to the main chat: “So every floor in this game has an empty hole in it?”, then “I don't think I agree that
it being black is an okay fix.  I'd like an actual wall there”. Pulled at his word, 27 Nov 2026 (asked to start a new task:
“Yes, the next one”).

## The survey

- **Floor 2 (the prison).** Its walls stand full height with their tops painted on (a slate roof on the buildings' faces, a
  wall-walk and merlons on the outer walls). A wall more than a tile thick, such as the cell blocks between the courtyards or
  the outer wall's thick runs, gets its top drawn only one tile deep, so the rest of the block's top is left empty. That reads
  as black holes now, and as holes full of stars under the night sky. 1,204 of its 1,990 wall tiles have no picture.
- **The other floors** (other_floors_survey.png: floors 1, 3, 5, 7, 11 and 14). The dungeon floors (1, 3, 5, 14, 17) keep the
  art rulebook's dark: their walls fade into the dark at the top ("Walls: 40 game pixels tall, the top 12 fading into the
  dark"), and no wall there has a top drawn, so the black above them is the dungeon's dark and not a hole. The open-air
  floors (the Ledge Road, 7; the Gate Ward, 11) are recorded from the game, which draws their tops (rock, roofs). So floor 2
  is the floor with holes, and the work is there. `tools/wall_tops.py` runs on any first-kind look if another floor needs it.

## What it is (floor 2)

`tools/wall_tops.py floor2` writes `godot/assets/looks/floor2_tops.png` and `floor2_tops.json`. Each wall tile with no
picture gets its top, in the stone and at the height of the wall it belongs to (the nearest wall tile with a face):
- **Slate** on the buildings: the look's own slate tones, laid in courses that run on from tile to tile, a step lighter than
  the roof slopes as tops are lit, with moss.
- **Wall-walk** on the outer walls: their own flagstones with dotted joints.
- **Coping** on the low walls.
- **Edges.** Where a wall ends on its far side, the edge catches the light.

The look shows the ground behind a thick block as if the block were cut away, so a top laid whole would hide that ground.
Tops are laid only where the look shows nothing on the screen (the hairline seams between floor tiles excepted). They fill
the holes and never cover the courtyards.

They stand and fade among the walls as walls do: faint near the hero when he is behind them. A roof is seen once any wall of
its block beside the ground within 14 tiles has been seen (fog). With the keep on (F2_KEEP), the tops inside it stay under its
roof and show only while it is clear.

Behind look.gd's `WALL_TOPS` (OFF; `--walltops=1` for a run). Checked in the game on the autorun walk through courtyards 1, 3
and 10, alone and with the night sky, with no script errors.

Pictures: floor2_wall_tops.png (now / with the tops, and with the night sky), other_floors_survey.png.

## Every wall of floors 1 to 5, checked, and the walls mended

His question on the survey: “You’re telling me that there are no wall sections missing on any of the other first 5 floors
except when your character walk behind them and they fade as designed?  If I boot up the game and play the first level, every
single wall will be in place?” The survey had looked at one view a floor, and that was not enough. So every wall was checked:
`--only=walls --floor=N` (godot/scripts/check_walls.gd) pictures a whole floor a screen at a time, every tile seen, without the
dark, and `tools/wall_check.py` looks just above the foot of every wall face in those pictures. Floor 2 had none missing.
Floors 1, 3, 4 and 5 had 84 wall faces missing, all at room corners where a wall steps diagonally down the screen, where a step
was left without its face and the dark showed through as a slit (missing_wall_pieces.png; wallcheck_before.json).

His answer: “Fix them in a way that keeps the wall flowing correcting.  There are already issues with the straight east-west
walls where the square blocks are not cut to make triangles so the wall is flat.  Make it look correct.” `tools/wall_mend.py`
(per floor: `<place>_mend.json`, laid over the look by look.gd's MEND, OFF; `--mend=1`) does two things:
- **Near slanting walls cut flat.** A wall running straight across the screen on a room's near side was drawn as square blocks
  seen corner on, a row of points along its foot. Each piece is now drawn with the floor's own far slanting picture: one flat
  face, its foot on the line through the blocks' side corners, as the far walls stand. That is 26 on floor 1, 22 on floor 3,
  28 on floor 4 and 21 on floor 5.
- **Step faces laid in.** Each missing face is the floor's own straight wall face of that side, at its step, so the steps'
  faces run on as one band: 11 on floor 1, 14 on floor 3, 29 on floor 4 and 30 on floor 5.
Checked again with the mend on: no gaps on floors 1, 3 and 4. On floor 5 one place is still dark above its foot. It is the
faded top of a near wall standing in front of it, which by the art rules fades into the dark, so it is not a gap.
`--only=walls --floor=N --at=x,y` takes one close picture at the game's size. Pictures: walls_mended.png.
