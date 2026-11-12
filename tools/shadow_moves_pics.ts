// THE LIVING SHADOW'S MOVES: THEIR FRAMES FOR THE FILM (the Warlock chat, 11 Nov 2026; docs/mockups/warlock_up2/README.md).
// Paints each move of dev/shadow_moves.ts frame by frame (thirty a second; its run and its dropping down sixty, as the game
// shows them),
// from in front and from behind, its slashes with what they leave in the air (dev/shadow_fx.ts), each as an RGBA PNG on the
// slash's scene (520 x 420, its floor point at 260, 326), and a note of what was made (moves.json);
// tools/shadow_moves_film.py makes the film of them. Nothing of the game imports it.
//   npx tsx tools/shadow_moves_pics.ts <dir> [stand,run,slashL,slashR,drop,rear0..rear7,slashLw0..3,slashRw0..3] [front,back] [turn]

// @ts-ignore - node typings are not part of this project
import { mkdirSync, writeFileSync } from 'node:fs';
// @ts-ignore
import { deflateSync } from 'node:zlib';
import { Px as PxOf } from '../src/engine/px';
import type { Px } from '../src/engine/px';
import { RIG_CANVAS } from '../src/dev/sculpt_demon_rig';
import { solve } from '../src/art/skeleton';
import type { Posed } from '../src/art/skeleton';
import { WOLF_B } from '../src/dev/demon_new';
import { DROP_INTO, DROP_PICTURES, REARS, SHADOW_CARRY, SLASH_WAYS, drawShadowAt, shadowMoves, shadowPose } from '../src/dev/shadow_moves';
import type { ShadowMove } from '../src/dev/shadow_moves';
import { SLASH_SCENE, slashLight } from '../src/dev/shadow_fx';
import { makeVeteranArt } from '../src/art/veteran_art';
import { paintWithoutCanvas, paintingOf } from '../tests/helpers';

declare const process: { argv: string[]; exit: (n: number) => never };
paintWithoutCanvas();

const TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc(b: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < b.length; i++) c = TABLE[(c ^ b[i]) & 255] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type: string, data: Uint8Array): Uint8Array {
  const out = new Uint8Array(12 + data.length);
  const dv = new DataView(out.buffer);
  dv.setUint32(0, data.length);
  for (let i = 0; i < 4; i++) out[4 + i] = type.charCodeAt(i);
  out.set(data, 8);
  dv.setUint32(8 + data.length, crc(out.subarray(4, 8 + data.length)));
  return out;
}
function save(path: string, px: Px): void {
  const raw = new Uint8Array((px.w * 4 + 1) * px.h);
  for (let y = 0; y < px.h; y++) raw.set(px.d.subarray(y * px.w * 4, (y + 1) * px.w * 4), y * (px.w * 4 + 1) + 1);
  const ihdr = new Uint8Array(13);
  const dv = new DataView(ihdr.buffer);
  dv.setUint32(0, px.w);
  dv.setUint32(4, px.h);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const parts = [new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw, { level: 6 })), chunk('IEND', new Uint8Array(0))];
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  writeFileSync(path, out);
}
/** One picture laid on another, so far across and down it. */
function over(on: Px, top: Px, dx = 0, dy = 0): void {
  for (let y = 0; y < top.h; y++) {
    for (let x = 0; x < top.w; x++) {
      const i = (y * top.w + x) * 4;
      if (!top.d[i + 3] || !on.inside(x + dx, y + dy)) continue;
      const j = ((y + dy) * on.w + x + dx) * 4;
      for (let c = 0; c < 4; c++) on.d[j + c] = top.d[i + c];
    }
  }
}

const dir = process.argv[2];
if (!dir) throw new Error('npx tsx tools/shadow_moves_pics.ts <dir> [stand,run,slashL,slashR,drop,rear0..rear7] [front,back] [turn]');
mkdirSync(dir, { recursive: true });
const all = shadowMoves();
// (its slashes made walking: slashLw0 its left claw going ahead, w1 to its left, w2 backing away, w3 to its right; slashRw0..3 its right's)
const KEYS = ['stand', 'run', 'slashL', 'slashR', 'drop', ...Array.from({ length: REARS }, (_, i) => `rear${i}`), ...SLASH_WAYS.map((_, i) => `slashLw${i}`), ...SLASH_WAYS.map((_, i) => `slashRw${i}`)];
const which = (process.argv[3] ?? 'stand,run,slashL,slashR,drop,rear5').split(',');
const views = (process.argv[4] ?? 'front,back').split(',') as ('front' | 'back')[];
const turn = Number(process.argv[5] ?? 0);
const note: Record<string, unknown> = { canvas: SLASH_SCENE, carry: SHADOW_CARRY, moves: {} };
for (const key of which) {
  const m = all[KEYS.indexOf(key)] as ShadowMove;
  if (!m) throw new Error(`no move ${key}`);
  // (its run and its dropping down into it: sixty pictures to a second, as the game shows them; the rest thirty a second)
  const fps = key === 'drop' || key === 'run' ? 60 : 30;
  const n = key === 'drop' ? DROP_PICTURES + 1 : Math.round(m.long * fps) + (m.loops ? 0 : 1);
  // (where its claws and hooves are in each frame, in its own measure: for the checks)
  const limbs: number[][][] = [];
  for (let f = 0; f < n; f++) {
    const t = f / fps;
    const s = solve(WOLF_B, shadowPose(m, t) as Posed);
    limbs.push([s.handL, s.handR, s.toeL, s.toeR].map((p) => [Math.round(p[0] * 10) / 10, Math.round(p[1] * 10) / 10, Math.round(p[2] * 10) / 10]));
    for (const v of views) {
      // (on the slash's scene: room for the whole of what a slash leaves round it)
      const scene = new PxOf(SLASH_SCENE.w, SLASH_SCENE.h);
      over(scene, drawShadowAt(v, m, t, turn).px, SLASH_SCENE.ax - RIG_CANVAS.ax, SLASH_SCENE.ay - RIG_CANVAS.ay);
      if (m.slash) over(scene, slashLight(m, t, v, turn));
      save(`${dir}/${key}_${v}_f${String(f).padStart(3, '0')}.png`, scene);
    }
  }
  // (a move made walking: the way it goes, and how far the game has carried it by each frame)
  const along = m.along ? Array.from({ length: n }, (_, f) => (m.along as (t: number) => number)(f / fps)) : null;
  (note.moves as Record<string, unknown>)[key] = { name: m.name, frames: n, fps, long: m.long, loops: m.loops, hit: m.hit ?? null, carry: m.carry ?? 0, way: m.way ?? 0, along, limbs };
}
// (the Brawler, the measure for new art: from in front and from behind, his floor point at 18, 60)
const brawler = makeVeteranArt();
save(`${dir}/brawler_front.png`, paintingOf(brawler.front.idle[0]));
save(`${dir}/brawler_back.png`, paintingOf(brawler.back.idle[0]));
note.brawler = { front: [brawler.front.idle[0].ax, brawler.front.idle[0].ay, brawler.front.idle[0].density ?? 1], back: [brawler.back.idle[0].ax, brawler.back.idle[0].ay, brawler.back.idle[0].density ?? 1] };
note.dropInto = DROP_INTO;
note.rears = REARS;
writeFileSync(`${dir}/moves.json`, JSON.stringify(note));
// @ts-ignore
process.exit(0);
