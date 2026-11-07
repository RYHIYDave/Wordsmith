// THE RANGER BROUGHT UP: THE PICTURES FOR THE OWNER (the art chat's helper, 6 Nov 2026; docs/mockups/ranger_up/README.md).
// Paints him BEFORE (the game's ranger as he is: art/heroes3.ts paintMove3, his moves in art/moves3.ts) and NOW
// (art/ranger_up.ts), with the feather in his cap hung and moved as the game moves it (engine/tails.ts), and writes each
// picture as an RGBA PNG; tools/ranger_up_pics.py lays them out with their captions. Nothing of the game imports it.
//   npx tsx tools/ranger_up_pics.ts look <dir>      (his stance, one still from in front: before, his first sculpt, and now with
//                                                   his legs true; and where his near leg's hip, knee and floor are in each)

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
import { CANVAS3, stage } from '../src/art/skin';
import { bonesAt, solve } from '../src/art/skeleton';
import type { Skeleton, V3 } from '../src/art/skeleton';
import type { Move3 } from '../src/art/moves3';
import { paintRu } from '../src/art/ranger_up';
import type { RuSide } from '../src/art/ranger_up';
import { RU_MOVES } from '../src/art/ranger_up_moves';
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

/** Before (the game's), the first `now` he saw (the game's own crouch, sculpted), and now with his legs true (his knees out). */
type Who = 'before' | 'now' | 'legs';
const W = CANVAS3.w;
const H = CANVAS3.h;

/** A moment of one of his moves, as it was (before: in front or behind only) or as it is now (from any of his sides). */
function paintOf(who: Who, key: string, t: number, view: RuSide): Painted {
  if (who === 'before') return paintMove3(MOVES3[key], t, view === 'back' ? 'back' : 'front');
  return paintRu(who === 'legs' ? RU_MOVES[key] ?? MOVES3[key] : MOVES3[key], t, view);
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
  const legs: Record<string, unknown> = {};
  for (const who of ['before', 'now', 'legs'] as const) {
    writeFileSync(`${dir}/look_${who}.png`, pngRGBA(still(who, 'rstand', T, 'front')));
    // HIS NEAR LEG ON THE SCREEN (as tools/legs_measure.ts measures it): the hip, the knee, the ankle and the floor under it
    // (the ankle's own height below it), in picture pixels; and the two lengths along the leg, in game pixels
    const m: Move3 = who === 'legs' ? RU_MOVES.rstand : MOVES3.rstand;
    const s = solve(m.build, bonesAt(m.motion.keys, m.rest, T)) as Skeleton & Record<string, V3>;
    const st = stage('front');
    const sd = st.near(s.kneeL) >= st.near(s.kneeR) ? 'L' : 'R';
    const at = (p: V3): [number, number] => {
      const [x, y] = st.at(p);
      return [+x.toFixed(2), +y.toFixed(2)];
    };
    const ankle = s[`ankle${sd}`];
    const [H, K, A, F] = [at(s[`hip${sd}`]), at(s[`knee${sd}`]), at(ankle), at([ankle[0], ankle[1], ankle[2] - m.build.ankle])];
    const d = (a: [number, number], b: [number, number]): number => Math.hypot(a[0] - b[0], a[1] - b[1]);
    legs[who] = { leg: sd, hip: H, knee: K, ankle: A, floor: F, thigh: +(d(H, K) / 2).toFixed(1), lower: +((d(K, A) + d(A, F)) / 2).toFixed(1) };
  }
  writeFileSync(`${dir}/look.json`, JSON.stringify(legs, null, 1));
  console.log(`3 pictures in ${dir}`, JSON.stringify(legs));
}

const [mode, dir] = process.argv.slice(2);
if (mode === 'look') look(dir);
else console.log('usage: ranger_up_pics.ts look <dir>');
