// THE FLOOR 1 ACTION FILM (docs/mockups/action_f1/pictures/action_f1.mp4), made outside a browser: the bone archer's arrow rain and
// the Warden's Lockdown, from in front and from behind, with the knight; each again at half speed, closer. Captioned. Frames are
// piped to ffmpeg. Nothing of the game imports it.
//   npx tsx tools/action_f1_film.ts <out.mp4> [stills]
import { spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Px } from '../src/engine/px';
import { LOCKDOWN, RAIN, RAIN_LONG } from '../src/art/action_f1_fx';
import { LOCK_AT_HIT, LOCK_BACK, LOCK_FRONT, LOCK_LEAD, RAIN_AT_LOOSE, RAIN_BACK, RAIN_FRONT, RAIN_LEAD, lockScene, lockSegments, rainScene, tombFloor } from '../src/dev/action_f1_scene';
import type { LockPass, RainPass } from '../src/dev/action_f1_scene';
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

/** A scene `w` by `h` picture pixels, made `k` times as big to fill the film (whole pixels). */
const big = (p: Px, k: number): Px => (k === 1 ? p : cut(scaled(p, k), 0, 0, W, H));

// THE ARCHER: a scene of 400 by 226 picture pixels, three times as big (the game's pixels, half again bigger: for a phone)
function rainPart(p: RainPass, title: string): Part {
  const cx = 200;
  const cy = 140;
  const base = tombFloor(400, 226, cx, cy);
  const long = RAIN_LEAD + RAIN_AT_LOOSE + RAIN_LONG + 0.25;
  return { long, title, line: 'Draws almost straight up, holds, looses in a frame; the ring fills with shadows; 1.5 s later the arrows strike', frame: (t) => big(rainScene(p, t, base, cx, cy), 3) };
}
// (half speed, closer: four times as big: the draw and the loose framed on the archer, then the strike framed on the ring)
function rainSlow(p: RainPass): Part {
  const [ax, ay] = [32 * (p.archer[0] - p.archer[1]), 16 * (p.archer[0] + p.archer[1])];
  const [kx, ky] = [32 * (p.knight[0] - p.knight[1]), 16 * (p.knight[0] + p.knight[1])];
  const baseA = tombFloor(300, 169, Math.round(150 - ax - 20), Math.round(130 - ay));
  const baseK = tombFloor(300, 169, Math.round(150 - kx), Math.round(100 - ky));
  const a0 = RAIN_LEAD + 0.25;
  const a1 = RAIN_LEAD + RAIN_AT_LOOSE + 0.2;
  const b0 = RAIN_LEAD + RAIN_AT_LOOSE + RAIN.delay - 0.35;
  const b1 = RAIN_LEAD + RAIN_AT_LOOSE + RAIN.delay + 0.75;
  const first = (a1 - a0) * 2;
  return {
    long: first + (b1 - b0) * 2,
    title: 'THE ARROW RAIN · HALF SPEED',
    line: 'The draw held; the loose in one frame; the strike in two: a streak, then stuck; splinters, dust',
    frame: (t) => (t < first ? big(rainScene(p, a0 + t / 2, baseA, Math.round(150 - ax - 20), Math.round(130 - ay)), 4) : big(rainScene(p, b0 + (t - first) / 2, baseK, Math.round(150 - kx), Math.round(100 - ky)), 4)),
  };
}

// THE WARDEN: his arena whole, at the game's size (1200 by 676 picture pixels); and closer, twice as big
function lockPart(p: LockPass, title: string, k: number, slow = false): Part {
  const segs = lockSegments(p);
  const w = W / k;
  const h = Math.ceil(H / k);
  // (closer: the Warden and the knight in the middle of the picture)
  // (closer, his feet low enough in the picture that his keys held up over his helm are in it, the knight's below him)
  const mid = k === 1 ? [0, 0] : [(p.warden[0] + p.knight[0]) / 2, (p.warden[1] + p.knight[1]) / 2];
  const cx = Math.round(w / 2 - 32 * (mid[0] - mid[1]));
  const cy = k === 1 ? Math.round(h / 2 + 30) : Math.round(h * (k === 3 ? 0.7 : 0.6) - 16 * (p.warden[0] + p.warden[1]));
  const base = tombFloor(w, h, cx, cy);
  if (slow) {
    const t0 = LOCK_LEAD + 0.15;
    const t1 = LOCK_LEAD + LOCK_AT_HIT + 0.45;
    return { long: (t1 - t0) * 2, title: 'THE LOCKDOWN · HALF SPEED', line: 'Keys held up; wrenched down in one frame; the bars crash in two: a streak, then planted', frame: (t) => big(lockScene(p, t0 + t / 2, base, cx, cy, 1, segs), k) };
  }
  const long = LOCK_LEAD + LOCK_AT_HIT + LOCKDOWN.stand + LOCKDOWN.rise + 0.35;
  return { long, title, line: 'Keys up: the bars’ shadows cross the arena. Keys down: the bars crash. Stand in a cell', frame: (t) => big(lockScene(p, t, base, cx, cy, 1, segs), k) };
}

const parts: Part[] = [
  rainPart(RAIN_FRONT, 'THE BONE ARCHER’S ARROW RAIN · FROM IN FRONT'),
  rainPart(RAIN_BACK, 'THE BONE ARCHER’S ARROW RAIN · FROM BEHIND'),
  rainSlow(RAIN_FRONT),
  lockPart(LOCK_FRONT, 'THE WARDEN’S LOCKDOWN · FROM IN FRONT · HIS ARENA', 1),
  lockPart(LOCK_BACK, 'THE WARDEN’S LOCKDOWN · FROM BEHIND · HIS ARENA', 1),
  lockPart(LOCK_FRONT, 'THE WARDEN’S LOCKDOWN · FROM IN FRONT · CLOSER', 2),
  lockPart(LOCK_FRONT, '', 3, true),
];

const [out = 'action_f1.mp4', mode = ''] = process.argv.slice(2);
let total = 0;
for (const p of parts) total += p.long;
console.log(parts.length, 'parts,', total.toFixed(1), 's');
if (mode === 'stills') {
  mkdirSync(out, { recursive: true });
  const at = (process.argv[4] ?? '').split(',').filter(Boolean).map(Number);
  parts.forEach((p, i) => {
    for (const k of at.length ? at : [0.2, 0.4, 0.6, 0.8]) writeFileSync(`${out}/p${i}_${k.toFixed(2)}.png`, png(p.frame(Math.min(p.long - 1e-3, k < 1.0001 && !at.length ? p.long * k : k))));
  });
} else {
  const font = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf';
  const font2 = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf';
  const dir = mkdtempSync(join(tmpdir(), 'action_f1_captions_'));
  const filters: string[] = [];
  let at = 0;
  parts.forEach((p, i) => {
    writeFileSync(`${dir}/t${i}.txt`, p.title);
    writeFileSync(`${dir}/l${i}.txt`, p.line);
    const en = `:enable='between(t,${at.toFixed(3)},${(at + p.long - 0.001).toFixed(3)})'`;
    filters.push(`drawtext=fontfile=${font}:textfile=${dir}/t${i}.txt:x=18:y=14:fontsize=27:fontcolor=0xf0e8d0:box=1:boxcolor=0x07060c@0.65:boxborderw=8${en}`);
    filters.push(`drawtext=fontfile=${font2}:textfile=${dir}/l${i}.txt:x=18:y=${H}-44:fontsize=22:fontcolor=0xd8d2e6:box=1:boxcolor=0x07060c@0.65:boxborderw=8${en}`);
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
