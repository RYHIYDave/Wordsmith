# Floor 2's main building: the keep round the waypoint room

His idea, 27 Nov 2026, asked whether to start a new task after the cliff: “the little room you come out of where the waypoint is
at, thats the prison.  so maybe when you walk out of that room you should see a huge wall behind you as the wall of the prisons
main building”.

On the first try (floor2_main_building.png: a cell block of barred windows under a hipped slate roof) he asked for changes; his
picks: “Different top, Less like an apartment block”. On the second (floor2_keep_v2.png): “Good, ship it off (Recommended)”. So
it ships SWITCHED OFF, behind look.gd's `F2_KEEP` (`--f2keep=1` for a run), for him to switch on.

## What it is

`tools/f2_keep.py` builds it from the look's own pictures (godot/assets/looks/floor2.png):

- **The block.** Tiles x 1 to 13, y 68 to 75 of floor 2: the start room, the passage out of it and the walls round them. Its two
  faces toward the eye (south, y 75; east, x 13) run 276 picture pixels higher than the prison's outer walls.
- **The faces.** At the foot of each face is the look's own face for that tile, so the room keeps its two rows of windows and
  their glow, or the outer wall. Above it is plain ashlar laid in the outer walls' own courses (12 pixels, a lit top row, a dark
  joint, the same tones). A string course runs where it meets the foot and another under the battlements. Arrow slits stand
  here and there, a few with a light in them, and quoins run up the corners. At the top are the outer wall's own top and
  merlon.
- **The top.** A flat roof of the courtyards' flagstones, battlements round it (the outer walls' own merlons on its far
  edges too).
- **The gate tower.** Tiles x 11 to 13, y 73 to 75, 144 pixels higher again, with its own battlements and roof. Over the
  passage's door, the face begins above the gatehouse's gable, which stands in front of it as the look draws it.
- **Places 9.** From outside it stands whole. Once he steps inside (his tile in the block), the whole of it fades clear in a
  third of a second and the room is as it was. It comes back as he leaves.
- **Its dark.** While it stands whole, the lights inside the building are hidden: the braziers' and the waypoint's glows, and
  the holes they cut in the dark. A patch over the dark's own (with the dark's own material, so the hero's light cuts it)
  lays the dark over the building as over the rest. With the night sky on (`F2_SKY`) it covers the building's outline too
  (floor2_keep_cover.png).

Files: godot/assets/looks/floor2_keep.png, floor2_keep.json, floor2_keep_cover.png; look.gd `_make_keep`, `_step_keep`,
`_keep_veil`, `_cut_hole`; main.gd `--f2keep`.

Looked at in the game on the autorun walk out of the room into the courtyard (`WS_AUTORUN_WALK="2;8,72;14.6,72;21,72;24,77"
xvfb-run -a godot --path godot --rendering-driver opengl3 -- --only=autorun --cls=warrior --f2sky=1 --f2keep=1 --shots=<dir>`),
with the night sky on and off, with no script errors. The unlit picture of the whole: `python3 tools/f2_compose.py out.png
-1300 100 -750 760 --keep`.
