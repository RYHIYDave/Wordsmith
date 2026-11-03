# New item pictures: three styles to pick from

Pictures only. Nothing here is in the game: the painter is a dev file (`src/dev/items_look.ts`) that nothing of the game
imports (`tests/items_look.test.ts` checks it).

## His words

2 Nov 2026, 19:53: “I’d like new item sprites I think.  They’re pretty old art.  Then I guess get ready for unique items.”

2 Nov 2026, 22:2x, of the new hero, the Veteran (the Brawler's replacement): “Oh and we need sprites for his weapon, hand wraps, or brawler’s wraps.  2 handed obv.”

## What he is shown

`pictures/items_sheet.png` (1200 by 6893): today's pictures in a row, and today's inventory on a phone; then each style, A, B
and C, the whole set (the 17 kinds the game drops and the Veteran's wraps), the four rarities on a sword, and the set laid into
the real inventory as an iPhone 16 shows it held sideways, at its real size (5 screen dots to a game pixel, as the game sets
itself on that phone; the sheet is about as wide as that phone's screen held upright, so it shows at about its true size).

## The three styles

- **A · Painted.** Lit and shaded like the new heroes: five tones to each material, dark seams where one part meets another,
  a shadow under what lies on top, a bold dark outline. Each rarer weapon is a finer one (his rulebook, Heroes 3: “a rarer
  weapon looks finer”): plain steel; a blue stone and a blue grip; a gold guard and a yellow stone; a blackened blade inlaid
  with gold, a swept gold guard and orange stones.
- **B · Classic loot.** Bright flat colours, three tones to a material, a dark line round every part like a cartoon, and a rim
  in the rarity's colour round the whole picture (grey-white, blue, yellow, orange), so the rarity shows on the item itself,
  in the bag and lying on the floor.
- **C · Worn and storied.** Painted as A, in old, dulled colours, scratched and grimed, each with a little story: a nicked
  sword with a cord round its grip, a greatsword with a chipped point and a rag tied under the guard, a bow with a tally cut
  in it, a feather tied on and its string mended, a wand bound with twine and its crystal cracked, a staff with a string of
  beads, the Veteran's wraps stained across the knuckles, a shield with an arrow's shaft still in it, a patched quiver with a
  snapped arrow, a cracked focus with a claw gone, a dented and cut helmet with a ragged crest, a patched hood with a ragged
  hem, a scored breastplate with a rivet gone, a robe ragged at the hem and patched at the sleeve, a gauntlet with a finger
  plate gone, a belt with holes punched further along, boots with a patched toe and a hobnailed sole, a ring with a chipped
  stone, an amulet with its chain knotted. Its rarities as A's, in its own wear.

His rarity colours are the game's four (`RARITY_COLOR`, art/palette.ts): Normal, Magic, Rare, Unique. The brief named “set”
items too; the game has no set rarity, so none is drawn.

## The items

Weapons lie on the diagonal, grip at the bottom left, as today; the rest are seen from the front. Sword (slim, short guard);
greatsword (broad blade with a fuller, quillons swept toward the point, a long two-handed grip); recurve bow with horn tips and a
wrapped grip; wand (short, a gold collar and a pointed violet crystal); staff (long, gnarled, two prongs gripping a violet
crystal); **the Veteran's brawler's wraps**: a pair of fists bound in linen, the front fist's knuckles under a studded brass
plate, the back fist's under a leather strap, the loose ends trailing; heater shield (steel rim, red field, gold chevron,
boss); quiver (leaning, brass mouth, three arrows' fletching, its strap looped at its side); focus (a six-sided teal crystal in
a gold cradle on a short handle); helmet (a T-slit, a ridge over the top, a red crest); hood (its point drooping back, a cape
over the shoulders, the face in shadow); armour (breastplate, shoulder plates, a fauld of two bands, a belt); robe (bell
sleeves, flared hem, gold trim, a red sash); gloves (a steel gauntlet, the back of the hand, the thumb out); belt (a loop, its
buckle at the front, a pouch at its side); boots (tall, from the side, a folded cuff, a buckled strap); ring (gold, a big faceted
ruby in claws); amulet (a chain in a V, a sapphire in a gold setting).

Nothing glows: no friend's cyan glow, none of the enemy's pink or gold. The focus's crystal is a dark sea teal, as today's.

## How the pictures are made

All in code, like the rest of the game's art. Each item is built once as shapes (`src/dev/items_look.ts`): a blade, a guard, a
grip, a pommel, each of its own material and with its own way of taking the light (a blade's two faces, a grip's roundness, a
gem's dome, cloth's soft folds, a crystal's facets), and then painted in each style: the light from the upper left; in A and C
seams and cast shadows between parts; in B flat tones, ink between parts and the rarity rim; in C the old colours, wear (rust in
the dark of metal, scratches, scuffed leather and cloth) and each item's own story. Every pixel is solid: none half clear.

    npx tsx tools/items_look_sheet.ts <dir>                 # every picture, as PNGs (today's too)
    node tools/playtest.mjs --touch --size 852x393 --dpr 3 --scenario tools/scenarios/items_look_phone.mjs --out <dir>/phone
                                                           # (ITEMS_OUT=<dir>) the inventory on an iPhone 16, and where its slots are
    python3 tools/items_look_sheet.py <dir> docs/mockups/items_look/pictures/items_sheet.png
    npx tsx tools/items_look_peek.ts <out.png> [scale] [ABC]  # a quick look, big, for whoever paints them

The phone pictures are the real game's inventory, with every slot's picture painted over by the new one at 2.5 screen dots to
a picture pixel (as the phone shows it) and the dashes under each item put back over it, as the game draws them.

Checks (`tests/items_look.test.ts`, all pass): nothing of the game imports them; every item in every style at every rarity is
32 by 32, crisp, not cut off at its edge, big enough (at least 22 picture pixels across, 150 painted), with none of the friend's
glow colours or the enemy's colours; no two items' silhouettes overlap by four fifths or more in any style (the closest: in A
the wraps and the shield, 0.76; in B the same, 0.79; in C the helmet and the hood, 0.76); B's rim in each rarity's colour; A's
and C's four swords all different. `tsc` is clean.

## Making his pick game-ready

- **Size.** Each picture is 32 by 32 picture pixels at the heroes' grain: a Sprite of `density` 2, 16 by 16 game pixels, the
  size today's take (`IconArt.item`, art/icons.ts: “16x16, anchor (8, 8)”). Make it with
  `paint(...).sprite(16, 16, 2)`: the anchor stays the middle, (8, 8) in game pixels. So the slots stay as they are: `CELL`
  20, `PITCH` 22 (ui/panels.ts), a 1 px rim, the 16 pixel picture in the middle, the property dashes over its foot.
- **Where they are drawn.** `ui.slot` (ui/ui.ts) already draws a picture at its size in game pixels, so the bag, the paper
  doll, the carried item, the stash and the shop (ui/inventory.ts, ui/town.ts, ui/trades.ts) need nothing. The empty slot's
  faint picture (ui/inventory.ts, `GHOST`, about line 1236) calls `drawImage` without a size: it must pass `ghost.w, ghost.h`
  or a fine picture comes out twice as big. Loot on the floor (render/render.ts, the drops: lifted 4, its label 20 above) is
  drawn through `stand`, which knows the grain; its lift may want a look once the new ones lie on the floor.
- **Rarities.** Today one picture serves every rarity. A and C draw a finer weapon for a rarer one, and B rings each in its
  rarity's colour: either way the pictures become one per kind and rarity (`item[kind][rarity]`, or a function of the item),
  and every place above asks for the item's rarity as it already knows it. B's rim could instead be drawn at run time round
  the picture's outline. For unique items (his next step), A and C can give a unique its own picture outright.
- **The wraps.** `'wraps'` is not yet an `IconKey`: the Veteran's weapon kind and its base need adding (the Veteran is on
  `art/brawler-looks`), with `'wraps'` in `ICON_KEYS` and a picture here.
- **The old kinds** (axe, mace, maul, longbow: only an old save shows one, for a moment) keep today's pictures, or take the
  sword's, the greatsword's and the bow's.
- **Behind a switch.** Until he has said yes to it in the game, `ITEMS_LOOK = { on: false }`, with today's pictures when off.
