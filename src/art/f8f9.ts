// FLOORS 8 AND 9 FROM HIS PHONE: THE PINEWOOD'S FOOTBRIDGES WHOLE, AND ECHO CANYON'S STRONGHOLD DOOR CARVED INTO ITS WALL
// (a mock-up behind F8F9_FIX, off: game/f8f9.ts; docs/mockups/f8f9_fixes/README.md).
//
// His words, 4 Nov 2026: 08:17, “The bridges in level 9 are really bad”; 08:21, “The bridges don’t line up but they also just
// look bad.”; 08:19, “This stronghold entrance is really weird looking, it’s like it’s floating.  Overlapping the top plateau
// section.”
//
// A FOOTBRIDGE (`bridgeArt`): one whole bridge for a crossing, laid along the crossing's own line, square to the stream, however
// the stream runs on the grid: two log stringers resting on both banks, planks of the wood's timber laid across them (each a little
// crooked, its own tone, nailed), a post at each end and two between on either side with a pole rail along their tops, the ends set
// into the banks with river stones; the stream runs on under it (the ground paints it). It comes in pieces for the game to lay in
// depth: the deck (stringers, planks, stones), which lies under every figure as the floor does, and each side's rail in three
// spans, which stand in depth, so that a body on the deck is in front of the far rail and behind the near one.
//
// THE CARVED DOOR (`carvedDoor`): the waystation's way in cut into the canyon's wall, as a door into rock is: a doorway sunk into
// the face (its left reveal and its floor seen, going in), framed in the cult's dressed stone (jambs in courses, a heavy lintel, a
// threshold step out onto the canyon floor), a steer's skull of the canyon's cattle over it; shut, a door of iron-bound timber set
// back in it; open, its two leaves swung in against the dark. Drawn in the plane of the wall's face (the face is the ground's own:
// art/terrain.ts cuts the wall straight there), anchored at the foot of the face at the door's middle. The banners and braziers
// stand either side of it on the canyon floor (game/act1_dress.ts), its apron of flags on the floor before it only.
//
// HIS RULES THEY KEEP: light from the upper left; real shapes (logs round, planks with thickness, stones rounded, the doorway a
// hole in the rock you see into); the indigo seam where one thing ends before another; nothing glows, nothing cyan.
//
// MADE COPIES: each floor's bridges (their angles are its own) and the door are made the first time they are asked for and kept
// until `forgetMade` (render/act1_pieces.ts lets them go as another floor is come into).

import { Px } from '../engine/px';
import type { Sprite } from '../engine/px';
import { Scene, toneAt } from './floor4';
import type { V3 } from './floor4';
import { IRON, TIMBER, add, fr, mul, rope } from './floor6';
import { DRESSED, FLAG } from './floor6';
import { BONE } from './floor7';
import { GRANITE, MOSS, PBARK } from './floor9';
import { GRAIN, hash } from './kit';
import type { Ramp } from './kit';

/** River stones at a bridge's ends, wet: darker, a sheen on their tops. */
const WETSTONE: Ramp = ['#2e3232', '#404646', '#565c5a', '#727874', '#929892'];
/** The deep dark inside the rock (his rulebook's cool dark base). */
const INSIDE = '#16101f';
/** A tile, in the Scene's measure (art/floor4.ts: 40 to a tile; heights in picture pixels). */
const KT = 40;

const norm = (a: V3): V3 => {
  const n = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / n, a[1] / n, a[2] / n];
};

/** A picture cut down to what is painted in it (to the grain), its anchor kept where it was. */
function cropped(p: Px, ox: number, oy: number): Sprite {
  let x0 = p.w;
  let y0 = p.h;
  let x1 = -1;
  let y1 = -1;
  for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) if (p.has(x, y)) {
    if (x < x0) x0 = x;
    if (y < y0) y0 = y;
    if (x > x1) x1 = x;
    if (y > y1) y1 = y;
  }
  if (x1 < 0) return new Px(GRAIN, GRAIN).sprite(0, 0, GRAIN);
  x0 -= x0 % GRAIN;
  y0 -= y0 % GRAIN;
  const w = Math.ceil((x1 + 1 - x0) / GRAIN) * GRAIN;
  const h = Math.ceil((y1 + 1 - y0) / GRAIN) * GRAIN;
  const q = new Px(w, h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (!p.has(x0 + x, y0 + y)) continue;
      const i = ((y0 + y) * p.w + x0 + x) * 4;
      const j = (y * w + x) * 4;
      q.d[j] = p.d[i];
      q.d[j + 1] = p.d[i + 1];
      q.d[j + 2] = p.d[i + 2];
      q.d[j + 3] = p.d[i + 3];
    }
  }
  return q.sprite(ox - x0, oy - y0, GRAIN);
}

// =================================================================================================
// THE FOOTBRIDGE

/** One piece of a bridge that stands (a span of rail and its posts): its picture, anchored at the bridge's middle; where it stands for depth (world, from the bridge's middle). */
export interface BridgeRail {
  s: Sprite;
  dx: number;
  dy: number;
}
/** A whole footbridge: the deck that lies under every figure, and its rails' spans that stand in depth (both anchored at the bridge's middle, at the floor's height). */
export interface BridgeArt {
  deck: Sprite;
  rails: BridgeRail[];
}

/** The canvas a bridge's pieces are painted on, and the world's origin on it (picture pixels). */
const BW = 300;
const BH = 170;
const BOX = 150;
const BOY = 100;

/**
 * A FOOTBRIDGE along world angle `ang` (radians; the way across the stream), `len` long and `wide` across (tiles); `seed` its own
 * (its planks' tones, its stones).
 */
export function bridgeArt(ang: number, len: number, wide: number, seed: number): BridgeArt {
  const A: V3 = [Math.cos(ang), Math.sin(ang), 0];
  const B: V3 = [-Math.sin(ang), Math.cos(ang), 0];
  const L = (len / 2) * KT;
  const Wd = (wide / 2) * KT;
  const P = (a: number, b: number, z: number): V3 => add(add(mul(A, a), mul(B, b)), [0, 0, z]);
  const h = (i: number, k: number): number => hash(i, seed, k);

  // ---- THE DECK: stones at its ends, its two stringers, its planks
  const S = new Scene(new Px(BW, BH), BOX, BOY);
  // its shadow on the water and the bank under its edges (light from the upper left: on its lower right side)
  const sh = (b: number): void => {
    S.quad([P(-L + 2, b, 0.05), P(L - 2, b, 0.05), P(L - 2, b + 5, 0.05), P(-L + 2, b + 5, 0.05)], () => '#0c0e1470', 1);
  };
  const onRight = (B[0] - B[1]) > 0;
  sh(onRight ? Wd - 1 : -Wd - 4);
  // the stones the bridge's ends are set into, on each bank: rounded, wet, moss at their foot
  let id = 10;
  for (const e of [-1, 1]) {
    for (let k = 0; k < 7; k++) {
      const a = e * (L - 2 + h(k + e * 10, 1) * 12);
      const b = (k / 6 - 0.5) * 2 * (Wd + 6) + (h(k + e * 10, 2) - 0.5) * 6;
      const r = 4 + h(k + e * 10, 3) * 3.5;
      const c = P(a, b, r * 0.2);
      S.egg(c, [A, B, [0, 0, 1]], [r * 1.15, r, r * 0.62], (n, w) => (w[2] < 0.9 ? toneAt(n, MOSS, -0.15) : n[2] > 0.86 ? WETSTONE[4] : toneAt(n, k % 3 ? WETSTONE : GRANITE, 0)), id++);
    }
  }
  // the two stringers: round logs along it, under the planks' ends, resting on the banks past them
  for (const sg of [-1, 1]) S.rod(P(-L - 7, sg * (Wd - 8), 0.6), P(L + 7, sg * (Wd - 8), 0.6), 3.6, 3.3, PBARK, 30 + (sg > 0 ? 1 : 0));
  // the planks across it, a finger's gap between each, each a little crooked and its own tone, nailed to the stringers
  const n = Math.floor((2 * L) / 7);
  const step = (2 * L) / n;
  for (let k = 0; k < n; k++) {
    const a = -L + step * (k + 0.5);
    const tw = (h(k, 5) - 0.5) * 0.06;
    const Ak = norm(add(A, mul(B, tw)));
    const Bk = norm(add(B, mul(A, -tw)));
    const half = Wd + (h(k, 6) - 0.5) * 3;
    const off = (h(k, 7) - 0.5) * 2.4;
    const tone = h(k, 8);
    S.box(P(a, off, 2.2), [Ak, Bk, [0, 0, 1]], [step * 0.42, half, 1.3], (f, u, v, nn) => {
      if (f === 4) {
        // its top: the grain along it, a nail over each stringer, moss here and there
        const across = (f === 4 ? v : u) * 2 * half - half;
        const along = u;
        if (Math.abs(Math.abs(across + off) - (Wd - 8)) < 1.1 && Math.abs(along - 0.5) < 0.18) return IRON[1];
        if (h(Math.floor(across / 3), k * 7 + 11) < 0.05) return MOSS[2];
        const g = fr(across / 9 + tone * 3);
        const base = tone > 0.72 ? 4 : tone < 0.2 ? 2 : 3;
        return TIMBER[g < 0.08 ? base - 1 : base];
      }
      if (f < 2) return toneAt(nn, TIMBER, -0.25);
      return TIMBER[1];
    }, 100 + k);
  }
  const deck = cropped(finishScene(S), BOX, BOY);

  // ---- THE RAILS: posts at its ends and two between on either side, a pole along their tops; each span its own piece
  const posts = [-L + 3, -L / 3, L / 3, L - 3];
  const rails: BridgeRail[] = [];
  for (const sg of [-1, 1]) {
    const b = sg * (Wd + 1.5);
    for (let k = 0; k < 3; k++) {
      const R = new Scene(new Px(BW, BH), BOX, BOY);
      const post = (a: number, end: boolean, pid: number): void => {
        const top = end ? 27 : 23;
        R.rod(P(a, b, 0), P(a, b, top), end ? 2.8 : 2.3, end ? 2.5 : 2.1, TIMBER, pid);
        R.ball(P(a, b, top), end ? 2.5 : 2.1, TIMBER, pid, undefined, 0.1);
      };
      post(posts[k], k === 0, 200 + k);
      if (k === 2) post(posts[3], true, 203);
      R.rod(P(posts[k], b, 21), P(posts[k + 1], b, 21), 1.5, 1.5, TIMBER, 210 + k);
      // (a lower rope rail between, sagging a little)
      rope(R, P(posts[k], b, 11), P(posts[k + 1], b, 11), 1.6, 220 + k);
      const mid = (posts[k] + posts[k + 1]) / 2;
      const at = P(mid, b, 0);
      rails.push({ s: cropped(finishScene(R), BOX, BOY), dx: at[0] / KT, dy: at[1] / KT });
    }
  }
  return { deck, rails };
}

/** A scene's picture with the seams in ink, before it is cut down (art/floor6.ts finish, without making the sprite). */
function finishScene(S: Scene): Px {
  S.seams();
  return S.p;
}

// =================================================================================================
// THE CARVED DOOR

/** The canvas the door is painted on, and the world's origin on it (picture pixels). */
const DW = 132;
const DH = 200;
const DOX = 64;
const DOY = 166;

/** The door's measures, in the Scene's (40 to a tile; heights in picture pixels): the opening's half width and height, how deep it is cut, the frame's width and how far it stands out. */
const DOOR = { half: 26, tall: 78, deep: 20, jamb: 13, out: 5, lintel: 20 };

/**
 * THE WAYSTATION'S DOOR CARVED INTO THE CANYON'S WALL, its wall running along x and looking toward +y (the face turned to the
 * screen's lower left, in the light): shut, or `open`.
 */
export function carvedDoor(open: boolean): Sprite {
  const S = new Scene(new Px(DW, DH), DOX, DOY);
  const D = DOOR;
  const shadeIn = (c: string, k: number): string => mixHex(c, INSIDE, k);
  // ---- INSIDE: the passage's floor going in, its left reveal (the right one is out of sight), its back
  S.quad([[-D.half, 0.2, 0.2], [D.half, 0.2, 0.2], [D.half, -D.deep - (open ? 30 : 0), 0.2], [-D.half, -D.deep - (open ? 30 : 0), 0.2]], (u, v) => {
    const c = FLAG[fr(u * 3) < 0.06 || fr(v * 2) < 0.08 ? 0 : 2];
    return shadeIn(c, 0.35 + 0.5 * v);
  }, 1);
  S.quad([[-D.half, 0.2, 0], [-D.half, -D.deep - (open ? 30 : 0), 0], [-D.half, -D.deep - (open ? 30 : 0), D.tall], [-D.half, 0.2, D.tall]], (u, v) => {
    const course = Math.floor(v * 4);
    const c = DRESSED[fr(v * 4) < 0.08 || fr(u * 2 + (course % 2) * 0.5) < 0.06 ? 0 : 1];
    return shadeIn(c, 0.5 + 0.4 * u);
  }, 2);
  if (!open) {
    // the door of the cult: upright planks of timber, iron bands across them, studs, a ring
    S.quad([[-D.half, -D.deep, 0], [D.half, -D.deep, 0], [D.half, -D.deep, D.tall], [-D.half, -D.deep, D.tall]], (u, v) => {
      const z = v * D.tall;
      const x = u * 2 * D.half;
      if (Math.abs(z - 18) < 2.2 || Math.abs(z - 58) < 2.2) return Math.abs(z - 18) < 0.8 || Math.abs(z - 58) < 0.8 ? IRON[3] : IRON[1];
      if ((Math.abs(z - 18) < 4 || Math.abs(z - 58) < 4) && fr(x / 8) < 0.12) return IRON[2];
      // the ring, at its middle
      const dr = Math.hypot(x - D.half - 6, z - 38);
      if (dr > 2.4 && dr < 3.6) return IRON[3];
      const p = Math.floor(x / 8.7);
      const g = fr(x / 8.7);
      if (g < 0.1) return TIMBER[0];
      const c = TIMBER[g < 0.3 ? 3 : hash(p, 3, 931) > 0.6 ? 2 : 1];
      return shadeIn(c, 0.3);
    }, 3);
  } else {
    // the dark beyond, and the two leaves swung in against it (the left one seen, along its reveal)
    S.quad([[-D.half, -D.deep - 30, 0], [D.half, -D.deep - 30, 0], [D.half, -D.deep - 30, D.tall], [-D.half, -D.deep - 30, D.tall]], () => INSIDE, 3);
    S.quad([[-D.half + 2, -D.deep, 0], [-D.half + 2, -D.deep - 28, 0], [-D.half + 2, -D.deep - 28, D.tall - 4], [-D.half + 2, -D.deep, D.tall - 4]], (u, v) => {
      const z = v * D.tall;
      if (Math.abs(z - 18) < 2 || Math.abs(z - 58) < 2) return shadeIn(IRON[2], 0.4);
      return shadeIn(TIMBER[fr(u * 3.2) < 0.12 ? 0 : 2], 0.35 + 0.4 * u);
    }, 4);
  }
  // ---- THE FRAME of the cult's dressed stone, standing out of the face: jambs in courses, the lintel, the threshold
  const block = (x0: number, x1: number, z0: number, z1: number, out: number, bid: number): void => {
    S.box([(x0 + x1) / 2, out / 2, (z0 + z1) / 2], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [(x1 - x0) / 2, out / 2, (z1 - z0) / 2], (f, u, v, nn) => {
      // (the face toward the yard: dressed, tool marks across, its edges a shade lighter where the light catches them)
      if (f === 2) {
        // (its edges: the upper and left ones catching the light, the lower and right in shade; tool marks across it)
        if (v > 0.92 || u < 0.05) return DRESSED[3];
        if (v < 0.06 || u > 0.95) return DRESSED[1];
        if (hash(Math.floor(u * 9), Math.floor(v * 12), bid) < 0.07) return DRESSED[1];
        return DRESSED[2];
      }
      if (f === 4) return DRESSED[3];
      return toneAt(nn, DRESSED, -0.35);
    }, bid);
  };
  const courses: [number, number][] = [[0, 26], [26, 50], [50, D.tall]];
  courses.forEach(([z0, z1], i) => {
    const wide = i % 2 ? 3 : 0;
    block(-D.half - D.jamb - wide, -D.half, z0 + 0.4, z1 - 0.4, D.out, 40 + i);
    block(D.half, D.half + D.jamb + (i % 2 ? 0 : 3), z0 + 0.4, z1 - 0.4, D.out, 50 + i);
  });
  block(-D.half - D.jamb - 6, D.half + D.jamb + 6, D.tall, D.tall + D.lintel, D.out + 1, 60);
  // the threshold, a step out onto the canyon floor
  S.box([0, 5, 1.6], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [D.half + 8, 6, 1.6], (f, u, _v, nn) => (f === 4 ? (fr(u * 3) < 0.05 ? DRESSED[1] : DRESSED[3]) : toneAt(nn, DRESSED, -0.3)), 70);
  // ---- THE CANYON'S CATTLE: a steer's skull on the lintel, its horns out wide
  const sc: V3 = [0, D.out + 3, D.tall + D.lintel + 7];
  S.egg(sc, [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [5, 3.6, 6], (nn, w) => {
    // (its eyes, two dark sockets; its muzzle narrowing down)
    if (nn[1] > 0.55 && Math.abs(Math.abs(w[0]) - 2.2) < 1.1 && w[2] > sc[2] && w[2] < sc[2] + 2.6) return '#2a2420';
    return toneAt(nn, BONE, 0.1);
  }, 80);
  S.egg([0, D.out + 3, D.tall + D.lintel + 1.5], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [3, 3, 3.4], (nn) => toneAt(nn, BONE, 0), 81);
  for (const sg of [1, -1]) {
    const root: V3 = [sg * 4, D.out + 3, D.tall + D.lintel + 10];
    const mid: V3 = [sg * 12, D.out + 3, D.tall + D.lintel + 12];
    const tip: V3 = [sg * 18, D.out + 2, D.tall + D.lintel + 20];
    S.rod(root, mid, 1.8, 1.3, BONE, 82);
    S.rod(mid, tip, 1.3, 0.5, BONE, 82);
  }
  return cropped(finishScene(S), DOX, DOY);
}

/** `a` mixed `k` of the way to `b` (hex colours). */
function mixHex(a: string, b: string, k: number): string {
  const p = (c: string, i: number): number => parseInt(c.slice(1 + 2 * i, 3 + 2 * i), 16);
  const m = (i: number): string => Math.round(p(a, i) + (p(b, i) - p(a, i)) * Math.max(0, Math.min(1, k))).toString(16).padStart(2, '0');
  return `#${m(0)}${m(1)}${m(2)}`;
}

// =================================================================================================
// THE MADE COPIES

const BRIDGES = new Map<string, BridgeArt>();
const DOORS = new Map<boolean, Sprite>();
/** A bridge's pieces, made the first time they are asked for. */
export function bridgeOf(ang: number, len: number, wide: number, seed: number): BridgeArt {
  const key = `${ang.toFixed(4)}:${len}:${wide}:${seed}`;
  let b = BRIDGES.get(key);
  if (!b) {
    b = bridgeArt(ang, len, wide, seed);
    BRIDGES.set(key, b);
  }
  return b;
}
/** The carved door, shut or open, made the first time it is asked for. */
export function doorOf(open: boolean): Sprite {
  let d = DOORS.get(open);
  if (!d) {
    d = carvedDoor(open);
    DOORS.set(open, d);
  }
  return d;
}
/** Let go of every made copy (a floor's bridges, the door): made again if wanted. */
export function forgetMade(): void {
  BRIDGES.clear();
  DOORS.clear();
}
