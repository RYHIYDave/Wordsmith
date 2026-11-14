# THE MAGE'S UNIQUE STAVES IN HER HANDS: FOR THE MAIN CHAT (14 Nov 2026)

A chat of his of 13 and 14 Nov (the skins chat), on `art/staff-skins`, from `main` 8ccc8b9 (25.3.19). Not the main chat: `main`
is untouched, nothing is published. Behind a switch that is off (`STAFF_SKINS`, src/art/staff_skins.ts) until his yes to her
in the game.

## His words

- 13 Nov 2026, 18:22: “How hard would it be to have weapon skins?  Like can we just put a grey stick in the mage’s hand, build
  a basic skin for the staff, then have unique staves map over the grey stick the same way the basic staff does?  Or is it much
  more complicated than that?”; asked how to do it, by pop-up: “Yes, split layer (Recommended)”.
- Shown the Shepherd's Crook on her: “the hook gets inverted when she tunrs”, “but besides that it looks good”, “then lets see
  the rest of the staves”.
- Shown Ebb and Flow and Resonance: “is that all the unique staves?”; then, by pop-up: “Yes, all three (Recommended)”.
- Told the uniques are live and the Kindling Rod (level 8) is a fourth staff, by pop-up: “Yes, Rod + wire now (Recommended)”:
  the Rod made, and all four wired into the game, so that a unique staff put on is the staff in her hand.
- “then do it for the rest of the cast”: read as the same, afterwards, for every other hero's unique weapons, hero by hero,
  pictures first.
- Shown the Rod: “Yes, the Rod's right (Recommended)”.
- “will it swap seamlessly if im switching between different staves?”; told what each way costs on his phone (below), by
  pop-up: “Bake each staff whole (Recommended)”.

## What it is

- HER STAFF A SKIN (src/art/mage_up.ts): what was her staff's code is `PLAIN_STAFF`, a `StaffSkin` (`sculpt`: the solids of
  the staff, laid on her hand's line, `StaffAt`; `extras`: its lights and glows). `MuAround.staff` picks it (left out: her own
  staff; `null`: her with none). Painted with her own staff she is the very frame she was (1432 frames of her, every move,
  all eight sides, hashed the same as `main`'s).
- THE FOUR STAVES (src/art/staff_skins.ts), each laid on her body, not on the eye (`headWay`: so that the Crook's hook no
  longer flips as she turns, his “the hook gets inverted when she tunrs”):
  - THE SHEPHERD'S CROOK (`shepherdscrook`): a pale crook, its stone hung from the hook's end.
  - EBB AND FLOW (`tide`): two wave-curl crests about a pearl.
  - RESONANCE (`tuningstaff`): a tuning fork with an orb in its throat; rings about it when she casts hard.
  - THE KINDLING ROD (`kindlingrod`): charred wood with ember cracks, an iron cresset, and an honest fire in it (its light the
    fire's, not the friend's cyan: an honest fire burns orange).
  The friend's cyan for the other three stones' light.
- WHICH SHE HOLDS: `staffWorn(item)` (null with the switch off, or for anything but those four uniques).
- WHERE (src/art/heroes.ts): each staff two places of her own, in town and in a dungeon (`STAFF_PLACES`: crookTown/crook,
  ebbTown/ebb, resonanceTown/resonance, rodTown/rod; `lookOfPlace` gives `staff`), as the Warrior's axe and maul are
  (`HEAVY_PLACES`). Her art with that staff: art/heroes3.ts (`mageup:<staff>:<place>`, `makeMageUpArt(place, share, skin)`).
  The game asks for her places with the staff she holds (render/render.ts), the painter's worker paints them as the town's
  and the dungeon's (render/painter.ts), the loading screen shows her with it (main.ts).
- BAKED WHOLE, A GROUP FOR EACH STAFF (render/baked.ts `bakeGroups`, only with the switch on: `mage-crook`, `mage-ebb`,
  `mage-resonance`, `mage-rod`, each her in town and in a dungeon with it), fetched the first time she holds that staff.
- ONLY THE STAFF SHE HOLDS IS KEPT (render/baked.ts `holdOnly`, `letGoGroup`, called by the painter each time her pictures
  are asked for): as she takes up another staff, the last one's set is let go of (its places put back as they were, its
  frames given back, its sheets closed), and fetched again if she takes it up again. Her card's group is not touched.

## Why whole, not split (what he was told)

- Split layers (her once with no staff, and a layer for each staff laid over her) are exact: proved over her moves and
  sides, a layer laid over her gives back the whole frame to the pixel, and nothing partly solid of a layer lies over her
  (tests/staff_skins.test.ts, test 3). But a layer's box is about 63% of a whole frame's, so her and a layer held together are
  about 113% of her whole: more memory, not less, and two pictures to draw for each frame of her.
- Her whole set baked is about 1.95 MB to download (five sheets, mage-0..4.png, measured on the published page) and about
  80 MB in memory once open (five sheets of about 2048 by 2000). Two sets held at once would be 160 MB: hence only the one she
  holds is kept.
- THE SWAP: the inventory pauses the game (main.ts), so the new staff's set comes in while it is open; the first time she
  holds a staff it is fetched (its 2 MB or so), and painted meanwhile as before where it has not come yet.

## Also changed

- `src/art/mage_up_art.ts`: `paintMuMove`, `muSprite`, `makeMageUpArt` take the staff.
- `src/main.ts`: the test pages' switch (`__dbg.staffSkins`), and the loading screen's place.
- `tools/scenarios/staff_skins_film.mjs`, `tools/staff_skins_film.py`: the film of her in the game with each staff.

## What the main chat must do

- Bring in `art/staff-skins`. THE HEROES' BAKE HAS A NEW MARK (art/mage_up.ts changed, though she is painted the same):
  bake again as the build does.
- With the switch off nothing changes in play. With it on (his yes), the bake has four more groups (her set four times more:
  about 8 MB more on the server, fetched only when she holds that staff).
- Checks: `node tools/unit.mjs --changed` (tests/staff_skins.test.ts, tests/staff_skins_game.test.ts, tests/baked.test.ts);
  the published page's own playtests, the heroes' bake taken in (tools/scenarios/baked.mjs).
- Known limit: where there is no bake (it failed, or a page built without one), her pictures are painted by the worker as
  before, and a staff's set painted is kept when she takes up another (the let-go is the bake's).

## Checked

(below, as it was done)
