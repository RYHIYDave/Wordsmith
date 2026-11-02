// THE HOLLOW STAG DONE THE ACTION WAY: THE FILM (docs/mockups/action_f9_stag/pictures/stag_action.mp4), made outside a browser: the
// whole clearing from above (the game's own picture pixels): him bounding round it, the wood closing in at 3/4, 1/2 and 1/4 of his
// life, his gore and his charge, the knight dodging; then each move close (twice as big), from in front and from behind; then each
// strike at half speed (three times as big). Captioned. Frames are piped to ffmpeg. Nothing of the game imports it.
//   npx tsx tools/stag_action_film.ts <out.mp4> [stills <dir> <seconds,...> [parts]]
import { spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Px } from '../src/engine/px';
import { CHARGE9, CHARGE9_STRIKE, CLOSE, CLOSE_STRIKE, GORE9, GORE9_STRIKE, STOT9 } from '../src/art/stag_action';
import { BOUND_PASS, CHARGE_PASS, CLOSE_PASS, GORE_PASS, LEAD, arenaScene, boundScene, chargeScene, closeScene, fightMoments, goreScene } from '../src/dev/stag_action_scene';
import type { View } from '../src/dev/stag_action_scene';
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
type Scene = (view: View, t: number, w: number, h: number, cx: number, cy: number) => Px;
const SKIP = 0.25;
/** A part: a scene `k` times as big, his floor point at (cx, cy) of the scene; played from `from`, `slow` times slower. */
function part(scene: Scene, view: View, k: number, cx: number, cy: number, long: number, title: string, line: string, from = SKIP, slow = 1): Part {
  if (slow === 1 && from === SKIP) long -= SKIP;
  const w = Math.round(W / k);
  const h = Math.round(H / k);
  return { long: long * slow, title, line, frame: (t) => { const p = scene(view, from + t / slow, w, h, cx, cy); return k === 1 ? p : cut(scaled(p, k), 0, 0, W, H); } };
}
const strike = (scene: Scene, view: View, k: number, cx: number, cy: number, s: readonly [number, number], title: string, line: string, after = 0.3): Part => part(scene, view, k, cx, cy, s[1] - s[0] + 0.3 + after, title, line, LEAD + s[0] - 0.3, 2);
/** A stretch of the fight over the whole clearing, from `a` to `b` seconds of it. */
const arena = (a: number, b: number, title: string, line: string): Part => ({ long: b - a, title, line, frame: (t) => arenaScene(a + t, W, H, 600, 362) });
const M = fightMoments();
const C = M.closes;
const HALF = 'THE STRIKES · HALF SPEED';
export const parts: Part[] = [
  arena(0, C[0], 'THE WHOLE CLEARING, FROM ABOVE', `He bounds all round it: ${STOT9.pace} tiles a second, a bound every ${STOT9.bound} s · jinks as he lands · stops dead to stare`),
  arena(C[0], C[0] + CLOSE.long, 'AT 3/4 OF HIS LIFE: THE WOOD CLOSES IN', 'Reared up, bellowing, HELD: the new edge marked · he crashes down: a wall of roots and thorns bursts up'),
  arena(C[0] + CLOSE.long, M.gore + GORE9.long, 'THE CLEARING 80% ACROSS · HIS GORE', 'Round the smaller clearing · the gore: its sweep marked, HELD · the knight steps back out of it'),
  arena(M.gore + GORE9.long, C[1] + CLOSE.long, 'AT 1/2 OF HIS LIFE: IT CLOSES IN AGAIN', 'The clearing 60% across · the wall inside sinks away as the new one rises'),
  arena(C[1] + CLOSE.long, M.charge + CHARGE9.long, 'HIS CHARGE', `The lane marked · HELD · ${CHARGE9.pace} tiles a second · his antlers smash into the wall: it splinters`),
  arena(M.charge + CHARGE9.long, M.long, 'AT 1/4: LITTLE SAFE GROUND LEFT', 'The clearing 40% across · caught as it rises: struck and thrown in · he bounds on in what is left'),
  part(boundScene, 'front', 2, 300, 232, BOUND_PASS, 'HIS BOUNDS · FROM IN FRONT', 'Stiff legs, all four hoofs together, jinking as he lands · a heavy landing (it knocks) · he stares'),
  part(goreScene, 'front', 2, 230, 170, GORE_PASS, 'THE GORE · FROM IN FRONT', `Head down, antlers cocked, pawing, HELD · hooked up and across in 2 frames: ${GORE9.arc}°, out to ${GORE9.reach} tiles`),
  part(goreScene, 'back', 2, 250, 230, GORE_PASS, 'THE GORE · FROM BEHIND', 'The sweep marked on the floor while it is held · step back out of it'),
  part(chargeScene, 'front', 2, 210, 110, CHARGE_PASS, 'THE CHARGE · FROM IN FRONT', `The lane marked (${CHARGE9.lane} tiles) · pawing, HELD · he bursts off in 2 frames · the crash splinters the wall`),
  part(chargeScene, 'back', 2, 200, 300, CHARGE_PASS, 'THE CHARGE · FROM BEHIND', 'Out of the lane while he holds · he cannot turn once he is off'),
  part(closeScene, 'front', 2, 300, 175, CLOSE_PASS, 'THE WOOD CLOSES IN · FROM IN FRONT', 'He rears up bellowing, HELD · crashes down in 2 frames · the wall bursts up all round, over your head'),
  strike(goreScene, 'front', 3, 170, 130, GORE9_STRIKE, HALF, 'The gore: held, then hooked up and across in 2 frames, smeared'),
  strike(goreScene, 'back', 3, 170, 150, GORE9_STRIKE, HALF, 'The gore from behind: 2 frames'),
  strike(chargeScene, 'front', 3, 266, 200, CHARGE9_STRIKE, HALF, 'The charge: he bursts off in 2 frames', 0.45),
  strike(closeScene, 'front', 3, 200, 125, CLOSE_STRIKE, HALF, 'Crashed down out of his bellow in 2 frames: the wall bursts up', 0.5),
];

if (process.argv[1]?.endsWith('stag_action_film.ts')) {
  const [out = 'stag_action.mp4', mode = ''] = process.argv.slice(2);
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
    const dir = mkdtempSync(join(tmpdir(), 'stag_captions_'));
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
