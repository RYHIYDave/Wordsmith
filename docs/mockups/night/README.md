# Night in the town and on floor 1, and the morning

His words, 27 Nov 2026, 17:13: “I'm making some changes to the first town and floor 1. I'd like them both to be at night. I don't
want to change the look of either of them, but they do just need to be at night. And also, I need the gate that leads out to the
wilds from the town to be like solid wood instead of like a wrought iron sort of open thing. And then floor 1, I think you want like
moonlight instead of like sunlight beaming in. Same thing with the town, sorry. And it also makes the owl seem more natural.”

On the first pictures (by 18:00): “Okay I kinda like the town, not quite night enough but fine.  The floor one pictures look the
same.  I want when you come up from floor 5 back to town in the elevator, it’s morning.  And then you go out to the wilds and it’s
light out.  On second thought no, the town is not good enough as night”. On the second: “The town looks good.  Still not keen on
floor 1”; asked what floor 1 needed, his pick: “Darker, bright moonbeams (Recommended)”. On the third: “Yes, switch it all on
(Recommended)”.

What is in it (godot/scripts/night.gd, switch ON):
- The town and floor 1 at night until the elevator ride up from floor 5 (ways.gd sets `loot.morning`, saved with the run as
  "morning"; an older save already past floor 5 counts as morning). From then on both are as by day.
- Night: the dark deeper; the moon's blue multiplied over the place (look.gd `_night_grade`), but not where its fires burn nor in
  the hero's own small light; the daylight's shafts and pools moonlight; the town's window glass night-blue (its two cream colours
  swapped on its sheet as it loads, 0.1 s once); floor 1 darker, its moonbeams and their pools bright blue-white.
- The town gate solid wood, by day and night (assets/fx/tg_wood.png, painted by tools/wood_gate.py frame for frame with the iron
  gate's, so it rises as that did); no light through it while shut.
- `--night=0` turns it off for a run.

Checked: `--only=night` 6 of 6 (night, glass, wooden gate, floor 1, morning, the save keeps it); `--only=descent` 44 of 44 (the
ride up from floor 5, the gate unbarred and rising, on to floor 10); with it off the day pictures are unchanged.

Pictures: night_town_floor1.png (first try), night_and_morning.png (the town, the gate, the morning), floor1_moonbeams.png (floor
1 as switched on).
