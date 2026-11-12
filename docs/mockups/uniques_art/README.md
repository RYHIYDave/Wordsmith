# The unique items' own pictures

Branch `art/uniques`, cut from `uniques` at db0622f (the 62 built, behind `UNIQUES`, off). Queue item `draw-unique-items`,
the Uniques art chat, 11 Nov 2026. Nothing here is live: the pictures are behind `UNIQUE_ART` (src/art/items_unique.ts),
which is **off**, and they only ever show on a unique, which only exists with `UNIQUES` on.

## His words, in order (11 Nov 2026, each by pop-up)

Shown `pictures/today.png` (the 62 as the build shows them: each in its base's orange look, so all nine boots look alike,
all eight amulets, all seven rings) and asked how far the bag pictures should go: “A picture of its own each (Recommended)”,
offered as: 62 new bag pictures, each showing what the item is: a headsman's hood, a clockwork songbird; painted the way the
bag pictures are now, no finer; you see them in batches before anything goes in.

Asked whether this chat may send its own branch to GitHub: “Yes, let it send its branch (Recommended)”.

Shown the nine boots (`pictures/boots.png`) and asked whether this is the look for the other 53: “Yes, draw the rest like
this (Recommended)”, offered as: the other 53 the same way, in batches by kind; you see each batch.

**He has seen the nine boots and said yes to the look. He has been sent the other 53** (`pictures/jewels.png`,
`pictures/worn.png`, `pictures/weapons.png`) **and has not yet said yes to them, one by one or all.** The names are still
his placeholders.

## What is drawn

All 62, one picture each, by the unique's id in game/uniques.ts `UNIQUE_DEFS`:

- nine boots, eight amulets, seven rings (`boots.png`, `jewels.png`);
- six gloves, five belts, five helmets, four for the body (`worn.png`);
- eighteen weapons, three for each hero's own: greatsword, bow, staff, tome, wrench, wraps (`weapons.png`).

Each sheet has, for every piece, its picture six times its size, its name and a line on what it shows; and at its foot the
bag as the game itself draws it on an iPhone 16 held sideways (852 by 393, three screen dots to a point), from a page built
from this branch with both switches on (`*_in_game.png` are the whole screens).

**How they are painted.** With the item pictures' own kit (art/items_a.ts, his “A, painted” and “Finer and a rim” of 3 Nov):
the same five-tone materials, light from the upper left, dark seams, cast shadow, ink outline and the orange rim, 32 by 32
picture pixels, two to a game pixel. So they sit beside the game's own bag pictures at the same grain, and none is finer
than those are (his 9 Nov measure: what is finer is sent back the same as what is rougher). Each still reads as what it is
worn as: a boot is a boot, a ring is a ring.

**What glows.** Nothing new. The friend's cyan is on the pieces that carry a word or the hero's own magic (The Third
Word's third socket, The Dog-Eared Page's one bright word, The Ghostwriter's bead, The Short Way's band, The Windcutter's
edge and stone, The Tow Line's stone). Honest fire is orange (The Fleshmancer's Brand, The Unsigned Pact, The Cloven Boots,
The Restless Tome, The Burning Verse, and The Last Round in the kick's own orange). No pink, no gold glow.

**From the books, only what the books have:** The Clockwork Songbird is the artificial bird of Andersen's “The
Nightingale”; The Nettle Shirt is the nettle shirt of his “The Wild Swans”, one sleeve unfinished; The Queen's Glass is the
queen's looking-glass (floor 18's own book). The Dancing Shoes are a court shoe of my own drawing, red-heeled.

## What is where

- **src/art/items_unique.ts** (new): the switch `UNIQUE_ART`; a painter for each unique; `paintUnique(id)`, `uniqueArt(id)`
  (null with the switch off, or for an id with no picture), `UNIQUE_ART_IDS`.
- **src/art/items_a.ts**: the kit shared as `ITEM_A_KIT`; a part's material may be five tones of its own. No picture of the
  game's changes (tests/items_a.test.ts hashes nothing, but its checks of every kind at every rarity pass as before).
- **src/art/icons.ts** `itemPic(icons, key, rarity, unique?)`: the piece's `unique` as a fourth argument. Off, or for a
  unique not drawn, it gives the base's picture exactly as before.
- **src/ui/inventory.ts, src/ui/town.ts, src/render/render.ts**: the five places that have a piece pass `it.unique` (the
  bag and gear, the piece carried, the stash and shelves, the piece carried out, loot on the floor).
- **src/main.ts**: `__dbg.uniqueArt` (the switch, for a look in a page).
- **tests/items_unique.test.ts** (4): off, every unique shows its base's picture, the very same one; on, each shows its own,
  sized and anchored as the game's; every picture 32 by 32, crisp, a clear pixel round it, the orange rim, its own (no two
  alike, each told from its base's orange look); every id a unique of the build.
- **tests/items_a.test.ts, tests/items_a_game.test.ts**: brought along (the first lets art/items_unique.ts import the kit;
  the second lists the five calls with their fourth argument).
- **tools/uniques_art_peek.ts** (the pictures big, or dumped), **tools/uniques_art_sheet.py** (his sheets),
  **tools/scenarios/uniques_art_look.mjs** (the bag in a built page).

## To see them

`node tools/build_to.mjs dist/uniques_art.html`, then in the page's console `__dbg.uniques.on = true`,
`__dbg.uniqueArt.on = true`, `__dbg.practice('warrior', 7)`, `__dbg.game().giveUnique('clockworksongbird', 12)`. Or
`npx tsx tools/uniques_art_peek.ts peek.png 8` for all of them big.

## Checked

- tests/items_unique.test.ts, items_a.test.ts, items_a_game.test.ts: all pass.
- `tsc --noEmit`: only the error main already has (tests/relief.test.ts 378).
- The page builds; the bag opened with every one of the 62 in it, in four goes, at phone size: finished clean each time.
- Every picture looked at big and at the game's size, beside the game's own.

## Not done

1. **His yes on the 53** (he has seen the boots). Then `UNIQUE_ART.on` goes true when `UNIQUES` does.
2. **What is seen in play**, not begun: the queue item lists it (The Restless Tome's book in flight, The Drowned Arm's
   tentacle, The Queen's Talons' bird, The Fleshmancer's Brand's risen elite, The Rainwalker, The Shepherd's Crook, The
   Tide, The Windcutter's blade of wind, The Fan's three arrows, The Sticky Wrench's stuck vial, The Moth's Wing's darkened
   word, and the fourth globe over the Brawler's head, src/dev/veteran_globes.ts). The build sends
   `{ t: 'unique', id, what, … }` at each moment.
3. **The card's look** (name and what it does in orange, price in red, four orange pips): he was shown one picture on 11
   Nov by the build chat and has not said yes. Not this chat's to change; the new pictures show in the card's slot as they
   do in the bag.
4. **The floor**: a unique lying as loot shows its own picture through the same call (render.ts); not yet looked at in a
   picture of the floor.
