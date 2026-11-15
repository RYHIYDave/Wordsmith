// THE FROZEN MERE'S OWN THINGS: its fire, its stalls, the hole's ladder, the portal's ring of ice (the queue chat, 14 Nov 2026).
// Each town has its own vendors (his words of 14 Nov 2026: “We want different looking vendors for different towns”; his pick:
// new looks that fit the town on the same moves, their stalls to match, the wordsmith the same in every town). The Mere's, a fair
// held out on the ice:
//   THE FIRE       the one fire the camp is round (his sketch's line: “round one fire”): logs stacked in a cone in a ring of
//                  stones, burning high, sparks going up
//   THE FORGE      a smith's forge on a sledge: an iron firebox on wooden runners, its mouth to the anvil with the fire in it,
//                  a hood and a pipe for a chimney, snow on its hood
//   THE ANVIL      on a stump of a tree
//   THE RACK       of dark wood, snow along its top rail: an ice-axe, a spear, a sword, a round shield painted red and cream
//   THE QUENCH     a hole cut in the ice beside the forge, a blade cooling in it, steam off it
//   THE BOOTH      the charm seller's: a back of planks, a roof of red canvas with snow on it and icicles along its eave, a string
//                  of little lanterns
//   THE COUNTER    of planks with a blue cloth over it: candles alight, charms of glass on a little rack, jars, a pair of
//                  knitted mittens, and an ice crystal on a stand, the friend's cyan
//   THE RUG        a round rug braided of rags, on the snow where the seller stands
//   THE SHANTY     an ice-fisher's hut of planks, snow on its roof, a stovepipe: the stranger leans on its side
//   THE LADDER     down into the hole in the ice
//   THE ICE BLOCKS round the portal's round
// Each stands where the town's own does and is the same size (art/town.ts), so that the people stand at them as at the town's.

import { Px } from '../engine/px';
import type { Sprite } from '../engine/px';
import { Iso } from './isokit';
import type { SideShader } from './isokit';
import { GRAIN, ball, compose, hash, limb } from './kit';
import type { Ramp } from './kit';
import { COAL, EMBER, tongue } from './props';

const WOOD: Ramp = ['#1a0e0a', '#341e14', '#52321e', '#74482a', '#946038'];
const BARK: Ramp = ['#140c0a', '#281a12', '#3e2a1c', '#584028', '#705436'];
const IRON_M: Ramp = ['#14141a', '#2a2a34', '#46465a', '#6e6e84', '#a0a0b4'];
const SNOWP: Ramp = ['#2c3a58', '#405274', '#5a6e92', '#7a8eb0', '#a2b4d0'];
const STONE_M = ['#141418', '#24242a', '#36363e', '#4a4a54', '#62626c', '#7c7c86'];
const CANVAS_R: Ramp = ['#2a0a0e', '#4a1218', '#6e1e22', '#92302c', '#b44a3c'];
const CREAM: Ramp = ['#4a4236', '#7a6e5a', '#aa9c80', '#d2c6a8', '#efe6cc'];
const CLOTH_B: Ramp = ['#0a0e24', '#141c40', '#22305e', '#344680', '#4c62a2'];
const GLASS: Ramp = ['#1a2a3a', '#2a4460', '#40668c', '#6a94b8', '#b4d4ec'];
const ICEB: Ramp = ['#22344a', '#3a5674', '#5a7c9e', '#8aaccc', '#d0e2f2'];
const CYAN: Ramp = ['#0c6a80', '#18a0b4', '#22d0e0', '#b8fff8', '#ffffff'];
const RAGS = ['#5a2a24', '#7a5a3a', '#3a4a5a', '#8a7a5a', '#4a3a4a', '#6a2e2a'];
const INKY = '#0e0c18';

const boxOf = (r: Ramp): { top: () => string; left: SideShader; right: SideShader } => ({
  top: () => r[3],
  left: (_u, v, _w, h) => (v === 0 ? r[4] : v >= h - 1 ? r[1] : r[2]),
  right: (_u, v, _w, h) => (v === 0 ? r[3] : v >= h - 1 ? r[0] : r[1]),
});
/** Planks standing side by side on a side: a dark line between each, a knot now and then, darker toward the foot. */
const planks = (r: Ramp, wide: number, lo: number, seed: number): SideShader => (u, v, _w, h) => {
  if (u % wide === 0) return r[Math.max(0, lo - 1)];
  if (v === 0) return r[Math.min(4, lo + 2)];
  const k = Math.floor(u / wide);
  if (hash(k, Math.floor(v / 5), seed) > 0.95) return r[Math.max(0, lo - 1)];
  return r[Math.max(0, Math.min(4, lo + (hash(k, 0, seed + 1) > 0.6 ? 1 : 0) - (v > h - 4 ? 1 : 0)))];
};
/** Snow lying on a top: its own white, a shade at its far edge. */
const snowTop = (u: number, v: number): string => (u < 0.06 || v < 0.06 ? SNOWP[2] : hash(Math.round(u * 20), Math.round(v * 20), 7) > 0.9 ? SNOWP[3] : SNOWP[4]);

// ---------------------------------------------------------------------------------------------------------------------------
// THE FIRE: logs in a cone in a ring of stones. 96 x 128; at (48, 104). Four frames.

const BLAZE: ReadonlyArray<ReadonlyArray<readonly [number, number, number, number]>> = [
  [[0, 34, 9, 2], [-8, 22, 6, -2], [8, 24, 6, 3], [-3, 16, 5, -1], [5, 14, 4, 1]],
  [[1, 31, 9, -2], [-7, 25, 6, 2], [9, 20, 5, -1], [-4, 14, 5, 2], [4, 17, 4, -2]],
  [[-1, 36, 9, -3], [-8, 20, 6, -1], [7, 26, 6, 2], [-2, 18, 5, 1], [6, 13, 4, 2]],
  [[0, 30, 9, 3], [-9, 23, 6, 1], [8, 22, 6, -2], [-3, 15, 5, -2], [3, 18, 4, 1]],
];

export function mereFire(frame: number): Sprite {
  const W = 96;
  const H = 128;
  const ox = 48;
  const oy = 104;
  const back = new Px(W, H);
  const logs = new Px(W, H);
  const fire = new Px(W, H);
  const front = new Px(W, H);
  const over = new Px(W, H);
  // the ring of stones: round, the far ones first
  const N = 12;
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    const x = ox + Math.cos(a) * 22;
    const y = oy - 2 + Math.sin(a) * 11;
    const dst = Math.sin(a) < 0 ? back : front;
    const r = 4.2 + hash(i, 0, 3) * 1.8;
    ball(dst, x, y - r * 0.5, r, r * 0.72, STONE_M.slice(1, 6) as unknown as Ramp);
    // (snow on the outer stones' tops)
    if (hash(i, 1, 3) > 0.4 && Math.sin(a) > -0.3) dst.hline(Math.round(x - r * 0.6), Math.round(y - r * 1.1), Math.round(r * 1.2), SNOWP[3]);
  }
  // the bed of embers
  for (let y = oy - 8; y <= oy + 4; y++)
    for (let x = ox - 18; x <= ox + 18; x++) {
      const d = ((x - ox) / 18) ** 2 + ((y - oy + 2) / 7) ** 2;
      if (d > 1) continue;
      const n = hash(x, y, 4 + frame);
      back.set(x, y, n < 0.35 ? EMBER[2] : n < 0.6 ? EMBER[1] : n < 0.8 ? COAL[3] : COAL[2]);
    }
  // the logs: six, leaning in to a point over the middle
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.3;
    const x0 = ox + Math.cos(a) * 15;
    const y0 = oy - 1 + Math.sin(a) * 7;
    const x1 = ox + Math.cos(a) * 2;
    const y1 = oy - 30 + Math.sin(a) * 1;
    const dst = Math.sin(a) < 0 ? back : logs;
    limb(dst, x0, y0, x1, y1, 2.6, 1.8, BARK);
    // (charred where the fire is at them)
    dst.set(Math.round((x0 + x1) / 2), Math.round((y0 + y1) / 2), COAL[3]);
  }
  // the fire: tongues up through the logs
  for (const [dx, h, w, lean] of BLAZE[frame % BLAZE.length]) tongue(fire, ox + dx, oy - 2, h, w, lean, EMBER);
  // sparks going up
  for (let i = 0; i < 6; i++) {
    const t = ((frame * 0.25 + i / 6) % 1);
    const x = ox + Math.round(Math.sin(i * 2.3 + frame) * 8 * t);
    const y = oy - 40 - Math.round(t * 44);
    over.set(x, y, t < 0.5 ? EMBER[4] : EMBER[3]);
  }
  const s = compose(null, [back, logs, fire, front], over).sprite(ox, oy, GRAIN);
  s.lights = [{ x: ox / GRAIN, y: (oy - 22) / GRAIN, r: 34 + (frame % 2) * 2, color: EMBER[2], a: 0.62 }];
  return s;
}

// ---------------------------------------------------------------------------------------------------------------------------
// THE FORGE ON A SLEDGE. 104 x 156; its tile's middle at (52, 132). Four frames: its fire.

const FORGE_FIRE: ReadonlyArray<ReadonlyArray<readonly [number, number, number, number]>> = [
  [[0, 12, 4.4, 2], [-5, 8, 3, -1], [5, 7, 2.4, 1]],
  [[1, 11, 4.2, -2], [5, 9, 2.8, 2], [-5, 6, 2.2, -1]],
  [[0, 13, 4.4, -3], [-4, 8, 2.6, -2], [5, 8, 2.4, 1]],
  [[-1, 10, 4.2, 1], [-5, 9, 2.8, -1], [4, 7, 2.2, 2]],
];

export function mereForge(frame: number): Sprite {
  const W = 104;
  const H = 156;
  const ox = 52;
  const oy = 132;
  const sled = new Px(W, H);
  const box = new Px(W, H);
  const fire = new Px(W, H);
  const hood = new Px(W, H);
  const over = new Px(W, H);
  const is = new Iso(sled, ox, oy);
  const W0 = boxOf(WOOD);
  // the runners: two along x, their fronts curling up
  for (const y of [-0.36, 0.3]) {
    is.box(-0.62, y, 0.5, y + 0.06, 0, 4, W0);
    const [a, b] = is.at(0.5, y + 0.03, 2);
    const [c, d] = is.at(0.66, y + 0.03, 12);
    limb(sled, a, b, c, d, 1.6, 1.4, WOOD);
  }
  // the deck of planks
  is.box(-0.56, -0.42, 0.46, 0.42, 4, 8, { top: () => WOOD[3], left: planks(WOOD, 6, 2, 11), right: W0.right });
  // the firebox: iron, its mouth in the side that looks down the screen to the left (toward the anvil)
  const ib = new Iso(box, ox, oy);
  const A = 0.34;
  const Z0 = 8;
  const Z1 = 40;
  const mouth = new Set<number>();
  let bed: [number, number] = [ox, oy];
  ib.box(-A, -A, A, A, Z0, Z1, {
    top: () => IRON_M[2],
    left: (u, v, w, h, px, py) => {
      const mx = Math.abs(u + 0.5 - w / 2);
      if (mx < 8 && v > 8 && v < h - 6) {
        mouth.add(py * W + px);
        if (Math.round(u - w / 2) === 0 && v === h - 8) bed = [px, py];
        if (v > h - 10) {
          const n = hash(u, frame, 3 + v);
          return n < 0.3 ? EMBER[2] : n < 0.5 ? EMBER[1] : COAL[3];
        }
        return COAL[0];
      }
      // (the iron about the mouth glowing with it; rivets down its edges)
      if (mx < 10 && v > 6 && v < h - 4) return EMBER[0];
      if ((u === 2 || u === w - 3) && v % 6 === 3) return IRON_M[4];
      return v === 0 ? IRON_M[4] : v >= h - 1 ? IRON_M[1] : IRON_M[2];
    },
    right: (u, v, w, h) => ((u === 2 || u === w - 3) && v % 6 === 3 ? IRON_M[3] : v === 0 ? IRON_M[3] : v >= h - 1 ? IRON_M[0] : IRON_M[1]),
  });
  // the hood: iron drawn in from the box's top to a pipe; snow lying on it
  const ih = new Iso(hood, ox, oy);
  const D = 0.1;
  const Z2 = 62;
  ih.slopeLeft(-A, A, A, Z1, -D, D, D, Z2, (t, k) => (t > 0.55 ? (hash(Math.round(k * 20), Math.round(t * 10), 5) > 0.3 ? SNOWP[3] : SNOWP[4]) : t < 0.07 ? IRON_M[1] : k < 0.08 ? IRON_M[4] : IRON_M[2]));
  ih.slopeRight(A, -A, A, Z1, D, -D, D, Z2, (t, k) => (t > 0.6 ? SNOWP[2] : t < 0.07 || k > 0.9 ? IRON_M[0] : IRON_M[1]));
  const band = (v: number): boolean => v === 12 || v === 13 || v === 30;
  ih.box(-D, -D, D, D, Z2, Z2 + 44, { top: () => INKY, left: (_u, v) => (band(v) ? IRON_M[3] : IRON_M[2]), right: (_u, v) => (band(v) ? IRON_M[2] : IRON_M[1]) });
  // the fire, nothing of it outside the mouth
  for (const [dx, h, w, lean] of FORGE_FIRE[frame % FORGE_FIRE.length]) tongue(fire, bed[0] + dx, bed[1] - 1 + Math.round(dx / 2), h, w, lean, EMBER);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (fire.has(x, y) && !mouth.has(y * W + x)) fire.erase(x, y);
  // smoke out of the pipe
  const [px0, py0] = ih.at(0, 0, Z2 + 44);
  for (let i = 0; i < 3; i++) over.set(Math.round(px0) + ((frame + i) % 3) - 1, Math.round(py0) - 4 - i * 5, i ? '#4e5262' : '#626676');
  const s = compose(null, [sled, box, fire, hood], over).sprite(ox, oy, GRAIN);
  s.lights = [{ x: bed[0] / GRAIN, y: (bed[1] - 8) / GRAIN, r: 17 + (frame % 2), color: EMBER[2], a: 0.5 }];
  return s;
}

/** THE ANVIL on a stump. 56 x 60; at (28, 46). */
export function mereAnvil(): Sprite {
  const W = 56;
  const H = 60;
  const ox = 28;
  const oy = 46;
  const wood = new Px(W, H);
  const iron = new Px(W, H);
  const TOP = 14;
  // (round: its bark down its side, its rings on its top, snow at its foot)
  for (let y = oy - TOP; y < oy; y++) for (let x = ox - 11; x <= ox + 11; x++) {
    const u = (x - ox) / 11;
    const k = 0.5 - 0.45 * u;
    wood.set(x, y, (x * 3 + Math.floor(y / 3)) % 5 === 0 ? BARK[0] : BARK[Math.max(1, Math.min(4, Math.round(1 + k * 3)))]);
  }
  wood.ellipse(ox, oy - 1, 11, 2.8, BARK[1]);
  wood.ellipse(ox, oy - TOP, 11, 3.2, WOOD[3]);
  wood.ellipse(ox, oy - TOP, 7, 2, WOOD[2]);
  wood.ellipse(ox, oy - TOP, 2.6, 0.9, WOOD[3]);
  const iso = new Iso(iron, ox, oy);
  const IB = boxOf(IRON_M);
  const L0 = -0.3;
  const L1 = 0.3;
  const HW = 0.1;
  const FACE = TOP + 16;
  iso.box(-0.24, -0.12, 0.24, 0.12, TOP, TOP + 3, IB);
  iso.box(-0.12, -0.075, 0.12, 0.075, TOP + 3, TOP + 9, IB);
  iso.box(L0, -HW, L1, HW, TOP + 9, FACE, { top: () => IRON_M[4], left: IB.left, right: IB.right });
  const pt = (x: number, y: number, z: number): [number, number] => {
    const [a, b] = iso.at(x, y, z);
    return [Math.round(a), Math.round(b)];
  };
  const tip = pt(L0 - 0.3, 0, FACE - 1);
  iron.poly([pt(L0, HW, FACE), tip, pt(L0, HW, TOP + 10)], IRON_M[2]);
  iron.poly([pt(L0, -HW, FACE), tip, pt(L0, HW, FACE)], IRON_M[3]);
  const e0 = pt(L0, HW, FACE);
  const e1 = pt(L1, HW, FACE);
  iron.line(e0[0], e0[1], e1[0] - 1, e1[1] - 1, '#ffffff');
  return compose(null, [wood, iron], null).sprite(ox, oy, GRAIN);
}

/** THE RACK, of dark wood, snow on its top rail. 62 x 92; at (22, 80). */
export function mereRack(): Sprite {
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
  for (const x of [X0, X1 - 0.07]) iso.box(x, Y - 0.08, x + 0.07, Y + 0.17, 0, 3, W0);
  iso.box(X0 - 0.03, Y - 0.02, X1 + 0.03, Y + 0.02, 14, 18, W0);
  iso.box(X0 - 0.03, Y - 0.025, X1 + 0.03, Y + 0.025, 46, 50, { top: () => SNOWP[4], left: (_u, v) => (v === 0 ? SNOWP[3] : WOOD[2]), right: W0.right });
  for (const x of [X0, X1 - 0.07]) iso.box(x, Y - 0.035, x + 0.07, Y + 0.035, 3, TALL, { top: () => SNOWP[4], left: W0.left, right: W0.right });
  const FW = 46;
  const FH = 62;
  const flat = new Px(FW, FH);
  const boss = new Px(FW, FH);
  // an ice-axe: a short haft, a pick on one side, an adze on the other
  for (let y = 0; y < 34; y++) flat.set(6, 14 + y, WOOD[y % 6 === 0 ? 2 : 3]);
  flat.hline(1, 13, 11, IRON_M[3]).hline(1, 14, 11, IRON_M[2]).set(1, 15, IRON_M[2]).set(0, 16, IRON_M[2]).rect(10, 15, 2, 2, IRON_M[2]);
  // a spear, its point up
  for (let y = 0; y < 52; y++) flat.set(14, 4 + y, y < 9 ? IRON_M[3 - (y % 2)] : WOOD[y % 5 === 0 ? 2 : 3]);
  flat.set(13, 7, IRON_M[3]).set(15, 7, IRON_M[2]);
  // a sword, point down
  flat.rect(30, 2, 2, 2, IRON_M[3]);
  flat.rect(30, 4, 2, 6, WOOD[2]);
  flat.rect(26, 10, 10, 2, IRON_M[2]);
  for (let y = 0; y < 34; y++) {
    const hw = y > 30 ? (34 - y) / 2 : 2;
    for (let i = -Math.ceil(hw); i < Math.ceil(hw); i++) flat.set(31 + i, 12 + y, i < 0 ? IRON_M[4] : IRON_M[3]);
  }
  // a round shield, painted in quarters red and cream, an iron rim and boss
  ball(boss, 22, 44, 8, 9.5, CANVAS_R);
  for (let y = 34; y <= 54; y++) for (let x = 13; x <= 31; x++) {
    if (!boss.has(x, y)) continue;
    const d = ((x + 0.5 - 22) / 8) ** 2 + ((y + 0.5 - 44) / 9.5) ** 2;
    if (d > 0.78) boss.set(x, y, x < 22 ? IRON_M[3] : IRON_M[2]);
    else if ((x < 22) !== (y < 44)) boss.set(x, y, x < 22 ? CREAM[3] : CREAM[2]);
  }
  ball(boss, 22, 44, 2.4, 3, IRON_M);
  const hang = (onto: Px, what: Px): void => {
    new Iso(onto, ox, oy).left(X0 + 0.02, X0 + 0.02 + FW / 32, Y + 0.05, 0, FH, (u, v) => what.get(u, v));
  };
  hang(arms, flat);
  hang(front, boss);
  return compose(null, [frame, arms, front], null).sprite(ox, oy, GRAIN);
}

/** THE QUENCH: a hole cut in the ice, a blade cooling in it, steam off it. 48 x 40; at (24, 30). Two frames: the steam. */
export function mereQuench(frame: number): Sprite {
  const W = 48;
  const H = 40;
  const cx = 24;
  const foot = 30;
  const p = new Px(W, H);
  const over = new Px(W, H);
  // (the ice's broken edge round it, lit on its far lip; the water black)
  p.ellipse(cx, foot - 4, 15, 6.4, ICEB[3]);
  p.ellipse(cx, foot - 3.4, 13, 5.2, ICEB[1]);
  p.ellipse(cx, foot - 3, 12, 4.4, '#03050a');
  p.hline(cx - 6, foot - 4, 5, ICEB[1]).hline(cx + 3, foot - 2, 4, ICEB[1]);
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    p.set(Math.round(cx + Math.cos(a) * 15), Math.round(foot - 4 + Math.sin(a) * 6.4), ICEB[4]);
  }
  // the blade, its tang up, wrapped
  over.rect(cx + 4, foot - 18, 2, 14, IRON_M[2]).vline(cx + 4, foot - 18, 14, IRON_M[4]);
  over.rect(cx + 3, foot - 20, 4, 3, WOOD[3]);
  // steam
  for (let i = 0; i < 5; i++) over.set(cx + 2 + ((i + frame) % 3) * 2 - 2, foot - 22 - i * 3 - frame, i % 2 ? '#8a96aa' : '#aab6c8');
  return compose(null, [p], over).sprite(cx, foot, GRAIN);
}

// ---------------------------------------------------------------------------------------------------------------------------
// THE BOOTH: the charm seller's. Where the town's tent stands and as big: 168 x 208; its tile's middle at (96, 164).

const TENT_A = 1.4;
const TENT_BACK = -0.3;
const TENT_EAVE = 1.15;
const TENT_HIGH = 112;
const TENT_LOW = 94;
const TENT_OUT = 0.15;
const TENT_DROP = 9;

export function mereBooth(): Sprite {
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
  for (const x of [-TENT_A, TENT_A - 0.08]) ip.box(x, TENT_BACK - 0.04, x + 0.08, TENT_BACK + 0.04, 0, TENT_HIGH - 4, W0);
  // the back: planks to the roof, snow banked against its foot
  new Iso(wall, ox, oy).left(-TENT_A + 0.08, TENT_A - 0.08, TENT_BACK, 0, TENT_HIGH - 6, (u, v, w, h, px, py) => {
    if (v > h - 6 - 3 * Math.sin((u / w) * 9)) return SNOWP[3];
    return planks(WOOD, 7, 2, 21)(u, v, w, h, px, py);
  });
  const ifr = new Iso(front, ox, oy);
  for (const x of [-TENT_A, TENT_A - 0.08]) ifr.box(x, TENT_EAVE - 0.1, x + 0.08, TENT_EAVE - 0.02, 0, TENT_LOW - 2, W0);
  // the roof: red canvas, snow lying on its upper part
  const R = TENT_A + TENT_OUT;
  const ir = new Iso(roof, ox, oy);
  const lowY = TENT_EAVE + TENT_OUT;
  const highY = TENT_BACK - TENT_OUT;
  ir.quad(ir.at(-R, lowY, TENT_LOW), ir.at(R, lowY, TENT_LOW), ir.at(R, highY, TENT_HIGH), ir.at(-R, highY, TENT_HIGH), (t, u) => {
    const drift = 0.42 + 0.08 * Math.sin(u * 23) + 0.05 * Math.sin(u * 61);
    if (t > drift) return t > 0.95 ? SNOWP[3] : hash(Math.round(u * 60), Math.round(t * 30), 22) > 0.92 ? SNOWP[3] : SNOWP[4];
    // (the canvas: its seams running down the slope)
    return Math.floor(u * 9) !== Math.floor((u - 0.012) * 9) ? CANVAS_R[1] : CANVAS_R[t > drift - 0.05 ? 3 : 2];
  });
  // its valance along the eave: cream, cut in points; icicles hanging from it
  const ie = new Iso(edge, ox, oy);
  ie.left(-R, R, lowY, TENT_LOW - TENT_DROP, TENT_LOW, (u, v, _w, h) => {
    const k = u % 8;
    if (v >= h - 4 && Math.min(k, 7 - k) < v - (h - 5)) return null;
    return v <= 1 ? CANVAS_R[3] : CREAM[2 + (v === 2 ? 1 : 0)];
  });
  ie.quad(ie.at(R, lowY, TENT_LOW - TENT_DROP), ie.at(R, highY, TENT_HIGH - TENT_DROP), ie.at(R, highY, TENT_HIGH), ie.at(R, lowY, TENT_LOW), (t, u) => {
    const k = (u * 7) % 1;
    if (t < 0.45 && Math.abs(k - 0.5) > 0.5 - (0.45 - t) * 0.8) return null;
    return CREAM[1];
  });
  for (let i = 0; i < 14; i++) {
    const [a, b] = ie.at(-R + 0.1 + (i / 13) * (2 * R - 0.2), lowY, TENT_LOW - TENT_DROP);
    const long = 2 + Math.round(hash(i, 0, 23) * 6);
    over.vline(Math.round(a), Math.round(b), long, ICEB[4]).set(Math.round(a), Math.round(b) + long, ICEB[3]);
  }
  // a string of little lanterns along under the eave, alight
  const lights: { x: number; y: number }[] = [];
  for (const k of [-0.9, -0.3, 0.3, 0.9]) {
    const [a, b] = ie.at(k, lowY - 0.04, TENT_LOW - TENT_DROP - 3);
    const x = Math.round(a);
    const y = Math.round(b);
    over.rect(x - 1, y, 3, 4, EMBER[3]).set(x, y + 1, EMBER[4]).hline(x - 1, y - 1, 3, IRON_M[2]);
    lights.push({ x, y: y + 2 });
  }
  {
    // (the cord they hang from, sagging between them)
    for (let i = 0; i < lights.length - 1; i++) {
      const a = lights[i];
      const b = lights[i + 1];
      for (let k = 0; k <= 10; k++) {
        const t = k / 10;
        over.set(Math.round(a.x + (b.x - a.x) * t), Math.round(a.y - 3 + (b.y - a.y) * t + 2 * Math.sin(t * Math.PI)), WOOD[1]);
      }
    }
  }
  const s = compose(null, [posts, wall, front, roof, edge], over).sprite(ox, oy, GRAIN);
  s.lights = lights.map((l) => ({ x: l.x / GRAIN, y: l.y / GRAIN, r: 9, color: EMBER[2], a: 0.32 }));
  return s;
}

/** THE COUNTER: planks under a blue cloth, the seller's wares on it. 136 x 108; its tile's middle at (54, 68). */
export function mereCounter(): Sprite {
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
  const TOP = 30;
  const it = new Iso(table, ox, oy);
  it.box(-TA, TB0, TA, TB1, 0, TOP, {
    top: (u, v) => (v > 0.15 && v < 0.85 && u > 0.02 && u < 0.98 ? CLOTH_B[3] : CLOTH_B[4]),
    // (the cloth hangs to a hand above the snow, a band of white stitching along its hem; under it, planks)
    left: (u, v, w, h, px, py) => (v >= h - 8 ? planks(WOOD, 7, 2, 31)(u, v, w, h, px, py) : v === h - 10 ? CREAM[3] : v === 0 ? CLOTH_B[4] : u % 12 === 6 && v > 4 ? CLOTH_B[1] : CLOTH_B[2]),
    right: (_u, v, _w, h) => (v >= h - 8 ? WOOD[1] : v >= h - 9 ? CREAM[1] : CLOTH_B[1]),
  });
  const on = (x: number, y = 0.02): [number, number] => {
    const [a, b] = it.at(x, y, TOP);
    return [Math.round(a), Math.round(b)];
  };
  const lit: { x: number; y: number; c: string; r: number }[] = [];
  // candles: three, tall and short, alight
  for (const [x, y, tall] of [[-1.05, 0.05, 10], [-0.92, -0.08, 7], [-0.82, 0.12, 5]] as const) {
    const [a, b] = on(x, y);
    wares.rect(a - 1, b - tall, 3, tall, CREAM[3]).vline(a - 1, b - tall, tall, CREAM[4]);
    over.set(a, b - tall - 1, EMBER[3]).set(a, b - tall - 2, EMBER[4]);
    lit.push({ x: a, y: b - tall - 2, c: EMBER[2], r: 6 });
  }
  // charms of glass hung on a little rack
  {
    const iw = new Iso(wares, ox, oy);
    iw.box(-0.62, 0, -0.14, 0.05, TOP + 12, TOP + 14, boxOf(WOOD));
    for (const x of [-0.62, -0.18]) iw.box(x, 0, x + 0.04, 0.05, TOP, TOP + 12, boxOf(WOOD));
    const hues = [GLASS[3], '#7aa86a', '#a86a6a', GLASS[4]];
    for (let i = 0; i < 4; i++) {
      const [a, b] = iw.at(-0.55 + i * 0.11, 0.06, TOP + 11);
      wares.vline(Math.round(a), Math.round(b), 3, CREAM[2]);
      over.rect(Math.round(a) - 1, Math.round(b) + 3, 2, 3, hues[i]).set(Math.round(a) - 1, Math.round(b) + 3, '#ffffff');
    }
  }
  // jars, stoppered
  for (const [x, y] of [[0.0, 0.0], [0.16, 0.12]] as const) {
    const [a, b] = on(x, y);
    ball(wares, a + 0.5, b - 4, 4, 4.5, GLASS);
    wares.rect(a - 2, b - 10, 5, 2, WOOD[3]);
    wares.set(a - 2, b - 6, GLASS[4]);
  }
  // a pair of knitted mittens
  {
    const [a, b] = on(0.42, 0.16);
    for (const dx of [0, 6]) {
      wares.rect(a + dx - 2, b - 4, 5, 4, CANVAS_R[3]).hline(a + dx - 2, b - 2, 5, CREAM[3]).set(a + dx + 3, b - 3, CANVAS_R[2]);
    }
  }
  // an ice crystal on a stand: six points, the friend's cyan
  {
    const [a, b] = on(1.0);
    wares.rect(a - 1, b - 6, 3, 6, WOOD[2]).hline(a - 3, b - 1, 7, WOOD[3]);
    const cy = b - 13;
    for (let k = 0; k < 6; k++) {
      const ang = (k / 6) * Math.PI * 2;
      for (let d = 1; d <= 5; d++) over.set(Math.round(a + Math.cos(ang) * d), Math.round(cy + Math.sin(ang) * d * 0.9), d > 4 ? CYAN[2] : CYAN[3]);
    }
    over.set(a, cy, CYAN[4]);
    lit.push({ x: a, y: cy, c: CYAN[2], r: 9 });
  }
  const s = compose(null, [table, wares], over).sprite(ox, oy, GRAIN);
  s.lights = lit.map((l) => ({ x: l.x / GRAIN, y: l.y / GRAIN, r: l.r, color: l.c, a: 0.34 }));
  return s;
}

/** THE RUG: round, braided of rags, flat on the snow. 140 x 70; anchored at its middle. */
export function mereRug(): Sprite {
  const W = 140;
  const H = 70;
  const p = new Px(W, H);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const dx = (x + 0.5 - W / 2) / (W / 2);
      const dy = (y + 0.5 - H / 2) / (H / 2);
      const r = Math.hypot(dx, dy);
      if (r > 1) continue;
      // (its rings, each a braid of one rag: the braid's twist a darker pixel slanting along it)
      const ring = Math.floor(r * 9);
      const c = RAGS[(ring * 5 + 2) % RAGS.length];
      const a = Math.atan2(dy, dx);
      const twist = Math.floor((a / (Math.PI * 2)) * (20 + ring * 10) + r * 18) % 2 === 0;
      p.set(x, y, twist ? c : mixHex(c, '#000000', 0.25));
    }
  return p.sprite(W / 2, H / 2, GRAIN);
}
function mixHex(a: string, b: string, t: number): string {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return '#' + pa.map((v, i) => Math.round(v + (pb[i] - v) * t).toString(16).padStart(2, '0')).join('');
}

// ---------------------------------------------------------------------------------------------------------------------------
// THE SHANTY: an ice-fisher's hut of planks, the stranger leaning on its side. Built on the grid; its side to him looks down the
// screen to the right. Anchored at the middle of its foot. 120 x 176.

export function mereShanty(): Sprite {
  const W = 132;
  const H = 168;
  const ox = 66;
  const oy = 136;
  const hut = new Px(W, H);
  const roofP = new Px(W, H);
  const over = new Px(W, H);
  const iso = new Iso(hut, ox, oy);
  // (low and long, on runners, as such huts are dragged out onto the ice; its side to him the long one)
  const X0 = -0.62;
  const X1 = 0.0;
  const Y0 = -0.78;
  const Y1 = 0.78;
  const WALL = 52;
  const RUN = 5;
  const W0 = boxOf(WOOD);
  for (const x of [X0 + 0.06, X1 - 0.1]) iso.box(x, Y0 - 0.06, x + 0.05, Y1 + 0.1, 0, RUN, W0);
  // its walls of planks laid along it; a little window with a shutter in the end that looks left; snow banked at its foot
  iso.box(X0, Y0, X1, Y1, RUN, RUN + WALL, {
    top: () => WOOD[1],
    left: (u, v, w, h) => {
      const win = Math.abs(u - w * 0.5) < 6 && v > 14 && v < 26;
      if (win) return Math.abs(u - w * 0.5) > 5 || v === 15 || v === 25 ? WOOD[0] : u > w * 0.5 ? WOOD[3] : '#05060c';
      if (v > h - 5 - 2 * Math.sin(u * 0.4)) return SNOWP[3];
      return v % 7 === 0 ? WOOD[1] : hash(Math.floor(u / 9), Math.floor(v / 7), 41) > 0.85 ? WOOD[3] : WOOD[2];
    },
    right: (u, v, _w, h) => (v > h - 5 - 2 * Math.sin(u * 0.5) ? SNOWP[2] : v % 7 === 0 ? WOOD[0] : hash(Math.floor(u / 11), Math.floor(v / 7), 42) > 0.85 ? WOOD[2] : WOOD[1]),
  });
  // its roof: low, pitched along its length, snow thick on it and hanging over its eaves
  const ir = new Iso(roofP, ox, oy);
  const ROOF = 14;
  const Rx0 = X0 - 0.07;
  const Rx1 = X1 + 0.07;
  const midX = (Rx0 + Rx1) / 2;
  const Z = RUN + WALL;
  ir.slopeRight(Rx1, Y0 - 0.07, Y1 + 0.07, Z - 2, midX, Y0 - 0.07, Y1 + 0.07, Z + ROOF, (t, k) => (t < 0.14 ? SNOWP[2] : hash(Math.round(k * 30), Math.round(t * 10), 43) > 0.9 ? SNOWP[3] : SNOWP[4]));
  ir.quad(ir.at(Rx0, Y1 + 0.07, Z - 2), ir.at(Rx1, Y1 + 0.07, Z - 2), ir.at(midX, Y1 + 0.07, Z + ROOF), ir.at(midX, Y1 + 0.07, Z + ROOF), (t, k) => (t > 0.8 || Math.abs(k - 0.5) > 0.42 - t * 0.4 ? SNOWP[4] : WOOD[3]));
  // the stovepipe, smoke from it
  const [sa, sb] = ir.at(midX + 0.04, -0.4, Z + ROOF - 3);
  roofP.rect(Math.round(sa) - 2, Math.round(sb) - 16, 4, 15, IRON_M[1]).vline(Math.round(sa) - 2, Math.round(sb) - 16, 15, IRON_M[3]).hline(Math.round(sa) - 3, Math.round(sb) - 17, 6, IRON_M[2]);
  for (let i = 0; i < 4; i++) over.set(Math.round(sa) + (i % 2), Math.round(sb) - 21 - i * 4, i % 2 ? '#4e5262' : '#626676');
  // a fishing rod leant on its end, and a pair of skates hung by the window
  {
    const io = new Iso(over, ox, oy);
    const [a0, b0] = io.at(X0 + 0.1, Y1 + 0.06, 0);
    const [a1, b1] = io.at(X0 + 0.02, Y1 + 0.06, 70);
    over.line(Math.round(a0), Math.round(b0), Math.round(a1), Math.round(b1), WOOD[3]);
    const [a, b] = io.at(X0 + 0.16, Y1, 40);
    over.vline(Math.round(a), Math.round(b), 6, WOOD[1]).hline(Math.round(a) - 3, Math.round(b) + 6, 7, IRON_M[4]).hline(Math.round(a) - 2, Math.round(b) + 5, 5, WOOD[3]);
  }
  return compose(null, [hut, roofP], over).sprite(ox, oy, GRAIN);
}

/** THE LADDER down into the hole in the ice: two rails and their rungs, leant against its far side, the foot under the water. 48 x 80; at (24, 60). */
export function mereLadder(): Sprite {
  const W = 48;
  const H = 80;
  const ox = 24;
  const oy = 60;
  const p = new Px(W, H);
  // (seen from before it: its top standing out of the hole, leaning back, its rungs going down into the dark)
  for (const dx of [-6, 6]) for (let i = 0; i < 40; i++) p.set(ox + dx + Math.round(i * 0.05), oy - 34 + i, i < 30 ? WOOD[dx < 0 ? 3 : 2] : WOOD[1]);
  for (let k = 0; k < 7; k++) {
    const y = oy - 32 + k * 6;
    p.hline(ox - 5, y, 11, k < 5 ? WOOD[3] : WOOD[1]);
    if (k < 2) p.hline(ox - 5, y - 1, 11, SNOWP[3]);
  }
  return compose(null, [p], null).sprite(ox, oy, GRAIN);
}

/** A BLOCK OF ICE, cut and stood up: the portal's round is ringed with six. 28 x 40; at (14, 32). */
export function mereIceBlock(v: number): Sprite {
  const W = 28;
  const H = 40;
  const ox = 14;
  const oy = 32;
  const p = new Px(W, H);
  const iso = new Iso(p, ox, oy);
  const tall = 14 + (v % 3) * 3;
  iso.box(-0.16, -0.16, 0.16, 0.16, 0, tall, {
    top: (u, w) => (u + w < 0.5 ? ICEB[4] : ICEB[3]),
    // (clear ice: lighter at its edges, a bubble or a crack in it, darker at its heart)
    left: (u, vv, w, h) => (vv === 0 || u === 0 ? ICEB[4] : Math.abs(u - w * 0.6) < 1 && vv > 3 && vv < h - 3 ? ICEB[3] : ICEB[2]),
    right: (u, vv, _w, h) => (vv === 0 ? ICEB[3] : vv >= h - 1 ? ICEB[0] : u === 1 ? ICEB[2] : ICEB[1]),
  });
  return compose(null, [p], null).sprite(ox, oy, GRAIN);
}
void snowTop;
void hash;
