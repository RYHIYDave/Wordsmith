# Every word on a dungeon, enemy melds, and the one-line meld card (branch `build/meld-words-everywhere`)

Made by the Crafting chat of 12 Nov 2026 (session ...SqoVKRHVJcbR8XhUsaUF), a chat of his working the queue item
`talk-through-remaining-crafting-ideas` at his word, then building what the talk settled (his pick, asked whether to start it:
“Yes, build it now (Recommended)”). Not the main chat; `main` untouched; nothing published. Cut from `main` ac80ec7 (25.3.14).

## His words, and his picks (12 Nov 2026, 20:19 to 20:50 Eastern, by pop-up)

His 4 Nov 2026 ideas left over (NEXT_VERSION, 4 Nov 19:07 to 19:12): “And ALL words need to be craftable on items and put into
strongholds.”; “I like the idea of melding words for crafting specific mods because you’ve already blocked something that a word
would craft so it’s more deterministic.”; “Like, hypothetically, is lightning II would give you “50% lightning damage”, then
hailstorm would give you “25% lightning and frost damage”.”

- WORDS INTO STRONGHOLDS. Told that a stronghold's altar turned away melded words and ranked words, and asked how one should count,
  he asked: “Do we have enemy properties for melds or just attack and craft options?” Told no (monsters carried single words only).
  His picks: “Both words plus a twist (Recommended)” (a melded word on a monster does what each of its two words does on a monster,
  and a twist of its own); for ranked words, “Yes, half as strong again (Recommended)”; and “Counts as two words (Recommended)” (as
  hard and as rich as two words, so three hollows can come to six).
- THE TOWN GATE TOO: “Yes, the gate too (Recommended)”.
- MELDS CRAFTING SET MODS: offered a melded word letting him pick its outcome at the bench: “Keep it random”. Nothing changes.
- MIXED ELEMENTS: told his hailstorm was already in (since 25.2.7 Hailstorm on gear gives frost and lightning, each half what
  Lightning II gives), shown as two lines each rolled apart: “One line, crafting only (Recommended)”.
- EACH MELDED WORD'S TWIST ON A MONSTER, his pick of two offered (or his own words):

| Word | On a monster: its two words, and | his pick |
|---|---|---|
| Eruption | builds heat as it fights; at full heat its next blow erupts round it (a warning ring) | “Builds heat” |
| Avalanche | hits harder while you are chilled | “Harder when chilled (Recommended)” |
| Thunder | every few blows a thunderclap round it, a warning ring first | “Thunderclap (Recommended)” |
| Blight | while its poison is on you, you take more damage from everything | “Poison opens you up (Recommended)” |
| Scald | a fire hit while you are chilled, or frost while you burn, cracks for more | “Cracks for extra (Recommended)” |
| Wildfire | its blows leave small fires that throw sparks at you if you stay near | “Sparking fires (Recommended)” |
| Fumes | dies in a poison cloud that explodes if anything burning walks into it | “Exploding cloud” |
| Hailstorm | every few seconds hail on a marked circle round you, slows and strikes | “Hail on a circle (Recommended)” |
| Frostbite | while you are chilled by it, you lose life over time | “Chill bites (Recommended)” |
| Contagion | where it dies a poison cloud stays that shocks you in it | “Shocking cloud (Recommended)” |
| Demolition | its dying blast is huge, but slow to go off | “One huge slow blast” |
| Powderkeg | its dying blast leaves burning ground | “Burning ground (Recommended)” |
| Shatter | bursts into a ring of ice shards when it dies; dodge between | “Ring of shards (Recommended)” |
| Chain Reaction | its dying blast throws arcs of lightning at you if you are near | “Arcs from the blast (Recommended)” |
| Rupture | bursts when it dies, splashing poison over the ground | “Poison splash (Recommended)” |
| Siphon * | his own words: “make it so you cant heal as much if youre poisoned” (while its poison is on you, you heal less) | his words |
| Cauterize * | when low on life it sears itself and heals once, a flash first | “Burns its wounds shut” |
| Forking * | each lightning strike forks: a second, weaker bolt a moment after | “Forked bolt (Recommended)” |
| Shiver * | its critical hits freeze you for a blink | “Crits freeze briefly (Recommended)” |
| Sunder * | its next blow after knocking you back hits much harder | “Follow-up blow (Recommended)” |
| Fervor * | each enemy dying near it speeds it up and its fire burns hotter | “Fed by deaths (Recommended)” |
| Rime Ward * | hitting its shield chills you | “Cold shield (Recommended)” |
| Implode * | when it dies it pulls you in, then bursts, a warning ring first | “Pull, then burst (Recommended)” |

\* The eight new melds are not in `main` (their rules on the branch `melds8`, the queue's `put-eight-new-melds-live`): their twists
are NOT built here. Whoever puts them live adds each to `src/game/foe_melds.ts` as the fifteen are (FOE_TEXT, and its hook:
foeHarder, foeAfterBlow, foeTick, foeDeath), with a line in `tests/foe_melds.test.ts`. Siphon's needs a hook where he heals
(less while `h.poisonT > 0` from a Siphon blow); Cauterize's a flag on the monster (`seared`) and a flash event; Shiver's the hero
frozen (he can be: `rooted`/`frozen` in game.ts); Fervor's a count on the monster fed from the death hook.

My readings, told him: a melded word on the altar or the gate brings its own elements, and no other word of an element may lie
beside it; nor a word already in a melded word on it (no Frost beside Hailstorm, no Power II beside Eruption).

## What is built (behind two switches, both ON on this branch at his yes, below; off, the game is as it was)

`src/game/foe_melds.ts` (new) has the rules, the numbers (FOE_TUNE: starting points to tune) and the twists' words (FOE_TEXT).
Its switch is `FOE_WORDS` in `src/game/defs.ts` (wordShare reads it there, for the ranked words): ON.

- THE ALTAR AND THE GATE (game.ts altarProblem, planProblem): melded and ranked words go on, with the readings above
  (foe_melds.ts layProblem). The gate's words kept in a save include them (HELD_WORD_IDS).
- COUNTING AS TWO (foe_melds.ts wordWeight, wordsWeight, upTo): the stronghold's life (`HOLD_TUNE.life`), its runedust and pieces
  (`HOLD_TUNE.dust`, `LOOT2.hold`, run on past three words by their last step: six words' worth is 12 dust and 12 pieces, to tune),
  its gold; the gate's boss's extra words, the carriers' chance, magic find, gold and experience.
- ON THE MONSTERS (foe_melds.ts foeWordsOf): a melded word puts its two words on every monster and itself (its twist); a ranked word
  its word and itself (defs.ts wordShare: that word half as strong again, FOE_RANK). A melded word of two elements (Scald, Wildfire,
  Hailstorm): its blow half of each element (each resisted on its own), each leaving its burn, chill or shock whole (hurtHero).
- THE FIFTEEN TWISTS (hooks in game.ts, each one line, marked EVERY WORD ON A DUNGEON): hurtHero (foeHarder: Avalanche, Blight,
  Scald; foeAfterBlow: Blight, Frostbite, Wildfire, Eruption, Thunder), the monsters' turn (foeTick: Hailstorm), a monster's death
  (foeBlast: Demolition; foeDeath: Fumes, Contagion, Rupture, Powderkeg, Shatter, Chain Reaction), the zones (foeZone: a monster's
  ground is a hostile `burn` or `venom` zone with `foe` set; it harms the hero, not the monsters), the hero's ticks (Frostbite).
  Their looks are the game's own (the warning ring, the ground fire and poison, frost bolts, arcs): nothing new drawn.
- THE WORD'S PAGE (ui/lexicon.ts): ON A DUNGEON, for a melded or ranked word, what it does to every monster and “Counts as two words”.
- THE ONE-LINE MELD CARD, behind `MELD_LINE` (game/items.ts, ON): a melded word's two properties of one kind (two damages, two
  resistances) rolled once, one line: “Hailstorm: +20% Frost and Lightning Damage” (imbueLines, used by the card, the bench's word
  and the burned message). Pairs of two kinds stay two lines. Only from melded words; nothing on found gear changes.
- Made public in game.ts for the module: shutIn, after, hurtFrom, shootAt, damageMonster (nothing else of them changed).
- `__dbg.foeWords`, `__dbg.meldLine` (main.ts): the switches, for the pictures.

## Pictures

- `pictures/enemy_melds.mp4`: the twelve that show, one after another in the practice room, as the game plays them
  (tools/scenarios/foe_melds_look.mjs, filmed in real time; captions added).
- `pictures/card_now_and_one_line.png`: an amulet with Hailstorm, its card now and with MELD_LINE (tools/scenarios/meld_line_look.mjs).

## Checked

- `tsc` clean (but main's own tests/relief.test.ts 378).
- `tests/foe_melds.test.ts` (new) 12 of 12: switch off as before; the altar and the gate's rules; counting as two; the words on a
  monster and the ranked share; every live meld's page; Hailstorm half and half, and its hail; Avalanche, Scald, Blight; Eruption,
  Thunder; Wildfire, Frostbite; every death twist; Fumes going off; the one-line card on and off.
- `node tools/unit.mjs --only foe_melds,hold_altar,melds,volatile_melds,runes_on_gear,last_words,items,inventory,city_words,packs,three_words,gates`
  and the core on 3910bcfdc5: 33 files, 362 tests, all passed.
- The film and the card's pictures from a built page (tools/build_to.mjs dist/foe_melds.html), clean.

NOT CHECKED: his phone; a stronghold played through with melded words laid; the whole suite.

## His word on the pictures

12 Nov 2026, about 21:25 Eastern, sent both pictures and asked by pop-up whether to hand it all to the main chat switched on:
“Yes, hand it to main (Recommended)”. So FOE_WORDS and MELD_LINE are ON on this branch; tests/melds.test.ts and tests/rank2.test.ts
(which held melded and ranked words off the gate) now follow the switch.

## For the main chat

Merge `build/meld-words-everywhere` (from main ac80ec7; it touches game.ts in about a dozen marked places, defs.ts wordShare,
items.ts imbueItem, state.ts four fields, lexicon.ts, panels.ts, inventory.ts, main.ts __dbg). Nothing to bake. Tell him what
changes in play: melded and ranked words go on stronghold altars and the town gate and count as two; monsters carry their twists.
To tune once he has played it: FOE_TUNE (foe_melds.ts) and the strongholds' tables past three words (upTo). When the eight new
melds go live (put-eight-new-melds-live), add their eight twists here as the table above has them.
