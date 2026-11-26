# The Barrier gear's cowl and slippers (pictures first)

The queue's “Draw gear icons for a cloth hood and cloth slippers (the Barrier pieces)”, taken at his pick, 26 Nov 2026: “Yes, the
cloth hood and slippers icons (Recommended)”.

The Godot game's three defences (his idea, and his yes to their pictures, 22 Nov 2026: `godot/scripts/loot.gd` DEFENCE_LAYERS)
give heavy gear Armour, leather gear Dodge and cloth gear (Linen, Silk, Velvet) Barrier. Cloth had a robe, gloves and a sash, but no
helmet and no boots, so a Mage could not wear Barrier in every slot. Two new pictures:

- **Cowl** (`cowl`, the head: Linen, Silk, Velvet Cowl): a soft cloth cowl with no point (the leather hood has one), its face in
  shadow inside a band, a swag of cloth at the throat with a cord tied across it, a short mantle cut to a point at the front.
- **Slippers** (`slippers`, the feet: Linen, Silk, Velvet Slippers): one soft cloth slipper from the side, toe to the left as the
  boots', no heel, the toe swept up and curled back with a tassel hung from it, its mouth banded round the dark inside, a thin sole.

Both in the robe's colours: its violet cloth (the Unique's black), its band (cloth, blue, gold) and its sash's cord (plain, blue,
red). Each rarer one finer, as all the gear: Normal plain; Magic a blue band and a blue stone; Rare a gold band, gold stitching or
toe and a yellow stone; Unique black, gold, orange stones. Linen, Silk and Velvet share the picture at each rarity, as the robes do.

## In the code (branch `art/cloth-cowl-slippers`, from the Godot game's `claude/sharp-lamport-ey7q0l`)

- `src/art/items_a.ts`: `cowl` and `slippers` painters, kinds `'cowl', 'slippers'` (ITEM_A_KINDS, ITEM_A_NAME); a `nudge` helper.
- `src/game/types.ts`: the picture keys `'cowl' | 'slippers'` (IconKey, ICON_KEYS).
- `src/art/icons.ts`: stand-ins, shown only with ITEMS_A off (it is on).
- `tests/cloth_gear_art.test.ts`: the two are kinds the game knows; the robe's colours; the cowl apart from the hood and the
  slippers from the boots. `tests/items_a.test.ts` checks them as every kind (size, rim, each rarity finer, no enemy's colours, no
  two kinds alike).
- No piece of the game has these pictures: nothing changes how the game looks until the bases are added.

## Bringing them in (after his yes)

Add the two bases to `src/game/items.ts` GEAR_KINDS, then bake the Godot game's loot (`tools/godot_loot.ts`: `icons.png`,
`icons.json`, `items.json`), so each base's picture key is `cowl:<rarity>` or `slippers:<rarity>`:

    { id: 'cowl', slot: 'helm', icon: 'cowl', names: ['Linen Cowl', 'Silk Cowl', 'Velvet Cowl'], implicit: [...] },
    { id: 'slippers', slot: 'boots', icon: 'slippers', names: ['Linen Slippers', 'Silk Slippers', 'Velvet Slippers'], implicit: [...] },

`loot.gd` base_family already makes any base named Linen, Silk or Velvet cloth, so Barrier (and the robe's little cooldown
recovery) follows from the names. Their drops, levels and what is built in are the Godot chat's to set, as the queue says.

## Pictures

`cloth_gear_sheet.png`: the two at their four rarities beside today's robe, hood and boots, three times as big as a phone shows
them; then a Rare cowl in the Mage's empty helmet slot and the new pieces in the bag, placed into the Godot game's own screenshots
(`docs/mockups/defences`) at real size. Made by `npx tsx tools/items_a_sheet.ts <raw>` and `python3 tools/cloth_gear_sheet.py <raw>
<out.png>`.
