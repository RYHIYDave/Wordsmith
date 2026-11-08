// THE SWAMP COLOSSUS'S MOVES, PART 3B: THE PIECES ON THE STONE, SMASHED BY HIS FIRST SHOVEL (a mock-up behind EYE2, off; nothing of the
// game imports it: tests/eye_pieces.test.ts). The owner, 8 Nov 2026, asked what becomes of the pieces on the stone in the tentacles' way
// (offered as: the first shovel breaks them, chunks flying; rubble left after): “Smashed by the first sweep (Recommended)”. His rules:
// Movement 9, “Action, like a movie”, big and wild, nothing passes through anything, “Everything drawn should not just look like shapes.
// That’s the rule”, nothing ruled.
//
// What is here: the arena's pieces lying on the stone (its two broken columns at the back corners, the mossy stones by the back edge and
// toward the near edge, the fallen column drums by the near edge), where each is (`PIECES`), its body (for the hooks: never through it
// whole), the frame the first shovel's hook reaches it (`pieceHits`: the hook ploughs into it, a jolt in the hook, the screen jolted) and
// how it breaks, each kind its own way: A COLUMN falls and breaks across (its plinth burst, its shaft toppling off it, landing and
// breaking into three, the pieces sliding apart; the foot of its plinth left, low and broken); THE DRUMS roll and crack (the one the hook meets cracks apart and
// flies, the others rolling on and cracking as they stop); THE MOSSY STONES split (each in two, the halves flying, moss torn off). Each
// broken piece is its own picture's pixels (`breakPiece`: each fragment keeps the look of the part it was, its broken faces dark, the
// edges over them lit), and chips of stone fly with them (`chipsOf`: drawn as stone, irregular, lit tops and dark faces, some mossy);
// where they come to rest is the RUBBLE, left for the rest of the fight (the next shovels' hooks drag over it, scattering grit:
// `rubbleScatter`). The burst of grit, dust and moss torn off is the game's effect drawn over (the pictures' tool draws it).

import { STONE } from './eye_colossus';
import { ARM_COLOURS, QUAY, STONE_BOX, UNIT } from './eye_arms';
import { EYE_FPS } from './eye_moves';
import type { EyeFrame } from './eye_moves';
import { HEAD_LOOP, SCRAPERS, SCRAPE, SCRAPE_FRAMES, SHOVEL, headLocal, headWorld, heroWorld, scraperAt, shovelFrame, sideOf } from './eye_shovel';
import type { End } from './eye_shovel';

const SEEN = 2 / Math.sqrt(3);
const R3 = Math.sqrt(3);
const TAU = Math.PI * 2;
const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));
const sm = (a: number, b: number, v: number): number => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const mod = (a: number, n: number): number => ((a % n) + n) % n;
const hs = (a: number, b: number, c: number): number => {
  const v = Math.sin(a * 127.1 + b * 311.7 + c * 74.7) * 43758.5453;
  return v - Math.floor(v);
};
const noise1 = (x: number, s: number): number => {
  const xi = Math.floor(x);
  const f = x - xi;
  const u = f * f * (3 - 2 * f);
  return hs(xi, s, 3) + (hs(xi + 1, s, 3) - hs(xi, s, 3)) * u;
};
/** Gravity (his lengths a second a second; the flyers' own). */
const G = 420;

// =============================================================================================
// THE PIECES ON THE STONE

export type PieceKind = 'column' | 'stones' | 'drums';
/** A piece lying on the stone: its kind, its picture (the arena's, by name: art/floor10.ts `fenPieces`), where its foot is (the arena's
 *  units across and down from the water's edge, as tools/eye_moves_pics.ts lays the arena; and his lengths in the world), its body (on
 *  the stone, from its foot: capsules, how thick and how high), and its picture's size and foot (picture pixels). */
export interface Piece {
  id: string;
  kind: PieceKind;
  name: string;
  du: number;
  dv: number;
  x: number;
  y: number;
  body: ReadonlyArray<{ a: readonly [number, number]; b: readonly [number, number]; r: number; h: number }>;
  pic: { w: number; h: number; ax: number; ay: number };
}
const HALF = (STONE.across * Math.SQRT2) / 2;
const BODY: Record<PieceKind, Piece['body']> = {
  column: [
    { a: [0, 0], b: [0, 0], r: 24, h: 12 },
    { a: [0, 0], b: [0, 0], r: 11, h: 118 },
  ],
  stones: [{ a: [-6, -6], b: [20, 12], r: 12, h: 13 }],
  drums: [{ a: [-17, -26], b: [10, 38], r: 19, h: 27 }],
};
const PIC: Record<PieceKind, Piece['pic']> = {
  column: { w: 90, h: 160, ax: 45, ay: 140 },
  stones: { w: 90, h: 50, ax: 45, ay: 32 },
  drums: { w: 190, h: 100, ax: 95, ay: 62 },
};
const NAME: Record<PieceKind, string> = { column: 'a broken column', stones: 'mossy stones', drums: 'fallen column drums' };
const piece = (id: string, kind: PieceKind, du: number, dv: number): Piece => ({ id, kind, name: NAME[kind], du, dv, x: du * UNIT, y: (QUAY + dv) * UNIT, body: BODY[kind], pic: PIC[kind] });
/** THE PIECES ON THE STONE, as the arena lays them. */
export const PIECES: readonly Piece[] = [
  piece('column, right', 'column', HALF - 1.2, 0.9),
  piece('column, left', 'column', -(HALF - 1.2), 0.9),
  piece('mossy stones, back', 'stones', 4, 1.4),
  piece('mossy stones, near', 'stones', -8, 9.5),
  piece('drums', 'drums', 9, 11),
];

// =============================================================================================
// WHERE THE FIRST SHOVEL'S HOOKS REACH THEM

/** The points of a hook (with their thickness) in the world at frame `k` of the shovel at end `e`, the scraper `i`: as it is painted
 *  and laid (its writhe, how far it is drawn back, how far down). */
export function hookPoints(e: End, i: number, k: number): number[][] {
  const A = scraperAt(e, i, k);
  if (!A) return [];
  const H = headLocal(SCRAPERS[i].edge, mod(k, HEAD_LOOP) / HEAD_LOOP, A.back);
  return headWorld(e, SCRAPERS[i].edge, H, A.X).map((q) => [q[0], q[1], q[2] - A.drop, q[3]]);
}
/** How far a point with its thickness is from a piece's body (less than 0: in it). */
export function intoPiece(P: Piece, q: readonly number[]): number {
  let g = Infinity;
  for (const B of P.body) {
    const ax = P.x + B.a[0];
    const ay = P.y + B.a[1];
    const bx = P.x + B.b[0];
    const by = P.y + B.b[1];
    const vx = bx - ax;
    const vy = by - ay;
    const L2 = vx * vx + vy * vy;
    const u = L2 > 0 ? clamp01(((q[0] - ax) * vx + (q[1] - ay) * vy) / L2) : 0;
    const d = Math.hypot(q[0] - ax - vx * u, q[1] - ay - vy * u) - B.r - q[3];
    // (beside it, over it, or under the stone)
    const over = q[2] - q[3] - B.h;
    const under = -(q[2] + q[3]);
    g = Math.min(g, Math.max(d, over, under));
  }
  return g;
}
/** Where a hook meets a piece: the frame, the hook, the point of it nearest the piece, and which way the hook goes (across). */
export interface PieceHit { k: number; i: number; at: [number, number, number]; dir: number; inw: number }
const HITS = new Map<string, PieceHit | null>();
/** THE FRAME THE FIRST SHOVEL'S HOOK REACHES EACH PIECE (his shovel at the left end, `s1`): the first frame any hook's tube meets its
 *  body; from it on the piece is broken (so no hook passes through it whole). */
export function pieceHit(P: Piece): PieceHit | null {
  if (HITS.has(P.id)) return HITS.get(P.id) as PieceHit | null;
  const e: End = 'left';
  let hit: PieceHit | null = null;
  for (let k = SCRAPERS[0].k0; k < SCRAPERS[SCRAPERS.length - 1].k0 + SCRAPE_FRAMES && !hit; k++) {
    for (let i = 0; i < SCRAPERS.length && !hit; i++) {
      const T = hookPoints(e, i, k);
      let best = Infinity;
      let at: number[] = [];
      for (const q of T) {
        const g = intoPiece(P, q);
        if (g < best) {
          best = g;
          at = q;
        }
      }
      if (best < 0) {
        // (where they meet: from the middle of the hook's tube out to its skin, toward the piece; never past the piece's own face)
        const B = P.body[P.body.length - 1];
        const ax = P.x + B.a[0];
        const ay = P.y + B.a[1];
        const vx = P.x + B.b[0] - ax;
        const vy = P.y + B.b[1] - ay;
        const L2 = vx * vx + vy * vy;
        const u = L2 > 0 ? clamp01(((at[0] - ax) * vx + (at[1] - ay) * vy) / L2) : 0;
        const dx = ax + vx * u - at[0];
        const dy = ay + vy * u - at[1];
        const d = Math.hypot(dx, dy) || 1;
        const m = Math.min(at[3], Math.max(0, d - B.r * 0.5));
        hit = { k, i, at: [at[0] + (dx / d) * m, at[1] + (dy / d) * m, Math.max(4, Math.min(at[2] - at[3] * 0.5, B.h * 0.7))], dir: sideOf(e), inw: SCRAPERS[i].edge === 'back' ? 1 : -1 };
      }
    }
  }
  HITS.set(P.id, hit);
  return hit;
}
/** Every piece's hit (the first shovel's). */
export const pieceHits = (): Array<PieceHit | null> => PIECES.map(pieceHit);

// =============================================================================================
// HOW EACH BREAKS: ITS FRAGMENTS, EACH ITS OWN PIXELS OF ITS PICTURE

/** A fragment of a piece: its pixels are those of the piece's picture `partition` gives it. How it moves: `stay` (the foot of a column's
 *  plinth, the ground under it: left as they are), `fall` (a column's shaft: toppling off its plinth, then landing and sliding apart), `fly`
 *  (flung and tumbling, bouncing, settling), `roll` (a drum rolling on and cracking as it stops). `c`: where its middle is in the
 *  picture (picture pixels). */
export interface Frag { n: number; move: 'stay' | 'fall' | 'fly' | 'roll'; c: [number, number]; size: number; v?: [number, number, number]; spin?: number; split?: number }
/** A piece's broken plan: its fragments, and for a column which way it falls (on the stone: across and down it). */
export interface Broken { frags: Frag[]; fall?: [number, number] }
/** A column's shaft, in its picture: its middle across at its foot on the plinth and its lean (across for each pixel up), its top, where
 *  across it breaks, its foot; how thick (his lengths, round its middle). */
export const SHAFT = { x: 46, lean: 0.11, cuts: [62, 87] as const, top: 40, plinth: 127, r: 9 } as const;
/** The stones and the drums in their pictures: each one's middle, and how big. */
const STONES = [[39, 23], [54, 27], [68, 33]] as const;
const DRUMS = [[75, 35], [88, 53], [107, 72]] as const;
const BROKEN = new Map<string, Broken>();
/** Thrown out of the hook's way: inward over the stone (away from the edge the hook comes along: where it has already passed, its parts
 *  further in going by first), and a little on the way it goes; up. Speeds (his lengths a second) from `a` to `b`. */
function thrown(dir: number, inw: number, a: number, b: number, seed: number, m: number): [number, number, number] {
  const sp = a + (b - a) * hs(seed, m, 6);
  const ang = 0.25 + 0.75 * hs(seed, m, 7);
  return [dir * sp * Math.cos(ang) * 0.6, inw * sp * Math.sin(ang) + inw * 20, 60 + 90 * hs(seed, m, 8)];
}
/** WHICH WAY A COLUMN FALLS: the way, of those round about, on which its toppling shaft and then its pieces lying are clearest of every
 *  hook of the shovel (in the frames it falls and lies through), lying on the stone (never off its ends, where he comes up, nor over its
 *  back edge), and lying clear of the Warrior's way (his weave at each end, from when it lies: he never runs through it); and seen
 *  falling: across the screen more than toward you or away (away, it would only seem to shorten); the way the hook goes and inward
 *  first. */
function fallWay(P: Piece, H: PieceHit | null): [number, number] {
  const L = SHAFT.plinth - SHAFT.top;
  const pivotZ = P.pic.ay - SHAFT.plinth;
  const px = P.x + (SHAFT.x - P.pic.ax) / SEEN;
  const k0 = H ? H.k : 0;
  const dir = H ? H.dir : -1;
  const inw = H ? H.inw : 1;
  let best: [number, number] = [0, inw];
  let bestScore = Infinity;
  for (let q = 0; q < 36; q++) {
    const a = (q / 36) * TAU;
    const d: [number, number] = [Math.cos(a), Math.sin(a)];
    const ex = px + d[0] * (L + 20);
    const ey = P.y + d[1] * (L + 20);
    if (ex < STONE_BOX.x0 + 12 || ex > STONE_BOX.x1 - 12 || ey > STONE_BOX.y1 - 12 || ey < STONE_BOX.y0 + 12 || Math.abs(d[0]) < 0.5) continue;
    let score = 0;
    for (let k = k0; k < k0 + 50; k++) {
      const s = (k - k0) / EYE_FPS;
      const phi = s < COLUMN_FALL ? (Math.PI / 2) * (s / COLUMN_FALL) ** 2 : Math.PI / 2;
      for (let i = 0; i < SCRAPERS.length; i++) {
        for (const t of hookPoints('left', i, k)) {
          for (let u = 0; u <= L; u += 8) {
            const x = px + d[0] * u * Math.sin(phi);
            const y = P.y + d[1] * u * Math.sin(phi);
            const z = Math.max(11, pivotZ * (1 - Math.sin(phi)) + u * Math.cos(phi));
            if (Math.hypot(t[0] - x, t[1] - y, t[2] - z) < t[3] + 12) score++;
          }
        }
      }
    }
    // (the Warrior's way, at each end, from when it lies: the shaft lying from its foot along the way it fell, as thick as it is and
    // him as wide as he is, never on it)
    let hero = Infinity;
    for (const e of ['left', 'right'] as End[]) for (let k = e === 'left' ? k0 : 0; k < SHOVEL.frames; k++) {
      const h = heroWorld(e, k);
      const u = Math.max(0, Math.min(L + 10, (h.x - px) * d[0] + (h.y - P.y) * d[1]));
      hero = Math.min(hero, Math.hypot(h.x - px - d[0] * u, h.y - P.y - d[1] * u));
    }
    if (hero < HERO_CLEAR) score += 1000 * (HERO_CLEAR - hero);
    // (and the next shovel's hooks over where it lies: they ride up over what is low, so only a little)
    const pref = 0.01 * (1 - (d[0] * dir * 0.5 + d[1] * inw));
    if (score + pref < bestScore) {
      bestScore = score + pref;
      best = d;
    }
  }
  return best;
}
/** Which of a piece's stones a fragment was part of (its breaks are only against the others of that one: a column all one; each mossy
 *  stone and each drum its own; -1, the ground round them). */
export function bodyOf(P: Piece, f: Frag): number {
  if (P.kind === 'column') return 0;
  if (f.n === 0) return -1;
  if (P.kind === 'stones') return Math.floor((f.n - 1) / 2);
  let best = 0;
  DRUMS.forEach((d, q) => {
    if (Math.hypot(f.c[0] - d[0], f.c[1] - d[1]) < Math.hypot(f.c[0] - DRUMS[best][0], f.c[1] - DRUMS[best][1])) best = q;
  });
  return best;
}
/** How clear of the Warrior a column's shaft lies (his lengths from its middle to his: its thickness, his, and a little). */
export const HERO_CLEAR = 34;
/** A PIECE'S BROKEN PLAN, from the hook that meets it (its frame, where, which way it goes). */
export function brokenOf(P: Piece): Broken {
  const got = BROKEN.get(P.id);
  if (got) return got;
  const H = pieceHit(P);
  const dir = H ? H.dir : -1;
  const inw = H ? H.inw : 1;
  const seed = P.id.length * 7 + Math.round(P.x);
  const frags: Frag[] = [];
  let fall: [number, number] | undefined;
  if (P.kind === 'column') {
    // (the foot of its plinth left, low and broken; the plinth burst into three; the shaft broken off it, falling, breaking across in three)
    frags.push({ n: 0, move: 'stay', c: [40, 148], size: 6 });
    [[20, 136], [37, 138], [55, 138]].forEach((c, q) => frags.push({ n: 1 + q, move: 'fly', c: c as [number, number], size: 8, v: thrown(dir, inw, 40, 85, seed, 20 + q), spin: (3 + 3 * hs(seed, q, 21)) * (q % 2 ? -1 : 1) }));
    const bands = [[SHAFT.top, SHAFT.cuts[0]], [SHAFT.cuts[0], SHAFT.cuts[1]], [SHAFT.cuts[1], SHAFT.plinth]];
    bands.forEach(([a, b], q) => frags.push({ n: 4 + q, move: 'fall', c: [SHAFT.x + SHAFT.lean * (SHAFT.plinth - (a + b) / 2), (a + b) / 2], size: (b - a) / 2, v: [25 + 18 * (2 - q) + 15 * hs(seed, q, 1), (hs(seed, q, 2) - 0.5) * 30, 25 + 30 * hs(seed, q, 3)], spin: (hs(seed, q, 4) - 0.5) * 0.4 }));
    fall = fallWay(P, H);
  } else if (P.kind === 'stones') {
    frags.push({ n: 0, move: 'stay', c: [45, 32], size: 20 });
    STONES.forEach(([cx, cy], q) => {
      const ang = TAU * hs(seed, q, 5);
      for (const side of [-1, 1]) {
        const m = frags.length;
        frags.push({ n: m, move: 'fly', c: [cx + side * 3 * Math.cos(ang), cy + side * 3 * Math.sin(ang)], size: 6, v: thrown(dir, inw, 70, 130, seed, m), spin: (5 + 5 * hs(seed, m, 9)) * (hs(seed, m, 10) < 0.5 ? -1 : 1), split: ang + (side > 0 ? 0 : Math.PI) });
      }
    });
  } else {
    frags.push({ n: 0, move: 'stay', c: [95, 62], size: 40 });
    // (the drum the hook meets first cracks into three and flies; the others roll on, cracking in two as they stop)
    const hx = H ? H.at[0] : P.x - dir * 100;
    const hy = H ? H.at[1] : P.y;
    const drumW = (q: number): [number, number] => [P.x + (DRUMS[q][0] - P.pic.ax) / SEEN, P.y + (DRUMS[q][1] - P.pic.ay + 12) * R3];
    let first = 0;
    for (let q = 1; q < 3; q++) if (Math.hypot(drumW(q)[0] - hx, drumW(q)[1] - hy) < Math.hypot(drumW(first)[0] - hx, drumW(first)[1] - hy)) first = q;
    DRUMS.forEach(([cx, cy], q) => {
      if (q === first) {
        for (let w = 0; w < 3; w++) {
          const m = frags.length;
          const a = TAU * (w / 3 + hs(seed, q, 11));
          frags.push({ n: m, move: 'fly', c: [cx + 8 * Math.cos(a), cy + 8 * Math.sin(a)], size: 9, v: thrown(dir, inw, 50, 90, seed, m), spin: (3 + 3 * hs(seed, m, 15)) * (w % 2 ? -1 : 1), split: a });
        }
      } else {
        for (const side of [-1, 1]) {
          const m = frags.length;
          const dist = 30 + 25 * hs(seed, q, 16) + (q === 2 ? 10 : 0);
          frags.push({ n: m, move: 'roll', c: [cx + side * 4, cy], size: 12, v: [dir * dist * 0.5, inw * dist, 0], spin: 0, split: side });
        }
      }
    });
  }
  const B: Broken = { frags, fall };
  BROKEN.set(P.id, B);
  return B;
}
/** WHICH FRAGMENT EACH PIXEL OF A PIECE'S PICTURE IS (-1: none, transparent): the column's plinth burst in three over its foot, its
 *  shaft broken off it and across in three, the breaks jagged; each stone split in two along a jagged line; each drum on its own, the first cracked in three, the rest in two; what
 *  is round them (the plinth, its moss, the ground's ring) left. */
export function partition(P: Piece, w: number, h: number, alpha: ArrayLike<number>): Int16Array {
  const B = brokenOf(P);
  const out = new Int16Array(w * h).fill(-1);
  const seed = P.id.length * 7 + Math.round(P.x);
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    const q = j * w + i;
    if (!alpha[q]) continue;
    if (P.kind === 'column') {
      // (each break jagged, and slanting across the shaft its own way)
      const jag = (y: number, s: number, slant = 0): number => y + slant * (i - SHAFT.x) + 6 * (noise1(i * 0.4, seed + s) - 0.5) + 3 * (noise1(i * 1.3, seed + s + 9) - 0.5);
      const jagX = (x: number, s: number): number => x + 3 * (noise1(j * 0.5, seed + s) - 0.5);
      const shaftX = SHAFT.x + SHAFT.lean * (SHAFT.plinth - j);
      const inShaft = Math.abs(i - shaftX) < 16 && j < jag(SHAFT.plinth, 1);
      if (inShaft) out[q] = j < jag(SHAFT.cuts[0], 3, 0.3) ? 4 : j < jag(SHAFT.cuts[1], 4, -0.25) ? 5 : 6;
      else if (j >= jag(146, 5)) out[q] = 0;
      else out[q] = i < jagX(28, 6) ? 1 : i < jagX(46, 7) ? 2 : 3;
    } else if (P.kind === 'stones') {
      let best = 0;
      let bd = Infinity;
      STONES.forEach(([cx, cy], s) => {
        const d = Math.hypot(i - cx, (j - cy) * 1.5);
        if (d < bd) {
          bd = d;
          best = s;
        }
      });
      if (bd > 15) {
        out[q] = 0;
        continue;
      }
      const a = B.frags[1 + best * 2].split as number;
      const [cx, cy] = STONES[best];
      const along = (i - cx) * Math.cos(a) + (j - cy) * Math.sin(a) + 1.5 * (noise1(((i - cx) * -Math.sin(a) + (j - cy) * Math.cos(a)) * 0.5, seed + best) - 0.5);
      out[q] = along >= 0 ? 1 + best * 2 : 2 + best * 2;
    } else {
      let best = 0;
      let bd = Infinity;
      DRUMS.forEach(([cx, cy], s) => {
        const d = Math.hypot(i - cx, j - cy);
        if (d < bd) {
          bd = d;
          best = s;
        }
      });
      if (bd > 27) {
        out[q] = 0;
        continue;
      }
      // (this drum's fragments, in order)
      const mine = B.frags.filter((f) => f.n > 0 && Math.hypot(f.c[0] - DRUMS[best][0], f.c[1] - DRUMS[best][1]) < 12);
      if (mine.length === 3) {
        const [cx, cy] = DRUMS[best];
        const a = Math.atan2(j - cy, i - cx) + 0.4 * (noise1(Math.hypot(i - cx, j - cy) * 0.4, seed + best) - 0.5);
        const a0 = mine[0].split as number;
        out[q] = mine[Math.floor(mod(a - a0 + Math.PI / 3, TAU) / (TAU / 3)) % 3].n;
      } else {
        const [cx] = DRUMS[best];
        const cut = cx + 1.5 * (noise1(j * 0.5, seed + best) - 0.5);
        out[q] = (i < cut ? mine[0] : mine[1]).n;
      }
    }
  }
  return out;
}

// =============================================================================================
// HOW EACH FRAGMENT MOVES, AND WHERE IT COMES TO REST

/** Where a fragment is, `s` seconds after its piece is hit: its middle in the world (his lengths; `z` its middle's height), its turn in
 *  the picture (radians), for a column's shaft its fall (0 standing, π/2 lying) and its way along the stone, and whether it has come to
 *  rest. */
export interface FragAt { x: number; y: number; z: number; turn: number; fall: number; way: [number, number]; rest: boolean; gone: number }
/** How long a column's shaft takes to fall (seconds), and how it lands. */
export const COLUMN_FALL = 0.42;
/** Flung, tumbling, bouncing twice, sliding to rest: kept on the stone (flung more gently if it would leave it). */
function flight(x0: number, y0: number, z0: number, v: readonly number[], spin: number, zr: number, s: number): { x: number; y: number; z: number; turn: number; rest: boolean; restAt: number } {
  let k = 1;
  for (let tries = 0; tries < 12; tries++) {
    const r = sim(x0, y0, z0, v[0] * k, v[1] * k, v[2], spin, zr, 99);
    if (r.x > STONE_BOX.x0 + 8 && r.x < STONE_BOX.x1 - 8 && r.y > STONE_BOX.y0 + 8 && r.y < STONE_BOX.y1 - 8) break;
    k *= 0.8;
  }
  return sim(x0, y0, z0, v[0] * k, v[1] * k, v[2], spin, zr, s);
}
function sim(x0: number, y0: number, z0: number, vx0: number, vy0: number, vz0: number, spin0: number, zr: number, s: number): { x: number; y: number; z: number; turn: number; rest: boolean; restAt: number } {
  let x = x0;
  let y = y0;
  let z = z0;
  let vx = vx0;
  let vy = vy0;
  let vz = vz0;
  let spin = spin0;
  let turn = 0;
  let bounces = 0;
  let t = 0;
  const dt = 1 / 240;
  let rest = false;
  while (t < s - 1e-9) {
    const d = Math.min(dt, s - t);
    if (bounces < 3) {
      vz -= G * d;
      x += vx * d;
      y += vy * d;
      z += vz * d;
      turn += spin * d;
      if (z <= zr) {
        z = zr;
        bounces++;
        vz = -vz * 0.3;
        vx *= 0.55;
        vy *= 0.55;
        spin *= 0.45;
        if (bounces >= 2 || vz < 20) bounces = 3;
      }
    } else {
      // (sliding, slowing to rest)
      const sp = Math.hypot(vx, vy);
      const dec = 700 * d;
      if (sp <= dec) {
        vx = 0;
        vy = 0;
        spin = 0;
        rest = true;
        t += d;
        // (and lies)
        const restAt = t;
        return { x, y, z, turn, rest: true, restAt: s >= restAt ? restAt : restAt };
      }
      vx -= (vx / sp) * dec;
      vy -= (vy / sp) * dec;
      x += vx * d;
      y += vy * d;
      turn += spin * d * 0.5;
      spin *= 1 - 3 * d;
    }
    t += d;
  }
  return { x, y, z, turn, rest, restAt: rest ? t : Infinity };
}
/** WHERE A FRAGMENT IS, `s` seconds after its piece is hit (and where its picture's middle starts: in the world, by its picture). */
export function fragAt(P: Piece, f: Frag, s: number): FragAt {
  const B = brokenOf(P);
  // (its middle at the start: in the world, from its picture; on the ground, a stone's or a drum's middle as high as it is big)
  const rx = (f.c[0] - P.pic.ax) / SEEN;
  if (f.move === 'stay' || s <= 0) {
    const z = f.move === 'fall' ? P.pic.ay - f.c[1] : f.size;
    return { x: P.x + rx, y: P.y + (f.c[1] - P.pic.ay + z) * R3 * (f.move === 'fall' ? 0 : 1), z, turn: 0, fall: 0, way: B.fall ?? [1, 0], rest: true, gone: 0 };
  }
  if (f.move === 'fall') {
    const way = B.fall as [number, number];
    // (toppling about its foot on the plinth, faster and faster; its middle `u` up the shaft from there)
    const pivotZ = P.pic.ay - SHAFT.plinth;
    const u = SHAFT.plinth - f.c[1];
    const px = P.x + (SHAFT.x - P.pic.ax) / SEEN;
    const py = P.y;
    if (s < COLUMN_FALL) {
      const phi = (Math.PI / 2) * (s / COLUMN_FALL) ** 2;
      return { x: px + way[0] * u * Math.sin(phi), y: py + way[1] * u * Math.sin(phi), z: pivotZ + u * Math.cos(phi), turn: 0, fall: phi, way, rest: false, gone: 0 };
    }
    // (landed: lying along the stone, sliding apart, turning a little; or over the back edge into the water, sinking)
    const lx = px + way[0] * u;
    const ly = py + way[1] * u;
    if (ly < STONE_BOX.y0 - 6) {
      const g = sm(COLUMN_FALL, COLUMN_FALL + 0.9, s);
      return { x: lx, y: ly, z: 10 - 40 * g, turn: 0, fall: Math.PI / 2, way, rest: g >= 1, gone: g };
    }
    const v = f.v as [number, number, number];
    const r = flight(lx, ly, 10, [way[0] * v[0] - way[1] * v[1] * 0.3, way[1] * v[0] + way[0] * v[1] * 0.3, v[2]], 0, 10, s - COLUMN_FALL);
    const turn = Math.max(-0.21, Math.min(0.21, (f.spin ?? 0) * Math.min(1, (s - COLUMN_FALL) / 0.6)));
    const c = Math.cos(turn);
    const n = Math.sin(turn);
    return { x: r.x, y: r.y, z: r.z, turn: 0, fall: Math.PI / 2, way: [way[0] * c - way[1] * n, way[0] * n + way[1] * c], rest: r.rest, gone: 0 };
  }
  if (f.move === 'roll') {
    // (rolling on, slowing, then cracking: its halves parting a little)
    const v = f.v as [number, number, number];
    const T = 0.75;
    const u = 1 - (1 - Math.min(1, s / T)) ** 2;
    const dist = Math.hypot(v[0], v[1]);
    const x = P.x + rx + v[0] * u;
    const y = P.y + (f.c[1] - P.pic.ay + f.size) * R3 + v[1] * u;
    const crack = sm(T, T + 0.15, s) * 3 * (f.split ?? 1);
    // (rolling: rocking on its round as it goes, never spun about in the picture; cracking, its halves leaning apart)
    const turn = 0.14 * Math.sin((dist * u) / 7) * (1 - u) + 0.12 * sm(T, T + 0.15, s) * (f.split ?? 1);
    return { x: x + crack * 0.6, y, z: f.size, turn, fall: 0, way: [1, 0], rest: s >= T + 0.15, gone: 0 };
  }
  const v = f.v as [number, number, number];
  const r = flight(P.x + rx, P.y + (f.c[1] - P.pic.ay + f.size) * R3, f.size, v, f.spin ?? 0, f.size * 0.6, s);
  // (at rest, never lying square with the picture: a turn off the square)
  let turn = r.turn;
  const off = mod(turn, Math.PI / 2);
  if (r.rest && (off < 0.15 || off > Math.PI / 2 - 0.15)) turn += off < 0.15 ? 0.2 : -0.2;
  return { x: r.x, y: r.y, z: r.z, turn, fall: 0, way: [1, 0], rest: r.rest, gone: 0 };
}
/** When a fragment comes to rest (seconds after the hit). */
export function fragRest(P: Piece, f: Frag): number {
  if (f.move === 'stay') return 0;
  if (f.move === 'roll') return 0.9;
  for (let s = 1 / EYE_FPS; s < 4; s += 1 / EYE_FPS) if (fragAt(P, f, s).rest) return s;
  return 4;
}

// =============================================================================================
// THE CHIPS OF STONE THROWN OUT OF IT (left lying: the rubble's small stones)

/** A chip: flung from where the hook meets the piece, tumbling, bouncing, coming to rest, left lying. How big (picture pixels across),
 *  how mossy. */
export interface Chip { n: number; v: [number, number, number]; spin: number; size: number; moss: boolean; seed: number }
const CHIPS = new Map<string, Chip[]>();
/** How many chips each kind throws (and leaves lying). */
export const CHIP_COUNT: Record<PieceKind, number> = { column: 12, stones: 7, drums: 9 };
export function chipsOf(P: Piece): Chip[] {
  const got = CHIPS.get(P.id);
  if (got) return got;
  const H = pieceHit(P);
  const dir = H ? H.dir : -1;
  const inw = H ? H.inw : 1;
  const seed = P.id.length * 13 + Math.round(P.y);
  const out: Chip[] = [];
  for (let n = 0; n < CHIP_COUNT[P.kind]; n++) {
    const sp = 50 + 110 * hs(seed, n, 1) ** 1.5;
    const a = 0.15 + 1.1 * hs(seed, n, 2);
    out.push({ n, v: [dir * sp * Math.cos(a) * 0.7, inw * sp * Math.sin(a) + inw * 15, 70 + 120 * hs(seed, n, 3)], spin: (hs(seed, n, 4) - 0.5) * 20, size: 3 + Math.floor(5 * hs(seed, n, 5) ** 1.6), moss: P.kind !== 'drums' && hs(seed, n, 6) < 0.35, seed: seed * 31 + n });
  }
  CHIPS.set(P.id, out);
  return out;
}
/** Where a chip is, `s` seconds after the hit. */
export function chipAt(P: Piece, c: Chip, s: number): { x: number; y: number; z: number; turn: number; rest: boolean } {
  const H = pieceHit(P);
  const at = H ? H.at : [P.x, P.y, 20];
  return flight(at[0], at[1], at[2], c.v, c.spin, c.size * 0.5, Math.max(0, s));
}
/** A CHIP'S PICTURE: an irregular broken stone (not a disc: five to seven corners, each its own way out), its lit top, its mid, its dark
 *  faces to the bottom right, a dark crack along its foot, moss on some. Each pixel: across, down from its middle, and its colour. */
export function chipPicture(c: Chip): Array<[number, number, string]> {
  const m = 5 + Math.floor(hs(c.seed, 1, 1) * 3);
  const rad: number[] = [];
  for (let q = 0; q < m; q++) rad.push(c.size * (0.6 + 0.6 * hs(c.seed, q, 2)));
  const a0 = TAU * hs(c.seed, 2, 3);
  const R = (a: number): number => {
    const u = mod(a - a0, TAU) / (TAU / m);
    const q = Math.floor(u);
    const f = u - q;
    return rad[q % m] * (1 - f) + rad[(q + 1) % m] * f;
  };
  const out: Array<[number, number, string]> = [];
  const S = Math.ceil(c.size * 1.3);
  for (let dj = -S; dj <= S; dj++) for (let di = -S; di <= S; di++) {
    const r = Math.hypot(di, dj * 1.3);
    const a = Math.atan2(dj * 1.3, di);
    if (r > R(a)) continue;
    const edge = r > R(a) - 1.2;
    const lit = -di * 0.6 - dj * 0.8;
    let col: string = lit > c.size * 0.35 ? ARM_COLOURS.stoneLit : lit < -c.size * 0.3 ? ARM_COLOURS.stoneDark : ARM_COLOURS.stoneMid;
    if (edge && di + dj > 0) col = ARM_COLOURS.crack;
    if (c.moss && dj < 0 && hs(c.seed + di, dj, 4) < 0.45) col = ARM_COLOURS.moss;
    out.push([di, dj, col]);
  }
  return out;
}

// =============================================================================================
// THE FRAMES: HIS SHOVEL WITH THE PIECES

/** The hook ploughing into a piece: jolted back against the way it goes (his lengths) and up and down, frame by frame from the hit. */
export const HOOK_JOLT = { back: [14, 8, 3, 1], up: [-5, 3, -1, 0] } as const;
/** The screen jolted as each piece is smashed (game pixels, dying away over `long` frames); and as a column's shaft lands. */
export const SMASH_SHAKE = { smash: 5, long: 8, land: 4, landLong: 6 } as const;
/** What the game draws for the pieces in a frame: each piece, how long since it was smashed (seconds; less than 0, whole); where later
 *  hooks drag over rubble, grit thrown up (each where, and how long ago). */
export interface PiecesNow { since: number[]; scatter: Array<{ x: number; y: number; s: number; dir: number; seed: number }> }
/** The rubble as it lies: each fragment's and chip's resting middle, how big across, how high (his lengths); and what is left where it
 *  stood (the foot of a column's plinth). */
const RUBBLE = new Map<string, Array<{ x: number; y: number; r: number; h: number; a?: [number, number]; b?: [number, number] }>>();
export function rubbleOf(P: Piece): Array<{ x: number; y: number; r: number; h: number; a?: [number, number]; b?: [number, number] }> {
  const got = RUBBLE.get(P.id);
  if (got) return got;
  const out: Array<{ x: number; y: number; r: number; h: number; a?: [number, number]; b?: [number, number] }> = [];
  for (const f of brokenOf(P).frags) {
    if (f.move === 'stay') continue;
    const at = fragAt(P, f, 6);
    if (at.gone >= 1) continue;
    if (f.move === 'fall') {
      // (a piece of the shaft lying along the stone: a log of it)
      out.push({ x: at.x, y: at.y, r: 12, h: 22, a: [at.x - at.way[0] * f.size, at.y - at.way[1] * f.size], b: [at.x + at.way[0] * f.size, at.y + at.way[1] * f.size] });
    } else out.push({ x: at.x, y: at.y, r: f.size * 1.0, h: f.move === 'roll' ? 24 : f.size * 1.6 });
  }
  for (const c of chipsOf(P)) {
    const at = chipAt(P, c, 6);
    out.push({ x: at.x, y: at.y, r: c.size * 0.6, h: c.size });
  }
  // (what is left of a column: the foot of its plinth, low)
  if (P.kind === 'column') out.push({ x: P.x, y: P.y, r: 22, h: 6 });
  RUBBLE.set(P.id, out);
  return out;
}
/** How far up a hook must ride to go over the rubble lying under it (his lengths), its points as laid. */
export function liftOver(T: readonly number[][], since: readonly number[]): number {
  let lift = 0;
  PIECES.forEach((P, p) => {
    for (const R of rubbleOf(P)) {
      for (const t of T) {
        // (only what of the hook is over the stone, not under the water beside it)
        if (t[2] - t[3] < -4 || t[1] < STONE_BOX.y0 || t[1] > STONE_BOX.y1 || Math.abs(t[0]) > STONE_BOX.x1) continue;
        let d: number;
        if (R.a && R.b) {
          const vx = R.b[0] - R.a[0];
          const vy = R.b[1] - R.a[1];
          const L2 = vx * vx + vy * vy || 1;
          const u = clamp01(((t[0] - R.a[0]) * vx + (t[1] - R.a[1]) * vy) / L2);
          d = Math.hypot(t[0] - R.a[0] - vx * u, t[1] - R.a[1] - vy * u);
        } else d = Math.hypot(t[0] - R.x, t[1] - R.y);
        if (d >= R.r + t[3]) continue;
        // (resting by now? then over it)
        if (since[p] < 1.6) continue;
        const need = R.h + 2 - (t[2] - t[3] * Math.sqrt(Math.max(0, 1 - (d / (R.r + t[3])) ** 2)));
        if (need > lift) lift = need;
      }
    }
  });
  return lift;
}
/** WHERE A HOOK DRAGS OVER RUBBLE in frame `k` of the shovel at end `e` (what of it lies low on the stone, over a resting fragment or
 *  chip of a piece already smashed by then). */
export function rubbleScatter(e: End, k: number, since: readonly number[]): PiecesNow['scatter'] {
  const out: PiecesNow['scatter'] = [];
  for (let g = k - 8; g <= k; g++) {
    for (let i = 0; i < SCRAPERS.length; i++) {
      const T = hookPoints(e, i, g);
      if (!T.length) continue;
      PIECES.forEach((P, p) => {
        if (since[p] - (k - g) / EYE_FPS < 1.5) return;
        for (const R of rubbleOf(P)) {
          for (let q = 0; q < T.length; q += 2) {
            const t = T[q];
            if (t[2] - t[3] > 6) continue;
            if (Math.hypot(t[0] - R.x, t[1] - R.y) < R.r + t[3] * 0.6) {
              out.push({ x: R.x, y: R.y, s: (k - g) / EYE_FPS, dir: sideOf(e), seed: g * 7 + i * 31 + p });
              return;
            }
          }
        }
      });
    }
  }
  return out;
}
/** How far each hook rides up over the rubble in each frame (his lengths), as `piecesFrame` lays it: for the checks and the numbers. */
export const LIFTS = new Map<string, number>();
/** A FRAME OF HIS SHOVEL WITH THE PIECES: `s1` the first shovel, at the left end (the pieces whole until each hook reaches them, then
 *  smashed); `s2` the next, at the right end, over the rubble. The hook that ploughs into a piece jolted, the screen jolted. */
export function piecesFrame(shot: 's1' | 's2', k: number): EyeFrame & { pieces: PiecesNow } {
  const F = shovelFrame(shot, k);
  const e: End = shot === 's1' ? 'left' : 'right';
  const H = pieceHits();
  const since = H.map((h) => (shot === 's2' ? 60 : h ? (k - h.k) / EYE_FPS : -1));
  let sx = F.shake[0];
  let sy = F.shake[1];
  if (shot === 's1') {
    H.forEach((h, p) => {
      if (!h) return;
      const f = k - h.k;
      // (the hook ploughing in: jolted back and up and down)
      if (f >= 0 && f < HOOK_JOLT.back.length) {
        for (const L of [F.arms[2 * h.i], F.arms[2 * h.i + 1]]) {
          if (!L) continue;
          L.dx = (L.dx ?? 0) - h.dir * HOOK_JOLT.back[f];
          L.drop -= HOOK_JOLT.up[f];
        }
      }
      // (the screen jolted as it smashes; and as a column's shaft lands)
      const jolt = (g: number, a: number, long: number): void => {
        if (g < 0 || g >= long) return;
        const v = a * (1 - g / long);
        sy += Math.round(v * (g % 2 ? -1 : 1));
        sx += Math.round(v * 0.5 * (hs(k, p, 9) * 2 - 1));
      };
      jolt(f, SMASH_SHAKE.smash, SMASH_SHAKE.long);
      if (PIECES[p].kind === 'column') jolt(f - Math.round(COLUMN_FALL * EYE_FPS), SMASH_SHAKE.land, SMASH_SHAKE.landLong);
    });
  }
  // (every hook riding up over the rubble lying under it, smoothly: the most it needs this frame and the frames either side)
  for (let i = 0; i < SCRAPERS.length; i++) {
    const head = F.arms[2 * i];
    if (!head || !head.key.startsWith('AH')) continue;
    let lift = 0;
    for (let g = k - 2; g <= k + 2; g++) {
      const sinceG = H.map((h) => (shot === 's2' ? 60 : h ? (g - h.k) / EYE_FPS : -1));
      const w = 1 - Math.abs(g - k) / 3;
      lift = Math.max(lift, liftOver(hookPoints(e, i, g), sinceG) * w);
    }
    if (lift > 0) for (const L of [F.arms[2 * i], F.arms[2 * i + 1]]) if (L) L.drop -= lift;
    LIFTS.set(`${shot}.${k}.${i}`, lift);
  }
  F.shake = [sx, sy];
  return { ...F, pieces: { since, scatter: rubbleScatter(e, k, since) } };
}
