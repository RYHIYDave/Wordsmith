// THE CHAINED ONE'S MOVES DONE THE ACTION WAY: THE FILM (docs/mockups/action_f3_chained/pictures/chained_action.mp4), made outside a
// browser: each of his four moves in his pit with the knight for size, from in front and from behind (twice the game's pixels);
// then each strike at half speed (three times the game's pixels); then his lash once more at his third state, free of the ball and
// of his left chain. Captioned. Frames are piped to ffmpeg. Nothing of the game imports it.
//   npx tsx tools/action_f3_chained_film.ts <out.mp4> [stills <dir> <seconds,...> [parts]]
import { spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Px } from '../src/engine/px';
import { BALL_BACK, BALL_STRIKE, HOOK_BLOW_STRIKE, HOOK_STRIKE, LASH_STRIKES, WHIRL_RATE, WHIRL_STRIKE } from '../src/art/chained_action';
import { CRACK, RING } from '../src/art/chained_action_fx';
import { tombFloor } from '../src/dev/action_f1_scene';
import { BALL_AT, BALL_PASS, HOOK_PASS, LASH_PASS, LEAD, WHIRL_EXTRA, WHIRL_PASS, ballScene, hookScene, lashScene, whirlScene } from '../src/dev/action_f3_chained_scene';
import type { View } from '../src/dev/action_f3_chained_scene';
import type { CoFreed } from '../src/art/bosses3';
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
type Scene = (view: View, t: number, base: Px, cx: number, cy: number, k?: number, freed?: CoFreed) => Px;
/** A part: a scene of `W / k` by `H / k` picture pixels, its middle at (cx, cy), `k` times as big; played from `from`, `slow` times slower. */
function part(scene: Scene, view: View, k: number, cx: number, cy: number, long: number, title: string, line: string, from = 0, slow = 1, freed: CoFreed = 0): Part {
  const w = Math.round(W / k);
  const h = Math.round(H / k);
  const base = tombFloor(w, h, cx, cy);
  return { long: long * slow, title, line, frame: (t) => big(scene(view, from + t / slow, base, cx, cy, 1, freed), k) };
}
/** A strike at half speed: from a little before its wind-up ends to a little after it lands. */
const strike = (scene: Scene, view: View, cx: number, cy: number, s: readonly [number, number], title: string, line: string, shift = 0): Part => part(scene, view, 3, cx, cy, s[1] - s[0] + 0.45, title, line, LEAD + shift + s[0] - 0.2, 2);
const ballPass = LEAD + BALL_BACK + 0.3;
const parts: Part[] = [
  part(lashScene, 'front', 2, 300, 230, LASH_PASS, 'THE LASH · FROM IN FRONT', `Forehand: cocked, HELD, 2 frames · backhand: HELD, 2 frames · both fists up, HELD · slammed: the crack runs ${CRACK.to} tiles`),
  part(lashScene, 'back', 2, 300, 178, LASH_PASS, 'THE LASH · FROM BEHIND', 'Each blow steps in: he ends a tile on from where he began'),
  part(whirlScene, 'front', 2, 270, 195, WHIRL_PASS, 'THE WHIRL · FROM IN FRONT', `Chains gathered, HELD · spun on one foot, ${WHIRL_RATE / 360} turns a second, coming after you · fists up · slammed: a ring ${RING.whirl} tiles`),
  part(whirlScene, 'back', 2, 300, 210, WHIRL_PASS, 'THE WHIRL · FROM BEHIND', 'His chains flat out round him at your height, fire behind their ends'),
  part(hookScene, 'front', 2, 300, 250, HOOK_PASS, 'THE HOOK · FROM IN FRONT', 'Whirled · AIMED and HELD · flung in 2 frames · dragged in, two hauls · fists up, HELD · hammered down: a ring'),
  part(hookScene, 'back', 2, 300, 178, HOOK_PASS, 'THE HOOK · FROM BEHIND', 'The blow waits at the end of the drag: get out from under it'),
  part(ballScene, 'front', 2, 270, 250, ballPass, 'THE BALL · FROM IN FRONT', `Taken up · HELD HIGH · drawn back, HELD · whipped down in 2 frames · it lands ${BALL_AT} tiles off: a ring ${RING.ball} tiles`),
  part(ballScene, 'back', 2, 300, 178, ballPass, 'THE BALL · FROM BEHIND', 'Marked from when he holds it high: a second to get out'),
  strike(lashScene, 'front', 235, 235, LASH_STRIKES[0], 'THE STRIKES · HALF SPEED', 'The forehand: held still, then two frames, smeared'),
  strike(lashScene, 'front', 215, 225, LASH_STRIKES[1], 'THE STRIKES · HALF SPEED', 'The backhand: two frames'),
  part(lashScene, 'front', 2, 300, 230, LASH_STRIKES[2][1] - LASH_STRIKES[2][0] + 0.6, 'THE STRIKES · HALF SPEED', 'The finisher: two frames, and the crack running out', LEAD + LASH_STRIKES[2][0] - 0.2, 2),
  strike(whirlScene, 'front', 130, 165, WHIRL_STRIKE, 'THE STRIKES · HALF SPEED', 'The whirl’s slam: two frames, and the ring', WHIRL_EXTRA),
  strike(hookScene, 'front', 255, 245, HOOK_STRIKE, 'THE STRIKES · HALF SPEED', 'The hook flung: two frames'),
  strike(hookScene, 'front', 240, 245, HOOK_BLOW_STRIKE, 'THE STRIKES · HALF SPEED', 'The blow waiting: two frames'),
  strike(ballScene, 'front', 240, 245, BALL_STRIKE, 'THE STRIKES · HALF SPEED', 'The ball whipped down: two frames'),
  part(lashScene, 'front', 2, 300, 230, LASH_PASS, 'AT HIS THIRD STATE · FREE OF BOTH', 'His lash with one chain left (he is 2.2 times as quick then: the game plays it faster)', 0, 1, 2),
];

const [out = 'chained_action.mp4', mode = ''] = process.argv.slice(2);
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
  const dir = mkdtempSync(join(tmpdir(), 'chained_captions_'));
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
