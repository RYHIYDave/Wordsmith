// THE AMALGAMATION'S ACTION REWORK, SECOND ROUND: THE FILM (docs/mockups/action_f4_amalgam/pictures/amalgam_action2.mp4), made
// outside a browser: the new rakes with the knight, from in front and from behind (twice the game's pixels), then at half speed
// (three times); the first round's rakes beside the new for a moment; a bone mite close (forming, skittering, biting, struck dead),
// from in front and from behind (four times); the bone rain over the whole floor from above, the mites forming and swarming the
// knight (the game's own pixels), and close. Captioned. Frames are piped to ffmpeg. Nothing of the game imports it.
//   npx tsx tools/action_f4_amalgam_film2.ts <out.mp4> [stills <dir> <seconds,...> [parts]]
import { spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Px } from '../src/engine/px';
import { RAKES, SWIPE1_HITS, SWIPE_HITS, SWIPE_STRIKES } from '../src/art/amalgam_action';
import { RAIN } from '../src/art/amalgam_action_fx';
import { MITE } from '../src/art/amalgam_mites';
import { tombFloor } from '../src/dev/action_f1_scene';
import { ARENA_PASS, LEAD, MITE_CLOSE, RAIN_PASS, SWIPE_PASS, miteScene, rainArena, rainScene, swipeScene } from '../src/dev/action_f4_amalgam_scene';
import type { View } from '../src/dev/action_f4_amalgam_scene';
import { cut, scaled } from '../src/dev/king_scene';
import { png } from './king_png';

(Px.prototype as unknown as { toCanvas: (this: Px) => unknown }).toCanvas = function (this: Px): unknown {
  return this;
};

const W = 1200;
const H = 676;
const FPS = 30;
interface Part {
  long: number;
  title: string;
  line: string;
  frame: (t: number) => Px;
}
const big = (p: Px, k: number, w = W, h = H): Px => (k === 1 ? p : cut(scaled(p, k), 0, 0, w, h));
type Scene = (view: View, t: number, base: Px, cx: number, cy: number, k?: number) => Px;
/** A part: a scene of `W / k` by `H / k` picture pixels, its middle at (cx, cy), `k` times as big; played from `from`, `slow` times slower. */
function part(scene: Scene, view: View, k: number, cx: number, cy: number, long: number, title: string, line: string, from = 0, slow = 1): Part {
  const w = Math.round(W / k);
  const h = Math.round(H / k);
  const base = tombFloor(w, h, cx, cy);
  return { long: long * slow, title, line, frame: (t) => big(scene(view, from + t / slow, base, cx, cy, 1), k) };
}
/** A rake at half speed: from a third of a second before its strike to half a second after it lands. */
const rake = (view: View, i: number, cx: number, cy: number, title: string, line: string): Part => part(swipeScene, view, 3, cx, cy, SWIPE_STRIKES[i][1] - SWIPE_STRIKES[i][0] + 0.85, title, line, LEAD + SWIPE_STRIKES[i][0] - 0.33, 2);
/** THE FIRST ROUND'S RIGHT RAKE BESIDE THE NEW: each half its own scene, at half speed, both landing at once; a line down the middle. */
function beside(): Part {
  const k = 2;
  const w = Math.round(W / 2 / k);
  const h = Math.round(H / k);
  const cx = 190;
  const cy = 200;
  const base = tombFloor(w, h, cx, cy);
  const before = 0.5;
  const after = 0.75;
  return {
    long: (before + after) * 2,
    title: 'BEFORE AND NOW · HALF SPEED',
    line: 'Left: the first round’s right rake (“lackluster”) · right: the new one, at the same moment',
    frame: (t) => {
      const u = t / 2 - before;
      const old = big(swipeScene('front', LEAD + SWIPE1_HITS[0] + u, base, cx, cy, 1, true), k, W / 2, H);
      const now = big(swipeScene('front', LEAD + SWIPE_HITS[0] + u, base, cx, cy, 1), k, W / 2, H);
      const out = new Px(W, H);
      out.blit(old, 0, 0);
      out.blit(now, W / 2, 0);
      for (let y = 0; y < H; y++) for (const x of [W / 2 - 2, W / 2 - 1, W / 2, W / 2 + 1]) out.set(x, y, '#07060c');
      return out;
    },
  };
}
const arenaBase = tombFloor(W, H, 600, 370);
const [r, l] = RAKES;
const parts: Part[] = [
  part(swipeScene, 'front', 2, 330, 215, SWIPE_PASS, 'THE RAKES · FROM IN FRONT', `Arm hauled up, HELD · RAKED in 2 frames, ${r.out} tiles out · frozen on the hit · the backhand, ${l.out} tiles · the finisher as before`),
  part(swipeScene, 'back', 2, 300, 215, SWIPE_PASS, 'THE RAKES · FROM BEHIND', 'The heap twisted and heaved up · lunging into each rake · rocking on with it'),
  rake('front', 0, 215, 172, 'THE RAKES · HALF SPEED', 'The right: held still, then 2 frames: four claws swept across the floor, gouging it; the freeze'),
  rake('front', 1, 215, 172, 'THE RAKES · HALF SPEED', 'The backhand from the other side, bigger again'),
  rake('back', 1, 205, 160, 'THE RAKES · HALF SPEED · FROM BEHIND', 'The backhand from behind'),
  beside(),
  part(miteScene, 'front', 4, 200, 100, MITE_CLOSE.long, 'A BONE MITE · CLOSE · FROM IN FRONT', `A skull bursts · its bones pull together (${MITE.form} s) · skitters (${MITE.pace} tiles/s) · crouch HELD, SNAP · one blow`),
  part(miteScene, 'back', 4, 200, 70, MITE_CLOSE.long, 'A BONE MITE · CLOSE · FROM BEHIND', 'About a third of the knight’s height: quick, and one blow bursts it into chips'),
  { long: ARENA_PASS + 1.4, title: 'THE BONE RAIN · THE WHOLE FLOOR, FROM ABOVE', line: `Three waves, the shadows first · each skull bursts (${RAIN.r} tiles) and becomes a bone mite · they swarm the knight`, frame: (t) => rainArena(t, arenaBase, 600, 370) },
  part(rainScene, 'front', 2, 320, 235, RAIN_PASS + 1.2, 'THE BONE RAIN · CLOSE', 'Dozens of them: super easy to kill, but there’s a ton of them'),
];

const [out = 'amalgam_action2.mp4', mode = ''] = process.argv.slice(2);
let total = 0;
for (const p of parts) total += p.long;
console.log(parts.length, 'parts,', total.toFixed(1), 's');
if (mode === 'stills') {
  const dir = process.argv[4] ?? 'stills';
  mkdirSync(dir, { recursive: true });
  const at = (process.argv[5] ?? '').split(',').filter(Boolean).map(Number);
  const only = process.argv[6] ? process.argv[6].split(',').map(Number) : null;
  parts.forEach((p, i) => {
    if (only && !only.includes(i)) return;
    for (const k of at.length ? at : [0.2, 0.4, 0.6, 0.8]) writeFileSync(`${dir}/p${i}_${k.toFixed(2)}.png`, png(p.frame(Math.min(p.long - 1e-3, k < 1.0001 && !at.length ? p.long * k : k))));
  });
} else {
  const font = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf';
  const font2 = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf';
  const dir = mkdtempSync(join(tmpdir(), 'amalgam2_captions_'));
  const filters: string[] = [];
  let at = 0;
  parts.forEach((p, i) => {
    writeFileSync(`${dir}/t${i}.txt`, p.title);
    writeFileSync(`${dir}/l${i}.txt`, p.line);
    const en = `:enable='between(t,${at.toFixed(3)},${(at + p.long - 0.001).toFixed(3)})'`;
    filters.push(`drawtext=fontfile=${font}:textfile=${dir}/t${i}.txt:x=18:y=14:fontsize=26:fontcolor=0xf0e8d0:box=1:boxcolor=0x07060c@0.65:boxborderw=8${en}`);
    filters.push(`drawtext=fontfile=${font2}:textfile=${dir}/l${i}.txt:x=18:y=${H}-44:fontsize=18:fontcolor=0xd8d2e6:box=1:boxcolor=0x07060c@0.65:boxborderw=8${en}`);
    at += p.long;
  });
  const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-', '-vf', filters.join(','), '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-tune', 'animation', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const rgb = Buffer.alloc(W * H * 3);
  let n = 0;
  const t0 = Date.now();
  const write = async (): Promise<void> => {
    for (const [i, p] of parts.entries()) {
      const frames = Math.round(p.long * FPS);
      for (let f = 0; f < frames; f++) {
        const px = p.frame(f / FPS);
        for (let k = 0, j = 0; k < W * H * 4; k += 4, j += 3) {
          rgb[j] = px.d[k];
          rgb[j + 1] = px.d[k + 1];
          rgb[j + 2] = px.d[k + 2];
        }
        if (!ff.stdin.write(rgb)) await new Promise((res) => ff.stdin.once('drain', res));
        n++;
      }
      console.log(`part ${i} done (${n} frames, ${((Date.now() - t0) / 1000).toFixed(0)} s)`);
    }
    ff.stdin.end();
  };
  void write();
  ff.on('close', (code) => console.log('ffmpeg done', code, out, n, 'frames'));
}
