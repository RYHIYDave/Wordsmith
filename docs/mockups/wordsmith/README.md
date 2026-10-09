# Mock-up: THE WORDSMITH ON BONES AND HIS RING (NOT IN THE GAME until the main chat puts it there)

**What it is.** The town's wordsmith made new, built on bones like the heroes, and his ring of runes
made big and wild. Behind a switch that is off: `SMITH3` in `src/art/smith3.ts`. With it off the
town is as it was exactly (tests check it).

**Where:** the branch `art/wordsmith`, from `main` at Version 19.4 (`9e148f3`).

## His words

- 22:41, when the quest item and the runes powering up were to be drawn: "wait on that, cause we
  probably need new art for the wordsmith and the runes around him with the new design rules".
- By 22:45, his brief (the rulebook's questions for a character, each with our pick first): how he
  should feel, "Ancient and mighty (Recommended)"; what you would know him by, "Runes burning on him
  (Recommended)"; his ring when it is powered, "Big and wild (Recommended)"; his size, "A head taller
  (Recommended)".
- 22:46: "id like him on the wire skeleton and all that".
- 22:49: "ill give you the freedom to reimagine his look if you want".
- By 23:09, to `smith.gif` (in the town beside the wordsmith and ring as they are) and
  `smith_close.png` (close up): "Yes, this is him (Recommended)"; and of how wild the ring is, "Just
  right (Recommended)".

## What changes, with the switch on

- **The wordsmith** (`src/art/smith3.ts`): a body of bones (`SMITH_BODY`, 68 tall: the heroes are
  54.5 to 58), painted over them; he turns for real to face whoever comes up to him (the figure is
  turned round on the spot, `turnedBy`, not its picture flipped). Tall and old, a little stooped
  over his slab; a deep night-blue robe to the floor; a teal mantle and cowl (the teal of the fallen
  wordsmith in the first dungeon, `art/body.ts`); a long white beard and heavy white brows; his
  eyes burn cyan. Runes burn on him: down the front of his robe, round its hem, along the edge of
  his mantle and cowl, in his bare forearms and the backs of his hands, and on his brow. They throb
  slowly as he stands and blaze when he works. No staff. Standing, a small rune turns over his open
  right hand. Every 13.85 s (three rounds of his 3.6 s loop, then his work) he raises both hands,
  writes a great rune on the air stroke by stroke, gathers it up over his head and drives it down
  into his slab (3 s). He is a `Townsman` like the rest (`makeSmith3`), so `townFrame` and the
  renderer show him as they did the old one.
- **The ring** (`src/art/ring3.ts`): the six standing stones taller, each with one of his runes
  cut big and burning, light licking up the stone above it and motes rising off its top, a pulse
  going round them stone to stone; the circle in the floor cut wider and burning brighter, his runes
  laid flat in it, two bright arcs chasing each other round throwing sparks; fourteen letters of
  light swirling round inside the ring at every height (`swirlAt`), stood among everything else so
  that he hides the ones behind him; a column of light rising off the slab with runes climbing in
  it. When he drives the rune into the slab (`LANDS`, 2.12 s into his work), the letters, which drew
  in round him as he wrote, burst outward, every stone flares, the circle flashes and the column
  surges (`flareOf`). Turned to someone, he leaves his work, and the ring does not flare for it.
- **The dark ring** is painted too, for the next job (the quest item that powers the runes): each
  stone's `blaze` 0 (its rune cut and cold, no light) and `floorDark`. Not shown yet.
- Everything that glows is the friend's cyan, white at its heart (the rulebook).

## What it touches beyond the art

- `src/art/townsfolk.ts`: `makeTownsfolk` makes him with the switch on; `actAt` says where one of
  the town's people is in what they do now and then (as `townFrame` has it).
- `src/art/town.ts`: `TownProps.ring3`, painted with the switch on.
- `src/art/townscene.ts`: the ring's pictures with the switch on; `smithAct` (where he is in his
  work, -1 while he is turned to someone); `columnSprite`.
- `src/render/render.ts`: `standRing3`, behind the switch: the swirling letters and the column,
  stood among everything else by how near they are, with their light.
- `src/main.ts`: `__dbg.smith3(on)` (switches it and paints the town's people and things again) and
  `__dbg.clock()` (the clock the town's things go by).

## How it is checked

- `tests/smith3.test.ts` (5): the switch off, the town as it was; on, him standing, at his work and
  turned to each side, each side its own picture; a head taller than the heroes, his feet staying
  where they are (less than half a game pixel) whatever he does; his work and the ring keeping time
  (the town shows his act when `actAt` says, the rune goes into the slab at `LANDS`, every stone
  flares, and not while he is turned to someone); the ring's stones, circle, column and letters,
  the letters drawing in as he writes and bursting out as the rune goes in, and every letter of
  light in the friend's cyan or white.
- The films: `node tools/build_to.mjs dist/smith.html`, then
  `node tools/playtest.mjs --file dist/smith.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/smith_look.mjs --out shots/smith/on`
  (and `OFF=1 ... --out shots/smith/off`), then
  `python3 tools/smith_films.py shots/smith/off shots/smith/on previews/smith/smith.gif 2`. Close
  up, without a browser: `npx tsx tools/look/smith.ts <out.png> 4`.
- The cost, timed on a desktop in Node: his 205 frames take 1.7 s to paint, one at a time as they
  are first shown (`lazyFrames`); the ring's take about a third of a second, the same way.

## To make it the game's own

Turn `SMITH3.on` on (or fold `makeSmith3` into `makeTownsfolk` and `makeRing3` into
`makeTownProps`, and drop the switch from `townscene.ts` and `render.ts`). `__dbg.smith3(on)` puts it
in for a playtest.

## Next

The quest item (his job of 20:39 and 20:41, through the main chat): the ring dark until the hero
brings the fallen wordsmith's item; the item put in like a battery; the runes powering up into this.
Pictures first.
