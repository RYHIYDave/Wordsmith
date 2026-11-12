# THE MOTH'S PICTURES KEPT PACKED: THE BUILD (on a branch; not on `main`, not published)

The queue's `keep-moths-pictures-from-filling-memory`, pulled by a chat of its own ("Moth memory chat") at his word, 12 Nov
2026, 07:28 (Eastern): “Work on this task from the Wordsmith Queue: “Keep the Moth's pictures from filling memory on floor 20”
(queue item keep-moths-pictures-from-filling-memory).” He had not asked for the item itself: the Monsters-before-play chat found
it baking the floors' monsters.

Branch `build/moth-packed`, cut from `main` at e1b3274 (25.3.8): a fast-forward for `main` while it stands there. `PACKED.on` is
ON on the branch (`src/render/painter.ts`). IT CHANGES NOTHING HE SEES: the same pictures, every pixel (checked, below), but a
stand-in for a frame or two as a move of the Moth begins. Off, or where its worker cannot pack, the Moth is as it was.
NO NEW BAKE: the bakes' marks on the branch are main's (heroes 1fdc8d09059a, townsfolk d4c898fe370d, monsters 1cbff15ba80a).
`art/kit.ts` is in every bake's code: it is not touched.

## What was wrong (measured on main before the change)

The Moth (floor 20's boss, `src/art/act1_figs/moth.ts`) is 1,316 frames of up to 832 by 824, about 1.3 MB each as a picture,
1,984 MB were they all held. Not baked (`TOO_BIG`), it is the painter's: its worker painted every frame and handed it over,
and nothing let one go before the floor was left. A frame of it is 125 to 363 ms to paint (measured here, in node): so painted
again when wanted, a move of 64 to 97 frames would come about 10 s late. That is why "hold only the move it is in" needed more.

A phone's screen (844 by 390, three to a pixel, a finger) in Chrome on a two-core cloud machine, NOT A PHONE: a readable build
of main (`dist/moth_before.html`, no bakes beside it), the Warrior on the Tower Top, nothing can kill him, the bot fighting,
the Moth kept alive and taken through its phases (`tools/scenarios/moth_memory.mjs`, SECONDS=200 PHASES=70,140):

| s | pictures handed over held | canvases | the page's memory (renderer) | the game's own frame, middle |
|---|---|---|---|---|
| 0 | 0 MB | 57 MB | 693 MB | |
| 60 | 198 MB | 311 MB | 1,463 MB | 7 ms |
| 120 | 488 MB | 409 MB | 1,833 MB | 7 ms |
| 160 (its last phase) | 690 MB | 383 MB | 2,141 MB | 240 ms |
| 200 | 902 MB | 593 MB | 2,457 MB, climbing | 5.5 ms |

In its last phase the game's own frame was 217 to 240 ms in the middle (160 to 170 s), 34 to 39 frames over 50 ms each 10 s (150 to 180 s): its
frames not handed over yet were painted where the game is played, as they were shown.

## What it is

THE MOTH'S FRAMES PACK AS PNGs ABOUT 33 TIMES SMALLER (flat colour: 50 KB a frame in node's encoder, about 100 KB in Chrome's).
So (`src/render/painter.ts`, `PACKED`, its comment says it all):

- THE WORKER PAINTS EVERY FRAME, as before, the first frame of every move first, AND PACKS IT (`OffscreenCanvas.convertToBlob`,
  a PNG, kept in the worker). It hands over only the first frame of every move (held always: what stands in while a move is
  coming) and the frames of a move the page wants now.
- THE PAGE ASKS FOR A MOVE AS IT IS SHOWN (`Painter.shown`, told by `render/render.ts` every time a picture of it is drawn, and
  as it falls): the worker unpacks it (`createImageBitmap` of the PNG, beside the game: no painting), from the frame wanted on.
  The painting waits while a move is unpacked (a frame of painting is up to 360 ms in one go). Until a frame comes, the nearest
  of its move that is here is shown (`LEFT_TO_PAINTER`), never painted where the game is played.
- ITS MOVES UNPACKED ARE HELD UP TO `PACKED.budgetMB` (96 MB on a phone, 320 elsewhere; its first frames apart), the least lately
  shown let go of first, never one shown in the last `holdMs` (1.5 s): their frames made lazy again (their own lazy getters,
  kept by the painter: `packMoves`) and their room given back by hand `giveBackMs` (250 ms) on (`engine/px.ts retireSprite(s, ms)`).
- ITS WORKER IS KEPT FOR THE FLOOR, its painting done (`Lane.holds`): ended, what it packed would be gone. Ended with the floor.
- WHERE ITS WORKER CANNOT PACK (no `convertToBlob` or `createImageBitmap` there), it says so with its first frames and hands
  every frame over, as before (tested).

TWO MORE OF THE MOTH'S, FOUND MEASURING:
- ITS MIRROR IMAGES (it is drawn mirrored when it faces the other way): a big one pushed out of `FLIP_BUDGET` was held 3 s
  (`RETIRE_MS`) before it was given back, and the Moth makes one every frame it is shown so: 66 to 116 MB of them waiting. A
  passing one (kept by nobody past the frame it is drawn in) is given back `PASSING_MS` (250 ms) on now (`engine/px.ts`). This
  is for every big mirror image of a passing picture, not only the Moth's.
- ITS EFFECTS' PICTURES (the gust, the dust, the beams, the swarm, the wind of its beat, the words pouring out of it as it
  dies: `render/act1_fx/moth.ts`) were kept for the whole floor: 156 MB 240 s into the fight; the words alone are 113 frames of
  about 1.2 MB, each shown once. Kept up to `MADE_MOST` (96 MB) now, the least lately shown let go of and given back; one let go
  of is made again if it is shown again, as it was the first time.

FILES: `src/render/painter.ts` (PACKED, the page's side and the worker's), `src/render/render.ts` (monsterSprite, fallenSprite),
`src/engine/px.ts` (retireSprite's `ms`, PASSING_MS, flipOrigin), `src/render/act1_fx/moth.ts` (MADE_MOST), `src/main.ts`
(`__dbg.mothFx`), `tests/moth_packed.test.ts` (new, 4), `tools/scenarios/moth_memory.mjs` (new), `tools/scenarios/moth_packed_check.mjs` (new).

## Measured after (the same, `dist/moth_after.html`; NOT A PHONE)

A sitting of 480 s on the branch's first commit (a4291a7; the second, ed2707e, only moves where its frames are made lazy again,
and was weighed again below), PHASES=330,400, DIE=440 (let die on the book at 440 s), so that it was all packed before its
phases came:

| s | its moves unpacked held | pictures handed over held, all | canvases | renderer | frame, middle | over 50 ms in 20 s |
|---|---|---|---|---|---|---|
| 60 | 63 frames, 81 MB | 124 MB | 203 MB | 1,172 MB | 6.4 ms | 4 |
| 120 | 63, 81 MB | 133 MB | 183 MB | 1,142 MB | 7.0 ms | 0 |
| 200 | 49, 63 MB | 129 MB | 185 MB | 1,156 MB | 5.3 ms | 0 |
| 300 | 112, 145 MB | 214 MB | 188 MB | 1,143 MB | 5.1 ms | 0 |
| 400 (its last phase) | 60, 76 MB | 146 MB | 180 MB | 1,012 MB | 4.6 ms | 0 |
| 440 (dying) | 49, 80 MB | 149 MB | 175 MB | 1,004 MB | 3.6 ms | 0 |

- Its first frames held always: 23 of its 24 moves' by 60 s here (24 in the check below), about 31 MB. Its moves unpacked: 31 to 145 MB
  over the sitting (96 MB its budget, and the move being shown, up to about 117 MB, never let go of). Packed in the worker, all 1,315 by 340 s: 129.5 MB of PNGs.
- STAND-INS (a frame shown as the nearest of its move here, its own still coming): while it was still being painted, the first
  five minutes on the floor, 1,685 of 18,818 pictures of it shown (9%; most for frames not painted yet: before the change those
  were painted where the game is played, the 240 ms frames above); once all of it was packed, 29 of 5,880 (0.5%).
- Its effects' pictures: 92 MB in the air, 96 MB at most.
- After it died the floor was left: one frame of 1,675 ms as the next place came (the place's own pictures in one frame: the
  queue's smooth-the-loading-screens-long-frames), then the page 731 MB.
- A shorter sitting of 300 s on ed2707e (PHASES=100,200, DIE=260): the same, the page 967 to 1,219 MB through the fight, its
  pictures handed over 49 to 203 MB, canvases 102 to 197 MB.

THE SAME PICTURES (`tools/scenarios/moth_packed_check.mjs`, a desk's screen; on a4291a7 and again on ed2707e, alike): 304 frames packed in 73 s, its stand, drift,
buffet and struck asked for from in front and behind, unpacked, and every frame of it in hand (248: 224 unpacked, 24 first
frames) held against the game's own painting of it made afresh (`__dbg.bakedMobsCheck`): its parts, its size, every value of
every pixel: none unlike.

CHECKED: tsc clean; tests/moth_packed.test.ts 4 of 4 alone; the unit run on the code's commit (`node tools/unit.mjs --only
moth_packed,memory_floors,kit,moth,figure,act2_moments` and the core): its line at the foot of this note.
NOT CHECKED: A PHONE (WebKit's convertToBlob and createImageBitmap in a worker, its PNGs' size and its times; his iPhone is on
iOS 18.7, where both should be had: where they are not, the Moth is as before); a release build with the bakes beside it; the
published page's playtests; the whole suite.

## For the main chat, bringing it in

1. Merge `build/moth-packed` (a fast-forward while main is at e1b3274).
2. The release build: NO NEW BAKE (the marks are main's).
3. The published page's playtests, with these two among them: `tools/scenarios/moth_memory.mjs` on a phone's screen
   (`--serve --touch --size 844x390 --dpr 3 --init tools/mem_probe.js`; SECONDS, PHASES, DIE, WHO=1 for what holds the
   pictures) and `tools/scenarios/moth_packed_check.mjs` (`--serve --size 1280x720`).
4. To tune after his phone, one number each: `PACKED.budgetMB.small`, `PACKED.holdMs`, `MADE_MOST`.
5. NOT DONE HERE, worth knowing: the floor's other bosses are still painted where the game is played when a frame of theirs is
   shown before the painter hands it over (`monsterSprite` sets LEFT_TO_PAINTER for the Moth and for monsters still coming from
   the bake, not for the painter's other bosses); on a phone a boss's baked pictures are not taken in (`monsters_baked.ts`), so
   those are the painter's. The Carrion Queen (537 MB) and the Flame Unfinished (380 MB) could be kept packed the same way:
   one name each in `PACKED.figures`, then weighed.

UNIT, on the code's last commit: `UNIT DONE ed2707e94d: 29 files, 29 passed, 0 failed (0 passed alone)` (the six named and the core 23).
