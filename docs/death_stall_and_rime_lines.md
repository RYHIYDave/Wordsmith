# A boss's death and the Rime Shade's lines, without the stalls

The queue's item `fix-boss-death-stall-and-rime-shade` (added by the main chat, 10 Nov 2026: "Two known hitches left from
testing 25.0; he has not asked for them. The game still stalls for a moment as a boss dies (shortened, not gone). On floor
20, the Rime Shade's lines cost about a third of a frame for three of them: paint each only over the floor it covers."),
done 12 Nov 2026 by a chat started from the queue, on the branch `fix/boss-death-stall-rime-shade`, from `main` at 0b79b7a
(25.3.9). NOTHING HERE CHANGES HOW THE GAME LOOKS: no switch; every picture is the same picture, painted sooner or on less.
He has not been told of it, and has not asked for it.

## 1. The stall as a boss dies

FOUND (tools/scenarios/boss_death_stall.mjs, new: on each floor the hero set by its boss, its life run down by the rules'
own hand over FIGHT seconds, then killed; every frame's time round the death, and what was painted where the game is
played after it, by what asked: `__dbg.painting.trace`). On 25.3.9, a phone's page (touch, so the painter paints the
bosses), a 20-second fight, every boss of floors 1 to 20, painting after the death:

- FLOOR 7, THE CARRION QUEEN: 3.3 s of painting in the 5 s after she died, frames of 100 to 180 ms (with a 10-second
  fight, frames of 58 ms in the middle for 5 s). Her death is kept among her moves as `fall` for her effects to play off
  the eyrie's edge (art/act1_figs/queen.ts), her `die` empty: so the 25.0 mend (her death painted first once she is under
  60% of her life) never found it, and render/act1_fx/queen.ts read its frames straight, painting each as it was shown.
- FLOOR 5, THE FLESHMANCER: his runedust and his Meldstone (art/meld_drops.ts), a quarter of a second of painting over
  the second after (the spill, the heap, the crack, the stone, its spins), painted as first shown.
- FLOOR 19, THE KING: the Hush at his side unwinding into nothing as he dies ('gking:2', render/act1_fx/gking.ts), a
  quarter of a second over 61 frames; and one frame of his own death alone (KING_ALONE), none of it painted yet.
- Every other boss: nothing, or a frame or two (floor 4, 19 ms).
- With all of a boss's pictures painted ahead first (READY=1: as when he is come to minutes into a floor), his death was
  clean (floors 7 and 13 measured so).

MENDED:
- render/left_to_painter.ts `deathOf`: a figure's death is its `die`, or where one of the descent's figures keeps its death
  among its moves and has no `die` of its own (the Queen's `fall`), that. The painter's worker paints it first as a boss
  nears his end (render/painter.ts `mob`, its `dieSoon`): so her fall is painted first as she nears her end, as every
  other boss's death is. Where the painter does not paint her (a browser without it), render/render.ts `dieAheadOf` puts
  her fall to be painted ahead here.
- render/left_to_painter.ts `isPainted` and `leftToPainter`; the effects' context `paints` (render/act1_fx/types.ts,
  render/bossfx.ts, render/render.ts): the Queen's fall is read with a frame not painted yet left to the painter, its
  nearest painted shown meanwhile, as a fallen monster's death already was (render/render.ts fallenSprite). Her fall's
  frames laid under the eyrie's rock are kept by the frame they are made from, not by their place in the fall.
- render/render.ts `dieAheadOf`: as a boss goes under 60% of his life, what else his death shows that the game paints
  itself is put to be painted ahead, a frame at a time, before the rest of the monsters' frames (the Fleshmancer's runedust
  and Meldstone; the King's Hush's end).
- NOTHING IN THE BAKES' CODE IS CHANGED (art/kit.ts, art/bestiary.ts and its paintOrder untouched; the one new thing in
  art/rime_shade_fx.ts kept out of the monsters' bake page): the marks are main's, heroes 1fdc8d09059a, monsters
  4f510caa1c9d, townsfolk d4c898fe370d, the Colossus 7cf0996e564d. NO NEW BAKE.

MEASURED, the same run on the mended page: floor 7, 3.3 s of painting after her death to 0.1 s (that 0.1 s, and some on
floors 7 and 19 in other runs, is the HERO's frames, the test page's heroes not baked: the release's are); floor 5, 0.24 s
to none; floor 19, 0.24 s to one frame (27 ms); the rest as they were. With a 10-second fight her fall is shown as its
nearest painted frames where the painter has not reached them: no frame of hers painted as it is shown.

NOT DONE, seen on the way:
- FLOOR 13, the Scraper killed with the Quill at full life: the Quill, fighting on alone, shows moves of its own not yet
  painted, a second of painting over the next five (frames of 40 to 60 ms). Not its death: any monster's move first shown
  before the painter has come to it is painted so. The test leaves the Quill unhurt; in play both are fought.
- The frame a boss is killed in costs 40 to 70 ms on this machine with nothing painted in it (the death's own work).
- Fights in the scenario begin 9 s into a floor: the boss's own moves are painted as first shown in them (the moth's
  130 ms frames). In play he is come to later. Not this item's.

## 2. The Rime Shade's lines

Each line's pictures (its mark, its crust, its crystals all at once, or behind and before the hero) were painted on the
art's whole canvas, 640 by 400, fifteen times a second each, and laid onto canvases that size: most of the time went in
clearing, copying and laying those pixels. Now each is painted only over the part of the canvas its line covers
(art/rime_shade_fx.ts `lineBox`: from the mark's start to past its end, across past the front's bright edge, up past the
tallest crystal, with a margin; on whole game pixels; 7 to 22 in 100 of the canvas, by the way the line runs) and laid
where it lies on the whole canvas (render/act1_fx/rshade.ts: its anchor moved by the box's corner). `markPainted` and
`linePainted` take the box; without it they paint the whole canvas as before (the art's own pages and tests).

The same pixels in the same places: tests/rime_shade_box.test.ts (both views, every way a line is turned and the game's
own, every moment of the mark and the line, the crust, the crystals all at once and behind and before points along it:
the boxed picture is the whole picture cut to the box, nothing outside it, its lights where they were).

MEASURED (tools/scenarios/rime_shade_cost.mjs, new: three Rime Shades on floor 20 round the knight, as
rime_shade_play.mjs sets them, profiled 8 s; up to six lines on the floor at once): drawing their lines took 160 ms a
second on 25.3.9 and 62 to 67 ms a second now, three runs (5.4 ms a frame to 1.5 to 1.8; the page's median frame 24.6 ms
to 17.6 to 19.1); rime_shade_play.mjs on the branch's page all as it should be (a frame 18.7 ms in the middle). Of what is left
about half is the painting of the lines itself, which the canvas's size never changed.

Left as it was: they are still painted fifteen times a second (PAINT_FPS). The art chat drew them at thirty; at the new
cost thirty would cost less than fifteen did, but it is a change to how they look, his to see first.

## Tests

- tests/rime_shade_box.test.ts (2), new.
- `node tools/unit.mjs --only rime_shade_box,rime_shade,rime_shade_game,monsters_baked,act1_queen,queen_action,
  carrion_queen2,king,meld_drops,eye_death` and the core on ee57c12ab4: 33 files, 391 tests, all passed.
- The two playtests above on a page of the branch (`node tools/build_to.mjs dist/fix.html`, `--touch --size 844x390
  --dpr 3`).

## Bringing it in (the main chat's)

It merges clean with main and, tried and not kept, with each ready branch of 12 Nov: build/moth-packed,
build/smooth-loading-frames, bring-in/hero-cards, build/warrior-tree, build/brawler-packed. One thing to know with
build/moth-packed: were the Queen ever kept packed as the Moth is (its PACKED.figures), her fall, drawn by
render/act1_fx/queen.ts, would have to ask for its move as shown (Painter.shown) as fallenSprite does there.

Merge the branch; nothing to switch on, nothing to bake (the marks are main's). Worth a look in play before a release: floor 7 (her fall off the eyrie's edge,
under the rock as before) and floor 20 (the lines). Then `tools/scenarios/rime_shade_play.mjs` and a boss film or two
(first5_boss.mjs) on the release's frozen copy, as for any small update.
