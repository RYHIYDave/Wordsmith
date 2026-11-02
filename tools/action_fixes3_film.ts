// THE THIRD ROUND OF FIXES' FILM (docs/mockups/action_fixes/pictures/action_fixes3.mp4), made outside a browser, captioned: the
// Chanter's bolt alone and with another player (floor 6's quarry, a stand-in); the Physician's Diagnosis and his bigger operation over
// his whole theatre from above with the knight, then close, and its strike at half speed (his theatre, a stand-in); the king's
// knight's banner's reach from higher up with the knight and a few of his fellows in it (the King's hall, a stand-in). Frames are piped
// to ffmpeg. Nothing of the game imports it.
//   npx tsx tools/action_fixes3_film.ts <out.mp4> [stills <dir> <seconds,...> [parts]]
import { spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Px } from '../src/engine/px';
import { CHAIN } from '../src/art/action_f6_cult';
import { CHAIN_PASS, chainScene, chainTimes, standInFloor as quarryFloor } from '../src/dev/action_f6_scene';
import { OP_HIT, OP_STRIKE } from '../src/art/physician_action';
import { BEAM, BEAM_FILL_WAS, ESCAPE, FIELD } from '../src/art/physician_action_fx';
import { diagArena, diagArenaFullAt, diagCloseFull, diagCloseScene, theatreFloor } from '../src/dev/physician_action_scene';
import { BANNER } from '../src/art/action_f16_knight';
import { RALLY_WIDE_PASS, bannerWideScene, standInFloor as hallFloorOf } from '../src/dev/action_f16_scene';
import { cut, scaled } from '../src/dev/king_scene';
import { png } from './king_png';

(Px.prototype as unknown as { toCanvas: (this: Px) => unknown }).toCanvas = function (this: Px): unknown {
  return this;
};

const W = 1200;
const H = 676;
const FPS = 30;
export interface Part {
  long: number;
  title: string;
  line: string;
  frame: (t: number) => Px;
}
type Ground = 'quarry' | 'theatre' | 'hall';
const BASES = new Map<string, Px>();
function baseOf(g: Ground, k: number, cx: number, cy: number): Px {
  const w = Math.round(W / k);
  const h = Math.round(H / k);
  const key = `${g}${k}@${cx},${cy}`;
  let b = BASES.get(key);
  if (!b) {
    b = g === 'quarry' ? quarryFloor('quarry', w, h, cx, cy) : g === 'theatre' ? theatreFloor(w, h, cx, cy, true) : hallFloorOf('hall', w, h, cx, cy);
    BASES.set(key, b);
  }
  return b;
}
type Scene = (t: number, base: Px, cx: number, cy: number) => Px;
/** A part: `W / k` by `H / k` picture pixels, `k` times as big; played from `from` (seconds into its scene), `slow` times slower. */
function part(g: Ground, scene: Scene, k: number, cx: number, cy: number, from: number, long: number, title: string, line: string, slow = 1): Part {
  return { long: long * slow, title, line, frame: (t) => { const p = scene(from + t / slow, baseOf(g, k, cx, cy), cx, cy); return k === 1 ? p : cut(scaled(p, k), 0, 0, W, H); } };
}
const HALF = ' · HALF SPEED';
const ct = chainTimes();
const alone: Scene = (t, b, cx, cy) => chainScene('front', t, b, cx, cy, 0);
const aloneBack: Scene = (t, b, cx, cy) => chainScene('back', t, b, cx, cy, 0);
const twoPlayers: Scene = (t, b, cx, cy) => chainScene('front', t, b, cx, cy, 1);
const arena: Scene = (t, b, cx, cy) => diagArena(t, b, cx, cy);
const close = (view: 'front' | 'back', caught: boolean): Scene => (t, b, cx, cy) => diagCloseScene(view, t, b, cx, cy, caught);
const fa = diagArenaFullAt();
const ff = diagCloseFull('front');
const fb = diagCloseFull('back', true);
export const parts: Part[] = [
  part('quarry', alone, 2, 290, 170, 0.15, CHAIN_PASS - 0.15, 'THE CHANTER’S LIGHTNING · ALONE', `Book up, HELD, crackling · a ring under you: get out · ONE bolt onto you, a crackle of static · it jumps to no one`),
  part('quarry', alone, 3, 175, 105, ct.strike - 0.3, 1.0, 'THE BOLT' + HALF, 'Brought down in 2 frames · one bolt · the static crackling round him', 2),
  part('quarry', aloneBack, 2, 270, 200, 0.15, CHAIN_PASS - 0.15, 'THE CHANTER’S LIGHTNING · FROM BEHIND', 'No jumps to your animals or to other monsters'),
  part('quarry', twoPlayers, 2, 290, 170, 0.15, CHAIN_PASS - 0.15, 'WITH ANOTHER PLAYER', `Only with another player near you does it jump: on to them, ${CHAIN.every} s later (within ${CHAIN.jump} tiles)`),
  part('theatre', arena, 1, 600, 336, 0.3, fa + OP_HIT + 1.45 - 0.3, 'THE PHYSICIAN · DIAGNOSIS, THEN THE OPERATION · THE WHOLE THEATRE', `The mark fills in ${BEAM.fill} s now (was ${BEAM_FILL_WAS}) · full: the room goes dark, one spotlight on you · get out of it`),
  part('theatre', arena, 1, 600, 336, fa - 0.2, 1.6, 'HIS INSTRUMENTS RING THE LIGHT · HALF SPEED', `Out of the light in ${ESCAPE.toFixed(1)} s, before they close`, 2),
  part('theatre', close('front', false), 2, 215, 118, ff - 0.6, 3.1, 'THE OPERATION · CLOSE', `Scalpels, saws, forceps, needles round the light’s edge, HELD · he runs out of it · they close on nothing`),
  part('theatre', close('back', true), 2, 150, 234, fb - 0.4, 2.9, 'CAUGHT IN THE LIGHT · FROM BEHIND', `They close in from all round in 2 frames: one huge strike, ${FIELD.r} tiles round · the light back after`),
  part('theatre', close('back', true), 3, 50, 177, fb + OP_STRIKE[0] - 0.35, 0.95, 'THE STRIKE' + HALF, 'Held · closing in from all round in 2 frames, smeared · stuck in the boards', 2),
  part('hall', bannerWideScene, 1, 560, 300, 0.3, RALLY_WIDE_PASS - 0.3, 'THE KING’S KNIGHT’S BANNER · ITS REACH FROM HIGHER UP', `Now ${BANNER.reach} tiles round (was 3.5): a wide gold ring · most of the fight inside it · you can still pull them out`),
];
void OP_HIT;

if (process.argv[1]?.endsWith('action_fixes3_film.ts')) {
  const [out = 'action_fixes3.mp4', mode = ''] = process.argv.slice(2);
  let total = 0;
  for (const p of parts) total += p.long;
  console.log(parts.length, 'parts,', total.toFixed(1), 's; full at', fa.toFixed(2), ff.toFixed(2), fb.toFixed(2));
  if (mode === 'stills') {
    const dir = process.argv[4] ?? 'stills';
    mkdirSync(dir, { recursive: true });
    const at = (process.argv[5] ?? '').split(',').filter(Boolean).map(Number);
    const only = process.argv[6] ? process.argv[6].split(',').map(Number) : null;
    parts.forEach((p, i) => {
      if (only && !only.includes(i)) return;
      for (const k of at.length ? at : [0.2, 0.4, 0.6, 0.8].map((q) => q * p.long)) if (k <= p.long) writeFileSync(`${dir}/p${i}_${k.toFixed(2)}.png`, png(p.frame(Math.min(p.long - 1e-3, k))));
    });
  } else {
    const font = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf';
    const font2 = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf';
    const dir = mkdtempSync(join(tmpdir(), 'fixes3_captions_'));
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
    const ffm = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-', '-vf', filters.join(','), '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-tune', 'animation', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
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
          if (!ffm.stdin.write(rgb)) await new Promise((r) => ffm.stdin.once('drain', r));
          n++;
        }
        console.log(`part ${i} done (${n} frames, ${((Date.now() - t0) / 1000).toFixed(0)} s)`);
      }
      ffm.stdin.end();
    };
    void write();
    ffm.on('close', (code) => console.log('ffmpeg done', code, out, n, 'frames'));
  }
}
