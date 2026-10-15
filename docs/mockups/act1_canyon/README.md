# Floor 8, Echo Canyon

The art chat for floors 6 to 10, on the branch `mockup/act1-canyon` (from `mockup/act1-ledge`, 1524242: floor 7
whole, each part with his yes). NOTHING OF THE GAME IMPORTS ANY OF THIS. Pictures to him first; the main chat
puts it in.

## What began it

His word, 14 Oct, 21:21: "Okay floor 8 go", after the Carrion Queen's moves had his yes.

What floor 8 is, from his design doc ("Wordsmith Act 1: The Descent (Levels 6–10)") and his picks with the
planning chat (the project's `claude/act1_descent.md`):
- ECHO CANYON: "After the open cliff, the walls close in. The canyon is the cult's supply road down the
  mountain." Red-rock switchbacks along a dry riverbed; the level ends where the river comes back. Its palette:
  red rock. Wagons haul the quarry's obelisks downhill, and the cult's chanting echoes off the walls.
- ITS LOOK, his pick by 20:35 on 12 Oct, to the planning chat's in-game mock-up (previews/canyon_in_game.png;
  src/dev/preview_act1.ts, hash `shot`), asked "Is this how Echo Canyon should look?": "Yes, this is it
  (Recommended)", offered as: the canyon runs up the screen mostly, with the near wall's shadow and see-through
  pillars where it turns. Its tops dressed, by 20:42: "Yes, like this (Recommended)" (junipers, sage, yucca,
  dead trees, boulders, small hoodoos, a cairn and a skull, a rim of pale caprock, the cult's lookout with a
  hoist letting crates down to the road).
- ITS BOSS, the Cantor (his yes of 12 Oct, 18:07, to the planning chat's bosses): the cult's choirmaster;
  everything he does echoes off the canyon walls a beat later. His floor: The Cantor's Gorge.
- ITS MOBS: Canyon Scorpions (medium) and Dust Devils (small), with the cult's own.

The order, as for floor 7: the ground first, then its pieces, then the boss, then the mobs; each shown to him.

## Its ground (src/art/canyon.ts, `CANYON_LOOK`)

Painted by the game-ready painter of the Quarry and the Ledge Road (src/art/terrain.ts) from the level's own
tiles, with no change to the painter.
- THE FLOOR, the dry riverbed: fine sand the walls' own colour, in slow patches giving way softly (a two-by-two
  ordered dither where one tone meets the next, still crisp); drifted pale against the walls' feet; the wind's
  ripples across it in long broken lines, a lit crest over a line of shade, a pixel each; bars of river-worn
  stones, grey and cream among the red, each lit at its upper left with its shadow on the sand; flats of dried
  mud split into plates; grit and pebbles.
- THE WALLS, sheer sandstone in beds (rise 150 picture pixels, the planning chat's: about three heroes high, the
  walls closing in): low down the red beds, soft and deep red, with hard ledges standing out between them (lit
  along their tops, a shadow under them); higher up the paler beds of old dunes, swept with fine slanting lines;
  some beds split into blocks by short cracks; pits weathered into the soft beds; a few joints splitting down
  through several beds; the desert varnish streaked down from the rim, broad at the top and narrowing; the
  shadow under the caprock's lip.
- THE TOPS, the mesa: rust-red earth in soft patches; a rim of pale caprock along every cliff's edge, cracked;
  slabs of the caprock out across the top, standing a little proud (lit along their upper left, a shadow beyond
  their lower right); cracks; olive scrub in clumps; pebbles. What stands on the tops (the junipers, the yucca,
  the hoodoos, the cult's lookout) are pieces, next.
- HIS RULES: the near wall cut away where the canyon turns across the screen, its shadow on the sand (1.6 tiles,
  the mock-up's), and the near cliff's face in shadow where the ridge slants back (his rule of 12 Oct).
- COLOURS: every colour under the dullest word's saturation (leech, 0.498 in HSV; the ground's most saturated
  is 0.488), so the rock is a step duller than the planning chat's sketch, which was rough paint. The walls'
  deepest dark is warm (`WALL_DEEP`), so that the red rock never turns pink as it falls into shadow.
- WHAT IT COSTS (src/dev/preview_canyon.ts, `cost`, on this machine): the field 9 ms; a piece of 256 by 256
  picture pixels 66 to 142 ms. About the Ledge Road's.

      node tools/preview.mjs src/dev/preview_canyon.ts shots/canyon_ground.png 1014 468 shot
      node tools/preview.mjs src/dev/preview_canyon.ts shots/canyon_tiles.png 1014 468 tiles
      node tools/preview.mjs src/dev/preview_canyon.ts shots/canyon_kinds.png 1014 468 kinds
      node tools/preview.mjs src/dev/preview_canyon.ts shots/canyon_close.png 1014 936 close
      node tools/preview.mjs src/dev/preview_canyon.ts shots/canyon_cost.png 1014 200 cost

The tiles are laid by hand in the shape of the mock-up he said yes to (the road's line 3.7 tiles wide and the bay
at the turn); how the real Echo Canyon is laid is the main chat's.

`tests/canyon.test.ts` (9): nothing of the game imports it; every walkable tile's middle is floor, no rock
tile's; nothing painted over the floor; the near face on the cliff's side, within its height; pieces seamless,
the same every time; opaque, every kind of ground painted; no cyan or pink, duller than every word; light from
the upper left; three tones or so a material.

Shown `shots/canyon_ground.png` and `shots/canyon_close.png`, with a word that the rock is a step duller than the
sketch by his rule that places stay duller than the words, and asked "Is this Echo Canyon's ground?" (offered:
"Yes, on to its pieces (Recommended)"; "Brighter rock", closer to the sketch's orange, past the "duller than the
words" rule; "Not yet"), his answer, 14 Oct, by 22:13: "Yes, on to its pieces (Recommended)".
