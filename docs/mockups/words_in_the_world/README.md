# Mock-up: words in the world (NOT IN THE GAME)

**What it is.** The letters of a power word, shown on the things that carry it, so that wordsmithing
is seen in the world and not only in the menus. Three parts, each compared by eye with the game as it
is:

- **A monster that has a word** (an elite, a guardian, the Warden): the dotted ring on the floor under
  it is WRITTEN IN ITS WORD instead, the word round and round it, turning slowly, reading left to right
  along the side toward the eye (the far side reads backwards, dimmer, mostly behind the monster).
- **The hero's weapon with a word burned into it:** the word's letters rise off the blade (or a
  crystal's light, or the figure's middle) one after another, in a column that reads from the top
  down; the whole word holds a moment, fades together (so that only the whole word is ever read), and
  is spelled again after a pause.
- **A word carved in a wall**, where a tapestry of the decorations would hang: cut into the stone
  (`plain`: dark cuts, the stone under each catching the light), or cut and lit from inside in the
  word's colour (`glow`). The words short enough to cut across two blocks in the game's normal letter
  (`CARVED_WORDS`); which one by the spot's own dice (its `variant`).

The art chat made it on 8 Oct 2026, on the branch `mockup/words-in-world`, ON TOP OF `mockup/decorations`
(the decorations he said yes to at 08:55; the carvings hang where they hang). Every letter is the game's
own (`engine/font.ts`).

**EVERYTHING OF IT IS BEHIND ONE SWITCH, AND IT IS OFF:** `WORDS_LOOK.on` in `src/render/words_world.ts`.
With it off nothing of this is drawn and the game is the decorations branch's.

## His words it answers

- 8 Oct 2026, 07:49, asked "Wordsmithing is the heart of the game. Should letters show in the world
  itself?" (Everywhere / Only where a word works / Menus only), he answered at 07:56: "Somewhere between
  1 and 2".
- From that, the art rulebook (branch `art/rulebook`, `docs/art/RULEBOOK.md`, "Words in the world"),
  which he approved at 08:23: a word shows its letters (gear with a word burned into it, and a monster
  carrying one, show glowing letters in that word's colour); carved words as landmarks, rare enough to
  notice; the game's own letter; the words win.
- 08:58, asked what the art chat should take up next: "Words in the world (Recommended)".

## Tried and dropped before anything was shown to him

- Letters sparking up off a monster's ring: they crossed its legs and read as noise.
- The word laid along the blade: on most frames the blade is too short on the screen for a word, and
  the letters ran together.
- The first letter of the word, big, on the blade: it read as a label stuck on the sword.
- A ring of letters as tight as today's dotted ring: the letters crowded the feet and read as noise.
  It is now at least 0.85 of a tile out.

## What is in the code (every piece is marked MOCK-UP)

- `src/render/words_world.ts` (new): THE SWITCH, `WORDS_LOOK = { on: false, monster: 'ring', gear: 'rise',
  carved: 'plain' }`; `letterRing` (the ring of letters: laid out evenly round the oval as the eye sees
  it, turning slowly); `LetterSparks` (the rising word: spelled a letter at a time at 2.2 letters a second,
  rising 13 game pixels a second, the whole word holding 0.7 s and fading in 0.5 s, the next spelling 1.2 s
  after).
- `src/art/carving.ts` (new): `makeCarving` (a word cut in the wall's plane, in a cut frame, as a tapestry is
  painted: `Flat`, strips a quarter of a tile wide), `CARVED_WORDS`, `makeCarvingArt` (each painted once).
- `src/engine/font.ts`: `glyphRows`, the pixels of a line of text as rows of '#' and '.', at the font's own
  pixels or the screen's grain. A pure addition: nothing else in the font changed.
- `src/render/render.ts`: with the switch on, `standDecor` stands a carving where a tapestry would hang
  (`carved` not 'off'); the elites' rings are drawn by `letterRing` (`monster` 'ring'); after what glows,
  `drawWordsWorld` sends the hero's weapon's first word up off the blade (`gear` 'rise'). The blade's
  lit points are taken from the hero's frame (`Figure.last.lights`); in an attack frame a streak's light
  can come first among them (known; it only moves where the letters start).
- `src/main.ts`: `__dbg.words` (the switch, for the pages that photograph it).
- `tools/scenarios/words_world.mjs` (new): the stills. (`tools/scenarios/words.mjs` is an older, unrelated
  playtest of the words' effects.)
- `docs/mockups/words_in_the_world/close_ups.py`: the close-ups for the sheet.

## How to see it

```
node node_modules/typescript/bin/tsc --noEmit -p tsconfig.json
node tools/build_to.mjs dist/words.html
node tools/playtest.mjs --file dist/words.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/words_world.mjs --out shots/words/c
python3 docs/mockups/words_in_the_world/close_ups.py shots/words/c <out>
python3 tools/sheet_shots.py previews/words_in_the_world.png "Words in the world" "A mock-up, not in the game: a named monster's ring written in its word,|a word rising off a blade that carries one, and a word carved in a wall." \
  "shots/words/c_now.png;1. A room as the game draws it today.;880,30,2146,1005;1" \
  "shots/words/c_ring_rise_plain.png;2. The same room with words in the world, at the size it is on your phone.;880,30,2146,1005;1" \
  "<out>/monster.png;3. A monster carrying a word (here Twin): its ring is written in the word." \
  "<out>/blade.png;4. A weapon with a word burned into it (here Flame): the word rises off the blade, letter by letter, then fades." \
  "<out>/carved.png;5. A word carved in a wall, where a tapestry would hang: cut in the stone, or cut and glowing."
```

The room: run seed 6, Dungeon 2, room 0 (the decorations' room); the hero at (5, 5.5) from its corner,
holding the Iron Greatsword with Flame burned into it; a skeleton made a named Twin Skeleton beside him,
asleep. On the screen x runs down to the right and y down to the left.
