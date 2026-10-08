# Mock-up: the new words at work (NOT IN THE GAME)

**What it is.** How the eight new words LOOK at work, in front (on the hit) and behind (what is
left), drawn by the art chat for the owner to see before anything goes in: their colours, their
rune stones, and moving pictures of each in the game at a phone's size. Their RULES are the words
chat's to write (the note `docs/requests/new_words_art.md`); this is only the picture of them,
behind a switch that is off (`WORDS3.on` in `src/render/words3.ts`). With it off the game draws
exactly as before.

**State of this branch (`art/new-words`), 8 Oct 2026:** on `main` as it was at 10:41
(`17adc5d`). **HE HAS SAID YES (13:15) TO THE LOOKS OF THE FIRST FOUR, PULLING, HEAVY, HEXING AND
FRENZIED, AND TO THE COLOURS AND RUNE STONES OF ALL EIGHT.** The other four (Splitting, Precise,
Stilling, Guarding) are being drawn now, the same way, and come to him as pictures first.

## His words

- 11:26: "I’ve tasked the other agent to adding new words.  Can you communicate with the other
  agent for which words are being added and get some animations going?"
- 12:15: "Can you give a list of words and I’ll pick 4"; 12:17: "From our list of words ideas".
  He was sent the 27 words he marked Keep on his words page and a pop-up of 16 in four groups,
  and at 12:26 picked two in every group: "Pulling (Recommended),Splitting"; "Heavy
  (Recommended),Precise"; "Hexing (Recommended),Stilling"; "Frenzied (Recommended),Guarding".
  12:27: "Let the other agent know which words I’ve chosen and to add them to the game."
- 13:08 he was sent four moving pictures (`pulling.gif`, `heavy.gif`, `hexing.gif`,
  `frenzied.gif`) and the rune stones of all seventeen words (`runes.png`), with a pop-up of two
  questions. His answers, 13:15: "Do these four looks go in when their words do (pulling.gif,
  heavy.gif, hexing.gif, frenzied.gif)?": **"Yes, all four (Recommended)"**; "Do the colours and
  rune stones of the eight new words work (runes.png)?": **"Yes (Recommended)"**.
- What each word does, from his words page, and his comments on Precise, Heavy and Frenzied:
  `docs/requests/new_words_art.md`.

## The looks he said yes to

- **PULLING** (`#7a76e0`, violet-blue). In front, on the hit: a ring of the word's colour closes on
  the point, brightening as it closes; streaks fly in to it from all round; the middle goes dark
  for an instant and lets go with a pale flash; what it hits is hauled in (the rules move them; the
  picture adds lines of their going and dust where their feet scrape). Behind: THE VORTEX, a stain
  on the floor darkest in its middle, three dashed arms that wind in and turn, the dashes running
  inward, a pale lip round the dark well, and dust drawn in along the arms in the air.
- **HEAVY** (`#ac8753`, bronze). In front: EVERYTHING HOLDS FOR A TENTH OF A SECOND (the art
  rulebook's Movement 7, which he chose that morning), a squat bronze flash low on the floor, a
  bronze ring of shock and a wider ring of dust after it, then dust bursts out as the hold lets go,
  stone is thrown up, short cracks open, the screen kicks. THE STUN: three bronze sparks going round
  over the head, above the bar of its life, the near ones bright, the far ones dim; the stunned
  figure sways a pixel each way. THE STAGGER: the figure knocked back 7 game pixels in a blink,
  off balance a moment (it dips a pixel), and back slowly. Behind: THE CRACKED GROUND, spokes of
  cracks from the middle with breaks across them like a crater, two pixels wide near the middle,
  dark, with bronze light down in them (white-hot as they open, then breathing slowly), the lifted
  edge of each slab catching the light from the upper left, slabs a shade lighter or darker, grit
  about; what walks into it is staggered and kicks up grit.
- **HEXING** (`#b8b4c8`, ash). In front: six small signs close in round the struck and the curse
  hangs over its head as the word's own rune (an eye that weeps a hook), ash with a pale eye and a
  dark edge, bobbing; the cursed is drained grey; every hit on it makes the sign flare white and
  throw off a ring of ash. Behind: THE HEX CIRCLE, written round as it is cast: a bright ring and an
  inner one, eight small signs between them turning slowly, four hooks inside turning the other
  way, a cold shadow over the floor, ash sinking in it, and whatever stands in it drained grey.
- **FRENZIED** (`#ff5c33`, blood orange). In front, at every use: a ring beats out from the hero's
  feet and sparks are thrown back; THE RING OF FIVE at the feet lights one more segment (the newest
  flashes white) and turns faster the more are lit; from three the hero shivers in the word's
  colour (two copies a pixel or two to either side); at five, heat rises off them. Behind: a kill
  sends a spark of it leaping from the fallen to the hero, and the frenzy is kept going.
- **THE RUNES** (`runes.png`): each word's glyph cut in a rune stone as the nine are
  (`NEW_GLYPH`): Pulling a whirl drawn in to its middle, Splitting one stroke forking into three,
  Heavy a weight with a ring to lift it by, Precise the sight of a bow, Hexing an eye that weeps a
  hook, Stilling an hourglass, Frenzied claw marks, Guarding a shield.
- **THE COLOURS** (`NEW_RAMP`, six tones each, the word's own at index 3, its glow at 4): picked so
  that, as the eye sees colour (CIEDE2000), no two of the seventeen words are closer than today's
  closest two (Swift and Poison), and none is near the friend's cyan or the enemy's pink and gold.
  Hexing's was made paler (`#a89cb4` to `#b8b4c8`) before he saw them, so that its rune shows on
  the grey stone.

## In the code

- `src/render/words3.ts`: everything. `WORDS3 = { on: false }`. The colours and glyphs. The
  looks, as functions that take only where, how big and how far along: in front `pullHit`,
  `heavyHit`, `hexHit` (and `hexFlare`), `frenzyHit` (and `frenzyFed`); behind `vortex`,
  `crackedGround`, `hexCircle`; on monsters `stun`, `stagger`. What they leave lives in `W3`;
  `tick3` ages it. The drawing: `floor3` (with the floor), `shift3` (a monster's picture moved by
  a stagger or a stun), `tint3` (the cursed and the hexed drained grey), `heroCopies3` (the
  frenzy's shiver), `air3` (what glows over the dark), `lights3` (the light they give). At the
  foot, THE DEMO (`demoEvents3`, `demo3`): the playtest's hands, which also do the rules' share by
  hand (drag, stun, curse, stagger).
- `src/render/render.ts`: seven hooks, each behind `WORDS3.on` (a test checks it).
- `src/main.ts`: `__dbg.words3 = demo3(...)`, for the playtest. It touches nothing until a
  playtest calls `listen()`.

## How to see it

```
node tools/build_to.mjs dist/w3.html
WORD=pulling node tools/playtest.mjs --file dist/w3.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/words3.mjs --out shots/w3/pulling
   (WORD = pulling | heavy | hexing | frenzied; OFF=1 for the same with the switch off)
python3 tools/words3_films.py shots/w3 previews/new_words      (the four moving pictures he saw)
python3 tools/words3_runes.py previews/new_words/runes.png     (the rune stones)
```

The playtest stands monsters in the practice room, throws the switch for its page only, sets the
word on the hero's attacks (`W3.front`), makes the hero attack, and lays what is left behind by
hand at set moments; a frame every thirtieth of a second of the game's time. Film one at a time:
three at once fall seconds behind.

## FOR THE MAIN CHAT: bringing it in, when the words chat's rules are in

1. The colours and glyphs into the four tables keyed by `WordId` (`WORD_COLOR`, `WORD_GLOW`,
   `GLYPH` in `src/art/icons.ts`; `WORD_HUE` in `src/render/fx.ts`) from `NEW_RAMP[w][3]`,
   `NEW_RAMP[w][4]` and `NEW_GLYPH`.
2. Call the looks from the words' events (`Fx.handle`): a hit with Pulling, Heavy or Hexing in
   front, `pullHit` / `heavyHit` / `hexHit` (and `hexFlare` for any hit on a cursed monster); each
   use of an ability with Frenzied in front, `frenzyHit`, and a kill by one with it behind,
   `frenzyFed`; what the words leave behind, `vortex` / `crackedGround` / `hexCircle` with the zone's
   place, size and time. Stun, stagger and the curse are the rules' state: feed `stun`, `stagger`
   and the curse's time from it (or read the monster's own fields in `shift3` / `tint3`). Then
   drop the demo (`demoEvents3`, `demo3`, `__dbg.words3`) and the switch.
3. Heavy's hold sets `fx.freeze` itself; route it through `Fx.hold` (which keeps quick attacks from
   making the game stutter) when it moves into fx.ts. The particles go into `fx.particles` under the
   same limit of 900.
4. The other four words' looks follow on this branch; he sees them first.

## Tested

`tests/words3.test.ts` (14): the switch is off; every call from the renderer is behind it; the
playtest's hands do nothing until used; Heavy's hold of a tenth of a second; the pull closing in;
the stagger and the stun that end; the curse and the circle that drain and end; what is left goes
when its time is up; the frenzy of five and no more; no reserved glow colours; the runes cut as the
nine; the particles within their limit; each look draws, and nothing draws with nothing going on.
`tsc --noEmit` clean; the whole unit suite (see the commit).
