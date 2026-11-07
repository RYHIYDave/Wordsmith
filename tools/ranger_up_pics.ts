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
import { paintRuMove as paintRu } from '../src/art/ranger_up_art';
import type { RuSide } from '../src/art/ranger_up';
import { RU_MOVES, RU_SHOT_HIT, RU_SHOT_LONG } from '../src/art/ranger_up_moves';
import { WU_SIDES } from '../src/art/warrior_up';
import { wuFacing } from '../src/art/warrior_up_art';
import { wuLegs, wuThighs } from '../src/art/warrior_up_review';
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
/** Him before (the game's) or now (brought up), a move by its short name or as a move. */
function paintMv(who: 'before' | 'now', m: Move3, t: number, view: RuSide): Painted {
  if (who === 'before') return paintMove3(m, t, view === 'back' || view === 'backL' || view === 'away' ? 'back' : 'front');
  return paintRu(m, t, view);
}
function stillMv(who: 'before' | 'now', m: Move3, t: number, view: RuSide, warm = 0.5): Px {
  const rig = new Rig();
  let px: Px | null = null;
  for (let u = t - warm; u <= t + 1e-6; u += 1 / 30) px = rig.frame(paintMv(who, m, Math.max(0, u), view), 1 / 30, who === 'before' ? 1 : facingOf(view));
  return px as Px;
}

/** THE FEATHER IN HIS CAP, hung from where a frame fixes its quill and moved as the game moves it (engine/tails.ts): `facing` as
 * art/warrior_up_art.ts wuTailsFacing has it for his side (-1 for the three that face left), his anchor where the frame has it. */
class Rig {
  tails = new Tails(RANGER_TAILS);
  ox = 0;
  oy = 0;
  frame(f: Painted & { ax?: number; ay?: number }, dt: number, facing: 1 | -1 = 1, at?: [number, number]): Px {
    const ax = f.ax ?? CANVAS3.ax;
    const ay = f.ay ?? CANVAS3.ay;
    if (at) [this.ox, this.oy] = at;
    const roots: TailRoot[] = (f.tails ?? []).map((r) => ({ ...r, x: r.x / 2, y: r.y / 2 }));
    this.tails.step(dt, roots, ax / 2, ay / 2, facing, this.ox, this.oy);
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
      out.d[i] = f.px.d[i];
      out.d[i + 1] = f.px.d[i + 1];
      out.d[i + 2] = f.px.d[i + 2];
      out.d[i + 3] = f.px.d[i + 3];
    }
    lay(true);
    // (laid with his floor point at the canvas's own, 84 across, whichever side: so that every cell lines up)
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
const TAIL_PW = 192;
const TAIL_PH = 152;
const TAIL_HW = 96;
const TAIL_UP = 112;
const facingOf = (v: RuSide): 1 | -1 => (v === 'frontL' || v === 'sideL' || v === 'backL' ? -1 : 1);

/** Him at a moment of a move, his feather hung as it would be (the move played from half a second before up to it). */
function still(who: Who, key: string, t: number, view: RuSide): Px {
  const rig = new Rig();
  let px: Px | null = null;
  for (let u = t - 0.5; u <= t + 1e-6; u += 1 / 30) px = rig.frame(paintOf(who, key, Math.max(0, u), view), 1 / 30, facingOf(view));
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

// ---------------------------------------------------------------------------------------------
// THE SHEET: before beside now for every list, from in front and from behind, three times as big and at the game's size; a legs
// panel at its top; and a side-on strip of eight frames of his run, before and now, with the swinging thigh's angle.

const NOW = RU_MOVES;
/** The lists of the sheet: a caption, the move before and now, and the moments (seconds) of each. */
const SHEET: { title: string; rows: { label: string; key: string; before: number; now: number }[] }[] = [
  { title: 'Standing in a fight', rows: [{ label: 'his guard (now his legs true from every side, alive, his bow canted so it shows)', key: 'rstand', before: 0.6, now: 0.6 }] },
  { title: 'Running', rows: [{ label: 'a stride (now a hunter\'s run, his foot passing low, never a high-step)', key: 'rrun', before: 0.1, now: 0.1 }] },
  { title: 'The Shot', rows: [
    { label: 'the held draw (now held three frames, the string to his cheek)', key: 'shot', before: 4 / 30, now: 8 / 30 },
    { label: 'the release (now one frame, the string snapped, its after-image)', key: 'shot', before: 5 / 30, now: 10 / 30 },
    { label: 'the follow-through (now the string hand flown back past his ear)', key: 'shot', before: 8 / 30, now: 15 / 30 },
  ] },
  { title: 'The Volley', rows: [
    { label: 'the held draw at the sky, on his knee', key: 'volley', before: 5 / 30, now: 10 / 30 },
    { label: 'the release (one frame) and its after-image', key: 'volley', before: 6 / 30, now: 12 / 30 },
  ] },
  { title: 'His roll', rows: [{ label: 'over in a ball', key: 'roll', before: 0.2, now: 0.2 }] },
  { title: 'Struck', rows: [{ label: 'from in front', key: 'rreel', before: 3 / 30, now: 3 / 30 }, { label: 'from behind', key: 'rlurch', before: 3 / 30, now: 3 / 30 }] },
  { title: 'His fall', rows: [{ label: 'the end: on his knee, his bow laid down, the light gone out', key: 'rfall', before: 45 / 30, now: 45 / 30 }] },
  { title: 'Left standing', rows: [{ label: 'the squirrel on his shoulder', key: 'squirrel', before: 0.6, now: 0.6 }, { label: 'sighting along an arrow', key: 'sighting', before: 1.6, now: 1.6 }] },
  { title: 'In town and on his card', rows: [
    { label: 'standing in town', key: 'rtown', before: 0.6, now: 0.6 },
    { label: 'running in town', key: 'rtownrun', before: 0.1, now: 0.1 },
    { label: 'his card: ready in his guard after unslinging his bow', key: 'rdraw', before: 30 / 30, now: 30 / 30 },
  ] },
];

function sheet(dir: string): void {
  mkdirSync(dir, { recursive: true });
  let n = 0;
  const write = (px: Px): string => {
    const f = `s${String(n++).padStart(3, '0')}.png`;
    writeFileSync(`${dir}/${f}`, pngRGBA(px));
    return f;
  };
  const sections = SHEET.map((sec) => ({
    title: sec.title,
    rows: sec.rows.map((r) => {
      const front = ['front', 'back'] as const;
      const files: string[] = [];
      for (const v of front) for (const who of ['before', 'now'] as const) files.push(write(stillMv(who, (who === 'before' ? MOVES3 : NOW)[r.key], who === 'before' ? r.before : r.now, v)));
      return { label: r.label, files };
    }),
  }));
  // the legs panel: his guard from in front, before and now, the near leg's hip, knee and floor
  const legs: Record<string, unknown>[] = [];
  for (const who of ['before', 'now'] as const) {
    const m = (who === 'before' ? MOVES3 : NOW).rstand;
    const T = 0.6;
    const s0 = solve(m.build, bonesAt(m.motion.keys, m.rest, T)) as Skeleton & Record<string, V3>;
    const st = stage('front');
    const sd = st.near(s0.kneeL) >= st.near(s0.kneeR) ? 'L' : 'R';
    const at = (p: V3): [number, number] => {
      const [x, y] = st.at(p);
      return [+x.toFixed(2), +y.toFixed(2)];
    };
    const ankle = s0[`ankle${sd}`];
    const [Hh, K, A, F] = [at(s0[`hip${sd}`]), at(s0[`knee${sd}`]), at(ankle), at([ankle[0], ankle[1], ankle[2] - m.build.ankle])];
    const d = (a: [number, number], b: [number, number]): number => Math.hypot(a[0] - b[0], a[1] - b[1]);
    const least = Math.min(...WU_SIDES.map((v) => Math.min(...wuLegs(s0, v, m.build.ankle).map((l) => l.ratio))));
    legs.push({ who, file: write(stillMv(who, m, T, 'front')), hip: Hh, knee: K, floor: F, thigh: +(d(Hh, K) / 2).toFixed(1), lower: +((d(K, A) + d(A, F)) / 2).toFixed(1), least: +least.toFixed(2) });
  }
  // the stride strip: eight frames of his run side-on (`side`), before and now, each with its swinging thigh's angle
  const strip: Record<string, unknown>[] = [];
  for (const who of ['before', 'now'] as const) {
    const m = (who === 'before' ? MOVES3 : NOW).rrun;
    const end = m.motion.keys[m.motion.keys.length - 1].at;
    for (let i = 0; i < 8; i++) {
      const t = (end * i) / 8;
      const sk = solve(m.build, bonesAt(m.motion.keys, m.rest, t));
      const sw = wuThighs(sk).filter((x) => x.swinging);
      const deg = sw.length ? Math.max(...sw.map((x) => x.deg)) : 0;
      // (before: the game has no side-on picture of him; he is drawn by the new painter from side-on on the game's run, to show its legs)
      strip.push({ who, file: write(stillMv('now', m, t, 'side', 0.2)), deg: +deg.toFixed(0) });
    }
  }
  const small = ['rstand', 'rrun', 'shot', 'volley', 'rfall', 'rtown'].map((key) => ({
    key,
    files: (['before', 'now'] as const).map((who) => write(stillMv(who, (who === 'before' ? MOVES3 : NOW)[key], key === 'shot' ? (who === 'before' ? 4 / 30 : 8 / 30) : key === 'volley' ? (who === 'before' ? 5 / 30 : 10 / 30) : key === 'rfall' ? 45 / 30 : 0.6, 'front'))),
  }));
  writeFileSync(`${dir}/sheet.json`, JSON.stringify({ sections, legs, strip, small }, null, 1));
  console.log(`${n} pictures in ${dir}`);
}

// ---------------------------------------------------------------------------------------------
// THE SECOND SHEET: his head six times as big, before (in front, from behind) and now from all eight sides; the turnaround of his
// stance, a run stride and the Shot's release in his eight true facings.

const SIDE_NAMES: Record<RuSide, string> = { front: 'down and to the right', toward: 'down, toward you', frontL: 'down and to the left', sideL: 'to the left', backL: 'up and to the left', away: 'up, away from you', back: 'up and to the right', side: 'to the right' };
function sheet2(dir: string): void {
  mkdirSync(dir, { recursive: true });
  let n = 0;
  const write = (px: Px): string => {
    const f = `t${String(n++).padStart(3, '0')}.png`;
    writeFileSync(`${dir}/${f}`, pngRGBA(px));
    return f;
  };
  const heads: Record<string, unknown>[] = [];
  for (const v of ['front', 'back'] as const) heads.push({ label: `BEFORE · ${v === 'front' ? 'in front' : 'from behind'}`, now: false, file: write(stillMv('before', MOVES3.rstand, 0.6, v)) });
  for (const v of WU_SIDES) heads.push({ label: `NOW · facing ${SIDE_NAMES[v]}`, now: true, file: write(stillMv('now', NOW.rstand, 0.6, v)) });
  const turn = (['rstand', 'rrun', 'shot'] as const).map((key) => ({
    title: key === 'rstand' ? 'Standing in his guard' : key === 'rrun' ? 'Running: a stride' : 'The Shot: the release, with its after-image',
    cells: WU_SIDES.map((v, k) => ({ k, name: SIDE_NAMES[v], file: write(stillMv('now', NOW[key], key === 'shot' ? RU_SHOT_HIT : key === 'rrun' ? 0.1 : 0.6, v)) })),
  }));
  writeFileSync(`${dir}/sheet2.json`, JSON.stringify({ heads, turn }, null, 1));
  console.log(`${n} pictures in ${dir}`);
}

// ---------------------------------------------------------------------------------------------
// THE FILM: running a circle through his eight facings and shooting each of the eight ways, at the game's size and three times as
// big; then before and now for every list, from in front and from behind; the Shot and the Volley again at half speed.

const onScreen = (X: number, Y: number): [number, number] => [(X - Y) * 32, (X + Y) * 16];
const SCENE_W = 560;
const SCENE_H = 420;
function laid(px: Px, at: [number, number]): Px {
  const out = new Px(SCENE_W, SCENE_H);
  const dx = Math.round(at[0]) - CANVAS3.ax;
  const dy = Math.round(at[1]) - CANVAS3.ay;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const si = (y * W + x) * 4;
    if (px.d[si + 3] === 0) continue;
    const X = x + dx;
    const Y = y + dy;
    if (X < 0 || Y < 0 || X >= SCENE_W || Y >= SCENE_H) continue;
    out.d.set(px.d.subarray(si, si + 4), (Y * SCENE_W + X) * 4);
  }
  return out;
}
const FILM: { caption: string; key: string; seconds: number; slow?: number }[] = [
  { caption: 'STANDING IN A FIGHT · now his legs true from every side, alive (two breaths, his weight shifting, a glance away)', key: 'rstand', seconds: 2.4 },
  { caption: 'RUNNING · now a hunter\'s run, light and low, the foot passing close to the floor', key: 'rrun', seconds: 1.7 },
  { caption: 'THE SHOT · a big held draw, the release in one frame with its after-image, a big follow-through', key: 'shot', seconds: 1.0 },
  { caption: 'THE VOLLEY · down on his knee, a held draw at the sky, the release in one frame', key: 'volley', seconds: 1.15 },
  { caption: 'HIS ROLL', key: 'roll', seconds: 0.75 },
  { caption: 'STRUCK FROM IN FRONT', key: 'rreel', seconds: 0.4 },
  { caption: 'STRUCK FROM BEHIND', key: 'rlurch', seconds: 0.4 },
  { caption: 'HIS FALL · thrown back, down on one knee, his bow laid down', key: 'rfall', seconds: 1.8 },
  { caption: 'LEFT STANDING · the squirrel', key: 'squirrel', seconds: 3.6 },
  { caption: 'LEFT STANDING · sighting along an arrow', key: 'sighting', seconds: 3.6 },
  { caption: 'IN TOWN, STANDING', key: 'rtown', seconds: 2.4 },
  { caption: 'IN TOWN, RUNNING', key: 'rtownrun', seconds: 1.2 },
  { caption: 'HIS CARD: UNSLINGING HIS BOW WHEN PICKED, INTO HIS GUARD', key: 'rdraw', seconds: 1.4 },
  { caption: 'THE SHOT AT HALF SPEED', key: 'shot', seconds: 0.9, slow: 2 },
  { caption: 'THE VOLLEY AT HALF SPEED', key: 'volley', seconds: 1.07, slow: 2 },
];
function film(dir: string): void {
  mkdirSync(dir, { recursive: true });
  let n = 0;
  const write = (px: Px, pre: string): string => {
    const f = `${pre}${String(n++).padStart(4, '0')}.png`;
    writeFileSync(`${dir}/${f}`, pngRGBA(px));
    return f;
  };
  const scenes: Record<string, unknown>[] = [];
  const centre: [number, number] = [SCENE_W / 2, SCENE_H / 2 + 50];
  // RUNNING ROUND A CIRCLE through his eight facings, at the game's pace
  {
    const seconds = 5.4;
    const r = (4.6 * seconds) / (2 * Math.PI);
    const m = NOW.rrun;
    const period = (m.stride as number) / 4.6;
    const rig = new Rig();
    for (let i = 0; i < Math.round(seconds * 30); i++) {
      const t = i / 30;
      const ph = (t / seconds) * 2 * Math.PI;
      const fx = -Math.sin(ph);
      const fy = Math.cos(ph);
      const side = wuFacing(fx, fy);
      const [sx, sy] = onScreen(r * Math.cos(ph), r * Math.sin(ph));
      const at: [number, number] = [centre[0] + sx, centre[1] + sy];
      const px = rig.frame(paintRu(m, Math.floor((t % period) * 60 + 1e-6) / 60, side), 1 / 30, facingOf(side), [at[0] / 2, at[1] / 2]);
      scenes.push({ caption: 'NOW: RUNNING ROUND A CIRCLE, THROUGH HIS EIGHT FACINGS, EACH TRULY PAINTED', scene: write(laid(px, at), 'c'), cell: write(px, 'd'), at, facing: SIDE_NAMES[side], path: { r } });
    }
  }
  // SHOOTING EACH OF THE EIGHT WAYS
  for (const [k, v] of WU_SIDES.entries()) {
    const rig = new Rig();
    const long = 27 / 30;
    for (let i = 0; i < Math.round(long * 30); i++) {
      const px = rig.frame(paintRu(NOW.shot, Math.min(RU_SHOT_LONG, i / 30), v), 1 / 30, facingOf(v), [centre[0] / 2, centre[1] / 2]);
      scenes.push({ caption: 'NOW: THE SHOT, EACH OF THE EIGHT WAYS', scene: write(laid(px, centre), 'c'), cell: write(px, 'd'), at: centre, facing: SIDE_NAMES[v], way: [0, 1, 2, 3, 4, 5, 6, 7][k] });
    }
  }
  // BEFORE AND NOW, every list, in front and from behind
  const frames: Record<string, unknown>[] = [];
  for (const p of FILM) {
    const slow = p.slow ?? 1;
    const rigs = [new Rig(), new Rig(), new Rig(), new Rig()];
    const order: ['before' | 'now', RuSide][] = [['before', 'front'], ['now', 'front'], ['before', 'back'], ['now', 'back']];
    const ms = order.map(([who]) => (who === 'before' ? MOVES3 : NOW)[p.key]);
    const runs = p.key === 'rrun' || p.key === 'rtownrun';
    for (let i = 0; i < Math.round(p.seconds * slow * 30); i++) {
      const strip = new Px(W * 4, H);
      order.forEach(([who, v], j) => {
        const m = ms[j];
        const end = m.motion.keys[m.motion.keys.length - 1].at;
        const fps = who === 'before' && (p.key === 'rstand' || p.key === 'rtown') ? 10 : who === 'before' && (p.key === 'squirrel' || p.key === 'sighting') ? 20 : runs ? 60 : 30;
        let u = i / 30 / slow;
        if (m.motion.loop !== undefined) u %= end;
        u = Math.min(end, Math.floor(u * fps + 1e-6) / fps);
        const px = rigs[j].frame(paintMv(who, m, u, v), 1 / 30 / slow, 1);
        for (let y = 0; y < H; y++) strip.d.set(px.d.subarray(y * W * 4, (y + 1) * W * 4), (y * strip.w + j * W) * 4);
      });
      frames.push({ caption: p.caption, file: write(strip, 'f') });
    }
  }
  writeFileSync(`${dir}/film.json`, JSON.stringify({ scenes, frames }, null, 0));
  console.log(`${scenes.length} + ${frames.length} frames (${((scenes.length + frames.length) / 30).toFixed(1)} s)`);
}

const [mode, dir] = process.argv.slice(2);
if (mode === 'look') look(dir);
else if (mode === 'sheet') sheet(dir);
else if (mode === 'sheet2') sheet2(dir);
else if (mode === 'film') film(dir);
else console.log('usage: ranger_up_pics.ts look|sheet|sheet2|film <dir>');
