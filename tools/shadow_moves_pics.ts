// THE LIVING SHADOW'S MOVES: THEIR FRAMES FOR THE FILM (the Warlock chat, 11 Nov 2026; docs/mockups/warlock_up2/README.md).
// Paints each move of dev/shadow_moves.ts frame by frame (thirty a second; its run and its dropping down sixty, as the game
// shows them),
// from in front and from behind, its slashes with what they leave in the air (dev/shadow_fx.ts), each as an RGBA PNG on the
// slash's scene (520 x 420, its floor point at 260, 326), and a note of what was made (moves.json);
// tools/shadow_moves_film.py makes the film of them. Nothing of the game imports it.
// Its other moves (damning, step, roar, burnout, reel, lurch: dev/shadow_moves.ts shadowOthers) are painted whole, with what
// they do to the floor and the air (dev/shadow_fx.ts damningScene, stepScene, burnOutScene); Damning and the smoke step for
// some frames past their end, it standing, so that what they left on the floor is seen to cool.
//   npx tsx tools/shadow_moves_pics.ts <dir> [stand,run,slashL,slashR,drop,rear0..rear7,slashLw0..3,slashRw0..3,damning,step,roar,burnout,reel,lurch,change] [front,back] [turn] [frames, as 0,8,24: only these, to look at]
// `change`: the change into it, from his being tapped to the end of its roar (dev/shadow_change.ts).

// @ts-ignore - node typings are not part of this project
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
// @ts-ignore
import { deflateSync } from 'node:zlib';
import { Px as PxOf } from '../src/engine/px';
import type { Px } from '../src/engine/px';
import { RIG_CANVAS } from '../src/dev/sculpt_demon_rig';
import { project, solve } from '../src/art/skeleton';
import type { Posed } from '../src/art/skeleton';
import { WOLF_B } from '../src/dev/demon_new';
import { DROP_INTO, DROP_PICTURES, OTHER_MOVES, REARS, SHADOW_CARRY, SLASH_WAYS, drawShadowAt, shadowMoves, shadowPose } from '../src/dev/shadow_moves';
import type { ShadowMove } from '../src/dev/shadow_moves';
import { SLASH_SCENE, burnOutAll, burnOutScene, damningScene, roarScene, slashLight, stepScene } from '../src/dev/shadow_fx';
import { makeVeteranArt } from '../src/art/veteran_art';
import { SHADOW_CHANGE_ALL, shadowChangeScene } from '../src/dev/shadow_change';
import { MORPH_AT, ROAR_AT } from '../src/dev/warlock_change';
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
const stand = all[0];
/** How many frames more than its own a move is painted for, it standing. */
const AFTER: Record<string, number> = { damning: 60, step: 48 };
// (its slashes made walking: slashLw0 its left claw going ahead, w1 to its left, w2 backing away, w3 to its right; slashRw0..3 its right's)
const KEYS = ['stand', 'run', 'slashL', 'slashR', 'drop', ...Array.from({ length: REARS }, (_, i) => `rear${i}`), ...SLASH_WAYS.map((_, i) => `slashLw${i}`), ...SLASH_WAYS.map((_, i) => `slashRw${i}`), ...OTHER_MOVES];
/** Its roar with nothing leaving its mouth (`roarface`): it alone, so that its face is seen moving (the film's close-up). */
const PLAIN: Record<string, string> = { roarface: 'roar' };
const which = (process.argv[3] ?? 'stand,run,slashL,slashR,drop,rear5').split(',');
const views = (process.argv[4] ?? 'front,back').split(',') as ('front' | 'back')[];
const turn = Number(process.argv[5] ?? 0);
// (to look at a few frames only: their numbers, as 0,8,24; not given, every frame)
const only = process.argv[6] ? new Set(process.argv[6].split(',').map(Number)) : null;
// (the moves painted into this folder before are kept in its note: a few may be painted again without the rest)
const was = existsSync(`${dir}/moves.json`) && !only ? (JSON.parse(readFileSync(`${dir}/moves.json`, 'utf8')) as { moves?: Record<string, unknown> }).moves ?? {} : {};
const note: Record<string, unknown> = { canvas: SLASH_SCENE, carry: SHADOW_CARRY, moves: { ...was } };
for (const key of which) {
  // (THE CHANGE INTO IT, from his being tapped to the end of its roar: dev/shadow_change.ts, thirty pictures a second)
  if (key === 'change') {
    const n = Math.round(SHADOW_CHANGE_ALL * 30) + 1;
    for (let f = 0; f < n; f++) {
      if (only && !only.has(f)) continue;
      for (const v of views) save(`${dir}/change_${v}_f${String(f).padStart(3, '0')}.png`, shadowChangeScene(v, f / 30, turn));
    }
    (note.moves as Record<string, unknown>)[key] = { name: 'The change into it', frames: n, own: n, fps: 30, long: SHADOW_CHANGE_ALL, morphAt: MORPH_AT, roarAt: ROAR_AT, loops: false };
    continue;
  }
  const m = all[KEYS.indexOf(PLAIN[key] ?? key)] as ShadowMove;
  if (!m) throw new Error(`no move ${key}`);
  // (its run and its dropping down into it: sixty pictures to a second, as the game shows them; the rest thirty a second)
  const fps = key === 'drop' || key === 'run' ? 60 : 30;
  // (its burning out goes on past its own sagging: its crumbling, and him getting up, dev/shadow_fx.ts burnOutScene)
  const long = key === 'burnout' ? burnOutAll(m) : m.long;
  const own = key === 'drop' ? DROP_PICTURES + 1 : Math.round(long * fps) + (m.loops ? 0 : 1);
  // (Damning and the smoke step go on past their end, it standing: so that what they left on the floor is seen to cool
  // where it lies and does not vanish as the move ends, dev/shadow_fx.ts mineAt)
  const n = own + (AFTER[key] ?? 0);
  // (where its claws and hooves are in each frame, in its own measure: for the checks)
  const limbs: number[][][] = [];
  // (and where its head is on the scene from in front: for the film's close-up of its face)
  const head: number[][] = [];
  for (let f = 0; f < n; f++) {
    const t = f / fps;
    const s = solve(WOLF_B, shadowPose(m, Math.min(t, m.long)) as Posed);
    const hs = project(s.head, 'front');
    head.push([Math.round(SLASH_SCENE.ax + hs[0]), Math.round(SLASH_SCENE.ay + hs[1])]);
    limbs.push([s.handL, s.handR, s.toeL, s.toeR].map((p) => [Math.round(p[0] * 10) / 10, Math.round(p[1] * 10) / 10, Math.round(p[2] * 10) / 10]));
    if (only && !only.has(f)) continue;
    for (const v of views) {
      // (on the slash's scene: room for the whole of what a slash leaves round it)
      let scene = new PxOf(SLASH_SCENE.w, SLASH_SCENE.h);
      // (its other moves whole, with what they do to the floor and the air: dev/shadow_fx.ts)
      if (key === 'damning') scene = damningScene(m, t, v, turn, stand);
      else if (key === 'step') scene = stepScene(m, t, v, turn, stand);
      else if (key === 'burnout') scene = burnOutScene(m, t, v, turn);
      else if (key === 'roar') scene = roarScene(m, t, v, turn);
      else {
        over(scene, drawShadowAt(v, m, t, turn).px, SLASH_SCENE.ax - RIG_CANVAS.ax, SLASH_SCENE.ay - RIG_CANVAS.ay);
        if (m.slash) over(scene, slashLight(m, t, v, turn));
      }
      save(`${dir}/${key}_${v}_f${String(f).padStart(3, '0')}.png`, scene);
    }
  }
  // (a move made walking: the way it goes, and how far the game has carried it by each frame)
  const along = m.along ? Array.from({ length: n }, (_, f) => (m.along as (t: number) => number)(f / fps)) : null;
  // (a move in which it goes into smoke: how far it is gone by each frame)
  const gone = m.gone ? Array.from({ length: n }, (_, f) => (m.gone as (t: number) => number)(f / fps)) : null;
  // (a move that shakes the screen, its roar: how hard it asks the game to shake it at each frame, render/fx.ts `shake`)
  const shake = m.shake ? Array.from({ length: n }, (_, f) => (m.shake as (t: number) => number)(f / fps)) : null;
  (note.moves as Record<string, unknown>)[key] = { name: m.name, frames: n, own, fps, long, loops: m.loops, shake, head, hit: m.hit ?? null, carry: m.carry ?? 0, way: m.way ?? 0, along, gone, limbs };
}
// (the Brawler, the measure for new art: from in front and from behind, his floor point at 18, 60)
const brawler = makeVeteranArt();
save(`${dir}/brawler_front.png`, paintingOf(brawler.front.idle[0]));
save(`${dir}/brawler_back.png`, paintingOf(brawler.back.idle[0]));
note.brawler = { front: [brawler.front.idle[0].ax, brawler.front.idle[0].ay, brawler.front.idle[0].density ?? 1], back: [brawler.back.idle[0].ax, brawler.back.idle[0].ay, brawler.back.idle[0].density ?? 1] };
note.dropInto = DROP_INTO;
note.rears = REARS;
// (a few frames only, to look at: the folder's note is left as it was)
if (!only) writeFileSync(`${dir}/moves.json`, JSON.stringify(note));
// @ts-ignore
process.exit(0);
