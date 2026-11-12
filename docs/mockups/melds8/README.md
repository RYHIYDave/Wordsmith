# The eight new melds: their stones, colours and looks at work

Siphon, Cauterize, Forking, Shiver, Sunder, Fervor, Rime Ward and Implode: the melds across the groups he took on 8 Nov 2026
(the main chat's draft, “Yes, draft 6–8 (Recommended)”; of the eight drafted he took all eight). Their rules are the main chat's,
on its branch `melds8` (game/melds8.ts, behind MELDS8, off). This is how each LOOKS, on the branch `art/melds8-looks` (from main
d39dcde, 25.3.13), in `src/render/melds8.ts`, behind `MELDS8_LOOK`, **off**: with it off nothing of it is drawn, lit, ticked or
read, and the game is as it was.

The queue's item (the art chat's, 10 Nov): “Each needs a rune, its colours and how it looks at work. He sees stills, then a film,
before they go live.” Pulled by the queue chat of 12 Nov at his word, 16:1x Eastern, asked by pop-up whether to start it: “Yes,
start it (Recommended)”.

## 1. Their stones and colours: HIS YES

`pictures/1_stones_and_colours.png` (tools/melds8_stones.ts, tools/melds8_sheet.py): each stone as the game cuts a melded word's
(art/icons.ts runeSprite: its two words' colours along its foot), its two words' own stones beside it, its six colours. Asked by
pop-up, 12 Nov, “are the eight new melds' rune stones and colours right?”, with what each will look like at work in a line each,
his pick: **“Yes, draw them at work (Recommended)”**.

| Meld | Words | Its colour | Its rune | Nearest other colour (CIEDE2000) |
| --- | --- | --- | --- | --- |
| Siphon | Leech + Poison | `#008c05` venom green, its glow a leech's red | a drop of venom drawn up into a mouth | Blight 14.1 |
| Cauterize | Leech + Fire | `#d08460` seared copper | a branding iron, red-hot, its flame | Frenzied 12.2 |
| Forking | Twin + Lightning | `#f0ffc0` the fork's white, the twins' sea-green below | a bolt forking in two, both ends lit | Lightning 14.8 |
| Shiver | Precise + Frost | `#8c9cc8` cold steel-blue | a cold star in the cross-hairs | Hexing 12.7 |
| Sunder | Heavy + Power | `#8c5f5f` rusted iron, its crack burning | a block of iron split, its crack burning | Lasting 15.4 |
| Fervor | Frenzied + Fire | `#fcb490` the peach-white of a fire burning hotter | a fire climbing higher | Leech 14.0 |
| Rime Ward | Guarding + Frost | `#0f825a` sea-green under rime | a shield, frost on its face | Reaping, Guarding 13.6 |
| Implode | Pulling + Volatile | `#7800f0` a void's violet | everything drawn into one point | Shatter 14.0 |

Every one at least 12 from every colour a word already shows (the 28 words, the ten melds, Volatile's five, Binding), the friend's
cyan and the enemy's pink and gold, as the eye sees colour (the check of words10's test; `npx tsx tools/melds8_palette.ts`), and
from each other (the nearest two, Cauterize and Fervor, 13.1); none of their tones cyan or pink. The warm colours were full
(fire, Frenzied, Leech, Eruption, Powderkeg, Lasting), so Cauterize is a copper darker than all of them and Fervor the peach-white
of fire burning hotter; four first tries (an olive Siphon, a dark brown Sunder, a pine Rime Ward, a dull violet Implode) all but
vanished on the stone's grey and were brightened before he saw them.

## 2. Their looks at work

Each is called up by the moment the rules say happened: an event `{ t: 'meld8', id, ... }` (render/melds8.ts `M8Event`), handled
by the effects (render/fx.ts `melds8`, an `M8Fx`), drawn from where things are and the time since. `k` is how strongly: 1 in
front, the rules' MELD8_TUNE.behind (0.5) behind, smaller and fewer. Every number in `M8_LOOK`.

- **Siphon** (each tick of his poison that heals him: `on` the poisoned one): venom squeezed out of it, beads drawn off in an arc
  that turn from venom green to a leech's red as they fly, a thin thread between, a red pulse and a plus of life on him as they land.
- **Cauterize** (a burning one killed: `x`, `y`): a white-hot flash, its fire torn off it in a spiral and thrown at him as a ribbon,
  and the brand: its rune stamped over him in fire, a ring of copper flame closing on him, steam hissing off him; a scorch where it fell.
- **Forking** (a hit's arc: `x`, `y` to `x1`, `y1`): a jagged bolt jumping from the one struck to the other, made anew every other
  frame, forking near its end (a prong to the floor), sparks at both ends, the twins' sea-green after-image a moment.
- **Shiver** (a critical hit that freezes: `on`): cross-hairs snapping shut on it, a white crack of light, a star of ice needles
  shot out over the floor from its feet with crystals standing on them, shards thrown up, a shiver of cold lines, mist.
- **Sunder** (`on` one stunned by a Sunder hit, `secs`): the blow's dust ring, a crack split across the floor under it and up its
  front, burning red, embers off it while the stun lasts, cooling after; `what: 'hit'`, a blow on it then: the crack flares, chips fly.
- **Fervor** (a kill: `x`, `y`; `n` of `most`, `secs`): the kill's embers streaming to him; flames round his feet as long as it
  lasts, more and higher with each kill, embers rising off him, a ring of heat on the floor; at its most a burst of flame.
- **Rime Ward** (a blow he blocked: `on` its maker, chilled `secs`): a pane of rime flashing up between them, cracking and blown at
  it as shards, rime crusting on it and cold mist off it while it is chilled.
- **Implode** (a hit that will burst: `x`, `y`, pulling from `reach`, bursting `r` round after `wait`): a vortex on the floor, its
  ring closing, three arms turning in, dust dragged in along them, those in reach streaked toward its heart, a dark point swelling;
  then the burst: a white point, rays, a column of light, a violet shock ring out to `r`, shards, a star scorched on the floor.

### HIS YES

`pictures/2_melds8_at_work.mp4` (39 s: each meld in turn, in front and then behind, in the practice room beside the Warrior; its
name and two words in a corner) and `pictures/2_melds8_stills.png` (one moment of each), made by
`tools/scenarios/melds8_looks.mjs` (LOOK=<meld>) and `tools/melds8_film.py`. Asked by pop-up, 12 Nov, whether the eight looks
are right (each told in a line: the page does by hand what the rules will), his pick: **“Yes, hand them to main
(Recommended)”**, offered as: they go on the ship list, and the main chat puts them live with their rules.

### Checked

- `tests/melds8_look.test.ts` (new), 4 of 4: off, nothing is taken, ticked or drawn; their colours as above; their runes 7 by 7,
  each its own; on, each draws at its moment, on whole pixels, and is gone after.
- tsc clean; all eight filmed clean from a built page (`node tools/build_to.mjs dist/melds8_looks.html`).
- NOT CHECKED: with their rules (they are on the branch melds8, older than main), on his phone.

### For the main chat, as the eight are brought in (put-eight-new-melds-live)

- The rules send `{ t: 'meld8', id, ... }` at each moment (the fields above); `isM8Event`. Their stones: main.ts
  `useMeldArt(art, M8_RAMP, M8_GLYPH, MELD8_IDS)` once the eight are among the game's words (their ids are the same).
- Forking's rules already send the game's `arc`, Implode's a `burst` (style 'shock') as it goes off: with the switch on, those of
  the eight are drawn here, so leave them out or swallow them (Implode's look draws its own burst at `wait`).
- Sunder's `what: 'hit'` is a look of its own: send it on each blow that lands on one sundered while it is stunned.
- The page that films them: `tools/scenarios/melds8_looks.mjs` (LOOK=<meld>; it does by hand what the rules will).
