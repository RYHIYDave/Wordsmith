# The loading screen's picture: the wordsmith's ring burning in the dark, behind LOADING_RING (off)

The loading screen chat's branch `art/loading-screen`, from `main` at 797f2e4 (11 Nov 2026). NOTHING OF IT IS SWITCHED ON:
`LOADING_RING.on` (src/art/loading_ring.ts) is false, and with it off the loading screen is as it was (the word LOADING
and three marks lit in turn, on dark ink).

The queue's item “Paint a nicer loading screen” (`paint-loading-screen`, added by the art chat, 10 Nov 2026), pulled by this
chat on 11 Nov 2026 at his word: “Work on this task from the Wordsmith Queue: “Paint a nicer loading screen””.

## What he said

- Of the loading screen as it is, shown its picture (loading_screen.png) on 7 Nov 2026, by 22:55: “Yes, but nicer later”.
- On the art, 9 Nov 2026 (the art chat's notes): he wants “a good level of quality” held and “the little things be better
  instead of just improved paintings”; the Gate Ward (floor 11) and the Brawler are the measure for new art, and what is
  finer is sent back the same as what is rougher.
- HIS ANSWER TO THIS PICTURE: not yet (asked 11 Nov 2026; see the end of this file).

## What it is

Nothing in it is new art. The picture is laid up out of pictures the game has, at the game's own grain: the wordsmith's ring
as art/ring3.ts paints it (the ring made new, big and wild; his “Just right (Recommended)”, 8 Oct 2026), in the vault's
stone (`makeRing3(VAULT)`: as it was first painted, before the castle hall's stone), alone in the dark:

- the circle in the floor burning, its two bright arcs chasing each other round it (ten frames a second, as in town at rest);
- the six standing stones where the ring's stones stand; as the head of an arc comes by a stone it flares (the ring's own
  flaring picture: light licking up the stone, motes off its top), then a pulse, then burning: twice a turn, the four at the
  sides and the two at the back by turns;
- the slab in the middle of the ring, the master rune-stone in it, the column of light over it (at 0.7 of its strength);
- the fourteen letters of light swirling inside the ring (`swirlAt`);
- the word LOADING under it, in the game's letters, as before; the dark round it is the start screen's (#05040f).

A first try painted three new standing stones at the start screen's grain (a game pixel to a pixel). Set beside the Gate
Ward and the Brawler at a phone's size it was rougher than they are, so it was not kept and he was not shown it.

## What is in it

- `src/art/loading_ring.ts`: `LOADING_RING` (the switch); `loadingScene(t)`, what the picture is at a moment, as a plain
  list (the circle's frame; the stones, the slab, the column and the letters from the back to the front); `makeLoadingRing()`,
  which draws that list with the ring's own pictures (engine/px.ts drawSprite, drawLights) and says what it has cost.
- `src/main.ts`: `drawLoading` draws the ring and the word under it while the switch is on, and is as it was while it is off;
  `__dbg.loadingRing` (the switch), `__dbg.loadingRingCost()`, `__dbg.loadingAt(t)` (the loading screen's own time set, for
  pictures and films).
- `tests/loading_ring.test.ts` (7).
- `tools/scenarios/loading_ring_look.mjs`: his pictures, its film, what it costs.

## What it costs

The ring's pictures are painted the first time each is shown: nine for the first frame, then no more than one a frame
(`LOAD_PAINT`), the nearest painted one shown meanwhile; 140 in all, painted once in a run of the game. Measured 11 Nov 2026
with `__dbg.loadingRingCost()`, town to floor 1, 844x390 at 3:

- this machine as it is: the first drawing 13.5 to 25.9 ms; the longest drawing after it 13.9 to 14.5 ms; every picture
  painted and 710 drawings, 332 ms in all;
- the processor slowed six times (`CPU=6`): the first drawing 78.5 to 106.5 ms; the longest after it 46.9 to 79.5 ms; about
  1.4 to 1.5 s in all over the first 132 to 170 drawings. A loading screen after that costs only its drawing.

## Tested

- `tsx --test tests/loading_ring.test.ts`: 7 of 7 (the switch off and only main.ts using it; nothing painted in the file;
  the ring whole at every moment; drawn from the back to the front; at work, each stone flaring twice a turn; the first
  frame not an empty one; it fits its room).
- `tsc --noEmit -p tsconfig.json`: nothing of this branch's. (One error is there on `main` at 797f2e4 too, with TypeScript
  6.0.3: tests/relief.test.ts(378,16), TS7022.)
- In the game, with fingers, `node tools/build_to.mjs dist/loading_ring.html`, then
  `node tools/playtest.mjs --file dist/loading_ring.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/loading_ring_look.mjs --out shots/loading_ring/phone`:
  the screen up as the hero goes down from town, held, photographed at five moments, let go, the hero on floor 1, no errors.
  The same at 960x540, 568x320, 390x844 (turned) and 1366x1024: the ring and the word in the middle of each.
- With the switch off, the game's own `tools/scenarios/floor_loading.mjs` on this branch's page: up within a frame into floor
  1 and into floor 2, gone, no errors.
- Looked at beside the Gate Ward and the Brawler at a phone's size (844x390 at 3): the same grain, as it is the game's own art.
- Not run: the unit suite's core and the release's playtests (the main chat's, as it brings the branch in).

## The pictures sent to him

`previews/loading_ring_new.png` (the screen at its first moment, 844x390 at 3) and `previews/loading_ring_new.mp4` (4.4 s:
the town, the screen for 3.2 s of its own time, floor 1; made with `FILM=96` and ffmpeg). The previews folder is not in the
repository.

## For main when it is switched on

- `LOADING_RING.on = true` in src/art/loading_ring.ts; test 1 of tests/loading_ring.test.ts then says on.
- The first drawing could be taken off the loading screen by having the first frame's nine pictures painted while the start
  screen is up (one every few frames); not done here, as the start screen's own speed on a phone is the main chat's.
