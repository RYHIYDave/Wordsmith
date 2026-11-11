// THE MAGE BROUGHT UP: CHECK SHEETS (the Mage chat, 11 Nov 2026; docs/mockups/mage_up/README.md).
// Paints a move of hers, NOW (art/mage_up.ts, on her new bones) or BEFORE (the game's Mage as she is: art/heroes3.ts
// paintMove3, from in front and from behind only), at evenly spaced moments from each side asked for, her braids hung and
// moved as the game moves them (engine/tails.ts), and lays them out as one picture: a row a side, a column a moment.
// Nothing of the game imports it.
//   npx tsx tools/mage_up_sheet.ts sheet <move> <out.png> [moments=8] [now|before] [sides,comma] [scale=1]
//   npx tsx tools/mage_up_sheet.ts frames <move> <side> <dir> [now|before] [fps=30]     (every frame, each a PNG, for a film)
//   npx tsx tools/mage_up_sheet.ts time                                                (how long her frames take to paint)

// @ts-ignore - node typings are not part of this project
import { deflateSync } from 'node:zlib';
// @ts-ignore
import { mkdirSync, writeFileSync } from 'node:fs';
import { Px } from '../src/engine/px';
import { Tails } from '../src/engine/tails';
import type { TailRoot } from '../src/engine/tails';
import { paintMove3 } from '../src/art/heroes3';
import { MOVES3, settlesOf, startsOf } from '../src/art/moves3';
import type { Move3 } from '../src/art/moves3';
import { MAGE_TAILS } from '../src/art/hero_mage';
import type { Painted } from '../src/art/kit';
import { CANVAS3 } from '../src/art/skin';
import { paintMuMove } from '../src/art/mage_up_art';
import type { MuSide } from '../src/art/mage_up';
import { MU_MOVES } from '../src/art/mage_up_moves';
import { WU_SIDES } from '../src/art/warrior_up';
import { paintWithoutCanvas } from '../tests/helpers';

declare const process: { argv: string[] };
declare const performance: { now(): number };
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
export function pngRGBA(px: Px): Uint8Array {
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

const W = CANVAS3.w;
const H = CANVAS3.h;
const TAIL_PW = 192;
const TAIL_PH = 152;
const TAIL_HW = 96;
const TAIL_UP = 112;
const facingOf = (v: MuSide): 1 | -1 => (v === 'frontL' || v === 'sideL' || v === 'backL' ? -1 : 1);

/** HER BRAIDS, hung from where a frame fixes them and moved as the game moves them (engine/tails.ts); laid with her floor point
 * at the canvas's own (as tools/mage_up_pics.ts of stage 1). */
class Rig {
  tails = new Tails(MAGE_TAILS);
  frame(f: Painted & { ax?: number; ay?: number }, dt: number, facing: 1 | -1 = 1): Px {
    const ax = f.ax ?? CANVAS3.ax;
    const ay = f.ay ?? CANVAS3.ay;
    const roots: TailRoot[] = (f.tails ?? []).map((r) => ({ ...r, x: r.x / 2, y: r.y / 2 }));
    this.tails.step(dt, roots, ax / 2, ay / 2, facing, 0, 0);
    const out = new Px(W, H);
    const lay = (over: boolean): void => {
      const buf = new Uint8ClampedArray(TAIL_PW * TAIL_PH * 4);
      if (!this.tails.paint(buf, over)) return;
      const dx = ax - TAIL_HW;
      const dy = ay - TAIL_UP;
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
      out.d.set(f.px.d.subarray(i, i + 4), i);
    }
    lay(true);
    if (ax === CANVAS3.ax) return out;
    const moved = new Px(W, H);
    const sh = ax - CANVAS3.ax;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const X = x - sh;
      if (X < 0 || X >= W) continue;
      const si = (y * W + x) * 4;
      if (out.d[si + 3] === 0) continue;
      moved.d.set(out.d.subarray(si, si + 4), (y * W + X) * 4);
    }
    return moved;
  }
}

/** A move by its short name: hers, or one made from hers (`stop3`: the fourth coming to a stand; `start`: setting off; and
 * `tstop3`, `tstart` in town). */
function moveOf(key: string, who: 'now' | 'before'): Move3 {
  const M: Record<string, Move3> = who === 'now' ? MU_MOVES : MOVES3;
  const town = key.startsWith('t') && (key.startsWith('tstop') || key === 'tstart');
  const run = town ? M.mtownrun : M.mrun;
  const stand = town ? M.mtown : M.mstand;
  const k = town ? key.slice(1) : key;
  if (k.startsWith('stop')) return settlesOf(run, stand)[Number(k.slice(4)) || 0];
  if (k === 'start') return (startsOf(run, stand) as { move: Move3 }).move;
  const m = M[key];
  if (!m) throw new Error(`no move called ${key}`);
  return m;
}
const endOf = (m: Move3): number => m.motion.keys[m.motion.keys.length - 1].at;

/** Her before: the game's painter, from in front or from behind, mirrored for the left as the game mirrors her. */
function paintBefore(m: Move3, t: number, view: MuSide): Painted {
  return paintMove3(m, t, view === 'back' || view === 'backL' || view === 'away' ? 'back' : 'front');
}
function flipped(px: Px): Px {
  const out = new Px(px.w, px.h);
  for (let y = 0; y < px.h; y++) for (let x = 0; x < px.w; x++) {
    const si = (y * px.w + x) * 4;
    if (px.d[si + 3] === 0) continue;
    // (about her floor point)
    const X = 2 * CANVAS3.ax - 1 - x;
    if (X < 0 || X >= px.w) continue;
    out.d.set(px.d.subarray(si, si + 4), (y * px.w + X) * 4);
  }
  return out;
}

/** Every frame of a move from a side, at `fps`, her braids carried from frame to frame (warmed over the half second before). */
function framesOf(who: 'now' | 'before', m: Move3, view: MuSide, fps: number): Px[] {
  const rig = new Rig();
  const end = endOf(m);
  const loops = m.motion.loop !== undefined;
  const out: Px[] = [];
  const n = loops ? Math.round((end - (m.motion.loop ?? 0)) * fps) : Math.ceil(end * fps - 1e-6) + 1;
  const t0 = loops ? (m.motion.loop ?? 0) : 0;
  const mirror = who === 'before' && (view === 'frontL' || view === 'sideL' || view === 'backL');
  const one = (t: number): Px => {
    const f = who === 'before' ? paintBefore(m, t, view) : paintMuMove(m, t, view);
    const px = rig.frame(f, 1 / fps, who === 'before' ? 1 : facingOf(view));
    return mirror ? flipped(px) : px;
  };
  // (warm her braids: a loop over its last half second; a move played once, standing at its start)
  for (let i = 15; i >= 1; i--) one(loops ? t0 + (((n - i) % n) + n) % n / fps : 0);
  for (let i = 0; i < n; i++) out.push(one(Math.min(end, t0 + i / fps)));
  return out;
}

function sheet(key: string, file: string, moments: number, who: 'now' | 'before', sides: MuSide[], scale: number): void {
  const m = moveOf(key, who);
  const cols: Px[][] = [];
  for (const v of sides) {
    const all = framesOf(who, m, v, 30);
    const pick = Array.from({ length: Math.min(moments, all.length) }, (_, i) => all[Math.round((i * (all.length - 1)) / Math.max(1, Math.min(moments, all.length) - 1))]);
    cols.push(pick);
  }
  const n = cols[0].length;
  // (cut each cell to the box her figure fills over the whole sheet, with a margin)
  let x0 = W, x1 = 0, y0 = H, y1 = 0;
  for (const row of cols) for (const px of row) for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (px.d[(y * W + x) * 4 + 3]) {
    if (x < x0) x0 = x;
    if (x > x1) x1 = x;
    if (y < y0) y0 = y;
    if (y > y1) y1 = y;
  }
  x0 = Math.max(0, x0 - 3);
  y0 = Math.max(0, y0 - 3);
  x1 = Math.min(W - 1, x1 + 3);
  y1 = Math.min(H - 1, y1 + 3);
  const cw = x1 - x0 + 1;
  const ch = y1 - y0 + 1;
  const out = new Px(cw * n * scale, ch * sides.length * scale);
  // (a dark ground, a lighter line between cells)
  for (let i = 0; i < out.w * out.h; i++) out.d.set([22, 20, 46, 255], i * 4);
  cols.forEach((row, r) => row.forEach((px, c) => {
    for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) {
      const si = ((y + y0) * W + x + x0) * 4;
      const edge = x === 0 || y === 0;
      if (px.d[si + 3] === 0 && !edge) continue;
      const col = px.d[si + 3] ? px.d.subarray(si, si + 4) : [34, 32, 66, 255];
      for (let sy = 0; sy < scale; sy++) for (let sx = 0; sx < scale; sx++) out.d.set(col as Uint8ClampedArray, (((r * ch + y) * scale + sy) * out.w + (c * cw + x) * scale + sx) * 4);
    }
  }));
  writeFileSync(file, pngRGBA(out));
  console.log(`${file}: ${key} (${who}), ${sides.length} sides by ${n} moments, each ${cw}x${ch}, x${scale}; the move ${endOf(m).toFixed(3)} s`);
}

function frames(key: string, view: MuSide, dir: string, who: 'now' | 'before', fps: number): void {
  mkdirSync(dir, { recursive: true });
  const all = framesOf(who, moveOf(key, who), view, fps);
  all.forEach((px, i) => writeFileSync(`${dir}/${String(i).padStart(4, '0')}.png`, pngRGBA(px)));
  console.log(`${dir}: ${all.length} frames of ${key} (${who}) from ${view} at ${fps}`);
}

function time(): void {
  for (const key of ['mstand', 'mrun', 'wave', 'orb', 'beam', 'mfall']) {
    const m = MU_MOVES[key as keyof typeof MU_MOVES];
    const t0 = performance.now();
    let n = 0;
    for (const v of ['front', 'back', 'toward'] as const) for (let i = 0; i < 6; i++) {
      paintMuMove(m, (endOf(m) * i) / 6, v);
      n++;
    }
    console.log(`${key}: ${((performance.now() - t0) / n).toFixed(1)} ms a frame`);
  }
}

const [mode, a, b, c, d, e, f] = (process.argv[1] ?? "").replace(/\\/g, "/").endsWith("tools/mage_up_sheet.ts") ? process.argv.slice(2) : ["none"];
if (mode === 'sheet') sheet(a, b, Number(c) || 8, d === 'before' ? 'before' : 'now', e ? (e.split(',') as MuSide[]) : [...WU_SIDES], Number(f) || 1);
else if (mode === 'frames') frames(a, b as MuSide, c, d === 'before' ? 'before' : 'now', Number(e) || 30);
else if (mode === 'time') time();
else if (mode !== 'none') console.log('usage: mage_up_sheet.ts sheet <move> <out.png> [moments] [now|before] [sides] [scale] | frames <move> <side> <dir> [now|before] [fps] | time');
