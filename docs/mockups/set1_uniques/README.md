# Set 1: the battle axe's and the warhammer's uniques

Built by the main chat on 12 Nov 2026, on the branch `build/set1-uniques` (cut from `build/warrior-uniques-drop`). Its rules,
bag pictures and looks in play are all here.

## His words

- Asked what next, of the axe and hammer uniques: “lets do axe and hammer.  but i dont really like having swords, axes, and
  hammers dropping in the game if only one class can use them and only will use them 1/3 of the time”.
- Of the first hammer drafts: “kinda just throwing one unique per ability at me, its a little uninspired”.
- His picks: “The Red Harvest,The Falling Blade,i like the spinning return but how about it stops and spins for a duration.. you
  can have two out, and another throw replaces the oldest one.  or they expire.  might have to change the name tho” (axe);
  “The Bellringer,The Gathering Weight,i dont like the shoulder charge becoming a jump, but maybe the hammer hold pulls a meteor
  down that lands as the hammer hits.  the rest is the same.  maybe a fire damage mod on that one” (hammer).
- Of their names: “i dont like that we just added 6 uniques called "The ____ _____"”. His pick: “Set 1 (Recommended)”. So they
  are Gyre, Red Tithe, Widowfall, Death Knell, Deadweight and Starbreaker.
- Of each weapon's uniques: “Each keeps its weapon's moves”. So each drops only for the weapon he uses.
- Asked whether to start on them tonight: “just do number 1, get it all finished, screw what chat its supposed to go to.  im
  going to bed, get these ready for the next update”.

## What is built

| Unique | Weapon | What it does | Its price | Stats |
| --- | --- | --- | --- | --- |
| Gyre | Battle Axe | His thrown axe stops at the end of its flight and spins there for 3 s, cutting everything within 1.3 tiles every 0.35 s for 30% of the throw's hit; then falls. Two can spin at once; another throw takes the oldest's place. It does not come back. | None | Attack Speed, Area |
| Red Tithe | Battle Axe | An enemy that dies bleeding throws its blood (in 0.25 s) to the nearest other within 6 tiles, which bleeds as hard for 3 s. With Rend, one Cleave can bleed a whole room. | Cleave 15% weaker | Physical %, Life on Hit |
| Widowfall | Battle Axe | Leaping Chop lands with a Cleave all round him (2.4 tiles, 80% of the Chop's hit). Everything the Chop strikes bleeds half the hit again over 3 s. With Headlong, each kill readies the next leap. | None | Strength, Critical Chance |
| Death Knell | Warhammer | Every enemy his hammer stuns (Smash's full daze, Heavy Head, Earthquake, Bulldozer) rings for 4 s. Any hit of his on a ringing one makes it peal: everything within 2.6 tiles of it is stunned for 0.6 s, and rings too. | Each hammer stun 30% shorter | Strength, Area |
| Deadweight | Warhammer | Each Smash in a row hits 15% harder than the first for each before it, and swings 10% slower for each. The fifth lands as an Earthquake of its own (2 tiles, 1.5 times the Smash, stunning), and the weight starts over. After 1.2 s without a Smash, it drains one blow's worth every 0.5 s. | Slower swings while heavy | Physical %, Strength |
| Starbreaker | Warhammer | Earthquake calls a meteor down over the spot the maul will hit. It falls through his wind-up and lands with the hammer: fire on all within 1.6 tiles (1.5 times a fire hit), and the floor burning for 3 s. With Tremors its fire goes out again with each later shake (at Tremors' shares). | None | Fire %, Strength |

The numbers are a proposal, his to change: `UNIQUE_TUNE` gyre, tithe, widow, knell, weight and star in `src/game/uniques.ts`.

## Switches (all OFF until his yes to the pictures)

- `SET1` (`src/game/uniques.ts`): off, none of the six drops, is gambled for or is on his test page. Their rules are in
  `src/game/game.ts` under “UNIQUE ITEMS, SET 1”.
- `SET1_LOOK` (`src/render/set1_fx.ts`): their looks in play. Off, each shows as the build's plain stand-in (a burst, a spark).
- Their bag pictures are in `src/art/items_unique.ts` (SET1_PAINTERS). They are only ever asked for by a piece of Set 1, so
  they show only once `SET1` is on.

To put them live, set both switches on and change the two lines in `tests/set1_uniques.test.ts` and
`tests/set1_look.test.ts` that hold them off.

## Pictures for him

- `bag_all.png`: the six bag pictures. Each one also has its own `bag_<id>.png`.
- `set1_at_work.mp4`: each at work in the practice room, one after another, the Warrior with that weapon. It shows the axe left
  spinning, blood thrown, the Cleave on landing, bells ringing and pealing, the weight's Earthquake, and the meteor.
- `tools/scenarios/set1_look.mjs` makes the film (LOOK=gyre|tithe|widow|knell|weight|star, FILM=seconds).

## Checked

- `tsc` clean.
- `tests/set1_uniques.test.ts` (new): off none is had; each weapon's three found only by a Warrior with that weapon; each of the
  six doing what its card says.
- `tests/set1_look.test.ts` (new): the switch off draws nothing, and the six bag pictures are sound.
- Unit runs `--only` of what it touches, with the core: on 65b6e37bba, set1_uniques, items_unique, uniques, uniques_heroes,
  uniques_game, uniques_drops, warrior_uniques_drop, warrior_tree, warrior_tree_rules, unique_play and unique_play2 with the core
  (35 files): all passed but set1_look. Its two faults were mended, and on 45c8a8a440 set1_look, set1_uniques and items_unique
  with the core (26 files) all passed.
- Filmed from a built page (`tools/scenarios/set1_look.mjs`, each of the six): clean, no page errors.
- His page: [Set 1 Uniques](https://claude.ai/artifact/EaAEmfdgGSiU8Yr5CbWUbL), the six pictures and the film.

Not checked: his phone.
