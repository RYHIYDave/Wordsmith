// THE PHYSICIAN'S MOVES DONE THE ACTION WAY: THE FILM (docs/mockups/action_f14_physician/pictures/physician_action.mp4), made outside
// a browser: the Diagnosis over the whole theatre from above (the game's own pixels, the theatre whole: the knight ducking behind a
// bed and a pillar as the mark fills and drains, caught in the open, the operation); then each move close with the knight, from in
// front and from behind (twice the game's pixels); then each strike at half speed (three times). Captioned. Frames are piped to
// ffmpeg. Nothing of the game imports it.
//   npx tsx tools/physician_action_film.ts <out.mp4> [stills <dir> <seconds,...> [parts]]
import { spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Px } from '../src/engine/px';
import { DRAW9_STRIKE, OP_HIT, OP_STRIKE, RAP9_STRIKE, ROUNDS9_STRIKES } from '../src/art/physician_action';
import { BEAM, FIELD, LUNGE, RAP, RINGS } from '../src/art/physician_action_fx';
import { DIAG_ARENA_PASS, DRAW_PASS, LEAD, RAP_PASS, ROUNDS_PASS, diagArena, diagArenaFull, diagCloseScene, diagClosePass, drawScene, rapScene, roundsScene, theatreFloor } from '../src/dev/physician_action_scene';
import type { View } from '../src/dev/physician_action_scene';
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
const baseOf = (w: number, h: number, cx: number, cy: number): Px => {
  const key = `${w}x${h}@${cx},${cy}`;
  // (the sawdust strewn round the operating table only where the table stands: over the whole theatre)
  if (!BASES.has(key)) BASES.set(key, theatreFloor(w, h, cx, cy, w === W));
  return BASES.get(key) as Px;
};
/** A part: a scene of `W / k` by `H / k` picture pixels, the theatre's middle at (cx, cy), `k` times as big; played from `from`, `slow` times slower. */
function part(scene: Scene, view: View, k: number, cx: number, cy: number, long: number, title: string, line: string, from = SKIP, slow = 1): Part {
  if (slow === 1 && from === SKIP) long -= SKIP;
  const w = Math.round(W / k);
  const h = Math.round(H / k);
  const base = baseOf(w, h, cx, cy);
  return { long: long * slow, title, line, frame: (t) => { const p = scene(view, from + t / slow, base, cx, cy); return k === 1 ? p : cut(scaled(p, k), 0, 0, W, H); } };
}
const strike = (scene: Scene, view: View, k: number, cx: number, cy: number, s: readonly [number, number], title: string, line: string, after = 0.3, before = 0.3): Part => part(scene, view, k, cx, cy, s[1] - s[0] + before + after, title, line, LEAD + s[0] - before, 2);
const HALF = 'THE STRIKES · HALF SPEED';
const full = diagArenaFull();
const opAt = (view: View): number => diagClosePass(view) - OP_HIT - 1.2 - LEAD;
export const parts: Part[] = [
  {
    long: DIAG_ARENA_PASS() - 0.3,
    title: 'DIAGNOSIS · THE WHOLE THEATRE',
    line: `His lens's light finds you and follows · the mark fills while you stand in it · behind a bed or a pillar it drains`,
    frame: (t) => diagArena(t + 0.3, baseOf(W, H, 600, 336), 600, 336),
  },
  part(diagCloseScene, 'front', 2, 300, 150, diagClosePass('front'), 'DIAGNOSIS, THEN HE OPERATES · FROM IN FRONT', `The lens raised, the mark fills · full: the lens FLARES, his instruments fan out, HELD · one strike, ${FIELD.r} tiles round`),
  part(diagCloseScene, 'back', 2, 300, 220, diagClosePass('back'), 'DIAGNOSIS, THEN HE OPERATES · FROM BEHIND', 'Duck behind the bed: the mark drains · caught in the open: run from the marked field while he winds up'),
  part(rapScene, 'front', 2, 280, 170, RAP_PASS, 'THE RAP · FROM IN FRONT', `The cane hauled up over his shoulder, HELD · down in 2 frames at the end of a long step · cracks ${RAP.r} tiles round`),
  part(rapScene, 'back', 2, 300, 230, RAP_PASS, 'THE RAP · FROM BEHIND', `The ferrule lands ${RAP.ahead} tiles out (old 1.2) · the line and the star marked while it is held`),
  part(drawScene, 'front', 2, 270, 170, DRAW_PASS, 'THE DRAW · FROM IN FRONT', `En garde, HELD · the lunge in 2 frames, a needle of light ${LUNGE.to} tiles down the lane · your word hangs over his head`),
  part(drawScene, 'back', 2, 300, 230, DRAW_PASS, 'THE DRAW · FROM BEHIND', 'Out of the marked lane while he holds en garde'),
  part(roundsScene, 'front', 2, 300, 170, ROUNDS_PASS, 'ROUNDS · FROM IN FRONT', `The cane hoisted, HELD · three raps, each in 2 frames · rings of the Hush ${RINGS.reach} tiles out (old 3.5)`),
  part(roundsScene, 'back', 2, 250, 250, ROUNDS_PASS, 'ROUNDS · FROM BEHIND', 'Out past the marked ring while he holds the cane up'),
  strike(diagCloseScene, 'front', 2, 300, 150, [opAt('front') + OP_STRIKE[0], opAt('front') + OP_STRIKE[1]], HALF, 'He operates: 2 frames, the light burnt into the field', 0.5),
  strike(rapScene, 'front', 3, 200, 110, RAP9_STRIKE, HALF, 'The rap: 2 frames, smeared'),
  strike(drawScene, 'front', 3, 180, 110, DRAW9_STRIKE, HALF, 'The lunge: 2 frames'),
  strike(roundsScene, 'front', 3, 200, 110, [ROUNDS9_STRIKES[0][0], ROUNDS9_STRIKES[2][1]], HALF, 'The three raps: 2 frames each', 0.4, 0.2),
];
void BEAM;
void full;

if (process.argv[1]?.endsWith('physician_action_film.ts')) {
  const [out = 'physician_action.mp4', mode = ''] = process.argv.slice(2);
  let total = 0;
  for (const p of parts) total += p.long;
  console.log(parts.length, 'parts,', total.toFixed(1), 's; the mark full at', full.toFixed(2), 's');
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
    const dir = mkdtempSync(join(tmpdir(), 'physician_captions_'));
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
