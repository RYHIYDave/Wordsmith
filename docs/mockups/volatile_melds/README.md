# The five Volatile melds at work: Demolition, Powderkeg, Shatter, Chain Reaction, Rupture

A mock-up on `mockup/volatile-melds` (from v23 at 802fd5e), behind `VOLATILE3` in
`src/render/volatile3.ts`, **off**. With it off nothing of it is drawn or called, and the game is as it was.
Their rules are the main chat's.

## His words

To the main chat, 21 Oct 2026 (Pacific): 19:29, “Can you also add the volatile melds”; 19:30, “We have
info on them but I’d like them to be in the game”; asked who should draw their looks, by 19:31, “The art
chat (Recommended)”. To the art chat, 19:31: “I’ll need animations for the volatile melds I’m adding to
the damage melds”. Read as: the five melds of Volatile on his page "Wordsmith: Word Combinations" (left
out on 13 Oct by his pick “Only damage words meld”), each with a rune stone and a colour of its own and
its look at work, in front and behind, drawn as the other ten are (render/melds3.ts), big and wild by
his art rulebook.

Shown the sheet of their rune stones and colours and a film of each (in front, then behind), and asked
“Are the five Volatile melds right as shown: their rune stones, colours and animations?”, by 20:35:
“Yes, send to main (Recommended)”, offered as: the main chat puts them in with their rules, behind a
switch, and tells him when they are live.

Once the city's four words were in the game (23.8), Shatter's violet (`#7c7cf0`) was near the same colour as
Pulling and Chain Reaction's lilac (`#e8b8ff`) as Splitting (the main chat's board post of 22 Oct, 01:43
Eastern). Shown the two new colours (a sheet of each stone as it was and as it is now, beside the word it
had come too near and the enemy's pink) and a film of each in them, and asked “Are Shatter (sapphire ice)
and Chain Reaction (magenta lightning) right in their new colours?”, by 00:14 Pacific, 22 Oct: “Yes, send
to main (Recommended)”, offered as: the main chat puts the two new colours in with the other three and
tells him when they are live.

## What each looks like

Every one is an explosion, and Volatile's violet crackle runs through all of them; it pops again a
moment after, as Volatile does.

- **DEMOLITION** (Power + Volatile), dust lavender. *In front:* the kill's blast is the biggest of all: a
  dome of white light swelling over the floor and hollowing out into a ring of dust, a shockwave racing
  out, flagstones and rubble thrown high and coming down hard, red-hot sparks (Power's red), a mushroom of
  dust standing up, a crater left with red-hot cracks cooling; everything near jolts away from it.
  *An elite or boss at half life:* light bursts out of it in rays and straight up, then the blast, bigger
  still. *Behind:* ONE HUGE RUNE: a great double ring with a square set in it, the floor inside cracking
  out from its heart as its time runs down, ten charges round its rim lit one after another like a fuse,
  dust trickling up; then a pillar of light and the biggest blast there is, every charge going up with it.
- **POWDERKEG** (Flame + Volatile), black-powder red. *In front:* a fireball, white at its heart, gold,
  orange and red, violet flickering at its edge, rising as it swells and rolling over into black smoke;
  burning pieces of the keg thrown out that land and burn; the powder spitting sparks; little blasts
  popping round it after. *The blast setting others burning:* a burning piece flies at each and bursts into
  flame on it. *Behind:* a ring of black powder with a fuse burning round it, the spark running from the
  top round to where it began, the keg's sigil glowing hotter as it comes round; then the fireball, a
  column of smoke and fire, and BURNING GROUND: scorched black, its cracks glowing, flames on it, and the
  powder in it popping, orange and violet.
- **SHATTER** (Frost + Volatile), sapphire ice (`#2054fc`; until 21 Oct violet ice, `#7c7cf0`, too near Pulling). *In front:* the frozen one bursts: a white flash, spears of
  ice racing out over the floor, shards flung every way, chunks of ice coming down, a star of frost left.
  *Shards hitting those around it:* a long shard flies straight at each and bursts on it. *Behind:* a
  six-pointed star of ice; it FREEZES WHAT IS NEAR: a sheet of ice sweeps out over the floor, crystals
  standing up out of it, what it reaches frozen (the game's own frozen look) and lit white; cracks run
  through it, it beats white; then ICE SPIKES burst up out of the floor all over it, stand a moment and
  break into shards, and the burst.
- **CHAIN REACTION** (Lightning + Volatile), magenta lightning, its sparks violet-white (`#fc00f8`; until 21 Oct
  lilac, `#e8b8ff`, its sparks lightning's yellow-white, too near Splitting). *In front:* an
  explosion of lightning: a ball of bolts bursting out over the floor, crackling, cracking twice.
  *Arcs to the nearest:* thick forking bolts racing out to each, striking with a crack; what they strike
  crackles; those they kill go off in turn. *Behind:* a ring with a bolt across it; between runes in reach,
  a crackling line over the floor, a spark running along it. One going off: a bolt out of the sky onto it,
  its blast, and a bolt racing along its link to the next, which goes off in turn, and so on.
- **RUPTURE** (Poison + Volatile), plum, the poison inside it bile-green. *In front:* the poisoned one
  bursts like a sac: a wet violet pop, a gout of bile flung high, globs coming down and splashing where they
  land, a breath of sick gas, bubbles. *Splashing those around:* a glob flies onto each and splashes over
  it. *Behind:* a blister on the floor, swelling, glossy, veined, trembling as its time runs out; it bursts,
  and a POISON CLOUD boils up: puffs of plum and bile gas turning slowly over a slick, thin round the hero.

## For the main chat: what the looks need from the rules

The looks take only where, how big and how far along. `eventsV3(g.events, g, fx)` (main.ts, while
`VOLATILE3.on`, already hooked) reads the frame's events:

- **A kill's explosion:** a `'burst'` (style `'blast'`) with `meld` one of the five. Its `r` is the blast's
  reach (the film used 1.8; Demolition's 2.4, bigger as his page says).
- **A rune going off:** a `'burst'` (style `'ruin'`) with `meld`.
- **A rune or patch laid:** the zone carrying `meld` (or `look`, or the word in `words`): a `'rune'` of any
  of the five; Powderkeg's burning ground a `'burn'`; Rupture's cloud a `'venom'`. `floorV3`/`airV3` draw
  them and the renderer leaves them out (`ownsZoneV3`). A rune's countdown is drawn from its `t` of `dur`.
- **Their own moments,** one new event kind, `'volFx'` (the type `VolFx` in volatile3.ts; add it to
  `GameEvent`), `what` saying which:
  - `'half'` (id, x, y, r): Demolition: an elite or boss goes off at half life;
  - `'catch'` (id, x0, y0, x1, y1): Powderkeg's blast at (x0, y0) sets monster `id` at (x1, y1) burning (the
    burning piece lands in 0.12 s + 0.06 s a tile: set it burning then, or at once);
  - `'shard'` (id, x0, y0, x1, y1): Shatter's shard from the burst to one near it (lands in 0.06 s + 0.035 s a tile);
  - `'freeze'` (x, y, r, ids): Shatter's rune freezing what is near;
  - `'arc'` (id, x0, y0, x1, y1): Chain Reaction's arc to one near (it strikes in 0.05 s + 0.012 s a tile:
    one it kills should go off a little after that);
  - `'link'` (x0, y0, x1, y1): a Chain Reaction rune going off setting off the next;
  - `'splash'` (id, x0, y0, x1, y1): Rupture's poison splashed on one near (lands in 0.16 s + 0.06 s a tile).
- **A hit carrying one of them:** the `'hit'` event's `words` with the meld's id in it (its look, `hitV3`).
- **fx.ts** leaves a burst of the five to these looks (`ownsEventV3`, hooked). As for the ten, a hit with
  one of them should not also draw Volatile's and its element's own marks (`meldLookWords` in melds3.ts
  goes by `MELD_OF`: give it the five too).

THE IDS used here: `demolition`, `powderkeg`, `shatter`, `chainreaction`, `rupture` (`VMELD_IDS`). If yours
differ, the five strings in `VMELD_IDS` and the keys of the tables are all that change.

WHAT THE PICTURES WANT OF THE TIMINGS (`VRUNE`): Demolition's rune waits 2.4 s (slow, as his page says);
Powderkeg's 1.4 (the fuse's run round the ring); Shatter's 1.4, freezing what is near at 0.4 of it;
Chain Reaction's 1.2, linked runes going off 0.12 s apart, in reach 6 tiles (the link drawn to every one
of its kind in that reach); Rupture's 1.3. Powderkeg's burning ground and Rupture's cloud as long as the
rules like (the films: 4 s).

THEIR STONES: `vmeldRune(word, colourOf)` paints one as the others are cut, its two words' colours along
its foot; `VMELD_COLOR`/`VMELD_GLOW` for their names (WORD_COLOR / WORD_HUE / WORD_GLOW), as
`useMeldArt` does for the ten.

THE PLAYTEST'S HANDS (`__dbg.volatile3`, main.ts): with no rules yet the films do by hand what the rules
will (`carry`, `prime`, `rules`, `lay`): nothing of it runs unless a playtest calls it.

## How it was made and checked

- `tools/scenarios/volatile_looks.mjs`: each of the five in the practice room, in front then behind, a
  picture each thirtieth of a second of the game's own clock; `tools/volatile_films.py` makes the MP4s.
  `src/dev/preview_volatile_runes.ts`: the sheet of stones and colours.
- `tests/volatile3.test.ts` (8): the switch off and every hook behind it; nothing at all with it off; the
  colours (six tones each; each word at least 12 from every other word, the city's four among them, the ten
  melds, Binding, the friend's cyan, runedust, the enemy's pink and gold, as the eye sees colour, CIEDE2000;
  the nearest 12.9, Powderkeg to Power and Rupture to Volatile); nothing glows cyan or pink; the runes 7 by 7, each its own; every blast big, a rune's at least a
  kill's, Demolition's the biggest, within the effects' limit; the twists landing on their targets; the
  runes and patches drawn here and forgotten on a new level.
- Not run: the regression; a real phone; the five with real rules.
