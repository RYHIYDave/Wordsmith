// THE MAGE BROUGHT UP: THE PICTURES FOR THE OWNER (the art chat's helper, 7 Nov 2026; docs/mockups/mage_up/README.md).
// Paints her BEFORE (the game's Mage as she is: art/heroes3.ts paintMove3, her moves in art/moves3.ts) and NOW (art/mage_up.ts),
// with her braids hung and moved as the game moves them (engine/tails.ts), and writes each picture as an RGBA PNG;
// tools/mage_up_pics.py lays them out with their captions. Nothing of the game imports it.
//   npx tsx tools/mage_up_pics.ts look <dir>      (stage 1, the still: her stance before beside now, in front and from behind;
//                                                 her head six times as big (and from behind); a held cast; her eight sides; at the game's size;
//                                                 her legs measured)

// @ts-ignore - node typings are not part of this project
import { deflateSync } from 'node:zlib';
// @ts-ignore
import { mkdirSync, writeFileSync } from 'node:fs';
import { Px } from '../src/engine/px';
import { Tails } from '../src/engine/tails';
import type { TailRoot } from '../src/engine/tails';
import { paintMove3 } from '../src/art/heroes3';
import { MOVES3, MAGE_BODY } from '../src/art/moves3';
import type { Move3 } from '../src/art/moves3';
import { MAGE_TAILS } from '../src/art/hero_mage';
import { paintMage3 } from '../src/art/hero3_mage';
import type { Painted } from '../src/art/kit';
import { CANVAS3 } from '../src/art/skin';
import { bonesAt, solve } from '../src/art/skeleton';
import type { Skeleton, V3 } from '../src/art/skeleton';
import { paintMuMove, muPosed } from '../src/art/mage_up_art';
import type { MuSide } from '../src/art/mage_up';
import { MU_MOVES } from '../src/art/mage_up_moves';
import { WU_SIDES, spun } from '../src/art/warrior_up';
import { wuLegs } from '../src/art/warrior_up_review';
import { HEROES, measure } from './legs_measure';
import { paintWithoutCanvas } from '../tests/helpers';

declare const process: { argv: string[] };
paintWithoutCanvas();

// ---- a PNG with its see-through kept (as tools/ranger_up_pics.ts) ----
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

/** HER BRAIDS, hung from where a frame fixes them and moved as the game moves them (engine/tails.ts): `facing` as
 * art/warrior_up_art.ts wuTailsFacing has it for her side; laid with her floor point at the canvas's own, 84 across. */
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

/**
 * THE OLD DRAWING TURNED (for the head close up only): the game's painter (art/hero3_mage.ts) on her figure truly turned `deg` to
 * her left about the floor point under her, seen from in front. The game never drew her so (only in front and from behind,
 * mirrored for the left); this shows how her old head reads from the sides the new one is drawn from.
 */
function turnedSkeleton(s: Skeleton, deg: number): Skeleton {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(s)) {
    if (k === 'poleL' || k === 'poleR') out[k] = v;
    else if (Array.isArray(v) && v.length === 3 && typeof v[0] === 'number') out[k] = spun(v as V3, deg);
    else if (Array.isArray(v) && v.length === 3 && Array.isArray(v[0])) out[k] = (v as V3[]).map((p) => spun(p, deg));
    else out[k] = v;
  }
  return out as unknown as Skeleton;
}
const SPIN_OF: Record<MuSide, number> = { front: 0, toward: -45, frontL: -90, sideL: -135, backL: 180, away: 135, back: 90, side: 45 };

/** Her before: the game's painter, from in front or from behind (or, for the head, her figure turned to `side`). */
function paintBefore(m: Move3, t: number, view: MuSide, turned = false): Painted {
  if (!turned || view === 'front') return paintMove3(m, t, view === 'back' || view === 'backL' || view === 'away' ? 'back' : 'front');
  const end = m.motion.keys[m.motion.keys.length - 1].at;
  const tt = m.motion.loop !== undefined && t >= end ? t % end : t;
  const q = bonesAt(m.motion.keys, m.rest, tt);
  const s = turnedSkeleton(solve(m.build, q), SPIN_OF[view]);
  const prev = turnedSkeleton(solve(m.build, bonesAt(m.motion.keys, m.rest, Math.max(0, tt - 1 / 30))), SPIN_OF[view]);
  return paintMage3(s, q, 'front', { build: m.build }, { prev, wind: 0 });
}
function stillOf(who: 'before' | 'now', m: Move3, t: number, view: MuSide, warm = 0.5, turned = false): Px {
  const rig = new Rig();
  let px: Px | null = null;
  for (let u = t - warm; u <= t + 1e-6; u += 1 / 30) {
    const f = who === 'before' ? paintBefore(m, Math.max(0, u), view, turned) : paintMuMove(m, Math.max(0, u), view);
    px = rig.frame(f, 1 / 30, who === 'before' ? (turned ? facingOf(view) : 1) : facingOf(view));
  }
  return px as Px;
}

/** HER NEAR LEG ON THE SCREEN, from in front (as tools/legs_measure.ts measures it): the hip, the knee, the floor under the ankle,
 * in picture pixels; the two lengths in game pixels; and the least ratio of any leg from any of her eight sides through her
 * breathing stance. */
function legsOf(m: Move3, T: number): Record<string, unknown> {
  const s0 = solve(m.build, bonesAt(m.motion.keys, m.rest, T)) as Skeleton & Record<string, V3>;
  const f = paintMuMove(m, T, 'front');
  const st = f.drawn.st;
  const sd = st.near(s0.kneeL) >= st.near(s0.kneeR) ? 'L' : 'R';
  const at = (p: V3): [number, number] => {
    const [x, y] = st.at(p);
    return [+x.toFixed(2), +y.toFixed(2)];
  };
  const ankle = s0[`ankle${sd}`];
  const [Hh, K, A, F] = [at(s0[`hip${sd}`]), at(s0[`knee${sd}`]), at(ankle), at([ankle[0], ankle[1], ankle[2] - m.build.ankle])];
  const d = (a: [number, number], b: [number, number]): number => Math.hypot(a[0] - b[0], a[1] - b[1]);
  const end = m.motion.keys[m.motion.keys.length - 1].at;
  const per: Record<string, number> = {};
  for (const v of WU_SIDES) {
    let least = 9;
    for (let t = 0; t < end - 1e-6; t += 1 / 30) {
      const s = solve(m.build, bonesAt(m.motion.keys, m.rest, t));
      for (const l of wuLegs(s, v, MAGE_BODY.ankle)) least = Math.min(least, l.ratio);
    }
    per[v] = +least.toFixed(2);
  }
  return { leg: sd, hip: Hh, knee: K, ankle: A, floor: F, thigh: +(d(Hh, K) / 2).toFixed(1), lower: +((d(K, A) + d(A, F)) / 2).toFixed(1), per, least: Math.min(...Object.values(per)) };
}

/** THE STILL (stage 1). */
function look(dir: string): void {
  mkdirSync(dir, { recursive: true });
  const T = 0.6;
  const out: Record<string, unknown> = {};
  const put = (name: string, px: Px): string => {
    writeFileSync(`${dir}/${name}.png`, pngRGBA(px));
    return `${name}.png`;
  };
  const before = MOVES3.mstand;
  const now = MU_MOVES.mstand;
  // her stance, before beside now, from in front and from behind
  out.stance = (['front', 'back'] as const).map((v) => ({ view: v, before: put(`stance_before_${v}`, stillOf('before', before, T, v)), now: put(`stance_now_${v}`, stillOf('now', now, T, v)) }));
  // her head, before and now, from in front, side-on and toward the camera
  // (and from behind: before, the game's own view from behind; now, straight behind her)
  out.head = (['front', 'side', 'toward', 'away'] as const).map((v) => ({ view: v, before: put(`head_before_${v}`, stillOf('before', before, T, v, 0.5, v !== 'away')), now: put(`head_now_${v}`, stillOf('now', now, T, v)) }));
  // a held cast, now, from in front
  out.cast = put('cast_now_front', stillOf('now', MU_MOVES.cast, 0.3, 'front', 0.3));
  // her eight sides, standing
  out.sides = WU_SIDES.map((v) => ({ view: v, file: put(`side_${v}`, stillOf('now', now, T, v)) }));
  // her legs: the bones from in front, and the eye's (her robe's hem, the top of her boot) as tools/legs_measure.ts reads them
  const eyeBefore = measure(HEROES.mage('stance'));
  const eyeNow = measure(HEROES['mage-now']('stance'));
  out.legs = { before: { ...legsOf(before, T), eye: eyeBefore }, now: { ...legsOf(now, T), eye: eyeNow } };
  // her face at the game's size: where her head is, for the caption
  const f = paintMuMove(now, T, 'front');
  out.head_at = f.drawn.st.at(muPosed(now, T).s.head);
  writeFileSync(`${dir}/look.json`, JSON.stringify(out, null, 1));
  console.log(`written ${dir}`, JSON.stringify(out.legs));
}

const [mode, dir] = process.argv.slice(2);
if (mode === 'look') look(dir);
else console.log('usage: mage_up_pics.ts look <dir>');
