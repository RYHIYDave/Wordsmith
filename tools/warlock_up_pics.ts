// THE WARLOCK BROUGHT UP: THE PICTURES FOR THE OWNER (the art chat's helper, 7 Nov 2026; docs/mockups/warlock_up/README.md).
// Paints him BEFORE (the game's Warlock as he is: dev/warlock_moves.ts drawWarlockAt, as art/warlock_art.ts paints him) and NOW
// (art/warlock_up.ts), and writes each picture as an RGBA PNG with his floor point at 84, 132 of his canvas;
// tools/warlock_up_pics.py lays them out with their captions. Nothing of the game imports it.
//   npx tsx tools/warlock_up_pics.ts look <dir>     (stage 1, the still: his stance before beside now, in front and from behind;
//                                                   his legs measured; his eight sides; a stride of his run side-on; at the game's size)

// @ts-ignore - node typings are not part of this project
import { mkdirSync, writeFileSync } from 'node:fs';
// @ts-ignore
import { deflateSync } from 'node:zlib';
import { Px } from '../src/engine/px';
import { CANVAS3 } from '../src/art/skin';
import type { V3, Skeleton } from '../src/art/skeleton';
import { solve } from '../src/art/skeleton';
import { WARLOCK_B, drawWarlockAt, warlockPose } from '../src/dev/warlock_moves';
import type { WarlockMove } from '../src/dev/warlock_moves';
import type { Drawn } from '../src/dev/sculpt';
import { LAST } from '../src/dev/sculpt';
import { WL_BOOT_TOP_BEFORE, paintWarlockUp } from '../src/art/warlock_up';
import type { WlFrame, WlSide } from '../src/art/warlock_up';
import { WL_GAME, WL_RUN, WL_STAND } from '../src/art/warlock_up_moves';
import { WU_SIDES } from '../src/art/warrior_up';
import { wuLegs, wuThighs } from '../src/art/warrior_up_review';
import { measure } from './legs_measure';
import type { Cover, Sample } from './legs_measure';
import { paintWithoutCanvas } from '../tests/helpers';

declare const process: { argv: string[] };
paintWithoutCanvas();

// ---- a PNG with its see-through kept (as tools/mage_up_pics.ts) ----
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

const W = CANVAS3.w;
const H = CANVAS3.h;
/** The moment of his stand the still shows (a breath, his arm restless). */
export const STILL_T = 0.6;
/** His breathing: the stand before the spasm, and after it from his foot set home (dev/warlock_moves.ts warlockStand). */
export const BREATHING: [number, number][] = [[0, 1.5], [5.42, 6.6]];

/** A picture with its floor point moved to the canvas's own (84 across), so every picture lies alike. */
function laid(px: Px, ax: number): Px {
  if (ax === CANVAS3.ax) return px;
  const out = new Px(W, H);
  const sh = ax - CANVAS3.ax;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const X = x - sh;
    if (X < 0 || X >= W) continue;
    const si = (y * W + x) * 4;
    if (px.d[si + 3] === 0) continue;
    out.d.set(px.d.subarray(si, si + 4), (y * W + X) * 4);
  }
  return out;
}

/** Before: the game's own picture of him (from in front, or from behind as the game truly paints him). */
function before(m: WarlockMove, t: number, view: 'front' | 'back'): { px: Px; drawn: Drawn } {
  const d = drawWarlockAt(view, m, t);
  return { px: d.px, drawn: d };
}

/** His near leg on the screen, from in front: hip, knee, floor (picture pixels), the two lengths (game pixels); and where the eye
 * reads his coat's edge over it and his boot's top (tools/legs_measure.ts measure). */
function legOf(s: Skeleton, drawn: Drawn, cover: (x: number, y: number) => Cover, who: string): Record<string, unknown> {
  const st = drawn.st;
  const sd = st.near(s.kneeL) >= st.near(s.kneeR) ? 'L' : 'R';
  const S = s as unknown as Record<string, V3>;
  const at = (p: V3): [number, number] => {
    const [x, y] = st.at(p);
    return [+x.toFixed(2), +y.toFixed(2)];
  };
  const ankle = S[`ankle${sd}`];
  const [Hh, K, A, F] = [at(S[`hip${sd}`]), at(S[`knee${sd}`]), at(ankle), at([ankle[0], ankle[1], ankle[2] - WARLOCK_B.ankle])];
  const d = (a: [number, number], b: [number, number]): number => Math.hypot(a[0] - b[0], a[1] - b[1]);
  const sm: Sample = { hero: who, pose: 'stance', B: WARLOCK_B, s, px: drawn.px, st, cover };
  return { leg: sd, hip: Hh, knee: K, ankle: A, floor: F, thigh: +(d(Hh, K) / 2).toFixed(1), lower: +((d(K, A) + d(A, F)) / 2).toFixed(1), eye: measure(sm) };
}
/** What covers a pixel, by his materials: his coat over, his trousers, his boots. */
function coverBy(drawn: Drawn, mats: { coat: number; trousers: number; boots: number }): (x: number, y: number) => Cover {
  return (x, y) => {
    if (x < 0 || y < 0 || x >= drawn.px.w || y >= drawn.px.h) return 'other';
    const a = drawn.px.d[(y * drawn.px.w + x) * 4 + 3];
    if (a !== 255) return 'other';
    const m = drawn.stuff[y * drawn.px.w + x];
    return m === mats.coat ? 'over' : m === mats.trousers ? 'upper' : m === mats.boots ? 'lower' : 'other';
  };
}

/** The least of either leg, from each of his eight sides, through the moments `spans` of a move (every frame at 30 a second). */
export function leastBySide(m: WarlockMove, spans: [number, number][]): Record<WlSide, number> {
  const out = {} as Record<WlSide, number>;
  for (const v of WU_SIDES) {
    let least = 9;
    for (const [a, b] of spans) for (let i = Math.round(a * 30); i < Math.round(b * 30); i++) {
      const s = solve(WARLOCK_B, warlockPose(m.motion, i / 30));
      for (const l of wuLegs(s, v, WARLOCK_B.ankle)) least = Math.min(least, l.ratio);
    }
    out[v] = +least.toFixed(2);
  }
  return out;
}

/** THE STILL (stage 1). */
function look(dir: string): void {
  mkdirSync(dir, { recursive: true });
  const out: Record<string, unknown> = {};
  const put = (name: string, px: Px): string => {
    writeFileSync(`${dir}/${name}.png`, pngRGBA(px));
    return `${name}.png`;
  };
  const T = STILL_T;
  // his stance, before beside now, from in front and from behind
  const now: Record<string, WlFrame> = {};
  out.stance = (['front', 'back'] as const).map((v) => {
    const f = paintWarlockUp(WL_STAND, T, v);
    now[v] = f;
    return { view: v, before: put(`stance_before_${v}`, before(WL_GAME.stand, T, v).px), now: put(`stance_now_${v}`, laid(f.px, f.ax)) };
  });
  // his eight sides, standing
  out.sides = WU_SIDES.map((v) => {
    const f = paintWarlockUp(WL_STAND, T, v);
    return { view: v, file: put(`side_${v}`, laid(f.px, f.ax)) };
  });
  // his legs, from in front: the bones, and his coat's edge and his boot's top as the eye reads them
  const b = before(WL_GAME.stand, T, 'front');
  const bMats = (() => {
    const mats = (LAST.sc as NonNullable<typeof LAST.sc>).mats;
    const sig = (r: readonly string[]): string => r.join(',');
    const C = '#0e0b1c,#1e1832,#322a50,#4c4270,#6c6094';
    const Hd = '#1e1018,#3a2026,#64382e,#94583c,#b8784e';
    const coat = mats.findIndex((m) => sig(m.ramp) === C);
    const trousers = mats.findIndex((m, i) => i > coat && sig(m.ramp) === C);
    const boots = mats.findIndex((m, i) => i > trousers && sig(m.ramp) === Hd);
    return { coat, trousers, boots };
  })();
  const nf = now.front;
  out.legs = {
    before: { ...legOf(solve(WARLOCK_B, warlockPose(WL_GAME.stand.motion, T)), b.drawn, coverBy(b.drawn, bMats), 'before'), per: leastBySide(WL_GAME.stand, BREATHING), whole: leastBySide(WL_GAME.stand, [[0, WL_GAME.stand.long]]) },
    now: { ...legOf(nf.s, nf.drawn, coverBy(nf.drawn, nf.mats), 'now'), per: leastBySide(WL_STAND, BREATHING), whole: leastBySide(WL_STAND, [[0, WL_STAND.long]]) },
  };
  // a stride of his run side-on: eight moments of its round (26 pictures at 60 a second), before and now, the swinging thigh's angle
  const PICKS = [0, 3, 6, 9, 12, 15, 18, 21];
  const stride = (m: WarlockMove, who: 'before' | 'now'): { file: string; thighs: { leg: string; deg: number; swinging: boolean }[] }[] =>
    PICKS.map((i) => {
      const t = i / 60;
      const f = paintWarlockUp(m, t, 'side', who === 'before' ? WL_BOOT_TOP_BEFORE : undefined);
      const th = wuThighs(f.s).map((x) => ({ leg: x.leg, deg: +x.deg.toFixed(0), swinging: x.swinging }));
      return { file: put(`run_${who}_${i}`, laid(f.px, f.ax)), thighs: th };
    });
  const most = (m: WarlockMove): number => {
    let k = 0;
    for (let i = 0; i < 26; i++) for (const x of wuThighs(solve(WARLOCK_B, warlockPose(m.motion, i / 60)))) if (x.swinging) k = Math.max(k, x.deg);
    return +k.toFixed(1);
  };
  out.run = { before: stride(WL_GAME.run, 'before'), now: stride(WL_RUN, 'now'), most: { before: most(WL_GAME.run), now: most(WL_RUN) } };
  writeFileSync(`${dir}/look.json`, JSON.stringify(out, null, 1));
  console.log(`written ${dir}`, JSON.stringify(out.legs), JSON.stringify((out.run as { most: unknown }).most));
}

const [mode, dir] = process.argv.slice(2);
if (mode === 'look') look(dir);
else console.log('usage: warlock_up_pics.ts look <dir>');
