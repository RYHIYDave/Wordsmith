# Mock-up: the Warden's floor, the Crypt's first floor themed after its boss (NOT IN THE GAME)

**What it is.** Floor 1's own set of pieces, by his rule of 10 Oct (his art rulebook, Places 7: each
floor themed after its boss, between 40 and 50 pieces made for it alone), and three moments that
play around the hero there (his idea of 07:52). Pictures for him first. Nothing of the game imports
`src/art/floor1.ts`; where each piece stands, when it is laid and what it does (what breaks, what
blocks, what hurts, what a quest asks, when a moment plays) are the main chat's, once he has said yes.

**State of this branch (`mockup/floor1-warden`):** from `mockup/crypt` (the Crypt as he said yes to
it). Made by THE ART CHAT, 10 Oct 2026, from 07:41.

## His words

- 07:29, asked whether the Crypt's four floors were good to build as shown: "Yes.  I’d also like
  each floor to be themed after the boss.  Add this to the ruleset.  We need somewhere between 40-50
  unique assets on each floor for each boss.  That can include wall tiles, floor tiles, breakables,
  stuff on the walls, on the floor, obstacles, the looks of doors and gates, traps, and quests."
- By 07:41, offered four themes (floor 1, the Warden: the dead king's tomb and its jailer; floor 2,
  the Headsman: the place of execution; floor 3, the Chained One: the prison; floor 4, the
  Amalgamation: the ossuary the miners broke into): "Yes, start floor 1 (Recommended)", offered as
  "A sheet of the Warden's floor pieces comes to you first."
- 07:47: "Put in the ruleset that I want animations as big and wild and kinetic and weighty as
  possible.  I’d rather it be a notch too high than a notch too low." 07:53: "And I want all
  animations checked against this statement before I see them." (Animations 1, his doc at rev 80.)
- 07:52: "I’d also like a couple environmental things happening around you for immersion unique
  for each floor.  Something shifts above you and dust comes down, you spook a pack of birds and
  they fly off,  a root shrivels as you walk by.  That sort of stuff"

## What is in it (`wardenPieces()`, 50 pieces; `wardenMoments()`, 3)

The theme is drawn from the Warden as he is painted (art/monster_warden.ts): "A dead king's jailer"
with a horned helm, a cape "the colour of blood" and a maul. So: the king's tomb (sarcophagi, his
effigy, his throne, his crown cut in the stone) and the jailer's iron (bars, keys, shackles, mauls,
horned helms, his red cloth, a dull wine).

- Wall tiles (6): burial niche, sealed niche, barred window, horned skull, the king's head, fallen-in stones.
- Floor tiles (7): ledger stone, grave slab and ring, the king's runner and its end, drain, the crown in the floor, sunken grave slab.
- Breakables (4) and what they leave (2): funeral urn, squat urn, bone box, skull jar; urn shards and ash, splinters and bones.
- On the walls (8): banner, banner in rags, shield, keys on a hook, shackles, torch (4 frames), crossed mauls, horned helm on a peg.
- On the floor (7): fallen guard, dropped keys, fallen banner, the effigy's head, horned helm, candles (4 frames), chain.
- Obstacles (9): sarcophagus, open sarcophagus, the king's tomb, horned knight, pillar, cresset (4 frames), rack of mauls, the king's throne, the king's coffer (the chest; closed and open).
- Doors and gates (3): the door's leaf (as makeDoorLeaf, from hinge to free end), the gate's crest, the boss's gate (its crown in the Warden's embers, as the game's boss gate has his mark).
- Traps (3): spike grate (and its glint), crown plate (and pressed), dart skull (its mouth the slot).
- Quest (1): the Warden's horn, his trophy for the armourer.
- Moments: dust and a falling stone (18 frames at 15 a second: grit, then a stone that strikes, bounces, breaks, chips flying, dust rolling out); rats bolt (14 at 20: into a burial niche); a candle gutters out (12 at 12: a gust, the tallest goes out, smoke).

Wall pieces are flat pictures set in a wall's face, the one turned to screen-left and the one in
shade (anchored at the foot of the face under the middle of its tile). Floor tiles are a tile's
picture (anchored at its top corner, as the floor's own). Traps as the game's (anchored at the
middle). Standing things at the middle of their tile, on the grid.

## The checks (`tests/floor1.test.ts`, 5)

Places 7 (40 to 50 pieces, every kind he named); Pixels 1 (crisp); Colour 3 (no cyan; pink only on
the boss's gate); Colour 4 (walls and floors darker than the darkest word); Pixels 4 (lit from the
upper left). The crypt's 13 still pass (nothing of the game changed: crypt.ts only shares three
colours). Animations 1, by eye, before he saw them: the stone falls hard, bounces and breaks; the
rats bolt; the flames lean hard over in the gust.

## Pictures (not in the repository)

`node tools/preview.mjs src/dev/preview_floor1.ts <out.png> 2800 3800 "sheet:3"` (every piece by
kind), `"room:3:<frame>"` (a room laid with them), `"moment:3:<n>"` (a moment's frames side by side).
