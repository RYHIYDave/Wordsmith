// THE CARRION QUEEN'S MOVES DONE THE ACTION WAY: THE FILM (docs/mockups/action_f7_queen/pictures/queen_action.mp4), made outside a
// browser: each move on her eyrie with the knight for size, from in front and from behind (twice the picture's pixels; the Eclipse at the game's own); THE ECLIPSE
// OVER THE WHOLE EYRIE FROM ABOVE, the knight moving between the pools of light and the vultures diving at him outside them; then each
// strike at half speed (two and three times the picture's pixels). Captioned. Frames are piped to ffmpeg. Nothing of the game imports it.
//   npx tsx tools/action_f7_queen_film.ts <out.mp4> [stills <dir> <seconds,...> [parts]]
import { spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Px } from '../src/engine/px';
import { QA_DIVE, QA_ECLIPSE, QA_GUST, QA_RAKE } from '../src/art/carrion_queen_action';
import { ARENA_PASS, DIVE_PASS, ECLIPSE_CLOSE_PASS, GUST_PASS, LEAD, RAKE_PASS, arenaDives, arenaFloor, closeFloor, diveScene, eclipseArena, eclipseCloseScene, gustScene, rakeScene } from '../src/dev/action_f7_queen_scene';
import type { View } from '../src/dev/action_f7_queen_scene';
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
/** Of each whole move, the first moments of her stand left out. */
const SKIP = 0.2;
function baseOf(view: View | 'arena', w: number, h: number, cx: number, cy: number): Px {
  const key = `${view}:${w}x${h}@${cx},${cy}`;
  if (!BASES.has(key)) BASES.set(key, view === 'arena' ? arenaFloor(w, h, cx, cy) : closeFloor(view, w, h, cx, cy));
  return BASES.get(key) as Px;
}
/** A part: a scene of `W / k` by `H / k` picture pixels, her floor point at (cx, cy), `k` times as big; played from `from`, `slow` times slower. */
function part(scene: Scene, view: View, k: number, cx: number, cy: number, long: number, title: string, line: string, from = SKIP, slow = 1): Part {
  if (slow === 1 && from === SKIP) long -= SKIP;
  const w = Math.round(W / k);
  const h = Math.round(H / k);
  const base = baseOf(view, w, h, cx, cy);
  return { long: long * slow, title, line, frame: (t) => { const p = scene(view, from + t / slow, base, cx, cy); return k === 1 ? p : cut(scaled(p, k), 0, 0, W, H); } };
}
/** A strike at half speed: from a little before its wind-up ends to a little after it lands. */
const strike = (scene: Scene, view: View, k: number, cx: number, cy: number, s: readonly [number, number], title: string, line: string, after = 0.35): Part => part(scene, view, k, cx, cy, s[1] - s[0] + 0.25 + after, title, line, LEAD + s[0] - 0.25, 2);
const HALF = 'THE STRIKES · HALF SPEED';
const arena = (): Part => {
  const cx = 640;
  const cy = 330;
  const base = baseOf('arena', W, H, cx, cy);
  return { long: ARENA_PASS - SKIP, title: 'THE ECLIPSE · THE WHOLE LEDGE, FROM ABOVE', line: 'Dark but for pools of light drifting across it · outside them, a vulture dives at you: its line marked first', frame: (t) => eclipseArena(t + SKIP, base, cx, cy) };
};
/** The Eclipse's dives at half speed, from above: the second one, which finds him. */
const diveHalf = (): Part => {
  const dv = arenaDives().find((d) => d.hits) ?? arenaDives()[0];
  const cx = 640;
  const cy = 330;
  const base = baseOf('arena', W, H, cx, cy);
  const t0 = LEAD + dv.mark + QA_ECLIPSE.warn - 0.35;
  return { long: 1.0 * 2, title: HALF, line: 'A vulture out of the dark: down its line in 2 frames, smeared', frame: (t) => eclipseArena(t0 + t / 2, base, cx, cy) };
};
export const parts: Part[] = [
  part(rakeScene, 'front', 2, 230, 250, RAKE_PASS, 'HER RAKE · FROM IN FRONT', `Up and HELD high, her claws' lanes lit on the rock · raked down in 2 frames: three gouges of fire out to ${QA_RAKE.to} tiles`),
  part(rakeScene, 'back', 2, 220, 290, RAKE_PASS, 'HER RAKE · FROM BEHIND', 'The wedge marked while she hangs · run back out of it before she drops'),
  part(gustScene, 'front', 2, 170, 220, GUST_PASS, 'HER GUST · FROM IN FRONT', `Reared, wings drawn back, HELD · clapped in 2 frames: the blast out to ${QA_GUST.far} tiles`),
  part(gustScene, 'back', 2, 170, 300, GUST_PASS, 'HER GUST · FROM BEHIND', 'Its rays run straight out from her: it shoves you straight away from her, never toward the edge'),
  part(diveScene, 'front', 2, 170, 210, DIVE_PASS, 'HER DIVE · FROM IN FRONT', `Up out of sight, her line marked, HELD · down it in 2 frames, ${QA_DIVE.at} tiles out · run out of the ring`),
  part(diveScene, 'back', 2, 170, 300, DIVE_PASS, 'HER DIVE · FROM BEHIND', `Talons first into the rock, held a tenth · the ring ${QA_DIVE.r * 2} tiles across`),
  part(eclipseCloseScene, 'front', 1, 470, 560, ECLIPSE_CLOSE_PASS, 'THE ECLIPSE · FROM IN FRONT', 'Wings spread, screaming, HELD: her flock gathers, the light dims · wings swept down: the flock pours over, the light goes'),
  part(eclipseCloseScene, 'back', 1, 470, 560, ECLIPSE_CLOSE_PASS, 'THE ECLIPSE · FROM BEHIND', 'The flock pours over the ledge from the drop · a pool of light drifts by: stand in it'),
  arena(),
  strike(rakeScene, 'front', 3, 150, 170, QA_RAKE.strike, HALF, 'Her rake: held, then raked down in 2 frames, smeared'),
  strike(gustScene, 'front', 2, 180, 260, QA_GUST.strike, HALF, 'Her gust: clapped in 2 frames, the blast straight out', 0.5),
  strike(diveScene, 'front', 2, 150, 180, QA_DIVE.strike, HALF, 'Her dive: down her line in 2 frames, held a tenth', 0.45),
  strike(eclipseCloseScene, 'front', 1, 470, 560, QA_ECLIPSE.strike, HALF, 'The Eclipse: wings swept down in 2 frames, the light goes', 0.5),
  diveHalf(),
];

if (process.argv[1]?.endsWith('action_f7_queen_film.ts')) {
  const [out = 'queen_action.mp4', mode = ''] = process.argv.slice(2);
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
      for (const k of at.length ? at : [0.2, 0.4, 0.6, 0.8]) writeFileSync(`${dir}/p${i}_${k.toFixed(2)}.png`, png(p.frame(Math.min(p.long - 1e-3, at.length ? k : p.long * k))));
    });
  } else {
    const font = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf';
    const font2 = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf';
    const dir = mkdtempSync(join(tmpdir(), 'qa_captions_'));
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
