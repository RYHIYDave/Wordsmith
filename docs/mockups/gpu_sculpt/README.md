# The new classes painted on the graphics chip (behind a switch, off)

The art chat's helper, 1 Nov 2026, on the branch `art/gpu-sculpt` (from `art/cheap-heroes` 1d78246). For the art chat and the
main chat; the pictures in `pictures/` are for the owner.

## The order, as he picked it

The owner, 31 Oct 2026, of the Warlock, the Tinkerer and the Brawler: "He needs to be able to be played by anyone, what are we
talking about". The last helper (`art/cheap-heroes`, docs/cheap_heroes.md) proved no frame of theirs can be painted more
cheaply on the CPU with the pixels the same: a frame is a ray march through distance-field solids (`src/dev/sculpt.ts`), and
the march is most of its cost. Of three ways on, he picked, 1 Nov: "Use the phone's graphics chip (Recommended)", offered
as the same sculpted look painted many times faster, a pixel here and there perhaps different, shown to him side by side
first.

## What was built

`src/dev/gpu_sculpt.ts`: the heavy, purely numeric part of `draw` done on the graphics chip (WebGL2), and nothing else.

- **On the chip:** every pixel's ray marched through the same solids, the same blends, the same step rule
  (`t -= max(0.02, d * 0.8 / L2)`, 160 steps at most) and the same stopping distance (0.02); at the point met, the way the
  skin faces (the same six sums, 0.18 each side), its creases (the same two, 1.2 and 2.6 out) and the solid nearest (whose
  part it is). It writes, per pixel: met or not, how near (`t`), the normal, the crease value, the material and the solid.
- **On the CPU, unchanged:** everything that decides the look. `draw` hands the chip's numbers to the very same shading
  code it hands `marchFast`'s (the colour, each material's own painter, the tone ramps, cleaning, marks, ink, the edge of
  light). Nothing of it was changed but that the callback now has a name (`shade`), so both marches can call it.
- **One shader for every figure, the solids as data.** Two programs, built once per page or worker and kept: a first pass
  that works out, for each small cell of space round the figure (8 pixels square, 8 lengths deep), which solids can matter
  there, as a 512-bit mask over the solids in `Field`'s order; and the march, which at each point walks the set bits of its
  cell's mask and does exactly what `Field` does with each (its bounding-ball test against what is found so far, its
  smooth union, its carves, the cap from the materials before). Solids, cuts and the material table are uploaded as
  textures each frame; readback is two RGBA32UI targets (the 32-bit floats' own bits), which every WebGL2 can render to and
  read back, so no float-target extension is needed.
- **Why the lists lose nothing.** A solid is left out of a cell only when `Field` passes it over at every point of the cell
  (and within the normal's 0.18 of it): what `Field` has found when it reaches a solid is never more than the most an
  earlier solid of its material (or of an earlier material with no carve near) can be from any point of the cell, since if
  `Field` looked at that solid it found no more than its distance, and if it passed it over it found less than its ball's
  reach. Each such bound is that solid's distance at the cell's middle plus how fast its distance can change. The same
  march in the CPU's own 64-bit numbers over the same lists (`listMarch`, in the same file) gives every frame to the bit:
  476 frames sampled from every list of all three classes (`tools/gpu_sculpt_emul.ts 25`), 0 differ; and in the node test.
  So the chip differs from the CPU only by its 32-bit sums.
- **Proved before it is trusted, and used only where it is faster.** The first time it is asked for, the chip marches a
  small figure (a ball, a rod melted into it, a cut and carved block, a sheet and 36 beads, so the lists span two words and
  their top bit) and is held against `listMarch`; if it meets it otherwise, the CPU paints from then on. Then it marches it
  again, timed against the CPU: a chip that is the CPU pretending to be one (SwiftShader, llvmpipe: Chrome on a computer
  with no usable graphics, some Android phones) or that is slower than the CPU is not used, and the CPU paints as now. This
  machine's Chromium is such a one (its small figure: 729 ms on it, 135 ms on the CPU), so the checks and the test page set
  `GPU_SCULPT_TEST.allowSlow` to measure it all the same; the game never does.

## The switch, and falling back

- `GPU_SCULPT = { on: false }` in `src/dev/gpu_sculpt.ts`. **Off, nothing changes**: `draw` calls `marchFast` exactly as
  before (tests/cheap_heroes.test.ts's pinned hashes pass: every one of the 285 lists, first, middle and last frame;
  tests/gpu_sculpt.test.ts).
- **On**, `draw` asks the chip first. Where there is no WebGL2, the context is lost, a shader will not build, the self-test
  fails, a figure has more than 512 solids or 64 materials, a texture would be too big, or the chip hands back numbers
  that are not sound (checked for every pixel before anything is painted), the CPU marches that frame exactly as before,
  and after any failure of the chip itself it is not asked again in that page or worker (`GPU_SCULPT_TEST.why` says why).
  Node (the tests) has no WebGL2: with the switch on there, every frame falls back and hashes as pinned (the node test).
  In this Chromium, with the switch on and nothing else set, the chip is refused as a software stand-in and the frame is
  painted on the CPU (checked).
- **Where the chip lives.** The first time a page or a worker paints a sculpted frame with the switch on, it makes one
  WebGL2 context: on an `OffscreenCanvas` where there is one (the side painter's worker: Chrome, Firefox, Safari 17 and
  later), else on a page canvas (the game painting for itself on the page; Safari 16, which has `OffscreenCanvas` but no
  WebGL2 on it). A worker on Safari before 17 gets none and paints as now.
- **One rule made safe for phones:** the shader never indexes a uniform array by a number worked out as it runs (the
  material table is a small integer texture). On this machine's SwiftShader such an index gave wrong answers (a whole
  material dropped in places), and some mobile drivers have the same kind of fault.

## What the main chat must change to bring it in

Only the switch, once the owner has said yes to the pictures:

```ts
// src/dev/gpu_sculpt.ts
export const GPU_SCULPT = { on: true };
```

That is all. `draw` (src/dev/sculpt.ts) already asks the chip; the side painter's workers (render/painter.ts, `Painter`, its
hero lane too) run the game's own script, so they use the chip through their own `OffscreenCanvas`, and the page uses its
own canvas where it paints for itself. No message, no new worker, no change to `paintWorkerMain`. Each worker makes its own
context the first time it paints a sculpted frame (a shader build, the self-test and its timing: on SwiftShader with
`allowSlow` about 1.7 s, of which the CPU's own part, `listMarch` on the small figure twice, is about 0.3 s) and gives it back
when the worker is ended at the end of a floor. The module adds about 38 KB to the release (minified).

Worth knowing, not needed: if a real chip brings the demon's frames near their CPU share (35 to 47 ms here, against about
600 now: see Speed), the side painter's second hero lane (`Painter.heroLane`) and `HEAVY_ART` (art/warlock_art.ts) could be
revisited; both work as they are.

## How the chip's frames differ from the CPU's

In Playwright's Chromium (`node tools/gpu_sculpt_check.mjs diff`), each frame painted twice, in two workers as the side
painter paints: the switch off (the CPU, exactly as now) and on (the chip), the two pictures compared pixel by pixel. A
pixel that differs is counted as **edge** (there in one, empty in the other), **ink** (the outline's ink in one and not the
other) or **tone** (both coloured, another colour). The share is of the figure's own pixels.

**What was compared (a sample, in part).** Every frame, both views: the Tinkerer (654 pictures), her Golem and Contraption
(2,082), the Brawler (1,142), and the Warlock as a man, blazing and the change (890). The demon: every frame of its
standing, running, both rakes and its Damning from in front, and 5 of its 10 leap frames; then the run was stopped for time
(SwiftShader takes 10 to 30 s a demon frame). Its landing and being struck from in front, and the other 5 leap frames, were
not compared. The demon from behind (every list) and its burning out from in front: **a sample, every 6th frame of every
list** (65 pictures). With the pictures' own frames (below), 5,131 pictures compared in all.

| class | frames read | pictures compared | differing pixels: median | mean | worst (frame) | frames over 1% | edge / ink / tone pixels | painting, CPU | painting, chip |
|---|---|---|---|---|---|---|---|---|---|
| warlock | 1717 | 1163 | 0.000% | 0.028% | 0.242% (warlock:demon/back.walk[24], 30 of 12408) | 0 | 2 / 6 / 3880 | 298 s | 6212 s |
| tinkerer | 722 | 654 | 0.000% | 0.000% | 0.085% (tinkerer:dungeon/back.idle[42], 1 of 1181) | 0 | 0 / 0 / 1 | 72 s | 969 s |
| tinkerer-kit | 2316 | 2082 | 0.000% | 0.000% | 0.161% (golem:cannon/front.clips.attack.frames[34], 6 of 3736) | 0 | 3 / 3 / 10 | 135 s | 1706 s |
| brawler | 1256 | 1142 | 0.000% | 0.000% | 0.112% (brawler:dungeon/front.clips.reel.frames[10], 2 of 1780) | 0 | 0 / 2 / 0 | 156 s | 1231 s |

| group | frames read | pictures compared | differing pixels: median | mean | worst (frame) | frames over 1% | edge / ink / tone pixels | painting, CPU | painting, chip |
|---|---|---|---|---|---|---|---|---|---|
| the man | 622 | 610 | 0.000% | 0.004% | 0.152% (warlock:dungeon/front.idle[19], 3 of 1978) | 0 | 1 / 2 / 50 | 69 s | 960 s |
| the change | 192 | 96 | 0.061% | 0.069% | 0.236% (warlock:dungeon/back.clips.change.frames[25], 27 of 11457) | 0 | 0 / 0 / 784 | 55 s | 1753 s |
| blazing (his own standing and running) | 622 | 184 | 0.000% | 0.013% | 0.207% (warlock:blaze/front.idle[21], 4 of 1930) | 0 | 1 / 2 / 44 | 18 s | 267 s |
| the demon | 265 | 257 | 0.072% | 0.078% | 0.242% (warlock:demon/back.walk[24], 30 of 12408) | 0 | 0 / 1 / 2934 | 150 s | 3154 s |
| the demon burning out | 16 | 16 | 0.000% | 0.036% | 0.118% (warlock:demon/back.clips.change.frames[0], 16 of 13548) | 0 | 0 / 1 / 68 | 6 s | 78 s |
| the Tinkerer | 722 | 654 | 0.000% | 0.000% | 0.085% (tinkerer:dungeon/back.idle[42], 1 of 1181) | 0 | 0 / 0 / 1 | 72 s | 969 s |
| her Golem | 1764 | 1530 | 0.000% | 0.000% | 0.161% (golem:cannon/front.clips.attack.frames[34], 6 of 3736) | 0 | 3 / 3 / 10 | 121 s | 1593 s |
| her Contraption | 552 | 552 | 0.000% | 0.000% | 0.000% (contraption:vials/front.tumble[0], 0 of 124) | 0 | 0 / 0 / 0 | 14 s | 112 s |
| the Brawler | 1256 | 1142 | 0.000% | 0.000% | 0.112% (brawler:dungeon/front.clips.reel.frames[10], 2 of 1780) | 0 | 0 / 2 / 0 | 156 s | 1231 s |

(Frames read counts every frame of every list, both views; a frame that is the same picture as one before it, by the very
same sums, is painted once and compared once.)

**Not one frame differs on more than 1% of its pixels, none falls back to the CPU, and none differs in size or anchor.**
The man, the Tinkerer, the Brawler, her Golem and Contraption: the median frame differs in no pixel at all. The demon and the
change, the biggest and most crowded figures: about 0.07% (some 10 pixels of 14,000). **The worst frame: the demon running,
seen from behind, frame 24: 30 of its 12,408 pixels (0.24%), every one tone**; next, the change from behind, frame 25: 27
of 11,457 (0.24%), all tone. Why: where two tones of a material meet, a pixel whose light is within a hair of the line
between them falls one side in the CPU's 64-bit sums and the other in the chip's 32-bit sums; each such pixel is exactly one
step of its material's own ramp away (checked on the rake at the strike: all 14 one step). Edge and ink differences are
almost nil (in all, 5 edge and 11 ink pixels over every picture compared). Seen side by side at six times, the rake at the
strike cannot be told apart.

The pictures' own frames (`pictures/`): the Warlock standing 1 of 1,968 pixels; his bolt 0 of 1,978; blazing 1 of 1,971;
mid-change 6 of 12,650; the demon standing 9 of 15,150; its rake at the strike 14 of 15,561; its Damning 5 of 14,735; the
Tinkerer 0 of 1,430; her Golem 0 of 3,805; the Brawler 0 of 1,671. The film's: the demon's rake, 32 frames, median 0.063%,
worst 0.099% (frame 5, 15 of 15,140, all tone); the change, 48 frames, median 0.058%, worst 0.128% (frame 40, 18 of 14,024,
all tone).

Every frame's numbers: `data/diff_*.json` (`node tools/gpu_sculpt_check.mjs report` makes these tables).

## Speed

Measured in Playwright's Chromium on this machine (2 cores, shared), each frame painted in a worker as the side painter
paints, the CPU's and the chip's never at once; the median of three frames of each move, after its first
(`node tools/gpu_sculpt_check.mjs speed`, `data/speed.json`). **This Chromium's WebGL2 is SwiftShader: no graphics chip at all,
but the CPU pretending to be one, on two shared cores**, and here the "chip" is far slower than the CPU. Nearly all its time
is the shader walking each cell's list of solids: with that walk taken out (a test variant, wrong pictures), a man frame
took 38 to 48 ms on it all in; with it, about 600. A demon frame asks some 70 million list entries and 14 million distance
sums (counted in `listMarch`); a phone's graphics chip runs such work on hundreds of lanes at once, where SwiftShader has a
few. What this machine can measure is the part no chip can take away: the frame's own work on the CPU (making the figure,
its colour, ink and edge of light, and handing the numbers back), the last column. On a real chip a frame should cost about
that, plus the chip's own march; that is an estimate, not a measure, and the test page (below) measures it on the owner's
own phone.

| a frame of | CPU now (ms) | on SwiftShader (ms) | its CPU share, with the chip (ms) |
|---|---|---|---|
| the Warrior standing (painted his own way) | 21 to 48 | (no sculpting) | |
| the Warrior's attack | 17 | (no sculpting) | |
| the Warlock standing | 97 | 652 | 25 |
| his bolt | 92 | 654 | 6 |
| blazing, standing | 74 | 600 | 6 |
| the change | 598 | 8,223 | 73 |
| the demon standing | 600 | 10,174 | 47 |
| its rake | 631 | 10,026 | 35 |
| its Damning | 600 | 9,886 | 36 |
| the Tinkerer standing | 71 | 461 | 14 |
| the Brawler standing | 129 | 689 | 14 |

(The Warrior's two runs, 21 and 48 ms, show this machine's noise.)

All of each class's frames painted, both ways (every frame of every list, each painted once; the times of the run below):

| | pictures painted | CPU now | on SwiftShader |
|---|---|---|---|
| the Warlock as a man, every frame | 610 | 69 s | 960 s |
| blazing (his own standing and running), every frame | 184 | 18 s | 267 s |
| the change, every frame | 96 | 55 s | 1,753 s |
| the demon and its burning out (624 pictures in a run, docs/cheap_heroes.md): **an estimate**, its 273 compared frames' mean (572 ms and 11,837 ms) times 624 | 624 | about 357 s | about 7,390 s |
| the Warlock in a run, all (**an estimate**, the four rows) | 1,514 | about 500 s | about 10,370 s |
| the Tinkerer, every frame | 654 | 72 s | 969 s |
| her Golem and Contraption, every frame | 2,082 | 135 s | 1,706 s |
| the Brawler, every frame | 1,142 | 156 s | 1,231 s |

These are SwiftShader's times, measured (but for the two estimates) and of no use for a phone, as above. Times in the
every-frame runs were taken with two runs at once on the two cores, so both columns are higher than a quiet machine's (the
quiet speed run above: the demon 600 ms and 10 s a frame).

## The phone test page

`dist/gpu_speed.html` (0.48 MB, one file, nothing else needed; made by `node tools/gpu_speed_page.mjs`). Opened on any phone
or computer, it says whether this device has a graphics chip the game can use (and its name), then paints some frames of
the Warlock (standing, his bolt, the change) and of the demon (standing, its rake) the way the game paints them now and then
on the chip, and shows each time in big plain words ("793 ms → 28,423 ms ... 35.9 times slower" here; on a phone with a
real chip it should read the other way). It says too whether the game itself would use the chip there ("yes", or "too
slow" for a software stand-in or a chip slower than the CPU). Last it paints a frame of the man and one of the demon in a
worker, as the game's side painter would, and says whether the chip works there ("works" here). About a minute on a phone;
keep the screen on. Checked in this Chromium at a phone's size (390 by 844): every part shows. For the owner's iPhone, the
art chat publishes it as a page and sends him the link.

## Files

- `src/dev/gpu_sculpt.ts`: the switch, the chip's march (the cull pass and the march, its WebGL2 context, its fall-back and
  self-test), and `listMarch`, the same march in the CPU's numbers.
- `src/dev/sculpt.ts`: `draw` asks the chip first when the switch is on (the shading callback named `shade`; nothing else).
- `src/dev/gpu_lists.ts`, `src/dev/gpu_check_main.ts`, `src/dev/gpu_speed_main.ts`: the checks' and the test page's own
  (nothing of the game imports them; the node test proves it).
- `tests/gpu_sculpt.test.ts`: the switch off; frames as pinned with it off and with it on where there is no chip; the chip's
  march in the CPU's numbers gives the pinned frames.
- `tools/gpu_sculpt_check.mjs`: in Playwright's Chromium, every frame painted both ways (`diff`), the cost table (`speed`),
  the pictures' frames (`pics`), the tables below (`report`). `tools/gpu_sculpt_pictures.py` makes the picture and the film.
  `tools/gpu_sculpt_emul.ts`: `listMarch` held against the pinned hashes. `tools/gpu_speed_page.mjs` builds the test page.
- `pictures/gpu_side_by_side.png`, `pictures/gpu_side_by_side.mp4`: for the owner. `data/`: every frame's numbers
  (`diff_warlock.json` the every-frame run as far as it went, `diff_warlock_sample.json` the demon's sample).

## His word on the pictures

Shown `gpu_side_by_side.png` and `gpu_side_by_side.mp4`, 1 Nov 2026, and asked whether the frames painted on the graphics chip
look the same to him as they do now (answered by 19:03 his time): “Yes, they look the same (Recommended)”. The phone test page
(`dist/gpu_speed.html`) is to be published for him to open on his iPhone; its numbers, when he sends them, go here.

### On his iPhone (1 Nov 2026, 19:05 his time; `dist/gpu_speed.html` sent to him as a file and opened in the Claude app)

His screenshot, a frame now → on the chip: the Warlock standing 27 ms → 12 ms (2.3 times as fast); his bolt 27 → 13 (2.0); the
change 197 → 77 (2.6); the demon standing 175 → 74 (2.4); its rake 188 → 72. Asked what the page showed: “It says much faster”.
In the side painter (a worker), he reported: “Chip not available there” (its reason line asked for). So on his phone the
chip is about two and a half times as fast, not many times: his phone's CPU is much quicker than this machine's (the man 27 ms
there against 97 here); and, as it stands, the side painter's worker gets no chip there, where the game paints his frames.

His second run (19:19, the page with its worker check, again opened in the Claude app): the demon standing 169 → 80 ms (2.1
times as fast), its rake 178 → 69 (2.6); "In the side painter: chip not available there · the painter stopped with an error";
"Worker check: a worker could not run here". So in the Claude app's file viewer no worker runs at all (not even the tiny
check): the side painter's question is not answered there. The game itself runs at his web address, where its side painter's
workers do run; the page is to be opened there (the main chat's to place beside the game) to answer it.
