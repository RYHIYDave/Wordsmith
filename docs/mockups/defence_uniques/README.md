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
  the sheet, but OFF until his yes: `loot.gd DEFENCE_ART` (`--defart=1` to see them). Off, each shows its base's look.
- Checked: `--only=defuniques` 27 of 27 (its line 27: every unique's picture is in the sheet, 88 their own, the fifteen their
  own with the switch on); `uniques` 11 of 11, `uniquesdo` 19 of 19, `defence` 11 of 11.
- After pulling this, Godot must import `icons.png` again (the editor does it on opening the project).
