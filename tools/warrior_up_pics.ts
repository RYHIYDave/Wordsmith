// THE WARRIOR BROUGHT UP: THE PICTURES FOR THE OWNER (the art chat's helper, 6 Nov 2026; docs/mockups/warrior_up/README.md).
// Paints him BEFORE (the game's knight as he is: art/heroes3.ts paintMove3, his moves in art/moves3.ts) and AFTER (art/warrior_up*.ts),
// both ways round, with his scarf's two ends hung and moved as the game moves them (engine/tails.ts), and writes each picture
// as an RGBA PNG; tools/warrior_up_pics.py lays out the sheet and the film with their captions. Nothing of the game imports it.
//   npx tsx tools/warrior_up_pics.ts sheet <dir>      npx tsx tools/warrior_up_pics.ts film <dir>

// @ts-ignore - node typings are not part of this project
import { deflateSync } from 'node:zlib';
// @ts-ignore
import { mkdirSync, writeFileSync } from 'node:fs';
import { Px } from '../src/engine/px';
import { Tails } from '../src/engine/tails';
import type { TailRoot } from '../src/engine/tails';
import { paintMove3 } from '../src/art/heroes3';
import { MOVES3 } from '../src/art/moves3';
import type { Move3 } from '../src/art/moves3';
import { WARRIOR_TAILS } from '../src/art/hero_warrior';
import type { Painted } from '../src/art/kit';
import { CANVAS3 } from '../src/art/skin';
import { paintWu } from '../src/art/warrior_up_art';
import { WU_MOVES } from '../src/art/warrior_up_moves';
import { paintWithoutCanvas } from '../tests/helpers';

declare const process: { argv: string[] };
paintWithoutCanvas();

// ---- a PNG with its see-through kept ----
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
function pngRGBA(px: Px): Uint8Array {
  const raw = new Uint8Array((px.w * 4 + 1) * px.h);
  for (let y = 0; y < px.h; y++) {
    raw[y * (px.w * 4 + 1)] = 0;
    raw.set(px.d.subarray(y * px.w * 4, (y + 1) * px.w * 4), y * (px.w * 4 + 1) + 1);
  }
  const ihdr = new Uint8Array(13);
  const dv = new DataView(ihdr.buffer);
  dv.setUint32(0, px.w);
  dv.setUint32(4, px.h);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const sig = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
  const parts = [sig, chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw, { level: 6 })), chunk('IEND', new Uint8Array(0))];
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return out;
}

type View = 'front' | 'back';
type Who = 'before' | 'after';
const W = CANVAS3.w;
const H = CANVAS3.h;

/** A moment of one of his moves, as it was (before) or as it is now (after). */
function paintOf(who: Who, key: string, t: number, view: View): Painted {
  if (who === 'before') return paintMove3(MOVES3[key], t, view);
  return paintWu(WU_MOVES[key], t, view);
}

/** HIS SCARF'S TWO ENDS, hung from where a frame fixes them and moved as the game moves them (engine/tails.ts), for one figure. */
class Rig {
  tails = new Tails(WARRIOR_TAILS);
  ox = 0;
  oy = 0;
  constructor(readonly view: View) {}
  /** Step the scarf on by `dt` to this frame (the figure carried `move` game pixels across the floor meanwhile), and lay the frame with it. */
  frame(f: Painted, dt: number, move = 0): Px {
    const facing = this.view === 'front' ? 1 : -1;
    // (going the way he faces: down and to the right from in front, up and to the left from behind)
    this.ox += move * 0.89 * facing;
    this.oy += move * 0.45 * facing;
    const roots: TailRoot[] = (f.tails ?? []).map((r) => ({ ...r, x: r.x / 2, y: r.y / 2 }));
    this.tails.step(dt, roots, CANVAS3.ax / 2, CANVAS3.ay / 2, facing, this.ox, this.oy);
    const out = new Px(W, H);
    const lay = (over: boolean): void => {
      const buf = new Uint8ClampedArray(TAIL_PW * TAIL_PH * 4);
      if (!this.tails.paint(buf, over)) return;
      const dx = CANVAS3.ax - TAIL_HW;
      const dy = CANVAS3.ay - TAIL_UP;
      for (let y = 0; y < TAIL_PH; y++) for (let x = 0; x < TAIL_PW; x++) {
        const si = (y * TAIL_PW + x) * 4;
        if (buf[si + 3] === 0) continue;
        const X = x + dx;
        const Y = y + dy;
        if (X < 0 || Y < 0 || X >= W || Y >= H) continue;
        const di = (Y * W + X) * 4;
        out.d[di] = buf[si];
        out.d[di + 1] = buf[si + 1];
        out.d[di + 2] = buf[si + 2];
        out.d[di + 3] = 255;
      }
    };
    lay(false);
    for (let i = 0; i < W * H * 4; i += 4) {
      if (f.px.d[i + 3] === 0) continue;
      out.d[i] = f.px.d[i];
      out.d[i + 1] = f.px.d[i + 1];
      out.d[i + 2] = f.px.d[i + 2];
      out.d[i + 3] = f.px.d[i + 3] === 255 ? 255 : f.px.d[i + 3];
    }
    lay(true);
    return out;
  }
}
const TAIL_PW = 192;
const TAIL_PH = 152;
const TAIL_HW = 96;
const TAIL_UP = 112;

/** How far the game carries him a frame while he runs (game pixels across the screen: 4.6 tiles a second, a tile 32 across). */
const RUN_STEP = (4.6 * 32 * 0.75) / 30;

/** One of his moves, before or after, as the game shows it: the frame it shows at `t` (its own pictures a second, or by how far through). */
interface Shown {
  key: string;
  /** The game's pictures a second of this list (the moment shown is the last picture before t). */
  fps: number;
  /** A loop's length, if it goes round. */
  loop?: number;
  /** The last moment it has (a move played once holds its last picture). */
  end: number;
  runs?: boolean;
}
function shown(s: Shown, t: number): number {
  let u = t;
  if (s.loop) u = t % s.loop;
  u = Math.floor(u * s.fps + 1e-6) / s.fps;
  return Math.min(u, s.end);
}
const endOf = (m: Move3): number => m.motion.keys[m.motion.keys.length - 1].at;
/** The lists of the film: what each shows before and after, and how. */
function lists(key: string): { before: Shown; after: Shown } {
  const o = MOVES3[key];
  const n = WU_MOVES[key];
  const loopO = o.motion.loop !== undefined ? endOf(o) - (o.motion.loop ?? 0) : undefined;
  const loopN = n.motion.loop !== undefined ? endOf(n) - (n.motion.loop ?? 0) : undefined;
  // (as the game had him: standing at 10 a second, looking about him at 20, the rest at 30; now all at 30, his run at 60)
  const fpsO = key === 'rear' || key === 'ktown' ? 10 : key === 'klook' ? 20 : 30;
  const fpsN = n.stride !== undefined ? 60 : 30;
  const endO = key === 'kdraw' ? 40 / 30 : endOf(o);
  const endN = key === 'kdraw' ? 40 / 30 : endOf(n);
  return { before: { key, fps: fpsO, loop: loopO, end: endO, runs: o.stride !== undefined || key.includes('run') }, after: { key, fps: fpsN, loop: loopN, end: endN, runs: key.includes('run') } };
}

// ---------------------------------------------------------------------------------------------
// THE SHEET: the key moments, each painted with the scarf hung by playing the move up to it

/** Him at a moment of a move, his scarf's ends hung as they would be (the move played from its start up to it, the floor going by if he runs). */
function still(who: Who, key: string, t: number, view: View): Px {
  const rig = new Rig(view);
  const runs = key.includes('run');
  // (from a second before, in a loop; from its start, else)
  const loop = (who === 'before' ? MOVES3[key] : WU_MOVES[key]).motion.loop !== undefined;
  const from = loop ? t - 1.2 : -0.5;
  let px: Px | null = null;
  for (let u = from; u <= t + 1e-6; u += 1 / 60) {
    px = rig.frame(paintOf(who, key, Math.min(Math.max(0, u), t), view), 1 / 60, runs ? RUN_STEP / 2 : 0);
  }
  return px as Px;
}

const SHEET: { title: string; rows: { label: string; key: string; before: number; after: number }[] }[] = [
  { title: 'Standing in his guard', rows: [{ label: 'his guard (now he breathes, shifts his weight, and has a habit of his own)', key: 'rear', before: 0, after: 1.3 }] },
  { title: 'Running', rows: [{ label: 'a stride (now his feet grip the floor)', key: 'krun', before: 0.1, after: 0.1 }] },
  { title: 'His class card: drawing his sword when picked', rows: [{ label: 'ready in his guard (now his feet step into it, never slide)', key: 'kdraw', before: 33 / 30, after: 33 / 30 }] },
  { title: 'Strike, the first swing (a rising cut)', rows: [
    { label: 'the wind-up (now big, and held)', key: 'strike', before: 2 / 30, after: 7 / 30 },
    { label: 'the strike (now two frames, smeared)', key: 'strike', before: 4 / 30, after: 10 / 30 },
    { label: 'the wind-down', key: 'strike', before: 8 / 30, after: 16 / 30 },
  ] },
  { title: 'Strike, the second swing (a downward slash)', rows: [
    { label: 'the wind-up (now big, and held)', key: 'kslash', before: 2 / 30, after: 7 / 30 },
    { label: 'the strike (now two frames, smeared)', key: 'kslash', before: 4 / 30, after: 10 / 30 },
    { label: 'the wind-down', key: 'kslash', before: 8 / 30, after: 18 / 30 },
  ] },
  { title: 'Slam', rows: [
    { label: 'the wind-up (now up on his toes, held)', key: 'slam', before: 5 / 30, after: 12 / 30 },
    { label: 'the strike (now two frames, smeared)', key: 'slam', before: 7 / 30, after: 15 / 30 },
    { label: 'the wind-down', key: 'slam', before: 12 / 30, after: 24 / 30 },
  ] },
  { title: 'Whirlwind', rows: [{ label: 'going round (now pivoting on one foot, the blade smeared)', key: 'whirl', before: 2 / 30, after: 2 / 30 }] },
  { title: 'Lunge (the diving thrust)', rows: [
    { label: 'the dive', key: 'kthrust', before: 0.25, after: 0.25 },
    { label: 'the point punched out as he lands', key: 'kthrust', before: 0.5, after: 0.5 },
  ] },
  { title: 'His fall', rows: [
    { label: 'now: once more he pushes up on the hilt', key: 'kfall', before: 33 / 30, after: 31 / 30 },
    { label: 'the end: kneeling, the light gone out', key: 'kfall', before: 46 / 30, after: 46 / 30 },
  ] },
];
const SMALL = [
  { label: 'standing', key: 'rear', before: 0, after: 1.3 },
  { label: 'the strike', key: 'strike', before: 4 / 30, after: 10 / 30 },
  { label: 'the slam', key: 'slam', before: 7 / 30, after: 15 / 30 },
  { label: 'running', key: 'krun', before: 0.1, after: 0.1 },
  { label: 'his fall', key: 'kfall', before: 46 / 30, after: 46 / 30 },
];

function sheet(dir: string): void {
  mkdirSync(dir, { recursive: true });
  const spec: { title: string; rows: { label: string; files: string[] }[] }[] = [];
  let n = 0;
  for (const sec of SHEET) {
    const rows: { label: string; files: string[] }[] = [];
    for (const r of sec.rows) {
      const files: string[] = [];
      for (const view of ['front', 'back'] as const) {
        for (const who of ['before', 'after'] as const) {
          const px = still(who, r.key, who === 'before' ? r.before : r.after, view);
          const f = `s${String(n++).padStart(3, '0')}_${who}_${view}.png`;
          writeFileSync(`${dir}/${f}`, pngRGBA(px));
          files.push(f);
        }
      }
      rows.push({ label: r.label, files });
    }
    spec.push({ title: sec.title, rows });
  }
  const small: { label: string; files: string[] }[] = [];
  for (const r of SMALL) {
    const files: string[] = [];
    for (const who of ['before', 'after'] as const) {
      const f = `g${String(n++).padStart(3, '0')}_${who}.png`;
      writeFileSync(`${dir}/${f}`, pngRGBA(still(who, r.key, who === 'before' ? r.before : r.after, 'front')));
      files.push(f);
    }
    small.push({ label: r.label, files });
  }
  writeFileSync(`${dir}/sheet.json`, JSON.stringify({ sections: spec, small }, null, 1));
  console.log(`${n} pictures in ${dir}`);
}

// ---------------------------------------------------------------------------------------------
// THE FILM: each list before and after, side by side, both ways round, at 30 frames a second; the strikes again at half speed;
// his class card's standing loop

interface Part {
  caption: string;
  key: string;
  seconds: number;
  /** Played slower than life (2: half speed). */
  slow?: number;
  /** Only from in front, the card's: before and after side by side, bigger. */
  card?: boolean;
}
const FILM: Part[] = [
  { caption: 'STANDING IN HIS GUARD · before: 10 pictures a second, still · now: 30, breathing, shifting his weight, a habit of his own', key: 'rear', seconds: 4 },
  { caption: 'RUNNING · now his feet grip the floor (they slid before)', key: 'krun', seconds: 2.2 },
  { caption: 'STRIKE, THE FIRST SWING · now a big held wind-up, a strike of two frames smeared, a big wind-down', key: 'strike', seconds: 1.5 },
  { caption: 'STRIKE, THE SECOND SWING · the same', key: 'kslash', seconds: 1.2 },
  { caption: 'SLAM · up on his toes and held, then two frames into the floor', key: 'slam', seconds: 1.4 },
  { caption: 'WHIRLWIND · now he pivots on one foot (both feet slid round before)', key: 'whirl', seconds: 1.6 },
  { caption: 'LUNGE · the dive, the point drawn back and punched out as he lands', key: 'kthrust', seconds: 1.4 },
  { caption: 'STRUCK FROM IN FRONT', key: 'kreel', seconds: 0.6 },
  { caption: 'STRUCK FROM BEHIND', key: 'klurch', seconds: 0.6 },
  { caption: 'HIS FALL · now he pushes up once more on his sword before the light goes out', key: 'kfall', seconds: 2.2 },
  { caption: 'IN TOWN, STANDING · before: 10 pictures a second · now: 30, alive', key: 'ktown', seconds: 2.6 },
  { caption: 'IN TOWN, RUNNING · now his feet grip the floor', key: 'ktownrun', seconds: 1.8 },
  { caption: 'IN TOWN, LOOKING ABOUT HIM · before: 20 pictures a second · now: 30', key: 'klook', seconds: 3.7 },
  { caption: "HIS CLASS CARD, DRAWING HIS SWORD WHEN PICKED · now his feet step, never slide", key: 'kdraw', seconds: 1.6 },
  { caption: 'STRIKE, THE FIRST SWING, AT HALF SPEED', key: 'strike', seconds: 1.3, slow: 2 },
  { caption: 'STRIKE, THE SECOND SWING, AT HALF SPEED', key: 'kslash', seconds: 1.0, slow: 2 },
  { caption: 'SLAM, AT HALF SPEED', key: 'slam', seconds: 1.2, slow: 2 },
  { caption: 'LUNGE, AT HALF SPEED', key: 'kthrust', seconds: 1.1, slow: 2 },
  { caption: 'HIS CLASS CARD: STANDING, BEFORE AND NOW, SIDE BY SIDE', key: 'ktown', seconds: 4.8, card: true },
];

function film(dir: string): void {
  mkdirSync(dir, { recursive: true });
  const frames: { caption: string; file: string; card: boolean; part: number }[] = [];
  let n = 0;
  FILM.forEach((p, pi) => {
    const L = lists(p.key);
    const rigs = { 'before:front': new Rig('front'), 'before:back': new Rig('back'), 'after:front': new Rig('front'), 'after:back': new Rig('back') };
    const total = Math.round(p.seconds * (p.slow ?? 1) * 30);
    // (a moment's warm-up for the scarf, so it hangs as it would)
    for (const [k, rig] of Object.entries(rigs)) {
      const [who, view] = k.split(':') as [Who, View];
      for (let i = 0; i < 30; i++) rig.frame(paintOf(who, p.key, 0, view), 1 / 30, L[who].runs ? RUN_STEP : 0);
    }
    for (let i = 0; i < total; i++) {
      const t = i / 30 / (p.slow ?? 1);
      const strip = new Px(W * 4, H);
      const order: [Who, View][] = [['before', 'front'], ['after', 'front'], ['before', 'back'], ['after', 'back']];
      order.forEach(([who, view], j) => {
        const s = L[who];
        const u = shown(s, t);
        const px = rigs[`${who}:${view}` as keyof typeof rigs].frame(paintOf(who, p.key, u, view), 1 / 30 / (p.slow ?? 1), s.runs ? RUN_STEP / (p.slow ?? 1) : 0);
        for (let y = 0; y < H; y++) strip.d.set(px.d.subarray(y * W * 4, (y + 1) * W * 4), (y * strip.w + j * W) * 4);
      });
      const f = `f${String(n++).padStart(4, '0')}.png`;
      writeFileSync(`${dir}/${f}`, pngRGBA(strip));
      frames.push({ caption: p.caption, file: f, card: !!p.card, part: pi });
    }
  });
  writeFileSync(`${dir}/film.json`, JSON.stringify({ frames }, null, 0));
  console.log(`${n} frames in ${dir} (${(n / 30).toFixed(1)} s)`);
}

const [mode, dir] = process.argv.slice(2);
if (mode === 'sheet') sheet(dir);
else if (mode === 'film') film(dir);
else console.log('usage: warrior_up_pics.ts sheet|film <dir>');
