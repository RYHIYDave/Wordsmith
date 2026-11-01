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
context the first time it paints a sculpted frame (a shader build, the self-test and the timing: about 0.9 s here on
SwiftShader with `allowSlow`, of which the CPU's own part, `listMarch` on the small figure twice, is about 0.3 s) and gives it back when the worker is ended at the end of a floor. The module adds about 38 KB to
the release (minified).

Worth knowing, not needed: with the chip on, the Warlock's demon and change frames cost about what the man's do now, so the
side painter's second hero lane (`Painter.heroLane`) and `HEAVY_ART` (art/warlock_art.ts) could be revisited later; both
work as they are.

## How the chip's frames differ from the CPU's

FILL

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

(The Warrior's two runs, 21 and 48 ms, show this machine's noise. Making the chip ready, once a page or worker: a shader
build and the self-test, 0.9 s here.)

All of each class's frames painted, both ways (every frame of every list, each painted once; the times of the run below):

FILL_TOTALS

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
- `pictures/gpu_side_by_side.png`, `pictures/gpu_side_by_side.mp4`: for the owner. `data/`: every frame's numbers.
