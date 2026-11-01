// THE AMALGAMATION'S MOVES DONE THE ACTION WAY: THE FILM (docs/mockups/action_f4_amalgam/pictures/amalgam_action.mp4), made outside
// a browser: each of its four moves in its ossuary with the knight for size, from in front and from behind (twice the game's
// pixels); the bone rain over the whole floor from above (the game's own pixels, the arena whole); then each strike at half speed
// (three times the game's pixels). Captioned. Frames are piped to ffmpeg. Nothing of the game imports it.
//   npx tsx tools/action_f4_amalgam_film.ts <out.mp4> [stills <dir> <seconds,...> [parts]]
import { spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Px } from '../src/engine/px';
import { ARMS_STRIKE, DEVOUR_STRIKES, RAIN_STRIKE, REAR, SWIPE_STRIKES } from '../src/art/amalgam_action';
import { ARMS, RAIN, SLAM_RING } from '../src/art/amalgam_action_fx';
import { tombFloor } from '../src/dev/action_f1_scene';
import { ARENA_PASS, ARMS_PASS, CONE, DEVOUR_PASS, LEAD, RAIN_PASS, SWIPE_PASS, armsScene, devourScene, rainArena, rainScene, swipeScene } from '../src/dev/action_f4_amalgam_scene';
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
const big = (p: Px, k: number): Px => (k === 1 ? p : cut(scaled(p, k), 0, 0, W, H));
type Scene = (view: View, t: number, base: Px, cx: number, cy: number, k?: number) => Px;
/** A part: a scene of `W / k` by `H / k` picture pixels, its middle at (cx, cy), `k` times as big; played from `from`, `slow` times slower. */
function part(scene: Scene, view: View, k: number, cx: number, cy: number, long: number, title: string, line: string, from = 0, slow = 1): Part {
  const w = Math.round(W / k);
  const h = Math.round(H / k);
  const base = tombFloor(w, h, cx, cy);
  return { long: long * slow, title, line, frame: (t) => big(scene(view, from + t / slow, base, cx, cy, 1), k) };
}
/** A strike at half speed: from a little before its wind-up ends to a little after it lands. */
const strike = (scene: Scene, view: View, cx: number, cy: number, s: readonly [number, number], title: string, line: string, k = 3): Part => part(scene, view, k, cx, cy, s[1] - s[0] + 0.5, title, line, LEAD + s[0] - 0.22, 2);
const arenaBase = tombFloor(W, H, 600, 370);
const parts: Part[] = [
  part(swipeScene, 'front', 2, 330, 215, SWIPE_PASS, 'THE SWIPE · FROM IN FRONT', `Right arm drawn up, HELD, raked in 2 frames · left, the same · REARED, both arms up, HELD · slammed: a ring ${SLAM_RING.finisher} tiles`),
  part(swipeScene, 'back', 2, 300, 215, SWIPE_PASS, 'THE SWIPE · FROM BEHIND', 'Every big move: it rears up to near twice its height on its arms, and comes down shaking the floor'),
  part(rainScene, 'front', 2, 320, 235, RAIN_PASS, 'THE BONE RAIN · FROM IN FRONT', 'Reared, ROARING, HELD · all four arms slammed down · the niches shed their skulls: shadows first'),
  { long: ARENA_PASS, title: 'THE BONE RAIN · THE WHOLE FLOOR, FROM ABOVE', line: `Three waves, the shadows first · each skull bursts (${RAIN.r} tiles) and leaves a pile that slows you for ${RAIN.pile.lie} s`, frame: (t) => rainArena(t, arenaBase, 600, 370) },
  part(armsScene, 'front', 2, 310, 190, ARMS_PASS, 'THE FLOOR ARMS · FROM IN FRONT', `Reared higher, HELD · slammed flat · ${ARMS.n} holes, the first under you, cracks glowing ${ARMS.warn} s before`),
  part(armsScene, 'back', 2, 300, 200, ARMS_PASS, 'THE FLOOR ARMS · FROM BEHIND', 'Four arms of the dead to a hole, half as big again: you must move'),
  part(devourScene, 'front', 2, 330, 200, DEVOUR_PASS, 'DEVOUR · FROM IN FRONT', `Reared, maw gaping, arms flung wide, HELD (the cone marked, ${CONE.reach} tiles) · the RAKE, 2 frames · the drag · the BITE, 2 frames`),
  part(devourScene, 'back', 2, 300, 210, DEVOUR_PASS, 'DEVOUR · FROM BEHIND', `Dragged in at ${CONE.pull} tiles a second to its maw`),
  strike(swipeScene, 'front', 215, 150, SWIPE_STRIKES[0], 'THE STRIKES · HALF SPEED', 'The right arm: held still, then 2 frames, smeared'),
  strike(swipeScene, 'front', 215, 150, SWIPE_STRIKES[1], 'THE STRIKES · HALF SPEED', 'The left arm: 2 frames'),
  part(swipeScene, 'front', 2, 330, 215, SWIPE_STRIKES[2][1] - SWIPE_STRIKES[2][0] + 0.75, 'THE STRIKES · HALF SPEED', 'The finisher: reared and held, slammed in 2 frames, the ring', LEAD + SWIPE_STRIKES[2][0] - 0.25, 2),
  part(rainScene, 'front', 2, 320, 235, RAIN_STRIKE[1] - RAIN_STRIKE[0] + 0.6, 'THE STRIKES · HALF SPEED', 'The bone rain’s slam: 2 frames', LEAD + RAIN_STRIKE[0] - 0.22, 2),
  part(armsScene, 'front', 2, 310, 190, ARMS_STRIKE[1] - ARMS_STRIKE[0] + 0.6, 'THE STRIKES · HALF SPEED', 'The floor arms’ slam: 2 frames', LEAD + ARMS_STRIKE[0] - 0.22, 2),
  strike(devourScene, 'front', 240, 150, DEVOUR_STRIKES[0], 'THE STRIKES · HALF SPEED', 'The rake: its claws in the floor at the end of their reach, 2 frames'),
  strike(devourScene, 'front', 225, 150, DEVOUR_STRIKES[1], 'THE STRIKES · HALF SPEED', 'The bite: 2 frames'),
];
void REAR;

const [out = 'amalgam_action.mp4', mode = ''] = process.argv.slice(2);
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
  const dir = mkdtempSync(join(tmpdir(), 'amalgam_captions_'));
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
        if (!ff.stdin.write(rgb)) await new Promise((r) => ff.stdin.once('drain', r));
        n++;
      }
      console.log(`part ${i} done (${n} frames, ${((Date.now() - t0) / 1000).toFixed(0)} s)`);
    }
    ff.stdin.end();
  };
  void write();
  ff.on('close', (code) => console.log('ffmpeg done', code, out, n, 'frames'));
}
