# THE WARRIOR'S UNIQUE WEAPONS IN HIS HANDS: FOR THE MAIN CHAT (14 Nov 2026)

A chat of his of 13 and 14 Nov (the skins chat), on `art/warrior-skins`, from `art/wrench-skins` (the Tinkerer's wrenches, which
holds the Ranger's bows, the Mage's staves and the bake made quicker: on the ship list; read docs/staff_skins.md,
docs/bow_skins.md and docs/wrench_skins.md first), with `art/warrior-pig-helm` (the bascinet, on the ship list) merged into it so
that his pictures here wear it. Not the main chat: `main` is untouched, nothing is published.

## His words

- 14 Nov 2026, of the Mage's staves done: “then do it for the rest of the cast”; asked whether to start, by pop-up: “Start the
  rest of the cast (Recommended)”.
- Shown his three unique great swords (docs/mockups/warrior_skins/pictures/swords_moves.mp4, swords_stills.png), by pop-up:
  “Yes, all three (Recommended)”.
- Shown his four unique battle axes and three unique warhammers (axes_moves.mp4, hammers_moves.mp4 and their stills), told an
  axe or a hammer shows only when his tree has given him that weapon, by pop-up: “Yes, all seven (Recommended)”.
- Shown him in the game holding each of the ten (docs/mockups/warrior_skins/pictures/swords_in_game.mp4, axes_in_game.mp4,
  hammers_in_game.mp4 and their `_sides.png`: put on from his bag as a player does, on floor 11 and in town; the axes with his
  tree's battle axe point, the hammers with its warhammer point), asked whether to turn them on for the next update, by 23:15
  Eastern: “Yes, switch them on (Recommended)”.

## What it is

- HIS GREAT SWORD A SKIN (src/art/warrior_up.ts `SwordSkin`, `PLAIN_SWORD`; painted flat as it always was, art/hero_warrior.ts
  blade): his own sword painted exactly as before (688 frames, his fourteen moves from eight sides, hashed the same).
  src/art/sword_skins.ts: MILLSTONE (a heavy grey blade, a millstone for a guard), WINDCUTTER (a pale curved blade, slotted, a
  winged guard, white streamers), UNDERTOW (a deep-water blade, an anchor's arms for a guard). Each blade's light of the cyan's
  family (Millstone's faint).
- HIS WAR AXE AND MAUL TAKEN BY A UNIQUE (src/art/warrior_up_weapons.ts `TakeLook`, a take's own stuffs; paintAxe, axeSprite,
  makeWarriorAxeArt, makeWarriorHammerArt and makeWarriorHeavyArt take a `skin`): his axe and maul painted exactly as before
  (702 frames, dungeon and town, three sides, hashed the same). src/art/heavy_skins.ts, each with the war axe's or the maul's
  haft, grip and balance, so his hands and every move are theirs: GYRE, RED TITHE, WIDOWFALL, THE ROT AXE (level 10), DEATH
  KNELL, DEADWEIGHT, STARBREAKER, each to its bag picture. The honed edges of the axes glow the friend's cyan as the war axe's;
  Starbreaker's cracks an honest fire's orange.
- IN THE GAME (art/heroes.ts `WARRIOR_SKINS`, ON at his yes in play): `warriorWorn(item, arms)` gives a unique only as the
  kind he is drawn with (a great sword while he holds his own; an axe or a hammer once his tree has given him that weapon,
  game/talents.ts heavyDrawn); `wornSkin(cls, item, arms)`; his places with each (`WARRIOR_SKIN_PLACES`, town and dungeon);
  heroes3 paints him with it; render.ts and the loading screen ask for those places; a bake group for each (`warrior-millstone`
  ...; an axe's or hammer's only while WARRIOR_TREE2 is on), his sets let go of as he swaps (render/baked.ts holdOnly).
- NOT DONE: the thrown axe in the air (art/warrior_up_axe_moves.ts paintFlying, the game's to draw) is the war axe's, whichever
  he threw; Gyre's spinning axe is Set 1's own look (render/set1_fx.ts).
- tools/bake_marks.mjs: sword_skins.ts and heavy_skins.ts are the Warrior's own (HERO_ROOTS).

## What the main chat must do

- Bring in `art/warrior-skins` (it holds `art/wrench-skins`, `art/bow-skins`, `art/staff-skins` and `art/warrior-pig-helm`: take
  this one in their place, or after them).
- THE HEROES' BAKE: his three great swords' groups, `warrior-millstone`, `warrior-windcutter`, `warrior-undertow`; and while
  WARRIOR_TREE2 is on, his seven axes' and hammers' too (`warrior-gyre` ... `warrior-starbreaker`): ten groups more, each a few
  files as his own (about 4 to 7), fetched only while he holds that weapon. art/warrior_up.ts, art/warrior_up_art.ts and the
  axe's and maul's art changed (his pictures the same), so his groups and the cards' are baked again.
- On the release page: tools/scenarios/baked.mjs (CLS=warrior), and the Warrior with a unique great sword put on.

## Checked

- tsc clean.
- His own great sword, war axe and maul as skins: 688 and 702 frames hashed the same as before.
- tests/warrior_skins.test.ts (5: the switch on; his own weapons the same frames; each its own; worn only as the kind he is drawn
  with, their places, looks, his art with each, a bake group each; his sets let go of as he swaps, not by the Mage's places).
- In the game (dist/warrior_look.html, unbaked): him with each weapon put on from his bag, on floor 11 and in town, filmed: his yes.
- NOT CHECKED: his groups baked in a real browser (the let-go is the staves', checked so); a whole bake; the release page; his
  phone.
