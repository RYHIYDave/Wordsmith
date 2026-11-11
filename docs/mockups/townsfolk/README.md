# THE TOWNSFOLK REDRAWN, AT THIRTY A SECOND (PICTURES FIRST; NOT IN THE GAME)

Branch `art/townsfolk`, from `main` at 797f2e4 (25.3.1). The Wordsmith Queue's item `redraw-townsfolk-30fps`, pulled by the
townsfolk chat on 11 Nov 2026. Everything is behind one switch, `TOWNSFOLK3` (`src/art/townsfolk3.ts`), OFF: with it off the
game is exactly as it was.

## His words

- 8 Nov 2026, 06:25: “And I think the townsfolk need look update and a 30fps makeover”.
- His rule to the art chat the same morning, “Yes, everything (Recommended)”: everything that moves, at 30 a second.
- His measure for new art (9 Nov): the Gate Ward (floor 11) and the Brawler; new art is checked beside them at the game's
  own size, and what is finer is sent back the same as what is rougher.
- HE HAS NOT SEEN THESE YET. The pictures below went to him on 11 Nov; his answer goes here.

## What is drawn

The four as they stand in the live game are of two older kinds: the armourer, the mystic and the stranger are flat rigs of
the first kit (Version 14.4), the wordsmith a body of balls and rods on bones (8 Oct). Beside the Brawler they read as
cut-outs. Each is now SCULPTED as the Brawler is (`src/dev/sculpt.ts`, on the heroes' bones), at his grain and no finer.
WHO EACH IS DOES NOT CHANGE: these are the looks he already knows, made the new way (`src/dev/sculpt_townsfolk.ts`).

- **The armourer**: bald, a great pale beard, a teal shirt with the sleeves rolled, a leather apron (brown leather now, as
  the town's wood and iron went to honest colours with its new look), dark trousers, boots. A barrel of a man, a hero's
  height. His left fist on his hip; the hammer in his right hand, its head up over his shoulder. His eyes are dark (his word
  of the opening's armourer, 25 Oct: “The armorer’s eyes glow for some reason”).
- **The mystic**: the mage's purple robe to the floor, a gold sash knotted in front, gold chains, a red stone on the lower;
  a great pale turban, wound, a red stone at its front, its end down his back; a teal veil with a row of gold coins; his
  eyes two points of light in the turban's shadow, as they have always been; the crystal turning over his open palm.
- **The wordsmith**: THE LOOK HE SAID YES TO ON 8 OCT (“Yes, this is him (Recommended)”), the same body, stance and work
  (`art/smith3.ts` SMITH_BODY, SMITH_STANCE, SMITH_MOVES): the night-blue robe, the teal mantle and its cowl up, the long
  white beard, his eyes and the runes on him burning cyan (down his skirts, round the hem, along the mantle's edge and the
  cowl, in his forearms); cold while his ring is dark.
- **The stranger**: a real lean now: his back on the wall, one leg planted well out, the other bent with its boot flat on
  the wall, arms folded (leather bracers), a long dark cloak, the hood down, two points of gold, a scarf, a gold clasp.

None has an edge of light (Pixels 5: "Townsfolk have none"). EACH IS TRULY TURNED the four ways along the grid, never its
picture flipped: the hammer stays in the hand that holds it. The stranger never leaves his wall; only his eyes go to you.

## How they move (`src/dev/townsfolk_moves.ts`: a pose at every thirtieth of a second)

They stood at ten frames a second and worked at twenty. Each still has a loop to stand in and something done now and then,
which begins and ends on the loop's first frame. Frames are thirtieths of a second.

| who | the loop | what he does now and then | its beats (frame: seconds) |
| --- | --- | --- | --- |
| armourer | 120: breathes from his belly, shifts his weight, looks to his forge and back, hefts the hammer | 72: heaves it up behind his head, holds, brings it down in two frames; sparks; held a tenth of a second; it bounces; he straightens | heave 6; top 18; LANDS 26 (0.87 s); bounce 35; shouldered 60 |
| mystic | 120: sways, his free hand drifting over his wares, the crystal turning and bobbing | 78: sweeps that hand up and round it; it lifts, spins up and blazes; robe and turban's end blown out | lifts 12 (0.4 s); BLAZE 34 (1.13 s); dies 50 |
| wordsmith | 108 (3.6 s, as before) | 90 (3 s, as before): hands up, writes the great rune, gathers it, drives it into the slab | as `art/ring3.ts` has them: nothing moved |
| stranger | 150: breathes, his eyes to one side, back, to the other; a finger taps | 66: his left hand out, a dip, the flick; the coin up over his hood turning six times; he snatches it | FLICK 16 (0.53 s); CAUGHT 46 (1.53 s) |

`TownMoves.beats` in the code has the same numbers. FOR THE SOUND CHAT AND THE MAIN CHAT: the town's sounds play as each act
BEGINS (`render.ts` folkSound, `game/world_sounds.ts` FOLK_SOUND). The anvil's blow now lands 0.87 s into his act (it was
about 0.6 s), the crystal blazes at 1.13 s, the coin leaves at 0.53 s and is caught at 1.53 s; the wordsmith's are as they
were. `anvil`, `crystal` and `coin` want playing at those moments, or cutting to them.

## The pictures (`docs/mockups/townsfolk/pictures/`)

- `armourer_now_and_redrawn.png`, `mystic_now_and_redrawn.png`, `wordsmith_now_and_redrawn.png`,
  `stranger_now_and_redrawn.png`: each as he is now and redrawn, side by side, in the game's own town, the Brawler standing
  by for size, eight screen pixels to a game pixel (1608 x 672: made to be read on a phone held sideways).
- `townsfolk_now_and_redrawn.mp4`: the same two side by side, each doing what he does now and then: 25 s, 30 frames a
  second. The frames are the game's own, made a frame at a time with the town's clock held.

Made with (the page built first: `node tools/build_to.mjs dist/tf_look.html`):

```
for o in 0 1; do OLD=$o MODE=still OUT=<stills>/s CLS=brawler node tools/playtest.mjs --file dist/tf_look.html --touch --size 1126x520 --dpr 4 --scenario tools/scenarios/townsfolk3_film.mjs; done
python3 tools/townsfolk3_pairs.py <stills> docs/mockups/townsfolk/pictures
for o in 0 1; do OLD=$o N=190 FRAMES=<frames> CLS=brawler node tools/playtest.mjs --file dist/tf_look.html --touch --size 1126x520 --dpr 4 --scenario tools/scenarios/townsfolk3_film.mjs; done
python3 tools/townsfolk3_film.py <frames> docs/mockups/townsfolk/pictures/townsfolk_now_and_redrawn.mp4
```

(1126 x 520 gives the game's 563 x 260 picture two whole screen pixels a game pixel; 844 x 390 gives 1.5, and uneven
pixels. The scenario lights the wordsmith's ring, `__dbg.quest3({ dark: false })`: a new hero's town has it dark, his runes
cold and his work waiting.)

## For the main chat: how it comes in (ONLY ON HIS YES)

- `src/art/townsfolk3.ts`: `TOWNSFOLK3 = { on: false }`; `makeTownsfolk3()` gives the town its four (a `Townsman` each, as
  before); `makeSmithDark3()` the wordsmith while his ring is dark. `TOWNSFOLK3_HEAVY` leaves their frames to the side
  painter (on, as the game needs) or paints each when asked (off: the pictures).
- Three of the game's files are touched, each a few lines, each the same as before with the switch off:
  `src/art/townsfolk.ts` (a `Townsman` may say its own `fps` and `actFps`; `townFrame` and `actAt` go by them, ten and
  twenty when not given; `makeTownsfolk` gives the sculpted four when the switch is on), `src/art/townscene.ts`
  (`folkActLong` by the act's own fps; the sculpted wordsmith's dark frames), `src/main.ts` (`__dbg.townsfolk3(on, heavy)`,
  and `__dbg.clockBy(dt)`, which puts the town's clock on by hand for a film made a frame at a time).
- THEIR FRAMES ARE HEAVY: a tenth to a third of a second each to paint, and there are about 2,580 of them (armourer 553,
  mystic 559, wordsmith 523 and 432 more with his ring dark, stranger 517: each loop four ways, the act one way). THEY WANT
  BAKING TO FILES, as the heroes' are (`tools/bake_heroes.mjs`), which is also what his “Still a ton of lag in the town”
  asks of the townsfolk (the queue's `fix-town-lag-on-phone`: "the townsfolk's frames painted before they are first
  shown"). Not done here: the bake is the main chat's. The turned loops could be baked at fewer frames if the size asks it.
- Tests: `tests/townsfolk3.test.ts` (7: the switch off; thirty a second; an act begins and ends as the loop begins and the
  loop comes round; the blow's wind-up, its two frames onto the anvil's face, its sparks and bounce, his feet planted; the
  crystal and the coin; painted on the floor, inside the canvas, no edge of light, the wordsmith's runes burning and cold;
  truly turned, the stranger on his wall). `tests/townart.test.ts`, `smith3.test.ts` and `town.test.ts` pass as before.

## Not settled

- His yes to the looks and to how they move.
- Whether the old kit rigs go once these are live (`art/townsfolk.ts` armourer, mystic, stranger; `art/smith3.ts`'s painter):
  the title screen and the opening have their own pictures of these people, untouched here.
