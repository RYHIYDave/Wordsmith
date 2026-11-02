// THE FLOOR 4 ACTION FILM (docs/mockups/action_f4/pictures/action_f4.mp4), made outside a browser: the Ossuary Golem's skeleton
// hurl with the knight, from in front and from behind (the haul, the hold, the hurl, the flight, the burst), then at half speed;
// the dagger cultist's frenzy and his winded moment, from in front and from behind, then at half speed; and a pack of them at the
// game's size. Captioned. Frames are piped to ffmpeg. Nothing of the game imports it.
//   npx tsx tools/action_f4_film.ts <out.mp4> [stills <dir> <seconds,...> [parts]]
import { spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Px } from '../src/engine/px';
import { HURL, hurlFly } from '../src/art/action_f4_fx';
import { FRENZY } from '../src/art/cultists';
import { tombFloor } from '../src/dev/action_f1_scene';
import { FRENZY_PASS, HURL_PASS, LEAD, frenzyScene, frenzyTimes, hurlScene, hurlTimes, packScene } from '../src/dev/action_f4_scene';
import type { View } from '../src/dev/action_f4_scene';
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
type Scene = (view: View, t: number, base: Px, cx: number, cy: number) => Px;
/** A part: a scene of `W / k` by `H / k` picture pixels, its middle at (cx, cy), `k` times as big; played from `from`, `slow` times slower. */
function part(scene: Scene, view: View, k: number, cx: number, cy: number, long: number, title: string, line: string, from = 0, slow = 1): Part {
  const w = Math.round(W / k);
  const h = Math.round(H / k);
  const base = tombFloor(w, h, cx, cy);
  return { long: long * slow, title, line, frame: (t) => big(scene(view, from + t / slow, base, cx, cy), k) };
}
const ht = hurlTimes();
const ft = frenzyTimes();
const fly = hurlFly(ht.d);
const parts: Part[] = [
  part(hurlScene, 'front', 2, 300, 150, HURL_PASS, 'THE OSSUARY GOLEM’S SKELETON HURL · FROM IN FRONT', `A skeleton hauled up · held aloft, HELD (its reach marked) · hurled · ${fly.toFixed(2)} s in the air · bursts ${HURL.r} tiles round`),
  part(hurlScene, 'back', 2, 270, 205, HURL_PASS, 'THE SKELETON HURL · FROM BEHIND', 'The same: the throw in two frames, smeared; its shadow growing as it comes down; the bones lie, crumble and are gone'),
  part(hurlScene, 'front', 2, 285, 160, ht.land + 1.1 - (ht.aim - 0.25), 'THE HURL · HALF SPEED', 'Held · over the top and loosed in two frames · the low, fast throw · the burst: bones flung out all round as shrapnel', ht.aim - 0.25, 2),
  part(frenzyScene, 'front', 3, 215, 125, FRENZY_PASS, 'THE DAGGER CULTIST’S FRENZY · FROM IN FRONT', `Runs in · coiled, HELD · four stabs in a blur, a step in with each · WINDED ${(FRENZY.winded[1] - FRENZY.winded[0]).toFixed(2)} s: your opening`),
  part(frenzyScene, 'back', 3, 190, 150, FRENZY_PASS, 'THE FRENZY · FROM BEHIND', `Each stab one frame, smeared · ${FRENZY.step} tiles a step, ${FRENZY.travel.toFixed(1)} in all · bent over, heaving, then up again`),
  part(frenzyScene, 'front', 4, 165, 92, FRENZY.hits[3] + 0.3 - 0.2, 'THE FRENZY · HALF SPEED', 'The coil held · stab, stab, stab, stab · a step in with each', ft.go + 0.2, 2),
  part((_v, t, base, cx, cy) => packScene(t, base, cx, cy), 'front', 1, 600, 360, 5.6, 'A PACK OF THEM · AT THE GAME’S SIZE', 'Five dagger cultists running in and frenzying, each in his turn: get out, or hit them while they heave'),
];
void LEAD;

const [out = 'action_f4.mp4', mode = ''] = process.argv.slice(2);
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
    for (const k of at.length ? at : [0.2, 0.4, 0.6, 0.8]) writeFileSync(`${dir}/p${i}_${k.toFixed(2)}.png`, png(p.frame(Math.min(p.long - 1e-3, !at.length ? p.long * k : k))));
  });
} else {
  const font = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf';
  const font2 = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf';
  const dir = mkdtempSync(join(tmpdir(), 'action_f4_captions_'));
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
