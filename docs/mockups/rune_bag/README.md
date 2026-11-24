# The rune bag and the melding stone (mock-up, for his yes)

His words, to a new Godot cloud chat, the evening of 23 Nov 2026 (Eastern):

> I have a UI issue.  I'm getting to the point where I have too many word runes for just a bag that pops out of the side of
> the inventory screen.  It needs groups, searchability, intuitive design for navigating to the exact rune you are looking
> for.  And probably info about each word if you press and hold on the rune.  Eventually there will be over 300 runes.  Now
> you won't have 1 of each or anything like that but you could have a ton.  In that same vein, the wordsmith UI is pretty
> empty.  I want some pizazz to his inventory.  Especially during the melding process.  Two runes go in, one comes out, you
> know?  They melt into cyan light pour down two tracks to a single empty slot where the new rune forms.  That sort of thing.

How it was read: two screens. (1) The LEXICON that opens over the game's half becomes a real RUNE BAG for hundreds of runes:
groups, a search, sorting, a fast way down the list, and a card for each rune when it is held. (2) The wordsmith's melding
half, today two small boxes and a question mark, becomes his carved stone: two hollows, two channels, one hollow beneath,
and the meld played out on it as he described.

The page: https://claude.ai/artifact/J555pKppZBjxdhpCy9gMBH (this folder's `rune_bag.html`). Drawn as the Godot game draws:
960 x 540, two picture pixels to a game pixel, the game's own letters (src/engine/font.ts) and colours (inventory.gd), and
the real 215 runes the Godot version knows today (28 runes, 23 older melds, 5 Rank II, 143 new melds and 16 level 2 runes),
their names, texts and stones taken from `godot/assets/words` and `godot/assets/loot`. The hero in it is an example: most
base runes, about half the melds, a few left out on purpose so that a meld can be found new (Flame + Frost makes Scald).

## The rune bag

- A RAIL OF GROUPS down its left: ALL, and the Lexicon's own five pages (DAMAGE, STRIKE, TIME, CONTROL, SPOILS: his pick
  of 9 Nov 2026 in the art chat), and MELDS. Each with its count. A Rank II or level 2 rune sits in its rune's group, after it.
- A SEARCH across the top: it finds a rune by its name, by a rune it is made of ("frost" finds Frost, Frostlock, and then
  everything MADE WITH FROST), and by what it does ("burn", "chill"). The rail's counts follow the search.
- SORT: GROUP (sections by group), A-Z, MOST (most held first), NEW (newest first).
- MELDS has a row of the base runes, MADE WITH: press one to see only the melds made with it, press a second to narrow to
  the meld of those two.
- A SCROLL BAR that can be held and drawn down to run through the whole bag at once, with a bubble saying where you are (the
  group, or the letter).
- Every rune a tile: its stone twice the size it is today, its name under it, how many, II on a ranked one, a cyan spark on
  one found since last looked.
- PRESS AND HOLD a rune: a ring of cyan fills round it, then its CARD: the stone large in its light, its name, what kind,
  what it grows with, how many held, what it is made of (each part pressed opens that part's card), and what it does in
  front of a move, behind one, and on a monster (in the enemy's pink). SHOW ITS MELDS on a base rune.
- A rune pressed then a slot, or dragged across to a slot, as today. LATEST RUNES on the gear half keeps the newest at hand.
  The LEXICON button is RUNES, with how many held and how many new.

## The melding stone

- His slab, carved: two hollows above, a channel from each down to one hollow beneath, the six standing stones of his ring
  round that, his runes carved beside the channels. Motes of light rising off it all the time.
- At the wordsmith the bag stands on the other half: a rune pressed goes into the next hollow (or dragged to one); a hollow
  pressed gives its rune back. With one laid in, THE BAG SHOWS WHAT MELDS WITH IT: a meld you know lit, a meld not yet found
  marked ?, a rune that makes nothing dimmed.
- Two laid in that meld: the channels shimmer, the hollow beneath shows the rune to come (faint), or a ? for one not found.
- MELD (3.5 s): the two runes rise, tremble and crack with light; melt into cyan light that pools in their hollows; the light
  pours down the two channels, the carved runes flaring as it passes; the two streams wheel round the hollow beneath, the
  standing stones waking; a flash over the whole stone, a ring thrown out, sparks; the new rune's pixels gather out of the
  light into their places; its name, and A NEW RUNE, FOUND! for one not found before (RANKED UP for two of the same). Pressed,
  it flies across into its place in the bag.

## Not in it

Sounds (the game's own would be used). The gear page is the game's as it is, drawn again for the picture. Nothing here is in
the game until he has seen it and said yes; then it is built in `godot/scripts/inventory.gd` behind a switch.

Pictures: `pictures/`. To build the page again: `node docs/mockups/rune_bag/build.mjs`.
