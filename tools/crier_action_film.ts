// THE CRIER'S MOVES DONE THE ACTION WAY: THE FILM (docs/mockups/action_f11_crier/pictures/crier_action.mp4), made outside a browser:
// each move in his square with the knight for size, from in front and from behind (twice the game's pixels); the shout off the walls,
// the scroll down a lane and the crowd's call over the whole square from above (the game's own pixels, the square whole), the knight
// finding the one spot; then each strike at half speed (three times the game's pixels). Captioned. Frames are piped to ffmpeg.
// Nothing of the game imports it.
//   npx tsx tools/crier_action_film.ts <out.mp4> [stills <dir> <seconds,...> [parts]]
import { spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Px } from '../src/engine/px';
import { CROWD_STRIKE, PROCLAIM_STRIKE, SHOUT_STRIKE, SWING_STRIKES } from '../src/art/crier_action';
import { DECREE, RING, WALLS } from '../src/art/crier_action_fx';
import { CROWD_ARENA_PASS, CROWD_PASS, DECREE_ARENA_PASS, DECREE_PASS, LEAD, SHOUT_ARENA_PASS, SHOUT_PASS, SWING_PASS, crowdArena, crowdScene, decreeArena, decreeScene, shoutArena, shoutScene, squareFloor, swingScene } from '../src/dev/crier_action_scene';
import type { View } from '../src/dev/crier_action_scene';
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
type Scene = (view: View, t: number, base: Px, cx: number, cy: number) => Px;
const BASES = new Map<string, Px>();
const SKIP = 0.25;
/** A part: a scene of `W / k` by `H / k` picture pixels, the square's middle at (cx, cy), `k` times as big; played from `from`, `slow` times slower. */
function part(scene: Scene, view: View, k: number, cx: number, cy: number, long: number, title: string, line: string, from = SKIP, slow = 1): Part {
  if (slow === 1 && from === SKIP) long -= SKIP;
  const w = Math.round(W / k);
  const h = Math.round(H / k);
  const key = `${w}x${h}@${cx},${cy}`;
  if (!BASES.has(key)) BASES.set(key, squareFloor(w, h, cx, cy));
  const base = BASES.get(key) as Px;
  return { long: long * slow, title, line, frame: (t) => { const p = scene(view, from + t / slow, base, cx, cy); return k === 1 ? p : cut(scaled(p, k), 0, 0, W, H); } };
}
const strike = (scene: Scene, view: View, k: number, cx: number, cy: number, s: readonly [number, number], title: string, line: string, after = 0.3): Part => part(scene, view, k, cx, cy, s[1] - s[0] + 0.3 + after, title, line, LEAD + s[0] - 0.3, 2);
const arena = (fn: (t: number, base: Px, cx: number, cy: number) => Px, long: number, title: string, line: string, from = SKIP): Part => {
  const base = squareFloor(W, H, 600, 352);
  return { long: long - from, title, line, frame: (t) => fn(t + from, base, 600, 352) };
};
const HALF = 'THE STRIKES · HALF SPEED';
export const parts: Part[] = [
  part(swingScene, 'front', 2, 300, 175, SWING_PASS, 'THE TRUMPET SWING · FROM IN FRONT', 'Hauled back, HELD · swung round in 2 frames · backswing, HELD · raised overhead, HELD · SLAMMED: a ring of silence'),
  part(swingScene, 'back', 2, 300, 200, SWING_PASS, 'THE TRUMPET SWING · FROM BEHIND', `Each sweep marked on the floor while it is held · the finisher's ring ${RING.r} tiles round where the bell lands`),
  arena(shoutArena, SHOUT_ARENA_PASS, 'THE SHOUT OFF THE WALLS · THE WHOLE SQUARE', 'The breath HELD: the square marked, ONE SPOT left plain · the shout crosses it, hits the walls, comes back from 3 sides', 0.6),
  part(shoutScene, 'front', 2, 400, 230, SHOUT_PASS, 'THE SHOUT OFF THE WALLS · FROM IN FRONT', 'Trumpet to his lips, chest heaving, the air round the bell rippling, HELD · thrown into the shout in 2 frames'),
  part(shoutScene, 'back', 2, 410, 140, SHOUT_PASS, 'THE SHOUT OFF THE WALLS · FROM BEHIND', `The one spot: behind him, against the wall at his back · the echoes stop ${WALLS.side} tiles either side of his line`),
  arena(decreeArena, DECREE_ARENA_PASS, 'THE SCROLL DOWN A LANE · THE WHOLE SQUARE', `The lane marked the length of the square · flung: it unrolls in a smear · its letters burn ${(DECREE.out - DECREE.unrolled).toFixed(0)} s: floor taken away`, 0.55),
  part(decreeScene, 'front', 2, 310, 230, DECREE_PASS, 'THE SCROLL DOWN A LANE · FROM IN FRONT', `The decree held high, HELD · flung down in 2 frames · ${(DECREE.half * 2).toFixed(1)} tiles wide, to the far wall`),
  part(decreeScene, 'back', 2, 290, 210, DECREE_PASS, 'THE SCROLL DOWN A LANE · FROM BEHIND', 'Out of the lane while he holds it · then keep off the burning letters'),
  arena(crowdArena, CROWD_ARENA_PASS, 'HE CALLS THE CROWD · THE WHOLE SQUARE', 'Sunk down, drawing breath, HELD: the Hush wells up in the lanes and doorways · the call: the Hushed pour in', 0.5),
  part(crowdScene, 'front', 2, 300, 215, CROWD_PASS, 'HE CALLS THE CROWD · FROM IN FRONT', 'Sunk down, the trumpet to the floor, chest heaving, HELD · flung up to the sky in 2 frames'),
  part(crowdScene, 'back', 2, 300, 230, CROWD_PASS, 'HE CALLS THE CROWD · FROM BEHIND', 'The call goes out over the rooftops · they come up out of the pools and shuffle in at you'),
  strike(swingScene, 'front', 3, 200, 110, SWING_STRIKES[0], HALF, 'The swing: held, then round in 2 frames, smeared'),
  strike(swingScene, 'front', 3, 200, 110, SWING_STRIKES[1], HALF, 'The backswing: 2 frames'),
  strike(swingScene, 'front', 2, 280, 215, SWING_STRIKES[2], HALF, 'The finisher: slammed down over the top in 2 frames', 0.45),
  strike(shoutScene, 'front', 3, 290, 160, SHOUT_STRIKE, HALF, 'The shout: thrown in, 2 frames', 0.45),
  strike(decreeScene, 'front', 3, 250, 210, PROCLAIM_STRIKE, HALF, 'The decree: flung down in 2 frames, and the smear', 0.45),
  strike(crowdScene, 'front', 3, 200, 187, CROWD_STRIKE, HALF, 'The call: up to the sky in 2 frames', 0.35),
];

if (process.argv[1]?.endsWith('crier_action_film.ts')) {
  const [out = 'crier_action.mp4', mode = ''] = process.argv.slice(2);
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
    const dir = mkdtempSync(join(tmpdir(), 'crier_captions_'));
    const filters: string[] = [];
    let at = 0;
    parts.forEach((p, i) => {
      writeFileSync(`${dir}/t${i}.txt`, p.title);
      writeFileSync(`${dir}/l${i}.txt`, p.line);
      const en = `:enable='between(t,${at.toFixed(3)},${(at + p.long - 0.001).toFixed(3)})'`;
      filters.push(`drawtext=fontfile=${font}:expansion=none:textfile=${dir}/t${i}.txt:x=18:y=14:fontsize=26:fontcolor=0xf0e8d0:box=1:boxcolor=0x07060c@0.65:boxborderw=8${en}`);
      filters.push(`drawtext=fontfile=${font2}:expansion=none:textfile=${dir}/l${i}.txt:x=18:y=${H}-44:fontsize=18:fontcolor=0xd8d2e6:box=1:boxcolor=0x07060c@0.65:boxborderw=8${en}`);
      at += p.long;
    });
    const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-', '-vf', filters.join(','), '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-tune', 'animation', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
    const rgb = Buffer.alloc(W * H * 3);
    let n = 0;
    const t0 = Date.now();
    const write = async (): Promise<void> => {
      for (const [i, p] of parts.entries()) {
        const frames = Math.round(p.long * FPS);
        for (let fr = 0; fr < frames; fr++) {
          const px = p.frame(fr / FPS);
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
}
