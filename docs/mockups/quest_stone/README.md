# Mock-up: THE MASTER RUNE-STONE AND THE RING POWERING UP (NOT IN THE GAME until the main chat puts it there)

**What it is.** The quest item the fallen wordsmith leaves in the first dungeon, a master rune-stone,
and what happens when the hero gives it to the wordsmith in town: his ring, dark until then, powers
up. Behind a switch that is off: `QUEST3` in `src/art/quest3.ts`. It stands on the wordsmith made new
and his ring (`SMITH3`, `docs/mockups/wordsmith/README.md`): the town's part needs that switch on too.
With `QUEST3` off the game is as it was exactly (tests check it).

**Where:** the branch `art/quest-stone`, from `art/wordsmith` (`ca09b4e`, itself from `main` at Version
19.4, `9e148f3`).

## His words

- To the main chat, as it posted them on the board at 20:42 (8 Oct). 20:39: "I’d like the fallen
  wordsmith to drop a quest item that you give to the wordsmith in town to unlock the ability to
  wordsmith." 20:41: "And I’d like the quest item to power up the runes around the wordsmith.  Like a
  battery being put in.  These animations should go to the art team".
- 22:41, in this chat, when the item was to be drawn: "wait on that, cause we probably need new art
  for the wordsmith and the runes around him with the new design rules". So the wordsmith and his ring
  were made new first (his yes by 23:09: the wordsmith's README).
- By 23:52, asked what the item should be: "A master rune-stone" (the pick put to him: a carved tablet
  with one great rune, laid into the slab's top like a key).
- By 23:52, to `quest_found.gif` (the stone beside the fallen wordsmith, taken up, and carried): "Yes,
  keep it (Recommended)". To `quest_power.gif` (the ring powering up): "Looks great except for the hole
  in the table.  Just a big black hole?"
- At 00:01 on 9 Oct, to `slab_hollow.png` (the hollow carved, before and now) and `quest_power.gif`
  made again: "Yes, keep it (Recommended)".

## What it is, with the switch on

- **The stone** (`src/art/quest3.ts`): a tablet of dark slate, its top corners cut off and its edges
  worn, cut with one great rune, the rune the wordsmith writes on the air (`GREAT_RUNE`,
  `src/art/smith3.ts`). It is painted as a thing in three dimensions, seen from the game's one camera
  (`paintStone`), so that it can turn, stand and lie down truly.
- **In the first dungeon:** it lies beside the fallen wordsmith, by his reaching hand (`STONE_BY` in
  `render.ts`), its rune throbbing, motes rising off it. Taken up (one second, `standQuestStone`), it
  rises, stands up, bursts with light and flies into the hero, growing smaller. Carried, its picture
  shows beside INVENTORY (`hud.ts`), popping in as the flight ends.
- **In town, dark:** the six stones' runes cut and cold, no light; the circle in the floor cold; no
  letters swirling, no column; the wordsmith's own runes cold (`darkOf`), and he does not work. His slab
  has an empty hollow cut in its top, the stone's shape: its far walls seen, the great rune's print cut
  in its floor (`paintHollow`; it was a black hole until his note, by 23:52).
- **Given** (seconds after the giving, `POWER`):

  | When (s) | What |
  |---|---|
  | 0 to 0.5 | it rises out of the hero |
  | 0.5 to 1.3 | it floats over to the slab |
  | 1.3 to 1.6 | it lies down over the hollow |
  | 1.6 to 1.9 | it comes down into it, with a burst of its light at 1.9 |
  | 1.9 to 2.3 | its rune catches, cold to white |
  | 2.3 to 2.9 | the slab's runes catch, one by one |
  | 2.9 to 4.1 | the light runs out of the slab round the circle both ways; each standing stone catches as it reaches it |
  | 4.1 | every stone flares, the letters burst out of the slab, the column rises, the wordsmith's runes catch fire |
  | 4.7 on | the ring he said yes to, the stone in the slab, and he goes back to his work |

- Everything that glows is the friend's cyan, white at its heart (the rulebook).

## What the rules must set (the main chat's)

What drops it, carrying it, giving it, and what it opens are the main chat's; this branch has only the
pictures, and a demo for the films (`__dbg.quest3` in `main.ts`). The pictures read these from
`QUEST3`:

- `on`: the switch.
- `dark`: the ring is dark (until the stone is given).
- `givenAt`: when it was given, on the clock the renderer is given (`clock` in `main.ts`); -1 not yet.
- `stone`: `'lying'` beside the fallen wordsmith, or `'gone'`.
- `takenAt`: when it was taken up, on the same clock; -1 not yet.
- `carried`: the hero has it (its picture by INVENTORY).

The guide's words and its shaft of light over the body ("Someone fell here", `ui/guide.ts`) are the
main chat's to change for the quest; the films put the guide aside. For the films only, the demo's
`take` marks the fallen wordsmith searched (`level.body.state = 1`). The stone is given from wherever
the hero stands: it floats from there to the slab.

## What it touches beyond the art

- `src/art/ring3.ts`: the slab made for the stone (`makeSlab3`: the hollow, the stone laid in and
  catching, the slab's runes catching, the slab burning); the circle catching round (`fuse`); the
  column rising; where the stones and the slab stand (`STONE_AT`, `SLAB_AT`, as `game/level.ts` has
  them).
- `src/art/smith3.ts`: `GREAT_RUNE` exported; the wordsmith cold (`smithFrame`'s `dark`,
  `makeSmith3Dark`, `darkOf`).
- `src/art/townscene.ts`: `ringPower`; the ring's pictures by it; `smithAct` -1 while the ring is dark
  or powering up; `columnSprite`; `swirlNow` (the letters, bursting out of the slab as it powers up).
- `src/render/render.ts`: `Art.quest`; in `standRing3`, the letters by `swirlNow`, the floating stone
  and its burst of light; `standQuestStone` (the dungeon); the lying stone, in the floor's pass.
- `src/ui/hud.ts`: the stone carried, by INVENTORY.
- `src/main.ts`: `art.quest`; `__dbg.quest3({ on, dark, give, take, lying, carried })`.

## How it is checked

- `tests/quest3.test.ts` (8): the switch off, the ring as it was; the stones and the slab where the
  town has them; the order of the giving and the power-up, nothing going out again; each stone
  catching as the light reaches it, the nearest the slab first; dark, everything cold, the hollow
  empty, no column, no letters, no work; powering up, each step in its turn, then the ring as he said
  yes to and the wordsmith at his work again; the hollow in the slab's own colours, nothing in it darker
  than the slab's shaded side, the rune's print in it, and all of it under the stone once the stone is
  laid in; the stone's pictures, all their light the friend's cyan.
- The whole suite, 736 of 736; tsc clean.
- The films: `node tools/build_to.mjs dist/quest.html`, then
  `node tools/playtest.mjs --file dist/quest.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/quest_dungeon.mjs --out shots/quest/dungeon`
  and the same with `tools/scenarios/quest_town.mjs --out shots/quest/town`, then
  `python3 tools/quest_films.py dungeon shots/quest/dungeon previews/quest/quest_found.gif` and
  `python3 tools/quest_films.py town shots/quest/town previews/quest/quest_power.gif`. Close up,
  without a browser: `npx tsx tools/look/stone.ts <out.png> 5`.
- The cost, timed in Node on this machine: the stone's 28 pictures take about 0.03 s to paint; the
  ring's 43 new ones (the slab's and the power-up's) about a quarter of a second the first time, each
  painted the first time it is shown (`lazyFrames`).

## To make it the game's own

With the wordsmith and his ring in (`SMITH3`), turn `QUEST3.on` on and have the rules set its fields as
above; or fold them into the rules' own state and drop the switch from `townscene.ts`, `render.ts` and
`hud.ts`. `__dbg.quest3({ on: true, dark: true, carried: true })` and then `__dbg.quest3({ give: true })`
show it in a playtest.
