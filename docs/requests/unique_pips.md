# A unique item's pips: one for each of its lines (built, his picks)

The Pips chat, a chat of his working from the queue (item `match-unique-pips-to-its-mods`), 12 Nov 2026. Branch
`build/unique-pips`, cut from main 10161fca (25.3.10). Main untouched; nothing published.

## What he said

- 11 Nov 2026, to the Uniques in-play chat, shown a unique's card and four orange pips under it in the bag: “I think it just has
  pips equal to the number of mods it has”.
- 12 Nov 2026, to this chat, by pop-up, after two pictures (below: A, our pick, a pip for each stat and each thing it does, stats
  blue and powers orange; B, its stats only; C, every line, its price too; D, A all orange):
  - which lines get a pip: “Every line, price too”;
  - their colour: “All orange”.

## What is built

- `src/ui/panels.ts`: `UNIQUE_PIPS` (`count: 'lines'`, `colour: 'orange'`, `free: false`: his picks) and `uniquePips(it)`. A
  unique shows one orange pip for each of its ordinary stats, each special modifier and its price, left to right as its card reads,
  and NO dim free places (it takes no word, and a dim place says “room for a word”). `drawItemPips` draws only those for a unique;
  an ordinary piece is as it was (blue for each affix, a word's colour for each word, dim for the rest).
- `src/game/uniques.ts`: `UniqueDef.powers` and `uniquePowers(d)`: how many special modifiers it has, one unless set. Only The
  Warden's Keys has two (the doors, the chests). Not the count of its card's orange lines: Bloodprice's second line (“Kills still
  refill them.”) only says how its one works.
- What it comes to: at most four, so never more than the four places (two stats, and two powers or one and a price). The Mask 1,
  Broken Shackles 3, the Drowned Arm 3, the Censor's Seal 4, Bloodprice 4, the Warden's Keys 4.
- Behind `UNIQUES` with the rest of them: nothing shows it while uniques are off. The other ways stay, one word each
  (`count: 'all' | 'stats'`, `colour: 'split'`), for pictures; `__dbg.uniquePips` sets them on a test page.

## Pictures

`docs/requests/unique_pips/`: `unique_pips_1_our_pick.png` and `unique_pips_2_other_ways.png` (what he was shown before his
picks), `unique_pips_3_your_pick.png` (his picks, as built; not sent him again: it is the D row with the price's pip). Made by
`tools/scenarios/unique_pips_look.mjs` (the practice room's Warrior, six uniques and two magic pieces in his bag; one shot of the
bag for each way, `UNIQUE_PIPS_WAYS=lines/orange,...`, and the Censor's Seal's card).

## Checked

- `tsc --noEmit` clean.
- `tests/unique_pips.test.ts` (new, 4): his picks are the ones set; every one of the 62 shows stats + powers + price pips, all
  orange, at most four, and only those drawn; the five he was shown count as shown; an ordinary piece is as it was.
- The scenario above on a page of the branch (`node tools/build_to.mjs dist/unique_pips.html`; `--size 960x540 --dpr 3`):
  finished clean; the bag looked at.

## For the main chat

Merge it (nothing to bake, nothing to switch on: uniques are off). It touches `drawItemPips` (the bag, the stash, the vendor,
on the hero), `uniques.ts` (one field, one function) and one line of `__dbg` in `main.ts`. When uniques go live, this goes with
them; it needs no picture again (his picks were made from pictures).
