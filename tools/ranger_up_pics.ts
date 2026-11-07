// THE RANGER BROUGHT UP: THE PICTURES FOR THE OWNER (the art chat's helper, 6 Nov 2026; docs/mockups/ranger_up/README.md).
// Paints him BEFORE (the game's ranger as he is: art/heroes3.ts paintMove3, his moves in art/moves3.ts) and NOW
// (art/ranger_up.ts), with the feather in his cap hung and moved as the game moves it (engine/tails.ts), and writes each
// picture as an RGBA PNG; tools/ranger_up_pics.py lays them out with their captions. Nothing of the game imports it.
//   npx tsx tools/ranger_up_pics.ts look <dir>      (his stance, one still: before beside now, from in front)

// @ts-ignore - node typings are not part of this project
import { deflateSync } from 'node:zlib';
// @ts-ignore
import { mkdirSync, writeFileSync } from 'node:fs';
import { Px } from '../src/engine/px';
import { Tails } from '../src/engine/tails';
import type { TailRoot } from '../src/engine/tails';
import { paintMove3 } from '../src/art/heroes3';
import { MOVES3 } from '../src/art/moves3';
import { RANGER_TAILS } from '../src/art/hero_ranger';
import type { Painted } from '../src/art/kit';
import { CANVAS3 } from '../src/art/skin';
import { paintRu } from '../src/art/ranger_up';
import type { RuSide } from '../src/art/ranger_up';
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

type Who = 'before' | 'now';
const W = CANVAS3.w;
const H = CANVAS3.h;

/** A moment of one of his moves, as it was (before: in front or behind only) or as it is now (from any of his sides). */
function paintOf(who: Who, key: string, t: number, view: RuSide): Painted {
  if (who === 'before') return paintMove3(MOVES3[key], t, view === 'back' ? 'back' : 'front');
  return paintRu(MOVES3[key], t, view);
}

/** THE FEATHER IN HIS CAP, hung from where a frame fixes its quill and moved as the game moves it (engine/tails.ts). */
class Rig {
  tails = new Tails(RANGER_TAILS);
  frame(f: Painted, dt: number): Px {
    const roots: TailRoot[] = (f.tails ?? []).map((r) => ({ ...r, x: r.x / 2, y: r.y / 2 }));
    this.tails.step(dt, roots, CANVAS3.ax / 2, CANVAS3.ay / 2, 1, 0, 0);
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
      out.d[i + 3] = f.px.d[i + 3];
    }
    lay(true);
    return out;
  }
}
const TAIL_PW = 192;
const TAIL_PH = 152;
const TAIL_HW = 96;
const TAIL_UP = 112;

/** Him at a moment of a move, his feather hung as it would be (the move played from a second before up to it). */
function still(who: Who, key: string, t: number, view: RuSide): Px {
  const rig = new Rig();
  let px: Px | null = null;
  for (let u = t - 1.2; u <= t + 1e-6; u += 1 / 60) px = rig.frame(paintOf(who, key, Math.max(0, u), view), 1 / 60);
  return px as Px;
}

/** THE STILL OF HIM STANDING: one frame of his breathing stance, before and now, from in front. */
function look(dir: string): void {
  mkdirSync(dir, { recursive: true });
  const T = 0.6;
  for (const who of ['before', 'now'] as const) writeFileSync(`${dir}/look_${who}.png`, pngRGBA(still(who, 'rstand', T, 'front')));
  console.log(`2 pictures in ${dir}`);
}

const [mode, dir] = process.argv.slice(2);
if (mode === 'look') look(dir);
else console.log('usage: ranger_up_pics.ts look <dir>');
