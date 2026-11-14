// FLOOR 5, THE TEMPLE'S DOOR: THE WAY FROM THE MINE INTO THE TEMPLE, BARRED (his idea, 13 Nov 2026, in the Brawler switch chat:
// “I want The the moment when you enter the temple from the line in level five to be an event when there’s a gate, the gate is
// locked. There’s two many bosses with keys you kill both of them you collect the two keys and then you unlock two chains across
// the door that then open the way into the temple”; read as the mine, and two mini-bosses; his pick for the door, “Great black stone
// doors (Recommended)”). Behind TEMPLE_DOOR, on at his yes (13 Nov 2026) (game/temple_door.ts has the rules).
//
// WHAT IS PAINTED HERE, an original design, in floor 5's look A (art/lair_temple.ts: the threshold's black worked stone, the
// mine's dark iron; nothing cyan, the friend's; the only glow the enemy's pink in the locks and in the mark):
//   THE LEAVES (leaf): two great leaves of the temple's black stone in the threshold's way, each a slab on the heroes' scale
//     (as tall as the way's jambs), sculpted as solids so that they turn truly as they swing into the temple; a carved frame, two
//     iron bands studded, and between them, split down the middle where the leaves meet, THE CULT'S MARK, the shrieking skull, its
//     eyes the enemy's pink, dull; an iron ring to pull each by.
//   THE TRANSOM (transom): the head of the way over the leaves, closed with dressed stone in courses (it stays as they open).
//   THE CHAINS (chains): two heavy chains of the mine's iron crossed over the leaves, each from a ring set high in one jamb to a
//     staple low in the other, and on each A PADLOCK, its keyhole the enemy's pink; unlocked, the key turns, the keyhole flares, the
//     shackle springs, and the chain falls link by link from its free end into a heap at the door's foot, the lock with it.
//   THE KEY (key): the key each of the two key-bearers carries: old black iron, its bow the cult's mark, the pink dull in its eyes.
// Light from the upper left: a face turned to screen-left lit, one to screen-right in shade.

import { Px } from '../engine/px';
import type { Sprite } from '../engine/px';
import { Flat } from './gates';
import type { Strip } from './gates';
import { GRAIN } from './kit';
import { FLAME } from './mkit';
import { Deep, IRON, THRESHOLD, inThresholdWay, litTone, markPx } from './lair_temple';
import type { Solid } from './lair_temple';

/**
 * THE SWITCH: ON, his yes to the door and its key-bearers in play (13 Nov 2026, shown the whole event filmed from the game,
 * docs/mockups/temple_door/pictures/temple_event_film.mp4): “Yes, switch it on (Recommended)”.
 */
export const TEMPLE_DOOR = { on: true };

/** The door's stone: the threshold's black worked stone, a step darker (it is set back in the way). */
const STONE = ['#0d0c13', '#1b1824', '#282432', '#38334a', '#504866'] as const;
/** The mark carved in it: its bone, lit and in shade. */
const CARVED = ['#625a78', '#8a81a4'] as const;
const SEAM = '#07060a';
/** The chains' and locks' iron: the mine's, with a cold lit edge. */
const CHAIN = [IRON[0], '#1c1a22', '#36323e', '#625b6c', '#a49cb6'] as const;
/** The enemy's pink, dull and alight (art/mkit.ts FLAME). */
const DULL = [FLAME[0], FLAME[1]] as const;
const ALIGHT = [FLAME[2], FLAME[3], FLAME[4]] as const;

/** The way's measures along its plane, in pixels (32 a tile) from the way's first tile's edge: where each leaf hangs. */
export const DOOR = {
  /** Each leaf's hinge, along the plane (px). */
  hingeA: 2,
  hingeB: 94,
  /** A leaf's width (px), its height (px: the way's jambs), its thickness (tiles). */
  wide: 46,
  high: THRESHOLD.jamb,
  thick: 0.14,
  /** Steps a swing is drawn in. */
  steps: 8,
};

/** A hash of three numbers, 0 to 1. */
function hash(a: number, b: number, c: number): number {
  let h = Math.imul(a * 374761393 + b * 668265263 + c * 2147483647, 1274126177);
  h ^= h >>> 13;
  h = Math.imul(h, 1103515245);
  return ((h >>> 0) % 10007) / 10007;
}

// =================================================================================================
// THE LEAVES

/**
 * One leaf's face at a point of it: (u px from its hinge to its free edge, v px up), `free` the side its free edge is on as seen
 * (-1 its free edge to screen-left of its hinge, +1 to screen-right) so the mark's halves meet; `tone` the face's light (0 to 4).
 */
function leafFace(u: number, v: number, tone: number, free: number): string {
  const W = DOOR.wide;
  const H = DOOR.high;
  const t = (k: number): string => STONE[Math.max(0, Math.min(4, k))];
  // THE FRAME: a raised border, its edge toward the light lit, the other in shade
  if (u < 1 || v < 1 || u > W - 1 || v > H - 1) return SEAM;
  if (u < 4 || u > W - 4 || v < 3 || v > H - 4) {
    const lit = v > H - 4 || (free > 0 ? u < 4 : u > W - 4);
    return t(tone + (lit ? 1 : -1));
  }
  if (u < 5 || u > W - 5 || v < 4 || v > H - 5) return SEAM;
  // THE IRON BANDS, studded
  for (const b of [7, H - 10]) {
    if (v >= b && v < b + 3) {
      if ((Math.floor(u) % 6) === 3 && v === b + 1) return CHAIN[4];
      return v === b + 2 ? CHAIN[3] : v === b ? CHAIN[0] : CHAIN[2];
    }
  }
  // THE RING to pull it by, near its free edge
  const rx = W - 9;
  const ry = 20;
  const rr = Math.hypot(u - rx, (v - ry) * 1.1);
  if (rr > 2.2 && rr < 3.8) return v > ry ? CHAIN[3] : CHAIN[1];
  if (rr <= 1.2) return CHAIN[2];
  // THE MARK, split down the middle where the leaves meet: the shrieking skull, its eyes the enemy's pink, dull
  const mi = (W - u) * free;
  const mk = markPx(Math.round(mi - 0.5), Math.round(v - 21), 10);
  if (mk === 'bone') return markPx(Math.round(mi - 1.5), Math.round(v - 20), 10) === null ? CARVED[1] : CARVED[0];
  if (mk === 'dark') return v > 22 ? (hash(Math.floor(u), Math.floor(v), 77) < 0.5 ? DULL[1] : DULL[0]) : SEAM;
  // the worked stone between: a little grain
  const g = hash(Math.floor(u / 2), Math.floor(v / 3), 71);
  return g < 0.12 ? t(tone - 1) : t(tone);
}

/** A leaf as a solid: from its hinge (0, 0) along (dx, dy) on the floor (tiles), so far open that it faces (nx, ny). */
function leafSolid(dx: number, dy: number, free: number): Solid {
  const W = DOOR.wide / 32;
  const T = DOOR.thick;
  const H = DOOR.high;
  const nx = -dy;
  const ny = dx;
  const local = (x: number, y: number): [number, number] => [x * dx + y * dy, x * nx + y * ny];
  const reach = W + T;
  return {
    box: { x0: -reach, y0: -reach, z0: 0, x1: reach, y1: reach, z1: H },
    inside: (x, y, z) => {
      const [u, w] = local(x, y);
      return u >= 0 && u <= W && Math.abs(w) <= T / 2 && z >= 0 && z <= H;
    },
    shade: (x, y, z, face) => {
      const [u, w] = local(x, y);
      if (face === 'z' || z > H - 0.6) return STONE[4];
      // (which of its faces: a broad face, or an edge)
      const ew = T / 2 - Math.abs(w);
      const eu = Math.min(u, W - u);
      let n: [number, number];
      if (ew <= eu * 1.0) n = [nx * Math.sign(w), ny * Math.sign(w)];
      else n = u < W / 2 ? [-dx, -dy] : [dx, dy];
      const tone = Math.min(3, litTone(n[0], n[1], 0) + 1);
      if (ew > eu) return eu < 0.02 ? SEAM : STONE[Math.max(0, tone - 1)];
      return leafFace(u * 32, z, tone, free);
    },
  };
}

/**
 * THE LEAF: `which` 'a' hangs at the way's first edge, 'b' at its last; `turn` 0 shut (along the plane) to 1 open (straight into
 * the temple); `alongX` the plane's way; `temple` which way across it the temple lies (+1 or -1). Its anchor is its hinge on the
 * floor. (Made the first time it is asked for, and kept.)
 */
const leaves = new Map<string, Sprite>();
export function leaf(which: 'a' | 'b', turn: number, alongX: boolean, temple: 1 | -1): Sprite {
  const step = Math.round(Math.max(0, Math.min(1, turn)) * DOOR.steps);
  const key = `${which}:${step}:${alongX}:${temple}`;
  let s = leaves.get(key);
  if (s) return s;
  const a = ((step / DOOR.steps) * Math.PI) / 2;
  // (along the plane from its hinge toward the way's middle, then swung toward the temple)
  const along = which === 'a' ? 1 : -1;
  const pa = Math.cos(a) * along;
  const pb = Math.sin(a) * temple;
  const [dx, dy] = alongX ? [pa, pb] : [pb, pa];
  // (which way its free edge lies on the screen: x - y along the screen)
  const free = Math.sign(dx - dy) || 1;
  const P = new Px(140, 130);
  const ox = 70;
  const oy = 70;
  const D = new Deep(P, ox, oy);
  D.march(leafSolid(dx, dy, free), 0.01);
  s = P.sprite(ox, oy, GRAIN);
  leaves.set(key, s);
  return s;
}

// =================================================================================================
// THE TRANSOM AND THE CHAINS, flat in the threshold's plane (as its own strips: art/lair_temple.ts thresholdStrips)

/** The plane's (u, v) to the threshold's du (from the way's middle, screen-relative: less than 0 toward the light). */
const scrOf = (alongX: boolean) => (u: number): number => (alongX ? u + 0.5 - 48 : 48 - (u + 0.5));

/** THE TRANSOM: the way's head over the leaves, closed with dressed stone in courses. */
export function transom(alongX: boolean): Strip[] {
  const H = THRESHOLD.crown + 4;
  const F = new Flat(-32, 128, H);
  const scr = scrOf(alongX);
  for (let v = DOOR.high; v < H; v++) {
    for (let u = -32; u < 128; u++) {
      const du = scr(u);
      if (!inThresholdWay(du, v)) continue;
      const row = Math.floor((v - DOOR.high) / 8);
      const lv = (v - DOOR.high) % 8;
      const lu = (((Math.floor(du) + (row % 2 ? 0 : 11)) % 22) + 22) % 22;
      const c = v === DOOR.high ? STONE[0] : lv === 7 || lu === 0 ? SEAM : lv === 6 || lu === 1 ? STONE[3] : STONE[2];
      F.set(u, v, c);
    }
  }
  return F.strips(alongX);
}

/** A chain's line: its ring high in one jamb to its staple low in the other (du, v), `a` from the screen-left jamb's ring. */
const CHAIN_LINE = { hi: 37, lo: 9, reach: 38 };
function chainEnds(first: boolean): { x0: number; y0: number; x1: number; y1: number } {
  const R = CHAIN_LINE;
  return first ? { x0: -R.reach, y0: R.hi, x1: R.reach, y1: R.lo } : { x0: R.reach, y0: R.hi, x1: -R.reach, y1: R.lo };
}

/** A padlock at (du, v) of its top: `k` 0 shut; to 0.2 the key turning, the keyhole flaring; past it, the shackle sprung. */
function padlock(set: (du: number, v: number, c: string) => void, cu: number, top: number, k: number): void {
  const open = k >= 0.2;
  // its shackle: a hoop over its body, through the chain's last link and the staple
  for (let a = 0; a <= 12; a++) {
    const t = (a / 12) * Math.PI;
    const x = cu + Math.cos(t) * 4;
    const y = top + 1 + Math.sin(t) * 5 + (open ? 4 : 0);
    set(Math.round(x + (open && Math.cos(t) > 0 ? 1 : 0)), Math.round(y), a < 6 ? CHAIN[4] : CHAIN[3]);
  }
  // its body: a heavy block of the mine's iron, rounded below, its face lit toward the light
  for (let y = 0; y < 13; y++) {
    const half = y > 9 ? 6 - (y - 9) * 1.3 : 6.5;
    for (let x = -Math.floor(half); x <= Math.floor(half); x++) {
      const edge = Math.abs(x) >= Math.floor(half);
      set(cu + x, top - y, edge ? (x < 0 ? CHAIN[3] : CHAIN[0]) : y === 0 ? CHAIN[3] : x < 0 ? CHAIN[2] : CHAIN[1]);
    }
  }
  // its keyhole: the enemy's pink, dull; alight as the key turns
  const kc = k <= 0 ? [DULL[1], DULL[0]] : k < 0.2 ? [ALIGHT[2], ALIGHT[1]] : [DULL[1], DULL[0]];
  set(cu, top - 4, kc[0]);
  set(cu - 1, top - 5, kc[0]);
  set(cu, top - 5, kc[0]);
  set(cu + 1, top - 5, kc[1]);
  set(cu, top - 6, kc[1]);
  set(cu, top - 7, kc[1]);
}

/** One link of a chain at (du, v), along (ex, ey) (a unit on the plane), face on or edge on. */
function link(set: (du: number, v: number, c: string) => void, x: number, y: number, ex: number, ey: number, faceOn: boolean): void {
  if (faceOn) {
    // (a heavy ring of iron seen flat: two pixels thick, its upper side lit, its lower in shade, a dark line under it)
    for (const [rx, ry, shade] of [[4.6, 3.0, 'out'], [3.6, 2.0, 'in']] as const) {
      for (let a = 0; a < 24; a++) {
        const t = (a / 24) * Math.PI * 2;
        const lx = Math.cos(t) * rx;
        const ly = Math.sin(t) * ry;
        const px = x + ex * lx - ey * ly;
        const py = y + ey * lx + ex * ly;
        const up = Math.sin(t) > 0;
        set(Math.round(px), Math.round(py), shade === 'out' ? (up ? CHAIN[4] : CHAIN[0]) : up ? CHAIN[3] : CHAIN[1]);
      }
    }
  } else {
    // (one seen edge on: a bar, lit along its top)
    for (let k = -4; k <= 4; k++) {
      set(Math.round(x + ex * k), Math.round(y + ey * k + 1), CHAIN[4]);
      set(Math.round(x + ex * k), Math.round(y + ey * k), CHAIN[3]);
      set(Math.round(x + ex * k), Math.round(y + ey * k - 1), CHAIN[0]);
    }
  }
}

/**
 * THE CHAINS: `a` and `b` how far each is through its unlocking (0 locked, 1 lying in its heap): to 0.2 the key turning in its lock
 * and the shackle springing; then it falls, link by link from its free end, into a heap at the door's foot, its lock with it.
 * The first is the one from the screen-left jamb's ring.
 */
const chainsKept = new Map<string, Strip[]>();
export function chains(alongX: boolean, a: number, b: number): Strip[] {
  const qa = Math.round(Math.max(0, Math.min(1, a)) * 30);
  const qb = Math.round(Math.max(0, Math.min(1, b)) * 30);
  const key = `${alongX}:${qa}:${qb}`;
  const kept = chainsKept.get(key);
  if (kept) return kept;
  const H = DOOR.high + 6;
  const F = new Flat(-32, 128, H);
  const scr = scrOf(alongX);
  const toU = (du: number): number => (alongX ? du + 48 - 0.5 : 48 - 0.5 - du);
  const set = (du: number, v: number, c: string): void => {
    if (v < 0) return;
    F.set(Math.round(toU(du)), Math.round(v), c);
  };
  void scr;
  // (the second chain drawn first: the first lies over it where they cross)
  for (const first of [false, true]) {
    const k = (first ? qa : qb) / 30;
    const e = chainEnds(first);
    // its ring, set in the jamb: it stays
    for (let t = 0; t < 10; t++) {
      const ang = (t / 10) * Math.PI * 2;
      set(Math.round(e.x0 + Math.cos(ang) * 2.5), Math.round(e.y0 + 1 + Math.sin(ang) * 2.5), Math.sin(ang) > 0 ? CHAIN[4] : CHAIN[1]);
    }
    // its staple, low in the other jamb: it stays
    for (const dx of [-2, 2]) for (let y = 0; y < 3; y++) set(e.x1 + dx, e.y1 - 2 + y, CHAIN[3]);
    const L = Math.hypot(e.x1 - e.x0, e.y1 - e.y0);
    const ex = (e.x1 - e.x0) / L;
    const ey = (e.y1 - e.y0) / L;
    const n = Math.floor(L / 7);
    const fall = Math.max(0, (k - 0.2) / 0.8);
    for (let i = 0; i <= n; i++) {
      const s = i / n;
      let x = e.x0 + (e.x1 - e.x0) * s;
      let y = e.y0 + (e.y1 - e.y0) * s;
      if (k >= 0.2) {
        // (falling: from its free end first; each link drops, and lies in the heap at the door's foot)
        const delay = (1 - s) * 0.35;
        const tf = Math.max(0, Math.min(1, (fall - delay) / 0.45));
        const heapX = e.x1 * 0.55 + (hash(i, first ? 1 : 2, 91) - 0.5) * 18;
        const heapY = 1 + Math.floor(hash(i, first ? 3 : 4, 93) * 4);
        x = x + (heapX - x) * tf * tf;
        y = y + (heapY - y) * tf * tf;
      }
      link(set, x, y, ex, ey, i % 2 === 0);
    }
    // its lock, on the chain's free end at the staple: it falls with it
    const lockTop = k < 0.2 ? e.y1 + 1 : e.y1 + 1 - (e.y1 - 2) * Math.min(1, fall * 2.2) ** 2;
    padlock(set, Math.round(e.x1 + (k >= 0.2 ? (e.x1 > 0 ? -3 : 3) * Math.min(1, fall * 2) : 0)), Math.round(Math.max(13, lockTop + 12)), k);
  }
  const out = F.strips(alongX);
  chainsKept.set(key, out);
  return out;
}

/**
 * WHERE ITS LIGHT IS: each lock's keyhole (the enemy's pink, dull; flaring as its key turns) and the seal's glow over the leaves while
 * they are barred, so that the door is seen across the mine's dark. Each (du along the plane from the way's middle, v up, its light).
 */
export function doorLights(a: number, b: number): { du: number; v: number; r: number; color: string; a: number }[] {
  const out: { du: number; v: number; r: number; color: string; a: number }[] = [];
  for (const first of [true, false]) {
    const k = first ? a : b;
    if (k >= 0.6) continue;
    const e = chainEnds(first);
    const flare = k > 0 && k < 0.2;
    out.push({ du: e.x1, v: e.y1 + 6, r: flare ? 22 : 12, color: flare ? ALIGHT[1] : DULL[1], a: flare ? 0.75 : 0.5 });
  }
  const barred = 1 - Math.min(1, Math.max(a, b) * 1.5);
  if (barred > 0) out.push({ du: 0, v: 24, r: 46, color: DULL[1], a: 0.3 * barred });
  return out;
}

/** A light alone, for the renderer to stand where one of the door's is (`v` game pixels over its foot). */
const glows = new Map<string, Sprite>();
export function glowAt(v: number, r: number, color: string, a: number): Sprite {
  const key = `${Math.round(v)}:${Math.round(r)}:${color}:${a.toFixed(2)}`;
  let s = glows.get(key);
  if (s) return s;
  s = { ...new Px(1, 1).sprite(0, 0, GRAIN), lights: [{ x: 0, y: -v, r, color, a }] };
  glows.set(key, s);
  return s;
}

// =================================================================================================
// THE KEY

/** THE KEY (for where it lies on the floor, and the bar's count): old black iron, its bow the cult's mark, the pink dull in its eyes. 18 by 10, its anchor its middle. */
let keyKept: Sprite | null = null;
export function key(): Sprite {
  if (keyKept) return keyKept;
  const p = new Px(20, 12);
  // the bow: the shrieking skull, small, in iron
  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 9; x++) {
      const mk = markPx(x - 4, y - 5, 4.4);
      if (mk === 'bone') p.set(x + 1, y + 1, markPx(x - 5, y - 4, 4.4) === null ? CHAIN[4] : CHAIN[3]);
      else if (mk === 'dark') p.set(x + 1, y + 1, y > 4 ? DULL[1] : CHAIN[0]);
    }
  }
  // the shaft and its bit
  for (let x = 9; x < 19; x++) {
    p.set(x, 5, CHAIN[4]);
    p.set(x, 6, CHAIN[2]);
  }
  for (const [x, h] of [[16, 3], [18, 2]] as const) for (let y = 0; y < h; y++) p.set(x, 7 + y, y === h - 1 ? CHAIN[1] : CHAIN[3]);
  // its outline, so it stands off the floor
  const q = new Px(20, 12);
  for (let y = 0; y < 12; y++) for (let x = 0; x < 20; x++) {
    if (p.get(x, y)) continue;
    if ([[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => p.get(x + dx, y + dy))) q.set(x, y, SEAM);
  }
  for (let y = 0; y < 12; y++) for (let x = 0; x < 20; x++) {
    const c = p.get(x, y);
    if (c) q.set(x, y, c);
  }
  keyKept = q.sprite(10, 6, GRAIN);
  return keyKept;
}
