// THE FLOORS 6 TO 8 ACTION FILM (docs/mockups/action_f6/pictures/action_f6.mp4), made outside a browser: the Firepot Thrower's big
// lob and the Chanter's chain lightning (on floor 6's quarry floor), the quarry golem's boulder roll and its hammer (the quarry), the
// canyon scorpion's acid spit and its snap, and the dust devil's twister (the canyon), each with the knight, from in front and from
// behind, then each strike at half speed. Captioned. Frames are piped to ffmpeg. Nothing of the game imports it.
//   npx tsx tools/action_f6_film.ts <out.mp4> [stills <dir> <seconds,...> [parts]]
import { spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Px } from '../src/engine/px';
import { BLAZE, CHAIN } from '../src/art/action_f6_cult';
import { BOULDER, HAMMER } from '../src/art/action_f6_golem';
import { SPIT, TW } from '../src/art/action_f6_canyon';
import { CHAIN_PASS, HAMMER_PASS, LEAD, LOB_PASS, ROLL_PASS, SNAP_PASS, SPIT_PASS, TWISTER_PASS, chainScene, chainTimes, hammerScene, lobScene, lobTimes, rollScene, rollTimes, snapScene, spitScene, spitTimes, standInFloor, twisterScene } from '../src/dev/action_f6_scene';
import type { View } from '../src/dev/action_f6_scene';
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
/** A part: a scene of `W / k` by `H / k` picture pixels on `ground`, its middle at (cx, cy), `k` times as big; played from `from`, `slow` times slower, for `long` seconds of the scene. */
function part(ground: 'quarry' | 'canyon', scene: Scene, view: View, k: number, cx: number, cy: number, long: number, title: string, line: string, from = 0, slow = 1): Part {
  const w = Math.round(W / k);
  const h = Math.round(H / k);
  const base = standInFloor(ground, w, h, cx, cy);
  return { long: long * slow, title, line, frame: (t) => big(scene(view, from + t / slow, base, cx, cy), k) };
}
const lt = lobTimes();
const ct = chainTimes();
const rt = rollTimes();
const st = spitTimes();
const parts: Part[] = [
  part('quarry', lobScene, 'front', 2, 300, 175, LOB_PASS, 'THE FIREPOT THROWER’S LOB, MADE BIG · FROM IN FRONT', `Whirled, HELD · slung high in 2 frames · its shadow shows where · bursts ${BLAZE.r} tiles round · the floor burns ${BLAZE.fire} round, ${BLAZE.burn} s`),
  part('quarry', lobScene, 'back', 2, 285, 205, LOB_PASS - 0.6, 'THE LOB · FROM BEHIND', 'The same: the knight runs out as it is slung; the whoosh; the burning floor stays'),
  part('quarry', lobScene, 'front', 2, 300, 175, lt.land + 0.6 - (lt.loose - 0.45), 'THE LOB · HALF SPEED', 'Held, whirling · over the top and slung in two frames · the pot up high · the whoosh', lt.loose - 0.45, 2),
  part('quarry', chainScene, 'front', 2, 290, 170, CHAIN_PASS, 'THE CHANTER’S CHAIN LIGHTNING · FROM IN FRONT', `Book up, HELD, crackling · a ring under you: ${CHAIN.r} tile, get out · it strikes, then jumps to anyone within ${CHAIN.jump} tiles (two stand-ins)`),
  part('quarry', chainScene, 'back', 2, 270, 200, CHAIN_PASS, 'THE CHAIN LIGHTNING · FROM BEHIND', `Down at you in two frames, smeared · the knight, then the two near him, ${CHAIN.every} s apart · white, violet, the enemy’s pink`),
  part('quarry', chainScene, 'front', 2, 290, 170, 0.85, 'THE CHAIN LIGHTNING · HALF SPEED', 'Held · brought down in two frames · the strike · the jumps', ct.strike - 0.35, 2),
  part('quarry', rollScene, 'front', 2, 320, 212, ROLL_PASS, 'THE QUARRY GOLEM’S BOULDER ROLL · FROM IN FRONT', `Torn up · HELD overhead (the lane marked) · bowled in 2 frames · ${BOULDER.pace} tiles a second, bouncing · smashes ${BOULDER.r} round`),
  part('quarry', rollScene, 'back', 2, 260, 250, ROLL_PASS, 'THE BOULDER ROLL · FROM BEHIND', `The lane ${BOULDER.half * 2} tiles wide, ${BOULDER.long} long, marked before it is bowled: step out of it`),
  part('quarry', rollScene, 'front', 2, 320, 212, 1.45, 'THE BOULDER ROLL · HALF SPEED', 'Held overhead · bowled down onto the floor in two frames · it rolls and bounces', rt.loose - 0.4, 2),
  part('quarry', hammerScene, 'front', 3, 180, 125, HAMMER_PASS, 'ITS HAMMER, BY MOVEMENT 9 · FROM IN FRONT', `Fists up, HELD · down in 2 frames, smeared · the floor cracks ${HAMMER.r} tiles round (was 0.8)`),
  part('quarry', hammerScene, 'back', 3, 175, 135, HAMMER_PASS, 'ITS HAMMER · FROM BEHIND', 'Then crouched over its fists, heaving'),
  part('canyon', spitScene, 'front', 2, 300, 170, SPIT_PASS, 'THE CANYON SCORPION’S ACID SPIT · FROM IN FRONT', `Tail cocked, dripping, HELD · spat in 2 frames · up high, down where you stood · a pool ${SPIT.pool} tiles round, ${SPIT.stays} s`),
  part('canyon', spitScene, 'back', 2, 290, 200, SPIT_PASS, 'THE ACID SPIT · FROM BEHIND', 'The pool hisses and smokes: floor taken away'),
  part('canyon', spitScene, 'front', 3, 200, 115, 1.0, 'THE ACID SPIT · HALF SPEED', 'Held, dripping · the tail flung over in two frames · the glob away', st.spat - 0.5, 2),
  part('canyon', snapScene, 'front', 3, 200, 120, SNAP_PASS, 'ITS SNAP, BY MOVEMENT 9 · FRONT, THEN BEHIND', 'Pincers wide, HELD · shut in 2 frames as it lunges · 2 tiles (was 1.7)'),
  part('canyon', snapScene, 'back', 3, 200, 120, SNAP_PASS, 'ITS SNAP · FROM BEHIND', 'Then squeezing on, and back'),
  part('canyon', twisterScene, 'front', 2, 300, 200, TWISTER_PASS, 'THE DUST DEVIL’S TWISTER · FROM IN FRONT', `Spins up, HELD · bursts up in 2 frames · ${TW.high} tall · drags you in (${TW.pull} tiles) · throws lightning · ${(TW.until - TW.hit).toFixed(1)} s`),
  part('canyon', twisterScene, 'back', 2, 300, 210, TWISTER_PASS - 1.4, 'THE TWISTER · FROM BEHIND', 'Each bolt’s place crackles a moment first · then it collapses back into the little devil'),
  part('canyon', twisterScene, 'front', 2, 300, 200, 0.7, 'THE TWISTER · HALF SPEED', 'Held, crackling · bursts up in two frames', LEAD + TW.hit - 0.4, 2),
];

const [out = 'action_f6.mp4', mode = ''] = process.argv.slice(2);
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
  const dir = mkdtempSync(join(tmpdir(), 'action_f6_captions_'));
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
