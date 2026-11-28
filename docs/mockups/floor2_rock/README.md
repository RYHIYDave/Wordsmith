# Floor 2's cliff: the prison on the edge of its cliff, at night

The work queue's item "Draw what lies outside floor 2's prison walls at night: no black, no sky under the walls" (his words and
the main chat's tries are in it). Asked to start a new task, 27 Nov 2026, he wrote: “There’s a new cliff I need for floor 2.
Should be in the queue”.

His words on the first try (angular rock masses hung straight down from the walls): “I have you the job because the code
couldn’t make a good cliff.  And all you did was put a cobble pattern on top of the shitty job the code did.  So fix it.  Make
it look like a good cliff.  Make it look like it was built on THE EDGE of a cliff, not directly into the cliff.  Please it’s
been hours on this floor and I’m getting sick of having to redo these cliffs.  Do it right.  Follow the rules.”

On the second (floor2_cliff_edge.png): “Close, change some things”. Asked what, his picks: “More rock detail (Recommended),
Rougher edge”, and his words: “I need the cliff to never show the background of the sky UNDER the cliff.  So just make sure it
goes down far enough to not let that happen”. On the third (floor2_cliff_v2.png): “Good, ship it off (Recommended)”, so it
ships SWITCHED OFF, behind look.gd's `F2_SKY` (with the main chat's night sky), for him to switch on.

## What it is

`tools/f2_rock.py` draws it, by the art rulebook (docs/art/RULEBOOK.md):

- **The rim.** The prison stands back from the edge. Between the foot of its walls and the drop there is a strip of clifftop
  rock, wide in places and narrow in others. The walls' shadow lies at their foot, with moss, pebbles and fallen stones on it.
  Along the edge runs a lip of pale caprock catching the moon. The edge is chipped and bitten. Where the prison's ground comes
  to a point toward the open air, the rim turns the corner with it.
- **The drop.** From the rim's edge the cliff falls in upright faces and ledges, three tones lit from the upper left. A face
  looking left takes the middle tone, one looking right takes the dark tone, and every ledge top takes the light tone. Each
  face is split into columns by cracks. Some columns stand proud with broken tops catching the light, others are set back in
  shadow, and the faces are pitted. Each ledge further down is a step deeper in the dark. Thirteen ledges run well below the
  screen, so no sky is ever seen under the cliff. Where the prison's outline steps in at its foot, the pockets between its
  walls are filled with the clifftop's ground.
- **The underside.** The dark of the place lies under all of the prison's ground, so no sky shows through a faded wall. In
  the holes the look left in the tops of thick walls (where stars showed), it draws a wall-walk's stones.

Files: `godot/assets/looks/floor2_rock.json`, `floor2_rock_<i>_<j>.png`, `floor2_under_<i>_<j>.png`; `floor2_cover.png` is
written with its holes filled, and the cover as first drawn is kept as `floor2_cover_drawn.png`. If `tools/godot_f2_night.py`
is run again, delete `floor2_cover_drawn.png` and run `python3 tools/f2_rock.py` after it. The main chat's earlier cliffs
(`_NightCliffs` in look.gd, `floor2_cliff_*`, `tools/godot_f2_cliff.ts`) are no longer used and can be dropped.

Looked at with: `WS_AUTORUN_WALK="2;8,71;20,80;20,90;16,96;60,96" xvfb-run -a godot --path godot --rendering-driver opengl3 --
--only=autorun --cls=warrior --f2sky=1 --shots=<dir>`. A count of sky pixels under the cliff or the prison, down to a
screen's height below each column's top, found 112, all in one small spot under a single piece at the far top of the prison,
not under the cliff.

Pictures: floor2_rock.png (the first try, turned down), floor2_cliff_edge.png (the second), floor2_cliff_v2.png (as shipped).
