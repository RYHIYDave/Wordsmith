# The uniques' defences, and the fifteen of the three defences (the Godot game)

Branch `claude/adoring-davinci-q6wn9n`, on top of `claude/sharp-lamport-ey7q0l` (5adef9ed). 23 Nov 2026.

His words: “We made changes to defenses in Wordsmith and added dodge and barrier. Armor staying the same. I'd like you to go
back and look at our uniques that we made and change them to reflect what the class that would be using them would be most
likely using as a defense. So if it's a mage unique and it has some flat armor on it, change that to barrier. Or if it's a
ranger unique, add dodge. That sort of thing. And then give me maybe 15 more uniques that each sort of go with, 5 for armor, 5
for barrier, 5 for dodge. So we can sort of include those new mechanics in the move pool. Sorry, not the move pool, the item
pool.”

## The uniques we had (done, in the game)

A piece's defence already followed its base (heavy armour, leather dodge, cloth barrier), so most were right. Changed
(`the_five_changed.png`): Shortcut (Mage) barrier in place of dodge; Prismheart (Mage) barrier in place of mana; The Pack
Collar (Ranger) dodge added; The Tow Line (Tinkerer) dodge in place of armour; The Quilted Coat (a jerkin) its flat armour is
dodge. And a leveling unique no longer picks up its base's dodge or barrier (“nothing but 20% movement speed”).

## The fifteen (ON at his yes, 23 Nov 2026: “Yes, switch them on”; `loot.gd DEFENCE_UNIQUES`)

`the_fifteen.png`: their cards as the game draws them. The pool's, anyone's. Names and numbers are proposals, his to change
(`src/game/uniques.ts` DEFENCE_DEFS, UNIQUE_TUNE; rules in `godot/scripts/uniques.gd`).

- ARMOUR: Anvilheart, The Burr, Ballast, The Unbowed, Workhardened.
- BARRIER: Quickglass, The Decanter, Shatterglass, Halo, The Glazier's Ring.
- DODGE: Feint, Afterimage, Featherweight, Close Call, Tailwind.

To run without them: `--defuniques=0`.

## Checked

`godot --path godot -- --shots=<dir> --only=defuniques`: 26 of 26. The older checks after it: `defence` 11 of 11, `uniques` 11
of 11, `uniquesdo` 19 of 19. `tsc` clean; tests/uniques, uniques_rolls, uniques_level, items_unique pass. The tables were made
again with `npx tsx tools/godot_loot.ts` (103 uniques).

## Their own pictures (23 Nov 2026)

His words, told the fifteen wore their bases' pictures: “Uniques always have unique sprite art”.

- THE GODOT GAME NOW SHOWS EVERY UNIQUE'S OWN PICTURE. The port had all of them in their bases' orange look: the export never
  asked for a unique's picture. Now `tools/godot_loot.ts` puts each one's picture (`src/art/items_unique.ts uniqueArt`) in
  `icons.png` under `u:<id>` and the piece's `icon` is that key. The 88 pictures are the ones he passed on 12 and 13 Nov.
- THE FIFTEEN'S PICTURES are painted (`items_unique.ts` DEFENCE_PAINTERS; `the_fifteen_pictures.png`, `in_the_bag.png`) and in
  the sheet, ON at his yes, 23 Nov 2026: “Yes, turn them on” (`loot.gd DEFENCE_ART`; `--defart=0` to run without them).
- Checked: `--only=defuniques` 27 of 27 (its line 27: every unique's picture is in the sheet, 88 their own, the fifteen their
  own with the switch on); `uniques` 11 of 11, `uniquesdo` 19 of 19, `defence` 11 of 11.
- After pulling this, Godot must import `icons.png` again (the editor does it on opening the project).

## Fifteen more leveling uniques (24 Nov 2026)

His words: “Give me 15 more leveling uniques”. Made as the twenty are: each its level's own, nothing of its base (a weapon, its
base's damage alone), every number rolled about a fifth either way, anyone's unless a hero's weapon, dropping on any floor of its
level or past it. Stats alone, no rule of its own. Eleven on the way (levels 2 to 20), four endgame (22 to 28, each with a
price). `src/game/uniques.ts` LEVEL2_DEFS; pictures `src/art/items_unique.ts` LEVEL2_PAINTERS.

ON AT HIS YES, 24 Nov 2026, shown their cards and pictures: “They’re all good.  A unique weapon needs a skin to go on the
Warrior if he equips it.  So you’ll have to get that going” (`godot/scripts/loot.gd LEVEL2_UNIQUES`; `--level2=0` to run
without them). THE BARN DOOR'S SKIN ON THE WARRIOR: `src/art/sword_skins.ts` BARNDOOR_SWORD, baked alone with
`node tools/bake_one_group.mjs warrior-barndoor` (2504 frames) into `godot/assets/heroes/warrior-barndoor*`, `skins.gd`
WARRIOR_KIND; `barn_door_on_the_warrior.png`. The other fourteen are armour and jewellery: no skin on a hero. `fifteen_more_leveling_cards.png`, `fifteen_more_leveling_pictures.png`, `fifteen_more_leveling_bag.png`.

Checked: `--only=defuniques` 31 of 31 (lines 28 to 31 are theirs); `skins` 38 of 38 (its line 29 the Barn Door); `uniques` 11 of 11; tsc clean;
tests/items_unique, uniques, uniques_level pass. Tables made again (`npx tsx tools/godot_loot.ts`: 118 uniques); Godot must
import `icons.png` again.

## Twelve leveling weapons (24 Nov 2026)

His words: “So things that will make the next run easier.  Low level gear with a twist or a stronger roll than you could get
early on”; “Can you tell me what they are before they get art and are pushed into the game?”; “How many unique weapons do we
have for leveling?  Cause we should have 3-4 for each class”. There were seven (the Warrior two, the others one each). Told
these twelve by name, level and numbers before any art: “Yes good to go”. FROM NOW ON: a unique is told him first, and painted
and built only after his yes.

`src/game/uniques.ts` LEVEL3_DEFS (two for each hero; three each now, the Warrior four); bag pictures `src/art/items_unique.ts`
LEVEL3_PAINTERS; a skin on its hero for each (`src/art/sword_skins.ts`, `heavy_skins.ts`, `bow_skins.ts`, `staff_skins.ts`,
`tome_skins.ts`, `wrench_skins.ts`, `wrap_skins.ts`; `src/art/heroes.ts`), baked with `node tools/bake_one_group.mjs <groups>`
into `godot/assets/heroes` (twelve groups, about an hour and a half), `godot/scripts/skins.gd`. The Icicle's every hit is frost
(`uniques.gd after_resolve`, as the Kindling Rod's are fire). The Rusty Wrench's poison is added to poison hits, as the game's
flat poison is.

BUILT AND CHECKED; OFF UNTIL HIS YES TO THEIR PICTURES: `godot/scripts/loot.gd LEVEL3_UNIQUES` (`--level3=1`).
`twelve_weapons_cards.png`, `twelve_weapons_pictures.png`, `twelve_weapons_on_the_heroes.png`.

Checked: `--only=defuniques` 36 of 36 (lines 32 to 36 theirs); `skins` 50 of 50; `uniques` 11 of 11; tsc clean. Tables made
again (130 uniques); Godot must import again.
