// THE FLOOR 3 ACTION FILM (docs/mockups/action_f3/pictures/action_f3.mp4), made outside a browser: the green troll's rampage
// (two stepping swings, the leap and the slam, its shockwave ring) with the knight, from in front and from behind, then at half
// speed; his bull rush down its lane, from in front and from behind, then at half speed; the Boneward's shield wall: coming on
// behind its shield, a blow from in front glancing off, one from the side landing, the shield lowered and the spear thrown, from
// in front and from behind; the glance at half speed. Captioned. Frames are piped to ffmpeg. Nothing of the game imports it.
//   npx tsx tools/action_f3_film.ts <out.mp4> [stills <dir> <seconds,...> [parts]]
import { spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Px } from '../src/engine/px';
import { RAMPAGE_HITS } from '../src/art/monster_brute';
import { RING, RUSH, WALL } from '../src/art/action_f3_fx';
import { tombFloor } from '../src/dev/action_f1_scene';
import { LEAD, RAMPAGE_PASS, WALL_PASS, rampageScene, rushScene, rushTimes, wallScene } from '../src/dev/action_f3_scene';
import type { View } from '../src/dev/action_f3_scene';
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
/** A scene made `k` times as big to fill the film (whole pixels). */
const big = (p: Px, k: number): Px => (k === 1 ? p : cut(scaled(p, k), 0, 0, W, H));
type Scene = (view: View, t: number, base: Px, cx: number, cy: number) => Px;
/** A part: a scene of `W / k` by `H / k` picture pixels, its middle at (cx, cy), `k` times as big; played from `from`, `slow` times slower. */
function part(scene: Scene, view: View, k: number, cx: number, cy: number, long: number, title: string, line: string, from = 0, slow = 1): Part {
  const w = Math.round(W / k);
  const h = Math.round(H / k);
  const base = tombFloor(w, h, cx, cy);
  return { long: long * slow, title, line, frame: (t) => big(scene(view, from + t / slow, base, cx, cy), k) };
}
const rush = rushTimes();
const [h1, , h3] = RAMPAGE_HITS;
const parts: Part[] = [
  part(rampageScene, 'front', 2, 280, 140, RAMPAGE_PASS, 'THE GREEN TROLL’S RAMPAGE · FROM IN FRONT', `Wound up and HELD · a swing · a step in · the backhand · the club up, crouched, HELD · the leap · the slam: its ring ${RING.radius} tiles`),
  part(rampageScene, 'back', 2, 260, 215, RAMPAGE_PASS, 'THE GREEN TROLL’S RAMPAGE · FROM BEHIND', 'The same: each blow in two frames, smeared; the ring marked from when the club goes up'),
  part(rampageScene, 'front', 3, 185, 138, h3 + 0.5 - (h1 - 0.35), 'THE RAMPAGE · HALF SPEED', 'Held · the swing in two frames · the step · held · the backhand · the leap · the slam in two frames', LEAD + h1 - 0.35, 2),
  part(rushScene, 'front', 2, 290, 165, rush.end + 0.5, 'THE GREEN TROLL’S BULL RUSH · FROM IN FRONT', `Head down, a fist on the floor, pawing (HELD 1 s, the lane marked) · ${RUSH.pace} tiles a second · a stumble to a stop`),
  part(rushScene, 'back', 2, 300, 230, rush.end + 0.5, 'THE GREEN TROLL’S BULL RUSH · FROM BEHIND', `The lane ${(RUSH.half * 2).toFixed(1)} tiles wide, on ${RUSH.past + RUSH.stop} tiles past where you stood`),
  part(rushScene, 'front', 3, 160, 132, rush.stop + 1.0 - (LEAD + 0.2), 'THE BULL RUSH · HALF SPEED', 'The brow lowered, the knuckles down, pawing; off; the run; the foot dug in, rocked back, his head shaken', LEAD + 0.2, 2),
  part(wallScene, 'front', 3, 170, 105, WALL_PASS, 'THE BONEWARD’S SHIELD WALL · FROM IN FRONT', 'It comes on behind its shield · a blow from in front GLANCES OFF · from the side it lands · it lowers the shield and throws'),
  part(wallScene, 'back', 3, 210, 150, WALL_PASS, 'THE BONEWARD’S SHIELD WALL · FROM BEHIND', `The wall: blows within ${WALL.arc} degrees of its front glance off; down from its throw until it has its spear again`),
  part(wallScene, 'front', 4, 120, 95, 1.0, 'THE GLANCE · HALF SPEED', 'White star, the shield rings, sparks of the enemy’s gold and pink; it holds its ground', 2.25 - 0.3, 2),
];

const [out = 'action_f3.mp4', mode = ''] = process.argv.slice(2);
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
  const dir = mkdtempSync(join(tmpdir(), 'action_f3_captions_'));
  const filters: string[] = [];
  let at = 0;
  parts.forEach((p, i) => {
    writeFileSync(`${dir}/t${i}.txt`, p.title);
    writeFileSync(`${dir}/l${i}.txt`, p.line);
    const en = `:enable='between(t,${at.toFixed(3)},${(at + p.long - 0.001).toFixed(3)})'`;
    filters.push(`drawtext=fontfile=${font}:textfile=${dir}/t${i}.txt:x=18:y=14:fontsize=26:fontcolor=0xf0e8d0:box=1:boxcolor=0x07060c@0.65:boxborderw=8${en}`);
    filters.push(`drawtext=fontfile=${font2}:textfile=${dir}/l${i}.txt:x=18:y=${H}-44:fontsize=19:fontcolor=0xd8d2e6:box=1:boxcolor=0x07060c@0.65:boxborderw=8${en}`);
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
