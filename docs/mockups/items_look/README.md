# New item pictures

Style A, painted, picked by him: every item at its four rarities, each rarer one finer, with a thin rim of its rarity's colour
round the item itself. Pictures first: in the game behind a switch that is off (`ITEMS_A = { on: false }`, `src/art/items_a.ts`),
asked for only through art/icons.ts `itemPic` (`tests/items_a.test.ts` and `tests/items_a_game.test.ts` check it; below,
"Brought in").

## His words, in order

2 Nov 2026, 19:53: “I’d like new item sprites I think.  They’re pretty old art.  Then I guess get ready for unique items.”

2 Nov 2026, 22:2x, of the new hero, the Veteran (the Brawler's replacement): “Oh and we need sprites for his weapon, hand wraps, or brawler’s wraps.  2 handed obv.”

3 Nov 2026, shown three styles (`pictures/items_sheet.png`, below), which style: “A, painted”.

3 Nov 2026, how rarity shows, offered a finer picture per rarity, or finer and a rim: “Finer and a rim”, offered as: the finer
picture, plus a thin rim of the rarity's colour round the item itself, in the bag and on the floor.

3 Nov 2026, 09:39: “I need fighters wraps, a demonic tome, and something for the tinkerer’s weapon as items”. Asked what the
Tinkerer's should be, his pick: “Her big wrench (Recommended)”, offered as: the heavy wrench she already carries, as an item;
rarer ones get gears, gauges and glowing cores.

3 Nov 2026, of the tome's fire: “Cyan, his hellfire (Recommended)”, offered as: the tome burns in the Warlock's own cyan
hellfire, matching him and your rule. And of the items as a whole: “Yes, hand them over (Recommended)”.

3 Nov 2026, 10:44, and so the tome's fire is the demon's red-orange again: “I think we want the demonic tome to be orange.  The warlock is Str/Int, which is kinda red and blue, cyan fire in the demonic hand, red/orange fire on the tome.  In that same vein, the brawler is Str/dex, so I think we change the color of the globe for a punch to green and the kicks stay orange/red.  I think that’s a good thematic change”. Asked whether to write stats-as-colours into his art rulebook for every class: “It can be case by case, but right now these changes would lock everyone into that theme for now”. So no rulebook change; just these. (The punch's green is the Veteran's, on `art/brawler-looks`.)

## What he is shown

`pictures/items_a_sheet.png` (1200 by 4795): every item in a row of its four rarities, Normal, Magic, Rare, Unique, each in a
slot drawn as the game draws one (its frame in the rarity's colour, a 16 game pixel picture in its middle), three times as big
as his phone shows it, with a line on how each gets finer; then his gear and bag, and eight pieces lying on the floor as loot,
on an iPhone 16 held sideways at its real size, **drawn by the game itself** (a build whose item pictures are the new ones:
below). The earlier sheet of the three styles, `pictures/items_sheet.png`, stays as the record of his pick.

## Style A, every item, four rarities

Painted like the new heroes: five tones to a material, the light from the upper left, dark seams where one part meets
another, a shadow cast where one part lies over another, a bold ink outline. 32 by 32 picture pixels, two to a game pixel: the
16 game pixels today's pictures fill.

**Finer by rarity** (his rulebook, Heroes 3: “a rarer weapon looks finer”), every kind its own way: Normal plain; Magic a touch
of blue (a blue stone, grip, strap, ribbon, cuff or field); Rare gold and a yellow stone; Unique blackened or gilded, with orange
stones.

| Item | Normal | Magic | Rare | Unique |
|---|---|---|---|---|
| Sword (one-handed: shorter and slimmer than the greatsword) | plain steel | blue grip, blue stone | gold guard, yellow stone, a line down the blade | blackened blade inlaid with gold, swept gold guard, orange stones, red grip |
| Greatsword | plain steel, broad, long grip | blue grip, blue stone in the guard | gold quillons and pommel, yellow stones | blackened and gilded, longer swept quillons, orange stones, red grip |
| Bow | wood, horn tips, leather grip | blue grip and stone | gold tips and bands, red grip, yellow stone | blackened wood inlaid with gold, orange stones in gold tips |
| Wand | wood, iron collar | carved ivory, blue stone at its foot | gold collar and claws up the crystal, yellow stone | blackened, a gold spiral, orange stones |
| Staff | gnarled wood, iron band | blue ribbon, blue stone | gold band, gold caps, yellow stone | blackened wood, gilded prongs, orange stones |
| Brawler's wraps (the Veteran's) | plain linen fists | blue straps and bands, steel knuckle studs, blue stones | gold studs and bands, yellow stones | dyed deep red, gilded, orange stones |
| Demonic tome (the Warlock's) | red leather and iron, an iron horned face, pages edged in the demon's red-orange fire | chained, steel face, blue stones in the clasps | gold face and corners, its third eye open, flames licking out | blackened and gilded, its eyes burning, a burning sigil, gilded chain, orange stones |
| Tinkerer's wrench | plain steel, leather grip, rivets | blue grip, a brass gear | a gold gear and a gauge, gold rivets, yellow stone | blackened and gilded, two gears, a glowing cyan core, orange stones |
| Shield | planks and a steel rim | blue field, steel chevron, blue stone | red field, gold chevron, yellow stone | blackened field, gold rim, orange stones |
| Quiver | leather, white fletching | blue fletching, strap and stone | gold mouth, tooled in gold, yellow stone | black leather, gold mouth and foot, orange stone |
| Focus | sea-green crystal in a steel cradle | blue stone | taller gold claws, yellow stone | blackened cradle, gold claws, orange stones |
| Helmet | steel, a horsehair crest | blue crest and stone | gold brow and ridge, red crest, yellow stone | blackened, inlaid with gold, orange stones |
| Hood | green wool, leather edge | blue edge and clasp | gold edge and hem, yellow stone | black, gold-edged, orange stone, its eyes glinting |
| Armour | steel plate, leather belt | blue belt and stone | gold trim, red belt, yellow stone | blackened plate inlaid with gold, orange stones |
| Robe | plain violet, a cord | blue trim, sash and stone | gold trim and hem, red sash, yellow stone | black, gold-trimmed, orange stones |
| Gloves | steel gauntlet | blue leather, blue stone | gold trim, yellow stone | blackened, gold inlay, orange stones |
| Belt | leather, iron buckle | blue pouch and stone | gold buckle and studs, yellow stone | dark leather tooled in gold, orange stones |
| Boots | plain leather | blue cuff and stone | gold buckle, steel toe cap, yellow stone | dark leather, gold toe, heel and trim, orange stones |
| Ring | steel, a red garnet | a sapphire | gold, a topaz | gold, an orange stone, two more in its band |
| Amulet | steel, a red garnet | a sapphire | gold, a topaz | a wider gold setting, an orange stone and three more |

**The rim**: one picture pixel (half a game pixel; 2.5 screen dots on his phone) of the game's own rarity colour
(`RARITY_COLOR`, art/palette.ts: grey-white, blue, yellow, orange) round the item's ink outline. Where it would fill a narrow
notch between two parts it is ink, so it only ever goes round the outside. The item takes 0.88 of its frame, so its rim stays a
picture pixel clear of the picture's edge and a game pixel and a half clear of the slot's own frame: the two lines of the same
colour sit apart, the slot's frame and, inside it, the item's rim (look at the phone pictures).

**Nothing glows** but the demon's fire on the tome, red and orange (his words, 10:44: “cyan fire in the demonic hand,
red/orange fire on the tome”; the ramp `fire` in `items_a.ts`, deep red to orange to a pale flame-white, as before his cyan pick:
not the enemy's pink flame, not a gold glow), and the core of the Unique wrench, the friend's cyan (hers is a friend's). The
Warlock's own hellfire, in his hand, stays cyan.

### The new kinds

- **Brawler's wraps** (the Veteran's, two-handed): a pair of fists bound in linen, the front one studded on its knuckles (from
  Magic up), a strap across the back one's fingers, the loose ends trailing.
- **Demonic tome** (the Warlock's): a heavy book standing, leaning a little, bound in his own red book's leather and iron
  (`BOOKRED`, dev/sculpt_warlock.ts), a horned demon's face raised on its cover, two clasps over the pages' edge, the pages edged
  in the demon's red-orange fire, a ribbon marker hanging from its foot. Rarer, more demonic: chained (Magic, Unique); a third eye
  open on its brow (Rare, Unique); flames licking out of the pages (Rare, Unique); blackened, its eyes burning, a burning sigil
  (Unique).
- **Tinkerer's wrench**: her big wrench as she carries it (dev/sculpt_tinkerer.ts, `wrenchIn`: a steel shaft, a broad jaw with its
  gap), on the diagonal, its gap to the upper right, a wrapped grip. Rarer: a gear at its throat (Magic up), a gauge on its shaft
  (Rare up), rivets, and the Unique's glowing cyan core set in its jaw.

The Warlock and the Tinkerer start with a wand today: the tome and the wrench would be their own weapon kinds, as the wraps are
the Veteran's. What they do (hands, speed, the quick attack, who can carry them, how they drop) is the main chat's rules.

## Game-ready: `src/art/items_a.ts`

- `ITEMS_A = { on: false }`: the switch. Until he has said yes to them in the game, today's pictures when off.
- `itemArt(key, rarity): Sprite`: the picture of an item by its picture key (an item's `icon`, or `'wraps'`, `'tome'`,
  `'wrench'`) at its rarity: 16 by 16 game pixels painted two picture pixels to a game pixel (`density` 2), anchor the middle
  (8, 8), as art/icons.ts' item pictures are drawn (`IconArt.item`: “16x16, anchor (8, 8)”). Made once and kept (80 pictures,
  painted as they are first asked for).
- **The old weapons** (axe, mace, maul, longbow: only an old save shows one, for a moment) show the kind each becomes as
  items.ts migrates it (`OLD_WEAPON`, `migrateItem`): the axe and the mace the sword, the maul the greatsword, the longbow the
  bow (`ITEM_A_OLD`, `itemAKind`).
- **The floor** draws loot with the same picture as the bag (render/render.ts, the drops: `art.icons.item[dr.item.icon]`, set
  down through `stand`, which knows the grain, lifted 4 with its label 20 above): no other picture is needed, and the lift reads
  right with the new ones (the floor picture).
- `paintItemA(kind, rarity): Px`: the 32 by 32 painting itself, for tests and sheets.

### What the main chat changes to bring it in

1. **Ask for the picture with the rarity.** Today every place takes `art.icons.item[it.icon]`, one picture for every rarity.
   Add one helper beside the item record in art/icons.ts, for example
   `itemPic(art, key, rarity) => ITEMS_A.on ? itemArt(key, rarity) : art.icons.item[key]`, and call it where the UI asks:
   - ui/inventory.ts, about line 1231: the bag and the hero's gear, `it.rarity`;
   - ui/inventory.ts, about line 1745: the piece carried under the finger, `carried.rarity`;
   - ui/town.ts, lines 238 and 274: the stash and the vendor's slots, and the piece carried, `it.rarity`, `c.item.rarity`;
   - ui/trades.ts, line 272: a kind for sale (`c.kind.icon`): it has no rarity yet, so Normal (0);
   - render/render.ts, about line 3110: loot on the floor, `dr.item.rarity`.
   `ui.slot` (ui/ui.ts) already draws a picture at its size in game pixels, and ui/panels.ts draws no item picture (only its
   cell sizes, `CELL` 20, `PITCH` 22, and the property dashes over the cell's foot, which stay as they are).
2. **The empty slot's ghost** (ui/inventory.ts, `GHOST`, about line 1236) calls `g.drawImage(ghost.img, x, y)` without a size: it
   must pass `ghost.w, ghost.h`, or a picture painted two to a game pixel comes out twice as big. (Its picture: the kind's Normal,
   faint, rim and all; or keep today's ghosts, which are the plainer hint.)
3. **The new kinds** (`'wraps'`, `'tome'`, `'wrench'`): each a `WeaponKind` (game/types.ts: `WeaponKind`, `WEAPONS`, `IconKey`,
   `ICON_KEYS`), with its bases by tier in items.ts (`ITEM_BASES`, its `icon` the kind), its name (`WEAPON_KIND_NAME`), its quick
   attack (defs.ts `WEAPON_TAP`), its hands (the wraps two-handed: his “2 handed obv”; no off-hand pairs with them, `canPair`),
   its slot (`mainhand`) and how it drops (`pickBase`); and the class it starts with (`CLASSES[cls].starts`: the Veteran the wraps,
   and if he wants it, the Warlock the tome and the Tinkerer the wrench). The Veteran is on `art/brawler-looks`.
4. **Unique items** (his next step): one picture per kind serves every Unique of it. A named unique can have a picture of its
   own: a painter added to `items_a.ts` under its own key, asked for by the item's `icon`.

### Brought in (the main chat, branch `items-in`, still behind ITEMS_A, off)

- `itemPic(icons, key, rarity)` (art/icons.ts) is the one place the game asks for an item's picture: ITEMS_A on, `itemArt(key,
  rarity)`; off, today's `icons.item[key]`, the very same picture. Every place above calls it with the rarity it knows (the
  stranger's throws Normal); the ghost is the kind's Normal, drawn at `ghost.w, ghost.h`. Loot on the floor is the same picture.
- The Warlock's weapon kind is `'tome'` (it was `'grimoire'`): “Demonic Tome”, “Chained Tome”, “Pact Tome” by tier; a saved
  grimoire loads as the tome (items.ts `migrateItem`). With ITEMS_A on the wraps, the tome and the wrench are the art's; the
  stand-ins in art/icons.ts are only for it off.
- `__dbg.itemsA` is the switch. `tests/items_a_game.test.ts` checks every place, off and on.
- `pictures/in_game/`: the game itself, both switches on, on an iPhone 16 held sideways (`node tools/build_brawler_to.mjs
  dist/items.html`, then `node tools/playtest.mjs --file dist/items.html --touch --size 852x393 --dpr 3 --scenario
  tools/scenarios/items_a_look.mjs --out shots/items_a_look/items`): a Warrior's bag of every kind at mixed rarities; the
  Warlock with his demonic tome, the Tinkerer with her wrench, the Veteran with his wraps (each with the other three rarities of
  it in the bag); loot on a dungeon floor at all four rarities; the armourer's shelf.

## How the pictures are made

    npx tsx tools/items_a_sheet.ts <dir>                  # every kind at its four rarities, as PNGs
    node tools/items_a_build.mjs                          # dist/items_a.html: the game, its item pictures the new ones
    ITEMS_OUT=<dir> node tools/playtest.mjs --file dist/items_a.html --touch --size 852x393 --dpr 3 \
        --scenario tools/scenarios/items_a_phone.mjs --out <dir>/       # the gear and the bag, then the floor, on an iPhone 16
    python3 tools/items_a_sheet.py <png dir> <shot dir> docs/mockups/items_look/pictures/items_a_sheet.png
    npx tsx tools/items_a_peek.ts <out.png> [scale] [kinds]  # a quick look, big, for whoever paints them

`tools/items_a_build.mjs` builds the game with `src/dev/items_a_icons.ts` standing in for art/icons.ts: the same art, its item
record handing out the new pictures, at the rarity after an `@` in an item's picture key (`'sword@2'`). The scenario gives each
item such a key and its own rarity, so the game draws every slot and every piece on the floor itself, at its real size. (Only a
way to see them in the real game before it asks for them by rarity: not the way to bring them in, above.)

## Checks

`tests/items_a.test.ts` (all pass): the switch off and nothing of the game importing `art/items_a`; every kind at every rarity
32 by 32, every pixel crisp, inside its frame with a clear pixel all round, at least 22 picture pixels across and 150 painted;
the rim one picture pixel thick, of the rarity's own colour, all round the ink and only on the outside, at least 50 pixels of
it; the four rarities of each kind all different, the Magic with blue, the Rare with gold or a yellow stone, the Unique with
orange stones and more finery than the Normal; no two kinds' silhouettes overlapping by four fifths or more at any rarity (the
closest: the tome and the shield, 0.77 to 0.78); none of the enemy's colours anywhere, the friend's cyan only in the Unique
wrench's core; the tome at every rarity burning in the demon's red-orange fire (at least 15 pixels of its ramp), none of it
cyan; `itemArt` 16 by 16 game pixels, anchor (8, 8), density 2, each made once, and the old weapons showing what they became. `tsc` is clean; `tests/items_look.test.ts` (the three styles) still passes.

## Before: the three styles (`pictures/items_sheet.png`)

The sheet he picked from: today's pictures, then the whole set in each of three styles, the rarities on a sword, and each laid
into the real inventory on an iPhone 16. **A · Painted** (picked): lit and shaded like the new heroes. **B · Classic loot**: flat
bright colours, ink between parts, a rarity rim. **C · Worn and storied**: as A in old, dulled colours, each with a little story.
Its painter, `src/dev/items_look.ts` (nothing of the game imports it; `tests/items_look.test.ts`), with
`tools/items_look_sheet.ts`, `tools/items_look_sheet.py`, `tools/items_look_peek.ts` and
`tools/scenarios/items_look_phone.mjs`, is the record of that choice and can go once the new pictures are in the game.
