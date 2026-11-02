// THE FLOORS 9 AND 10 ACTION FILM (docs/mockups/action_f9/pictures/action_f9.mp4), made outside a browser: the twisted deer's bramble
// charge and its gore and the fog wolves' pack strike (on floor 9's pinewood floor; the pack strike also from above), the Drowned's bog
// retch and its frost grab (on floor 10's fen), each with the knight, from in front and from behind, then each strike at half speed.
// Captioned. Frames are piped to ffmpeg. Nothing of the game imports it.
//   npx tsx tools/action_f9_film.ts <out.mp4> [stills <dir> <seconds,...> [parts]]
import { spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Px } from '../src/engine/px';
import { CHARGE, CHARGE_HIT, GORE9, GORE_HIT, HEDGE, LEAP, LEAP_HIT, PACK } from '../src/art/action_f9_pinewood';
import { FROST, GRAB9, RETCH_HIT, SLICK } from '../src/art/action_f9_fen';
import { CHARGE_PASS, GORE_PASS, GRAB_PASS, LEAD, PACK_PASS, RETCH_PASS, WITHER_FROM, chargeScene, chargeTimes, goreScene, grabScene, grabTimes, packAbove, packScene, packTimes, retchScene, retchTimes, standInFloor } from '../src/dev/action_f9_scene';
import type { View } from '../src/dev/action_f9_scene';
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
function part(ground: 'pinewood' | 'fen', scene: Scene, view: View, k: number, cx: number, cy: number, long: number, title: string, line: string, from = 0, slow = 1): Part {
  const w = Math.round(W / k);
  const h = Math.round(H / k);
  const base = standInFloor(ground, w, h, cx, cy);
  return { long: long * slow, title, line, frame: (t) => big(scene(view, from + t / slow, base, cx, cy), k) };
}
const cht = chargeTimes();
const pkt = packTimes();
const BACKWARDS = [3, 2, 1, 0];
const pkb = packTimes(BACKWARDS);
const rt = retchTimes();
const gt = grabTimes();
const above = (from: number, long: number, title: string, line: string, slow = 1): Part => ({ long: long * slow, title, line, frame: (t) => big(packAbove(from + t / slow, W / 2, H / 2), 2) });
const backPack: Scene = (view, t, base, cx, cy) => packScene(view, t, base, cx, cy, BACKWARDS);
const parts: Part[] = [
  part('pinewood', chargeScene, 'front', 3, 200, 150, CHARGE_PASS, 'THE TWISTED DEER’S BRAMBLE CHARGE · FROM IN FRONT', `Its lane marked · antlers down, stamping, HELD · off in 2 frames · ${CHARGE.pace} tiles a second · a hedge of thorns bursts up behind it`),
  part('pinewood', chargeScene, 'back', 3, 200, 150, CHARGE_PASS, 'THE BRAMBLE CHARGE · FROM BEHIND', `The lane ${CHARGE.half * 2} tiles wide, marked ${(CHARGE_HIT - CHARGE.aim).toFixed(2)} s before it goes · the hedge is a wall: the knight cannot cross`),
  part('pinewood', chargeScene, 'front', 3, 200, 150, CHARGE.until + 0.35 - (CHARGE_HIT - 0.4), 'THE BRAMBLE CHARGE · HALF SPEED', 'Held · bursting off in two frames, smeared · the gallop · the thorns rising behind it', cht.off - 0.4, 2),
  part('pinewood', chargeScene, 'back', 3, 200, 150, 1.4, 'THE HEDGE WITHERS', `It stands ${HEDGE.stays} s after it is all up, then withers`, WITHER_FROM),
  part('pinewood', goreScene, 'front', 3, 200, 128, GORE_PASS, 'ITS GORE, BY MOVEMENT 9 · FROM IN FRONT', `Head down, antlers aimed, HELD · in 2 frames it lunges a stride and hooks up · reaches ${GORE9.reach} tiles (was 1.1)`),
  part('pinewood', goreScene, 'back', 3, 200, 135, GORE_PASS, 'ITS GORE · FROM BEHIND', 'Its head flung up high after, held · it steps back'),
  part('pinewood', goreScene, 'front', 3, 200, 128, 0.75, 'ITS GORE · HALF SPEED', 'Held · the lunge and the hook in two frames', LEAD + GORE_HIT - 0.4, 2),
  part('pinewood', packScene, 'front', 3, 200, 122, PACK_PASS, 'THE FOG WOLVES’ PACK STRIKE', `They spread in a ring round you (${PACK.ring} tiles) · then one after another, ${PACK.beat} s apart, each crouches, HOLDS, and leaps through you`),
  part('pinewood', backPack, 'back', 3, 200, 122, PACK_PASS, 'THE PACK STRIKE · THE KNIGHT FROM BEHIND, THE OTHER WAY ROUND', 'Each leap 2 frames, smeared · each skids on to the ring across from where it was: still surrounded'),
  above(LEAD + 0.6, PACK_PASS - 0.6, 'THE PACK STRIKE · FROM ABOVE', `The ring · each from its own side, a beat apart · each leaps ${LEAP.leap} tiles through where you stand, on to the ring across`),
  part('pinewood', packScene, 'front', 3, 200, 122, pkt.at[3] + LEAP_HIT + 0.35 - (pkt.at[0] + 0.3), 'THE PACK STRIKE · HALF SPEED', 'Crouched, held · the leap in two frames: its fog streaming back, its eyes’ fire drawn out', pkt.at[0] + 0.3, 2),
  part('fen', retchScene, 'front', 3, 190, 120, RETCH_PASS, 'THE DROWNED’S BOG RETCH · FROM IN FRONT', `It rises, heaving, HELD · the cone marked · retches in 2 frames · ${SLICK.long} tiles out · a slick for ${SLICK.stays} s`),
  part('fen', retchScene, 'back', 3, 185, 135, RETCH_PASS, 'THE BOG RETCH · FROM BEHIND', 'The slick slows and stings: the knight wades out at half his pace · floor taken away'),
  part('fen', retchScene, 'front', 3, 190, 120, 0.85, 'THE BOG RETCH · HALF SPEED', 'Held, heaving · lurched forward in two frames · the gush', rt.hit - 0.4, 2),
  part('fen', grabScene, 'front', 3, 190, 140, GRAB_PASS, 'THE DROWNED’S FROST GRAB · FROM IN FRONT', `Arms up, frost on its hands, HELD · clutches in 2 frames · frozen in place ${FROST.hold} s · reaches ${GRAB9.fwd[1]} tiles (was 1.1)`),
  part('fen', grabScene, 'back', 3, 190, 150, GRAB_PASS, 'THE FROST GRAB · FROM BEHIND', 'Rime over the floor and ice round his feet · it shatters as he is let go · the frost grey-white, never the friend’s cyan'),
  part('fen', grabScene, 'front', 3, 190, 140, 0.75, 'THE FROST GRAB · HALF SPEED', 'Held · the clutch in two frames · the ice', gt.hit - 0.4, 2),
];
void pkb;
void RETCH_HIT;

const [out = 'action_f9.mp4', mode = ''] = process.argv.slice(2);
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
  const dir = mkdtempSync(join(tmpdir(), 'action_f9_captions_'));
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
