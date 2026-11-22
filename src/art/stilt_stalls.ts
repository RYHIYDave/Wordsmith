// THE STILT TOWN'S OWN THINGS: its stalls, its reeds, the posts round the portal's round (the queue chat, 14 Nov 2026). Each town
// has its own vendors (his words of 14 Nov 2026: “We want different looking vendors for different towns”; his pick: new looks that
// fit the town on the same moves, their stalls to match, the wordsmith the same in every town). The Stilt Town's, folk of the fen:
//   THE FORGE      of daubed clay on a bed of flat stones (so as not to burn the deck), cracked, straw in it; its mouth to the
//                  anvil with the fire in it; a tapering clay chimney, sooted; bundles of peat beside it
//   THE ANVIL      on a barrel
//   THE RACK       of poles lashed with rope: an eel-fork, a billhook, a club, a round shield of wicker
//   THE TROUGH     a barrel of water, a blade cooling in it
//   THE HUT        the herbalist's: a back of woven wattle, posts of rough wood, a roof of reed thatch, bundles of herbs hung
//                  from its eave, a lantern
//   THE TABLE      planks on trestles: jars (leeches in one), bundles of herbs, toadstools, bottles of murky green, and a cage
//                  with a wisp in it, the friend's cyan
//   THE MAT        woven of reeds, on the deck where the herbalist stands
//   THE SHACK      wattle and thatch: the stranger leans on its side
//   THE REEDS      sedge and cattails standing out of the water by the decks
//   THE POSTS      round the portal's round: old mooring posts, rope between them
// Each stands where the town's own does and is the same size (art/town.ts), so that the people stand at them as at the town's.

import { Px } from '../engine/px';
import type { Sprite } from '../engine/px';
import { Iso } from './isokit';
import type { SideShader } from './isokit';
import { GRAIN, ball, compose, hash, limb } from './kit';
import type { Ramp } from './kit';
import { COAL, EMBER, tongue } from './props';

const WOOD: Ramp = ['#140e0a', '#261a12', '#3a2a1c', '#4e3a28', '#644c34'];
const CLAY: Ramp = ['#2a1a12', '#4a2e1e', '#6a4430', '#8a5c40', '#a87a56'];
const STONE_F = ['#1c1c1a', '#2c2c28', '#3e3e38', '#52524a', '#68685e'];
const IRON_F: Ramp = ['#14141a', '#2a2a32', '#464650', '#6a6a76', '#9a9aa6'];
const THATCH: Ramp = ['#2a2214', '#42361e', '#5c4c2a', '#7a6838', '#968248'];
const WATTLE: Ramp = ['#1e160e', '#342818', '#4a3a24', '#604c30', '#76603e'];
const HERB: Ramp = ['#1e2416', '#2e3a20', '#4a5a30', '#6a7a42', '#8a9a58'];
const MURK: Ramp = ['#141c14', '#22301e', '#34462a', '#4a6038', '#6a8450'];
const ROPE: Ramp = ['#2a2014', '#4a3a24', '#6e5a38', '#94804e', '#b8a46a'];
const SEDGE = ['#2e3620', '#3a4228', '#4e5832', '#666e3e', '#7e8450'];
const CATTAIL = ['#2a2018', '#3a2c22', '#4e3c2c', '#5e4a38'];
const CYAN: Ramp = ['#0c6a80', '#18a0b4', '#22d0e0', '#b8fff8', '#ffffff'];
const INKY = '#0c0e0c';

const boxOf = (r: Ramp): { top: () => string; left: SideShader; right: SideShader } => ({
  top: () => r[3],
  left: (_u, v, _w, h) => (v === 0 ? r[4] : v >= h - 1 ? r[1] : r[2]),
  right: (_u, v, _w, h) => (v === 0 ? r[3] : v >= h - 1 ? r[0] : r[1]),
});
/** Daubed clay on a side: smooth, cracked, a straw in it here and there, lit or in shade. */
const daub = (lo: number, seed: number): SideShader => (u, v, _w, h) => {
  const crack = Math.abs(((u * 0.7 + v * 0.3 + hash(Math.floor(v / 9), 0, seed) * 9) % 13) - 6.5) < 0.4 && hash(Math.floor(u / 5), Math.floor(v / 6), seed + 1) > 0.5;
  if (crack) return CLAY[Math.max(0, lo - 1)];
  if (hash(u, v, seed + 2) > 0.97) return THATCH[3];
  if (v === 0) return CLAY[Math.min(4, lo + 1)];
  if (v >= h - 2) return CLAY[Math.max(0, lo - 1)];
  return CLAY[lo + (hash(Math.floor(u / 4), Math.floor(v / 4), seed + 3) > 0.8 ? 1 : 0)];
};
/** Wattle on a side: rods woven in and out of upright stakes. */
const wattle = (lo: number): SideShader => (u, v) => {
  if (u % 10 === 0) return WATTLE[Math.max(0, lo - 1)];
  const row = Math.floor(v / 3);
  const over = (Math.floor(u / 10) + row) % 2 === 0;
  if (v % 3 === 0) return WATTLE[Math.max(0, lo - 1)];
  return WATTLE[Math.min(4, lo + (over ? 1 : 0))];
};

// ---------------------------------------------------------------------------------------------------------------------------
// THE FORGE OF CLAY. 96 x 160; its tile's middle at (48, 132). Four frames: its fire.

const FIRE: ReadonlyArray<ReadonlyArray<readonly [number, number, number, number]>> = [
  [[0, 12, 4.4, 2], [-5, 8, 3, -1], [5, 7, 2.4, 1]],
  [[1, 11, 4.2, -2], [5, 9, 2.8, 2], [-5, 6, 2.2, -1]],
  [[0, 13, 4.4, -3], [-4, 8, 2.6, -2], [5, 8, 2.4, 1]],
  [[-1, 10, 4.2, 1], [-5, 9, 2.8, -1], [4, 7, 2.2, 2]],
];

export function fenForge(frame: number): Sprite {
  const W = 96;
  const H = 160;
  const ox = 48;
  const oy = 132;
  const base = new Px(W, H);
  const body = new Px(W, H);
  const fire = new Px(W, H);
  const stack = new Px(W, H);
  const over = new Px(W, H);
  const ib = new Iso(base, ox, oy);
  // its bed of flat stones on the deck
  ib.box(-0.5, -0.5, 0.5, 0.5, 0, 4, { top: (u, v) => STONE_F[hash(Math.round(u * 5), Math.round(v * 5), 1) > 0.5 ? 3 : 2], left: (_u, v) => (v === 0 ? STONE_F[4] : STONE_F[2]), right: (_u, v) => (v === 0 ? STONE_F[3] : STONE_F[1]) });
  // the body of clay, its mouth in the side that looks down the screen to the left
  const iso = new Iso(body, ox, oy);
  const A = 0.4;
  const Z0 = 4;
  const Z1 = 36;
  const mouth = new Set<number>();
  let bed: [number, number] = [ox, oy];
  const lit = daub(2, 11);
  iso.box(-A, -A, A, A, Z0, Z1, {
    top: (u, v) => (u + v < 0.4 ? CLAY[4] : CLAY[3]),
    left: (u, v, w, h, px, py) => {
      const mx = Math.abs(u + 0.5 - w / 2);
      const SPRING = 10;
      const inM = v > SPRING ? mx < 8 && v < h - 4 : (mx ** 2 + (v - SPRING) ** 2 < 64 && v > 2);
      if (inM && v < h - 4) {
        mouth.add(py * W + px);
        if (Math.round(u - w / 2) === 0 && v === h - 6) bed = [px, py];
        if (v > h - 9) {
          const n = hash(u, frame, 3 + v);
          return n < 0.3 ? EMBER[2] : n < 0.5 ? EMBER[1] : COAL[3];
        }
        return COAL[0];
      }
      if (mx < 10 && v > 0 && v < h - 2 && (mx ** 2 + (v - 10) ** 2 < 100 || v > 10)) return EMBER[0];
      return lit(u, v, w, h, px, py);
    },
    right: daub(1, 12),
  });
  // the chimney: clay, tapering up, sooted toward its top
  const ic = new Iso(stack, ox, oy);
  const D = 0.14;
  const Z2 = 54;
  ic.slopeLeft(-A + 0.05, A - 0.05, A - 0.05, Z1, -D, D, D, Z2, (t, k) => (k < 0.06 ? CLAY[4] : t > 0.8 ? CLAY[1] : CLAY[3]));
  ic.slopeRight(A - 0.05, -A + 0.05, A - 0.05, Z1, D, -D, D, Z2, (t) => (t > 0.8 ? CLAY[0] : CLAY[1]));
  ic.box(-D, -D, D, D, Z2, Z2 + 34, {
    top: () => INKY,
    left: (u, v, _w, h) => (v < 8 ? COAL[0] : v < 12 && hash(u, v, 13) > 0.5 ? COAL[0] : v >= h - 1 ? CLAY[1] : CLAY[3]),
    right: (_u, v) => (v < 8 ? COAL[0] : CLAY[1]),
  });
  // the fire, nothing of it outside the mouth
  for (const [dx, h, w, lean] of FIRE[frame % FIRE.length]) tongue(fire, bed[0] + dx, bed[1] - 1 + Math.round(dx / 2), h, w, lean, EMBER);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (fire.has(x, y) && !mouth.has(y * W + x)) fire.erase(x, y);
  // bundles of peat stacked beside it
  const P = boxOf(['#140c08', '#24160e', '#3a2618', '#523622', '#6a4a30']);
  for (const [x, y, z] of [[0.55, 0.0, 0], [0.55, 0.24, 0], [0.55, 0.12, 6]] as const) ib.box(x, y - 0.1, x + 0.2, y + 0.1, z, z + 6, P);
  // smoke
  const [sx, sy] = ic.at(0, 0, Z2 + 34);
  for (let i = 0; i < 3; i++) over.set(Math.round(sx) + ((frame + i) % 3) - 1, Math.round(sy) - 4 - i * 5, i ? '#3e463e' : '#4e564e');
  const s = compose(null, [base, body, fire, stack], over).sprite(ox, oy, GRAIN);
  s.lights = [{ x: bed[0] / GRAIN, y: (bed[1] - 7) / GRAIN, r: 17 + (frame % 2), color: EMBER[2], a: 0.5 }];
  return s;
}

/** A barrel: staves, two hoops, its top (water, or a lid). Painted round. */
function barrel(p: Px, cx: number, foot: number, r: number, tall: number, water: boolean): void {
  for (let y = foot - tall; y < foot; y++) {
    const bulge = 1 + 0.08 * Math.sin(((y - (foot - tall)) / tall) * Math.PI);
    const rr = r * bulge;
    for (let x = Math.floor(cx - rr); x <= Math.ceil(cx + rr); x++) {
      const u = (x + 0.5 - cx) / rr;
      if (Math.abs(u) > 1) continue;
      const k = 0.55 - 0.45 * u;
      const stave = Math.floor((Math.asin(Math.max(-1, Math.min(1, u))) + 2) * 4) % 2 === 0;
      let c = WOOD[Math.max(1, Math.min(4, Math.round(1 + k * 3) + (stave ? 0 : -1)))];
      const yy = y - (foot - tall);
      if (Math.abs(yy - tall * 0.22) < 1 || Math.abs(yy - tall * 0.78) < 1) c = IRON_F[Math.max(1, Math.min(4, Math.round(1 + k * 3)))];
      p.set(x, y, c);
    }
  }
  p.ellipse(cx, foot - tall, r, r * 0.32, WOOD[3]);
  if (water) {
    p.ellipse(cx, foot - tall + 0.4, r - 1.6, r * 0.32 - 0.8, '#0c1410');
    p.hline(Math.round(cx - r * 0.4), Math.round(foot - tall), 3, '#2b3d32');
  } else p.ellipse(cx, foot - tall, r - 1.6, r * 0.32 - 0.8, WOOD[2]);
}

/** THE ANVIL on a barrel. 56 x 64; at (28, 50). */
export function fenAnvil(): Sprite {
  const W = 56;
  const H = 64;
  const ox = 28;
  const oy = 50;
  const wood = new Px(W, H);
  const iron = new Px(W, H);
  const TOP = 16;
  barrel(wood, ox, oy, 11, TOP, false);
  const iso = new Iso(iron, ox, oy);
  const IB = boxOf(IRON_F);
  const L0 = -0.3;
  const L1 = 0.3;
  const HW = 0.1;
  const FACE = TOP + 16;
  iso.box(-0.24, -0.12, 0.24, 0.12, TOP, TOP + 3, IB);
  iso.box(-0.12, -0.075, 0.12, 0.075, TOP + 3, TOP + 9, IB);
  iso.box(L0, -HW, L1, HW, TOP + 9, FACE, { top: () => IRON_F[4], left: IB.left, right: IB.right });
  const pt = (x: number, y: number, z: number): [number, number] => {
    const [a, b] = iso.at(x, y, z);
    return [Math.round(a), Math.round(b)];
  };
  const tip = pt(L0 - 0.3, 0, FACE - 1);
  iron.poly([pt(L0, HW, FACE), tip, pt(L0, HW, TOP + 10)], IRON_F[2]);
  iron.poly([pt(L0, -HW, FACE), tip, pt(L0, HW, FACE)], IRON_F[3]);
  const e0 = pt(L0, HW, FACE);
  const e1 = pt(L1, HW, FACE);
  iron.line(e0[0], e0[1], e1[0] - 1, e1[1] - 1, '#ffffff');
  return compose(null, [wood, iron], null).sprite(ox, oy, GRAIN);
}

/** THE TROUGH: a barrel of water, a blade cooling in it. 40 x 44; at (20, 36). */
export function fenTrough(): Sprite {
  const W = 40;
  const H = 44;
  const cx = 20;
  const foot = 36;
  const p = new Px(W, H);
  const over = new Px(W, H);
  barrel(p, cx, foot, 10, 18, true);
  over.rect(cx + 3, foot - 30, 2, 12, IRON_F[2]).vline(cx + 3, foot - 30, 12, IRON_F[4]);
  over.rect(cx + 2, foot - 32, 4, 3, ROPE[2]);
  return compose(null, [p], over).sprite(cx, foot, GRAIN);
}

/** THE RACK, of poles lashed with rope. 62 x 92; at (22, 80). */
export function fenRack(): Sprite {
  const W = 62;
  const H = 92;
  const ox = 22;
  const oy = 80;
  const frame = new Px(W, H);
  const arms = new Px(W, H);
  const front = new Px(W, H);
  const iso = new Iso(frame, ox, oy);
  const Y = -0.34;
  const X0 = -0.72;
  const X1 = 0.72;
  const TALL = 58;
  const W0 = boxOf(WOOD);
  // (rough poles: the posts not quite straight, the rails lashed on with rope at each crossing)
  for (const z of [14, 46]) iso.box(X0 - 0.06, Y - 0.025, X1 + 0.06, Y + 0.025, z, z + 3, W0);
  for (const x of [X0, X1 - 0.07]) iso.box(x, Y - 0.035, x + 0.07, Y + 0.035, 0, TALL + (x < 0 ? 2 : -2), W0);
  for (const x of [X0 + 0.035, X1 - 0.035]) for (const z of [15, 47]) {
    const [a, b] = iso.at(x, Y + 0.04, z);
    frame.rect(Math.round(a) - 2, Math.round(b) - 2, 4, 4, ROPE[2]).set(Math.round(a) - 2, Math.round(b) - 2, ROPE[3]);
  }
  const FW = 46;
  const FH = 62;
  const flat = new Px(FW, FH);
  const boss = new Px(FW, FH);
  // an eel-fork: a long shaft, three barbed tines
  for (let y = 0; y < 50; y++) flat.set(6, 10 + y, WOOD[y % 5 === 0 ? 2 : 3]);
  for (const dx of [-3, 0, 3]) flat.vline(6 + dx, 2, 8, IRON_F[3]).set(6 + dx + (dx < 0 ? 1 : dx > 0 ? -1 : 1), 3, IRON_F[2]);
  flat.hline(3, 9, 7, IRON_F[2]);
  // a billhook, its blade hooked forward
  for (let y = 0; y < 30; y++) flat.set(16, 22 + y, WOOD[(y + 1) % 6 === 0 ? 2 : 3]);
  flat.poly([[16, 8], [20, 9], [22, 14], [21, 20], [17, 22], [16, 22]], IRON_F[2]);
  flat.line(20, 9, 22, 14, IRON_F[4]);
  flat.set(23, 13, IRON_F[3]).set(23, 12, IRON_F[2]);
  // a club, knotted
  for (let y = 0; y < 26; y++) {
    const hw = y < 10 ? 3 : 1.5;
    for (let i = -Math.ceil(hw); i < Math.ceil(hw); i++) flat.set(30 + i, 20 + y, i < 0 ? WOOD[4] : WOOD[2]);
  }
  flat.set(28, 23, WOOD[1]).set(31, 26, WOOD[1]);
  // a round shield of wicker, its rim bound
  ball(boss, 22, 44, 8, 9.5, WATTLE);
  for (let y = 34; y <= 54; y++) for (let x = 13; x <= 31; x++) {
    if (!boss.has(x, y)) continue;
    const d = ((x + 0.5 - 22) / 8) ** 2 + ((y + 0.5 - 44) / 9.5) ** 2;
    const a = Math.atan2(y - 44, x - 22);
    if (d > 0.78) boss.set(x, y, x < 22 ? ROPE[3] : ROPE[2]);
    else if (Math.floor((a + Math.PI) * 4 + Math.sqrt(d) * 6) % 2 === 0) boss.set(x, y, WATTLE[x < 22 ? 3 : 2]);
  }
  ball(boss, 22, 44, 2.2, 2.6, WOOD);
  const hang = (onto: Px, what: Px): void => {
    new Iso(onto, ox, oy).left(X0 + 0.02, X0 + 0.02 + FW / 32, Y + 0.05, 0, FH, (u, v) => what.get(u, v));
  };
  hang(arms, flat);
  hang(front, boss);
  return compose(null, [frame, arms, front], null).sprite(ox, oy, GRAIN);
}

// ---------------------------------------------------------------------------------------------------------------------------
// THE HERBALIST'S HUT. Where the town's tent stands and as big: 168 x 208; its tile's middle at (96, 164).

const TENT_A = 1.4;
const TENT_BACK = -0.3;
const TENT_EAVE = 1.15;
const TENT_HIGH = 112;
const TENT_LOW = 92;
const TENT_OUT = 0.18;
const TENT_DROP = 7;

export function fenHut(): Sprite {
  const W = 168;
  const H = 208;
  const ox = 96;
  const oy = 164;
  const posts = new Px(W, H);
  const wall = new Px(W, H);
  const front = new Px(W, H);
  const roof = new Px(W, H);
  const edge = new Px(W, H);
  const over = new Px(W, H);
  const W0 = boxOf(WOOD);
  const ip = new Iso(posts, ox, oy);
  for (const x of [-TENT_A, TENT_A - 0.09]) ip.box(x, TENT_BACK - 0.045, x + 0.09, TENT_BACK + 0.045, 0, TENT_HIGH - 4, W0);
  new Iso(wall, ox, oy).left(-TENT_A + 0.09, TENT_A - 0.09, TENT_BACK, 0, TENT_HIGH - 6, wattle(2));
  const ifr = new Iso(front, ox, oy);
  for (const x of [-TENT_A, TENT_A - 0.09]) ifr.box(x, TENT_EAVE - 0.11, x + 0.09, TENT_EAVE - 0.02, 0, TENT_LOW - 2, W0);
  // the roof: reed thatch, its strands running down the slope, thick
  const R = TENT_A + TENT_OUT;
  const ir = new Iso(roof, ox, oy);
  const lowY = TENT_EAVE + TENT_OUT;
  const highY = TENT_BACK - TENT_OUT;
  ir.quad(ir.at(-R, lowY, TENT_LOW), ir.at(R, lowY, TENT_LOW), ir.at(R, highY, TENT_HIGH), ir.at(-R, highY, TENT_HIGH), (t, u) => {
    const strand = Math.floor(u * 90);
    const n = hash(strand, Math.floor(t * 6), 31);
    // (courses of thatch laid one over the next: a dark line under each)
    if ((t * 6) % 1 < 0.08) return THATCH[0];
    if (t > 0.94) return THATCH[4];
    return THATCH[n > 0.7 ? 3 : n < 0.2 ? 1 : 2];
  });
  // its edge along the eave: the thatch's ragged ends hanging; and down its side
  const ie = new Iso(edge, ox, oy);
  ie.left(-R, R, lowY, TENT_LOW - TENT_DROP, TENT_LOW, (u, v, _w, h) => {
    if (v >= h - 4 && hash(u, 0, 32) < (v - (h - 5)) / 5) return null;
    return u % 2 === 0 ? THATCH[2] : THATCH[1];
  });
  ie.quad(ie.at(R, lowY, TENT_LOW - TENT_DROP), ie.at(R, highY, TENT_HIGH - TENT_DROP), ie.at(R, highY, TENT_HIGH), ie.at(R, lowY, TENT_LOW), (t, u) => (t < 0.3 && hash(Math.round(u * 50), 1, 33) < 0.5 ? null : THATCH[1]));
  // bundles of herbs hung from the eave
  for (const [k, long] of [[-1.05, 9], [-0.62, 12], [0.4, 10], [0.86, 13], [1.18, 8]] as const) {
    const [a, b] = ie.at(k, lowY - 0.03, TENT_LOW - TENT_DROP + 1);
    const x = Math.round(a);
    const y = Math.round(b);
    over.vline(x, y, 3, ROPE[2]);
    for (let j = 0; j < long; j++) {
      const w = j < 2 ? 1 : 2 + Math.floor(j / 4);
      over.hline(x - Math.floor(w / 2), y + 3 + j, w, HERB[j % 3 === 0 ? 2 : 3]);
    }
  }
  // a lantern under the eave
  const [la, lb] = ie.at(-0.2, lowY - 0.06, TENT_LOW - TENT_DROP - 1);
  const lx = Math.round(la);
  const ly = Math.round(lb);
  over.vline(lx, ly, 5, IRON_F[3]);
  over.rect(lx - 2, ly + 5, 5, 6, EMBER[2]).rect(lx - 1, ly + 6, 3, 4, EMBER[4]);
  over.hline(lx - 3, ly + 4, 7, IRON_F[2]).hline(lx - 3, ly + 11, 7, IRON_F[2]);
  const s = compose(null, [posts, wall, front, roof, edge], over).sprite(ox, oy, GRAIN);
  s.lights = [{ x: lx / GRAIN, y: (ly + 8) / GRAIN, r: 13, color: EMBER[2], a: 0.4 }];
  return s;
}

/** THE TABLE: planks on trestles, the herbalist's wares on it. 136 x 108; its tile's middle at (54, 68). */
export function fenTable(): Sprite {
  const W = 136;
  const H = 108;
  const ox = 54;
  const oy = 68;
  const table = new Px(W, H);
  const wares = new Px(W, H);
  const over = new Px(W, H);
  const TA = 1.25;
  const TB0 = -0.25;
  const TB1 = 0.3;
  const TOP = 28;
  const it = new Iso(table, ox, oy);
  const W0 = boxOf(WOOD);
  // two trestles, and the planks across them
  for (const x0 of [-1.0, 0.82]) {
    it.box(x0, TB0 + 0.05, x0 + 0.08, TB0 + 0.12, 0, TOP - 3, W0);
    it.box(x0, TB1 - 0.12, x0 + 0.08, TB1 - 0.05, 0, TOP - 3, W0);
    it.box(x0, TB0 + 0.05, x0 + 0.08, TB1 - 0.05, TOP - 8, TOP - 5, W0);
  }
  it.box(-TA, TB0, TA, TB1, TOP - 3, TOP, {
    top: (u, v) => (Math.floor(v * 5) !== Math.floor((v - 0.03) * 5) ? WOOD[1] : hash(Math.round(u * 30), Math.floor(v * 5), 41) > 0.85 ? WOOD[4] : WOOD[3]),
    left: (_u, v) => (v === 0 ? WOOD[4] : WOOD[2]),
    right: () => WOOD[1],
  });
  const on = (x: number, y = 0.02): [number, number] => {
    const [a, b] = it.at(x, y, TOP);
    return [Math.round(a), Math.round(b)];
  };
  // jars: leeches in one
  for (const [x, y, leech] of [[-1.05, 0.0, true], [-0.88, 0.14, false], [-0.74, -0.06, false]] as const) {
    const [a, b] = on(x, y);
    ball(wares, a + 0.5, b - 5, 4, 5, MURK);
    wares.rect(a - 2, b - 11, 5, 2, ROPE[3]);
    if (leech) for (const [dx, dy] of [[-1, -5], [1, -3], [0, -7]] as const) wares.set(a + dx, b + dy, '#0e0a0a');
    wares.set(a - 2, b - 7, MURK[4]);
  }
  // bundles of herbs, tied, lying along it
  for (const [k, y] of [[-0.42, 0.16], [-0.12, 0.2]] as const) {
    const a = on(k, y);
    const b = on(k + 0.24, y);
    limb(wares, a[0], a[1] - 2, b[0], b[1] - 2, 2, 1, HERB);
    wares.vline(Math.round((a[0] + b[0]) / 2), Math.round((a[1] + b[1]) / 2) - 4, 4, ROPE[3]);
  }
  // toadstools in a little heap
  for (const [x, y] of [[0.2, -0.04], [0.28, 0.08], [0.34, -0.1]] as const) {
    const [a, b] = on(x, y);
    wares.vline(a, b - 3, 3, '#c8bca0');
    wares.hline(a - 2, b - 4, 5, '#8a2a20').hline(a - 1, b - 5, 3, '#a8402e').set(a, b - 4, '#e0d4b8');
  }
  // bottles of murky green
  for (const [x, y] of [[0.56, 0.0], [0.66, 0.14]] as const) {
    const [a, b] = on(x, y);
    wares.rect(a - 1, b - 12, 3, 4, MURK[2]);
    ball(wares, a + 0.5, b - 4, 3, 4, MURK);
    wares.set(a - 1, b - 6, MURK[4]);
  }
  // a cage with a wisp in it: the friend's cyan
  {
    const [a, b] = on(1.0);
    const cy = b - 10;
    for (let k = -4; k <= 4; k += 2) wares.vline(a + k, cy - 7, 13, IRON_F[k < 0 ? 3 : 2]);
    wares.hline(a - 4, cy - 7, 9, IRON_F[3]).hline(a - 4, cy + 6, 9, IRON_F[2]);
    wares.vline(a, cy - 10, 3, IRON_F[3]);
    over.rect(a - 1, cy - 2, 3, 3, CYAN[3]).set(a, cy - 1, CYAN[4]).set(a - 2, cy - 1, CYAN[2]).set(a + 2, cy, CYAN[2]).set(a, cy + 2, CYAN[1]);
  }
  const s = compose(null, [table, wares], over).sprite(ox, oy, GRAIN);
  const [ca, cb] = on(1.0);
  s.lights = [{ x: ca / GRAIN, y: (cb - 10) / GRAIN, r: 11, color: CYAN[2], a: 0.4 }];
  return s;
}

/** THE MAT: woven of reeds, flat on the deck. 150 x 76; anchored at its middle. */
export function fenMat(): Sprite {
  const W = 150;
  const H = 76;
  const p = new Px(W, H);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const px = (x + 0.5 - W / 2) / (W / 2);
      const py = (y + 0.5 - H / 2) / (H / 2);
      const u = px + py;
      const v = py - px;
      if (Math.max(Math.abs(u), Math.abs(v)) > 0.9) continue;
      // (woven: the reeds over and under each other in squares, a frayed edge)
      const edge = Math.max(Math.abs(u), Math.abs(v)) > 0.84;
      const a = Math.floor((u + 2) * 10);
      const b = Math.floor((v + 2) * 10);
      const over = (a + b) % 2 === 0;
      p.set(x, y, edge ? THATCH[1] : over ? THATCH[3] : THATCH[2]);
    }
  return p.sprite(W / 2, H / 2, GRAIN);
}

/** THE SHACK: wattle and thatch, the stranger leans on its side. Anchored at the middle of its foot. 120 x 168. */
export function fenShack(): Sprite {
  const W = 120;
  const H = 168;
  const ox = 60;
  const oy = 136;
  const hut = new Px(W, H);
  const roofP = new Px(W, H);
  const iso = new Iso(hut, ox, oy);
  const X0 = -0.6;
  const X1 = 0.0;
  const Y0 = -0.72;
  const Y1 = 0.72;
  const WALL = 50;
  iso.box(X0, Y0, X1, Y1, 0, WALL, { top: () => WATTLE[1], left: wattle(2), right: wattle(1) });
  // its corner posts
  for (const [x, y] of [[X1, Y1], [X1, Y0], [X0, Y1]] as const) iso.box(x - 0.05, y - 0.05, x + 0.03, y + 0.03, 0, WALL + 2, boxOf(WOOD));
  // its roof: thatch, a low pitch along its length, ragged at its eaves
  const ir = new Iso(roofP, ox, oy);
  const ROOF = 18;
  const Rx0 = X0 - 0.12;
  const Rx1 = X1 + 0.12;
  const midX = (Rx0 + Rx1) / 2;
  ir.slopeRight(Rx1, Y0 - 0.1, Y1 + 0.1, WALL - 3, midX, Y0 - 0.1, Y1 + 0.1, WALL + ROOF, (t, k) => {
    if (t < 0.1 && hash(Math.round(k * 80), 0, 51) < 0.5) return null;
    if ((t * 4) % 1 < 0.1) return THATCH[0];
    return THATCH[hash(Math.round(k * 90), Math.floor(t * 4), 52) > 0.7 ? 2 : 1];
  });
  ir.quad(ir.at(Rx0, Y1 + 0.1, WALL - 3), ir.at(Rx1, Y1 + 0.1, WALL - 3), ir.at(midX, Y1 + 0.1, WALL + ROOF), ir.at(midX, Y1 + 0.1, WALL + ROOF), (t, k) => (t < 0.08 && Math.round(k * 40) % 2 === 0 ? null : THATCH[3]));
  return compose(null, [hut, roofP], null).sprite(ox, oy, GRAIN);
}

/** REEDS: a clump of sedge and a cattail or two, standing out of the water. 32 x 48; at (16, 42). Three of them. */
export function fenReeds(v: number): Sprite {
  const W = 32;
  const H = 48;
  const ox = 16;
  const oy = 42;
  const p = new Px(W, H);
  const n = 6 + v * 2;
  for (let i = 0; i < n; i++) {
    const x0 = ox - 6 + Math.round(hash(i, v, 61) * 12);
    const tall = 12 + Math.round(hash(i, v, 62) * (16 + v * 5));
    const lean = (hash(i, v, 63) - 0.5) * 0.5;
    for (let j = 0; j < tall; j++) p.set(Math.round(x0 + lean * j), oy - j, SEDGE[j > tall * 0.7 ? 4 : j > tall * 0.35 ? 3 : 2]);
    // (a cattail's head on the tallest)
    if (i % 3 === 0 && tall > 18) {
      const hx = Math.round(x0 + lean * tall);
      p.rect(hx - 1, oy - tall - 1, 2, 5, CATTAIL[2]).set(hx - 1, oy - tall - 1, CATTAIL[3]).set(hx, oy - tall - 3, SEDGE[3]);
    }
  }
  // (their ring in the water)
  p.hline(ox - 7, oy, 15, '#23332a');
  return compose(null, [p], null).sprite(ox, oy, GRAIN);
}

/** A MOORING POST: old wood, its top worn round, a rope round it. The portal's round is ringed with six. 24 x 48; at (12, 40). */
export function fenPost(v: number): Sprite {
  const W = 24;
  const H = 48;
  const ox = 12;
  const oy = 40;
  const p = new Px(W, H);
  const tall = 16 + (v % 3) * 3;
  const iso = new Iso(p, ox, oy);
  iso.box(-0.08, -0.08, 0.08, 0.08, 0, tall, { top: () => WOOD[3], left: (_u, vv, _w, h) => (vv === 0 ? WOOD[4] : vv >= h - 2 ? '#2e3a22' : WOOD[2]), right: (_u, vv, _w, h) => (vv >= h - 2 ? '#222b1b' : WOOD[1]) });
  const [a, b] = iso.at(0.08, 0.08, tall - 6);
  p.hline(Math.round(a) - 5, Math.round(b), 8, ROPE[3]).hline(Math.round(a) - 5, Math.round(b) + 1, 8, ROPE[1]);
  return compose(null, [p], null).sprite(ox, oy, GRAIN);
}

/** A LANTERN ON A POLE, the fen's: a rough pole, an arm off its top, an iron lantern hung from it, alight. 40 x 112; at (14, 100).
 * Four frames: its flame. */
export function fenLantern(frame: number): Sprite {
  const W = 40;
  const H = 112;
  const ox = 14;
  const oy = 100;
  const p = new Px(W, H);
  const over = new Px(W, H);
  const iso = new Iso(p, ox, oy);
  iso.box(-0.05, -0.05, 0.05, 0.05, 0, 76, boxOf(WOOD));
  // (its arm, out toward the right, a brace under it)
  const [a0, b0] = iso.at(0, 0, 74);
  p.hline(Math.round(a0), Math.round(b0) - 1, 14, WOOD[3]).hline(Math.round(a0), Math.round(b0), 14, WOOD[1]);
  p.line(Math.round(a0) + 1, Math.round(b0) + 8, Math.round(a0) + 8, Math.round(b0) + 1, WOOD[2]);
  // the lantern: a chain, a cap, a cage of iron round a flame
  const lx = Math.round(a0) + 12;
  const ly = Math.round(b0) + 1;
  p.vline(lx, ly, 4, IRON_F[3]);
  p.hline(lx - 3, ly + 4, 7, IRON_F[3]).hline(lx - 2, ly + 3, 5, IRON_F[2]);
  p.rect(lx - 3, ly + 5, 7, 8, EMBER[1]);
  for (const dx of [-3, 0, 3]) p.vline(lx + dx, ly + 5, 8, IRON_F[2]);
  p.hline(lx - 3, ly + 13, 7, IRON_F[2]);
  const f = frame % 4;
  over.set(lx - 1, ly + 8 - (f % 2), EMBER[3]).set(lx + 1, ly + 9, EMBER[3]).set(lx - 1, ly + 10, EMBER[4]).set(lx + 1, ly + 7 + (f >> 1), EMBER[4]);
  const s = compose(null, [p], over).sprite(ox, oy, GRAIN);
  s.lights = [{ x: lx / GRAIN, y: (ly + 9) / GRAIN, r: 14 + (f % 2), color: EMBER[2], a: 0.5 }];
  return s;
}
