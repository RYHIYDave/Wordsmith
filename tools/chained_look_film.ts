// THE CHAINED ONE IN HIS NEW LOOK, THE GAUNT CHAIN-WRAITH: THE FILM (docs/mockups/chained_look/pictures/chained_look.mp4), made
// outside a browser: him standing and walking; then each of his approved moves on the new body in his pit with the knight for size,
// from in front (the lash combo and the whirl also from behind); struck and dying; his chains breaking. Twice the game's pixels,
// captioned. Frames are piped to ffmpeg. Nothing of the game imports it.
//   npx tsx tools/chained_look_film.ts <out.mp4> [stills <dir> <seconds,...> [parts]]
import { spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Px } from '../src/engine/px';
import { BALL_BACK } from '../src/art/chained_action';
import { RING } from '../src/art/chained_action_fx';
import { tombFloor } from '../src/dev/action_f1_scene';
import { BALL_AT, BREAK_LONG, DIE_LONG, HOOK_PASS, LASH_PASS, LEAD, WHIRL_PASS, ballScene, hookScene, lashScene, moveScene, walkScene, whirlScene } from '../src/dev/chained_look_scene';
import type { View } from '../src/dev/chained_look_scene';
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
/** A part: a scene of `W / k` by `H / k` picture pixels, its middle at (cx, cy), `k` times as big. */
function part(scene: Scene, view: View, k: number, cx: number, cy: number, long: number, title: string, line: string, freed: CoFreed = 0): Part {
  const w = Math.round(W / k);
  const h = Math.round(H / k);
  const base = tombFloor(w, h, cx, cy);
  return { long, title, line, frame: (t) => big(scene(view, t, base, cx, cy, 1, freed), k) };
}
const move = (name: string, long: number): Scene => (view, t, base, cx, cy, k, freed) => moveScene(view, name, long, t, base, cx, cy, k, freed);
const walk: Scene = (view, t, base, cx, cy, k, freed) => walkScene(view, t, base, cx, cy, k, freed);
const ballPass = LEAD + BALL_BACK + 0.3;
const parts: Part[] = [
  part(walk, 'front', 2, 300, 250, 4.6, 'THE GAUNT CHAIN-WRAITH · STANDING, WALKING', 'Taller and thinner, his own chains wound round him like bandages, the ball dragged behind (the knight for size)'),
  part(lashScene, 'front', 2, 300, 250, LASH_PASS, 'THE LASH · FROM IN FRONT', 'His moves as approved, on the new body: forehand, backhand, both fists up, HELD · slammed: the crack'),
  part(lashScene, 'back', 2, 300, 200, LASH_PASS, 'THE LASH · FROM BEHIND', 'Each blow a step in, his chains and rags swinging after him'),
  part(whirlScene, 'front', 2, 300, 225, WHIRL_PASS, 'THE WHIRL · FROM IN FRONT', `Chains gathered, HELD · spun on one foot, coming after you · fists up · slammed: a ring ${RING.whirl} tiles`),
  part(whirlScene, 'back', 2, 300, 225, WHIRL_PASS, 'THE WHIRL · FROM BEHIND', 'His chains flat out round him, fire behind their ends'),
  part(hookScene, 'front', 2, 300, 265, HOOK_PASS, 'THE HOOK · FROM IN FRONT', 'Whirled · AIMED and HELD · flung · dragged in · fists up, HELD · hammered down'),
  part(ballScene, 'front', 2, 300, 275, ballPass, 'THE BALL · FROM IN FRONT', `Taken up · HELD HIGH · drawn back, HELD · whipped down: it lands ${BALL_AT} tiles off, a ring ${RING.ball} tiles`),
  part(move('reel', 0.3), 'front', 2, 300, 250, LEAD + 0.3 + 0.5, 'STRUCK', 'He jerks back from the blow, his head snapping up in the cage'),
  part(move('dying', DIE_LONG), 'front', 2, 300, 250, LEAD + DIE_LONG + 0.6, 'HIS CHAINS DRAG HIM DOWN', 'Struck down: his chains too heavy to lift drag him onto his knees and onto his face; the fire in his cage goes out'),
  part(move('breakL', BREAK_LONG), 'front', 2, 300, 250, LEAD + BREAK_LONG + 0.2, 'HIS FIRST CHAIN BREAKS', 'He stamps on his left chain and rips his arm free'),
];

const [out = 'chained_look.mp4', mode = ''] = process.argv.slice(2);
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
  const dir = mkdtempSync(join(tmpdir(), 'chained_look_captions_'));
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
