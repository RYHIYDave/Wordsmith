// THE FLOORS 11 TO 15 ACTION FILM (docs/mockups/action_f11/pictures/action_f11.mp4), made outside a browser: the Hushed watchman's chop and
// lantern throw (floor 11's streets), the reaper's harvest (floor 13's fields), the orderly's mallet blow and gurney charge (floor 14's
// ward), the Bookwarden's tome slam and book barrage (floor 15's library), each with the knight, from in front and from behind, then each
// strike at half speed. Captioned. Frames are piped to ffmpeg. Nothing of the game imports it.
//   npx tsx tools/action_f11_film.ts <out.mp4> [stills <dir> <seconds,...> [parts]]
import { spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Px } from '../src/engine/px';
import { CHOP, CHOP_HIT, LOB_HIT, POOL } from '../src/art/action_f11_watch';
import { HARVEST, HARVEST_HITS } from '../src/art/action_f11_field';
import { BLOW9, BLOW_HIT, GURNEY, GURNEY_HIT } from '../src/art/action_f11_orderly';
import { BARRAGE, BARRAGE_HIT, SLAM9, SLAM_HIT } from '../src/art/action_f11_warden';
import { BARRAGE_PASS, BLOW_PASS, CHOP_PASS, HARVEST_PASS, LEAD, LOB_PASS, SLAM_PASS, barrageScene, blowScene, chopScene, gurneyPass, gurneyScene, harvestScene, lobScene, lobTimes, slamScene, standInFloor } from '../src/dev/action_f11_scene';
import type { Ground, View } from '../src/dev/action_f11_scene';
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
const big = (p: Px, k: number): Px => cut(scaled(p, k), 0, 0, W, H);
type Scene = (view: View, t: number, base: Px, cx: number, cy: number) => Px;
/** A part: a scene of `W / k` by `H / k` picture pixels on `ground`, its middle at (cx, cy), `k` times as big; played from `from`, `slow` times slower, for `long` seconds of the scene. */
function part(ground: Ground, scene: Scene, view: View, k: number, cx: number, cy: number, long: number, title: string, line: string, from = 0, slow = 1): Part {
  const w = Math.ceil(W / k);
  const h = Math.ceil(H / k);
  const base = standInFloor(ground, w, h, cx, cy);
  return { long: long * slow, title, line, frame: (t) => big(scene(view, from + t / slow, base, cx, cy), k) };
}
const lt = lobTimes();
const dodging: Scene = (v, t, b, cx, cy) => gurneyScene(v, t, b, cx, cy, true);
const struck: Scene = (v, t, b, cx, cy) => gurneyScene(v, t, b, cx, cy, false);
const parts: Part[] = [
  part('street', chopScene, 'front', 3, 190, 172, CHOP_PASS, 'THE HUSHED WATCHMAN’S HALBERD CHOP · FROM IN FRONT', `Heaved up over his head, HELD · over the top in 2 frames · it bites the floor and the floor splits on to ${CHOP.split} tiles`),
  part('street', chopScene, 'back', 3, 178, 171, CHOP_PASS - 0.5, 'THE HALBERD CHOP · FROM BEHIND', `Its bite ${CHOP.r} tiles round, the split ${CHOP.half * 2} wide · stuck, wrenched out, stood again`),
  part('street', chopScene, 'front', 3, 190, 172, 0.85, 'THE HALBERD CHOP · HALF SPEED', 'Held · over the top and into the floor in two frames, smeared', LEAD + CHOP_HIT - 0.45, 2),
  part('street', lobScene, 'front', 2, 300, 165, LOB_PASS - 1.4, 'THE LANTERN THROW · FROM IN FRONT', `The lantern off his belt, swung back high, HELD, flaring · lobbed high in 2 frames · it smashes where you stood`),
  part('street', lobScene, 'back', 2, 300, 205, LOB_PASS - 1.4, 'THE LANTERN THROW · FROM BEHIND', `A pool of burning oil ${POOL.r} tiles round, burning ${POOL.burn} s: ground taken away · another lantern from his belt`),
  part('street', lobScene, 'front', 2, 300, 165, 0.75, 'THE LANTERN THROW · HALF SPEED', 'Held, flaring · swung over and lobbed in two frames, smeared', lt.hit - 0.45, 2),
  part('fields', harvestScene, 'front', 3, 170, 110, HARVEST_PASS - 0.3, 'THE REAPER’S HARVEST · FROM IN FRONT', 'Raised, HELD · a cut, stepping in · a backhand, stepping in · crouched, HELD · a leap: the sickle hooked into the ground'),
  part('fields', harvestScene, 'back', 3, 170, 160, HARVEST_PASS - 0.3, 'THE HARVEST · FROM BEHIND', `Each cut 2 frames, smeared · the hook bursts the chaff ${HARVEST.r} tiles round · on where they landed`),
  part('fields', harvestScene, 'front', 3, 170, 110, HARVEST_HITS[2] - 0.35, 'THE HARVEST · HALF SPEED', 'Three strikes, each two frames: right to left, left to right, the leap and the hook', LEAD + 0.5, 2),
  part('ward', blowScene, 'front', 3, 190, 120, BLOW_PASS, 'THE ORDERLY’S MALLET BLOW, BY MOVEMENT 9 · FROM IN FRONT', `Raised high, HELD, its hoops glinting · into the floor in 2 frames · ${BLOW9.r} tiles round (was 0.75)`),
  part('ward', blowScene, 'back', 3, 190, 150, BLOW_PASS - 0.3, 'THE MALLET BLOW · FROM BEHIND', 'Bent over it · heaved back up onto the shoulder'),
  part('ward', blowScene, 'front', 3, 190, 120, 0.85, 'THE MALLET BLOW · HALF SPEED', 'Held · over the top and into the floor in two frames, smeared', LEAD + BLOW_HIT - 0.45, 2),
  part('ward', struck, 'front', 2, 300, 150, gurneyPass(false), 'THE ORDERLY’S GURNEY CHARGE · FROM IN FRONT', `The lane marked · the mallet swung back, HELD · slammed into the gurney's end · ${GURNEY.pace} tiles a second · it crashes on you`),
  part('ward', dodging, 'back', 2, 300, 190, gurneyPass(true) - 0.3, 'THE GURNEY CHARGE · FROM BEHIND', `Out of the lane (${GURNEY.half * 2} tiles wide) · it careers on, rattling, and crashes at the lane's end · the crash ${GURNEY.r} tiles round`),
  part('ward', struck, 'front', 2, 300, 150, 0.8, 'THE GURNEY CHARGE · HALF SPEED', 'Held · swung down and through in two frames, smeared · off it goes', LEAD + GURNEY_HIT - 0.45, 2),
  part('library', slamScene, 'front', 3, 190, 130, SLAM_PASS, 'THE BOOKWARDEN’S TOME SLAM, BY MOVEMENT 9 · FROM IN FRONT', `The tome whirled over his head, HELD · over and flat on the floor in 2 frames (was 5) · its dust ${SLAM9.reach} tiles (was 1.2)`),
  part('library', slamScene, 'back', 3, 190, 160, SLAM_PASS - 0.3, 'THE TOME SLAM · FROM BEHIND', 'Held on the floor · dragged back up · hanging again'),
  part('library', slamScene, 'front', 3, 190, 130, 0.85, 'THE TOME SLAM · HALF SPEED', 'Whirling, held · over the top in two frames, smeared', LEAD + SLAM_HIT - 0.45, 2),
  part('library', barrageScene, 'front', 2, 300, 170, BARRAGE_PASS - 0.4, 'THE BOOKWARDEN’S BOOK BARRAGE · FROM IN FRONT', `The books rise and wheel round him, HELD · his hand thrust out in 2 frames · ${BARRAGE.n} books, one every ${BARRAGE.every} s, at you`),
  part('library', barrageScene, 'back', 2, 300, 200, BARRAGE_PASS - 0.4, 'THE BOOK BARRAGE · FROM BEHIND', `Each flung at where you are as it goes, ${BARRAGE.pace} tiles a second · run across the stream and they pass behind you`),
  part('library', barrageScene, 'front', 2, 300, 170, 1.0, 'THE BOOK BARRAGE · HALF SPEED', 'Held · the thrust in two frames, smeared · the stream', LEAD + BARRAGE_HIT - 0.4, 2),
];
void HARVEST_HITS;

const [out = 'action_f11.mp4', mode = ''] = process.argv.slice(2);
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
} else if (mode === 'count') {
  parts.forEach((p, i) => console.log(i, p.long.toFixed(2), p.title));
} else {
  const font = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf';
  const font2 = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf';
  const dir = mkdtempSync(join(tmpdir(), 'action_f11_captions_'));
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
