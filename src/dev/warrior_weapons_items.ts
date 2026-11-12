// THE WARRIOR'S BATTLE AXES AND WARHAMMERS AS ITEMS: their pictures in the bag and on the floor (the art chat's helper, 9 Nov
// 2026; docs/mockups/warrior_weapons/README.md). A MOCK-UP: NOTHING OF THE GAME IMPORTS IT (tests/warrior_weapons.test.ts).
//
// Painted in STYLE A, his pick of 3 Nov 2026 (“A, painted”; “Finer and a rim”), exactly as the game's own item pictures are
// (art/items_a.ts, its painter itself: `paintItemParts`), each take at the four rarities, a rarer one finer (his rulebook's
// Heroes 3, “a rarer weapon looks finer”) as the great sword's: Normal plain iron, ash and leather; Magic a blue grip and a
// blue stone; Rare gold fittings, a gold line along the head and a yellow stone; Unique the head blackened and inlaid with gold,
// an ebony haft, a red grip and orange stones. On the diagonal, the butt at the bottom left, as the game's weapons lie; each
// drawn from the very outline of the head he holds (art/warrior_up_weapons.ts), so the drop and the weapon in his hands are
// one design. Nothing glows on them (the game's item pictures glow only where the items say: not the great sword's blade).
//
// When the kinds come into the game, these painters go into art/items_a.ts's PAINTERS under the kinds' keys.

import type { Sprite } from '../engine/px';
import { Px } from '../engine/px';
import type { Rarity } from '../game/types';
import { INLAY, INLAY_LO, STONE, TRIM, UP, cap, ell, gem, paintItemParts, poly, side, stud } from '../art/items_a';
import type { Mark, Mat, Part, Rar, Shape, V } from '../art/items_a';
import { AXE_PROFILES, RUNES_SIDE, TAKES } from '../art/warrior_up_weapons';
import type { P2, TakeId } from '../art/warrior_up_weapons';

/**
 * How a take lies on the picture: its own (X, Y) to the 32 by 32 canvas, X along the diagonal toward the top right, Y out to
 * the upper left. As an item's picture does, it makes the head big and the haft short: the head at `k` picture pixels to one
 * of its units, the haft below it drawn shorter, so that at 16 game pixels the head is what is seen.
 */
interface Lay {
  at(X: number, Y: number): V;
  k: number;
}
/** Where each take's head begins along its haft (its lowest part: an axe's beard, a hammer's collar). */
const HEAD_FROM: Record<TakeId, number> = { axeA: 11.0, axeB: 15.6, axeC: 13.0, hammerA: 15.6, hammerB: 20.4, hammerC: 17.8 };
function layFor(take: TakeId, fit: { dx: number; dy: number; k: number } = { dx: 0, dy: 0, k: 1 }): Lay {
  const t = TAKES[take];
  const head = headReach(take);
  const x0 = t.butt - 1;
  const xh = HEAD_FROM[take];
  const x1 = Math.max(t.top, head.x1);
  const TOTAL = 33 * fit.k;
  const k = Math.min(0.95, 19 / (x1 - xh), 21 / (head.y1 - head.y0)) * fit.k;
  const ks = (TOTAL - (x1 - xh) * k) / (xh - x0);
  const along = (X: number): number => (X >= xh ? (xh - x0) * ks + (X - xh) * k : (X - x0) * ks) - TOTAL / 2;
  // (the haft's line pushed down and right of the middle as far as its head reaches out to the upper left, so it is in the frame)
  const off = (head.y1 + head.y0) * k * 0.5;
  const o: V = [16 + 1.2 - side(UP)[0] * off + fit.dx, 16 - 1.2 - side(UP)[1] * off + fit.dy];
  return {
    k,
    at: (X, Y) => [o[0] + UP[0] * along(X) - side(UP)[0] * Y * k, o[1] + UP[1] * along(X) - side(UP)[1] * Y * k],
  };
}
/** How far a take's head reaches: along the haft, and out to each side of it. */
function headReach(take: TakeId): { x1: number; y0: number; y1: number } {
  if (take === 'axeA' || take === 'axeB' || take === 'axeC') {
    const pts = AXE_PROFILES[take].blades.flat();
    return { x1: Math.max(...pts.map((p) => p[0])), y0: Math.min(-3.5, ...pts.map((p) => p[1])), y1: Math.max(...pts.map((p) => p[1])) };
  }
  if (take === 'hammerA') return { x1: 31.8, y0: -13.4, y1: 8 };
  if (take === 'hammerB') return { x1: 31.4, y0: -6.6, y1: 6.6 };
  return { x1: 34.4, y0: -8.4, y1: 8.2 };
}

const FIN = (r: Rar): { head: Mat; haft: Mat; grip: Mat; trim: Mat } => ({
  head: r === 3 ? 'dsteel' : 'steel',
  haft: r === 3 ? 'ebony' : 'wood',
  grip: r === 1 ? 'blue' : r === 3 ? 'red' : 'leather',
  trim: TRIM(r),
});

/** The haft, its wrapped grip and its knob: the same for every take. */
function haftParts(take: TakeId, L: Lay, r: Rar): Part[] {
  const t = TAKES[take];
  const f = FIN(r);
  const A = L.at(t.butt + 0.6, 0);
  const B = L.at(t.top, 0);
  const g0 = L.at(t.grip[0], 0);
  const g1 = L.at(t.grip[1], 0);
  const hr = 1.3;
  const out: Part[] = [];
  out.push({ s: cap(A, B, hr), m: f.haft, sh: { k: 'cyl', a: A, b: B, w: hr }, bias: 0.1 });
  const marks: Mark[] = [];
  for (let x = t.grip[0] + 1.6; x < t.grip[1] - 0.5; x += 2.6) marks.push({ a: L.at(x, -2.2), b: L.at(x + 1.1, 2.2), t: 1 });
  out.push({ s: cap(g0, g1, hr + 0.35), m: f.grip, sh: { k: 'cyl', a: g0, b: g1, w: hr + 0.35 }, bias: 0.16, marks });
  const kb = L.at(t.butt + 0.2, 0);
  out.push({ s: ell(kb, hr + 0.85), m: f.trim, sh: { k: 'dome', c: kb, r: hr + 0.85 }, shine: true });
  if (r >= 2) out.push(gem(kb, 0.95, STONE[r]!));
  return out;
}
/** A band round the haft at `X` (a collar): `w` and `r` in picture pixels, along the haft and out from it. */
function band(L: Lay, X: number, w: number, r: number, m: Mat): Part {
  const c = L.at(X, 0);
  const u = UP;
  const v = side(UP);
  const p = (a: number, b: number): V => [c[0] + u[0] * a + v[0] * b, c[1] + u[1] * a + v[1] * b];
  return { s: poly(p(-w / 2, -r), p(w / 2, -r), p(w / 2, r), p(-w / 2, r)), m, sh: { k: 'cyl', a: p(0, -r), b: p(0, r), w: w / 2 }, shine: true };
}
const polyOf = (L: Lay, pts: readonly P2[]): Shape => poly(...pts.map(([x, y]) => L.at(x, y)));
const lineMarks = (L: Lay, line: readonly P2[], t: number | string, inset = 0): Mark[] => {
  const out: Mark[] = [];
  for (let i = 0; i + 1 < line.length; i++) out.push({ a: L.at(line[i][0], line[i][1] - inset), b: L.at(line[i + 1][0], line[i + 1][1] - inset), t });
  return out;
};

// --- the axes ----------------------------------------------------------------------------------------------------------

function axeParts(take: 'axeA' | 'axeB' | 'axeC', r: Rar, L: Lay): Part[] {
  const f = FIN(r);
  const prof = AXE_PROFILES[take];
  const out = haftParts(take, L, r);
  const eyes: [number, number][] = take === 'axeC' ? [[22.5, 2.0], [36.7, 2.1]] : [[take === 'axeA' ? 27.2 : 27.0, 3.6]];
  for (const [i, blade] of prof.blades.entries()) {
    const edge = prof.edges[i];
    const sgn = Math.sign(edge[0][1]) || 1;
    // THE BLADE: flat to the eye, its edge honed bright (a lit line along it, a lighter band behind); finer, a line of gold
    // along it (Rare), gold inlay (Unique)
    const marks: Mark[] = [...lineMarks(L, edge, 4), ...lineMarks(L, edge, 3, sgn * 1.4)];
    if (r >= 2) marks.push(...lineMarks(L, edge, r === 3 ? INLAY : '#d0902c', sgn * 3.6));
    if (r === 3) marks.push(...lineMarks(L, edge, INLAY_LO, sgn * 4.4));
    out.push({ s: polyOf(L, blade), m: f.head, sh: { k: 'flat', bev: 1.5 }, shine: true, marks });
  }
  // the eye (or the two sockets) round the haft, and axe A's squared poll
  for (const [x, hw] of eyes) {
    const pts: P2[] = [[x - hw, -2.1], [x + hw, -2.1], [x + hw, 2.1], [x - hw, 2.1]];
    out.push({ s: polyOf(L, pts), m: f.head, sh: { k: 'flat', bev: 1.2 }, bias: 0.08, shine: true });
  }
  if (take === 'axeA') out.push({ s: polyOf(L, [[24.6, -1.6], [30.2, -1.6], [30.0, -4.4], [24.8, -4.4]]), m: f.head, sh: { k: 'flat', bev: 1.1 }, shine: true });
  if (take === 'axeB') {
    // the spike on top
    const a = L.at(30.4, 0);
    const b = L.at(38.0, 0);
    out.push({ s: poly(L.at(30.4, -1.6), b, L.at(30.4, 1.6)), m: f.head, sh: { k: 'ridge', a, b }, shine: true });
  }
  if (take === 'axeC') out.push({ s: poly(L.at(41.0, -1.4), L.at(43.8, 0), L.at(41.0, 1.4)), m: f.head, sh: { k: 'ridge', a: L.at(41, 0), b: L.at(43.8, 0) }, shine: true });
  // the collar under the head
  const collarAt = take === 'axeA' ? 21.8 : take === 'axeB' ? 22.4 : 19.4;
  out.push(band(L, collarAt, 1.4, 2.1, f.trim));
  // its stones: Magic one, Rare one, Unique two (and the knob's, Rare up)
  const st = STONE[r];
  if (st) {
    const c = L.at(eyes[0][0], take === 'axeB' ? 0 : 0.2);
    out.push(gem(c, r === 3 ? 1.35 : 1.15, st));
    if (r === 3) out.push(gem(L.at(take === 'axeC' ? 36.7 : eyes[0][0] - 1.2, take === 'axeA' ? -3.0 : 0), 1.0, st));
  }
  if (r === 3) for (const x of [collarAt - 3, collarAt - 6]) out.push(stud(L.at(x, 0), 0.7, 'gold'));
  return out;
}

// --- the hammers -------------------------------------------------------------------------------------------------------

function hammerParts(take: 'hammerA' | 'hammerB' | 'hammerC', r: Rar, L: Lay): Part[] {
  const f = FIN(r);
  const out = haftParts(take, L, r);
  const st = STONE[r];
  const rect = (x0: number, x1: number, y0: number, y1: number): Shape => polyOf(L, [[x0, y0], [x1, y0], [x1, y1], [x0, y1]]);
  if (take === 'hammerA') {
    // the spike behind, the block, the face proud of it (its rim honed bright), the cap
    const sa = L.at(27, -4.6);
    const sb = L.at(27, -13.4);
    out.push({ s: poly(L.at(24.2, -4.4), sb, L.at(29.8, -4.4)), m: f.head, sh: { k: 'ridge', a: sa, b: sb }, shine: true });
    out.push({ s: rect(22.8, 31.2, -5.0, 6.6), m: f.head, sh: { k: 'flat', bev: 1.6 }, bias: 0.1, shine: true, marks: r >= 2 ? [{ a: L.at(23.8, -3.6), b: L.at(30.2, -3.6), t: r === 3 ? INLAY : '#d0902c' }, { a: L.at(23.8, 5.0), b: L.at(30.2, 5.0), t: r === 3 ? INLAY : '#d0902c' }] : [] });
    out.push({ s: rect(22.3, 31.7, 6.05, 7.95), m: f.head, sh: { k: 'flat', bev: 0.9 }, bias: 0.12, shine: true, marks: [{ a: L.at(22.6, 7.7), b: L.at(31.4, 7.7), t: 4 }] });
    out.push({ s: rect(31.0, 32.2, -2.0, 3.6), m: f.trim, sh: { k: 'flat', bev: 0.8 }, shine: true });
    if (st) out.push(gem(L.at(27, 0.8), r === 3 ? 1.5 : 1.25, st));
    if (r === 3) for (const y of [-2.8, 4.4]) out.push(stud(L.at(27, y), 0.75, 'gold'));
    out.push(band(L, 16.6, 1.3, 2.1, f.trim));
  } else if (take === 'hammerB') {
    // the drum, seen from its side: its three bands, finer ones gilded
    // (round about its own axis, across the haft: its light runs across it as a drum's does)
    out.push({ s: rect(22.8, 30.8, -5.6, 5.6), m: f.head, sh: { k: 'cyl', a: L.at(26.8, -5.6), b: L.at(26.8, 5.6), w: 4.0 * L.k }, bias: 0.12, shine: true });
    for (const [y0, y1] of [[4.3, 6.4], [-6.4, -4.3], [-0.65, 0.65]]) {
      out.push({ s: rect(22.3, 31.3, y0, y1), m: r >= 2 ? f.trim : 'dsteel', sh: { k: 'cyl', a: L.at(26.8, y0), b: L.at(26.8, y1), w: 4.5 * L.k }, bias: 0.1, shine: true });
    }
    if (st) for (const y of r === 3 ? [-2.5, 2.5] : [2.5]) out.push(gem(L.at(26.8, y), 1.1, st));
    out.push(band(L, 21.4, 1.4, 2.2, f.trim));
  } else {
    // the flared head, from its narrow peen to its broad face, the face proud of it, its runes cut in (gold-filled when finer)
    out.push({ s: rect(25.6, 28.4, -8.4, -5.0), m: f.head, sh: { k: 'flat', bev: 0.9 }, shine: true });
    const runes: Mark[] = RUNES_SIDE.flatMap((l) => lineMarks(L, l, r >= 2 ? (r === 3 ? INLAY : '#d0902c') : 0));
    out.push({ s: polyOf(L, [[24.4, -5.6], [29.6, -5.6], [32.0, 7.0], [22.0, 7.0]]), m: f.head, sh: { k: 'flat', bev: 1.6 }, bias: 0.1, shine: true, marks: runes });
    out.push({ s: rect(21.9, 32.1, 7.0, 8.2), m: f.head, sh: { k: 'flat', bev: 0.8 }, bias: 0.12, shine: true, marks: [{ a: L.at(22.2, 8.0), b: L.at(31.8, 8.0), t: 4 }] });
    out.push({ s: poly(L.at(32.0, -1.2), L.at(34.4, 0), L.at(32.0, 1.2)), m: f.trim, sh: { k: 'ridge', a: L.at(32, 0), b: L.at(34.4, 0) }, shine: true });
    if (st) out.push(gem(L.at(27, -3.8), r === 3 ? 1.3 : 1.1, st));
    if (r === 3) for (const x of [23.6, 30.4]) out.push(gem(L.at(x, 7.6), 0.85, st as Mat));
    out.push(band(L, 20.8, 1.4, 2.2, f.trim));
    out.push(band(L, 18.8, 1.0, 1.9, f.trim));
  }
  return out;
}

/** The box its shapes reach to (on the 32 by 32 canvas, before the painter's scale). */
function reach(parts: readonly Part[]): { x0: number; y0: number; x1: number; y1: number } {
  const b = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity };
  const take = (x: number, y: number, r = 0): void => {
    b.x0 = Math.min(b.x0, x - r);
    b.x1 = Math.max(b.x1, x + r);
    b.y0 = Math.min(b.y0, y - r);
    b.y1 = Math.max(b.y1, y + r);
  };
  for (const pt of parts) {
    const sh = pt.s;
    if (sh.t === 'poly') for (const p of sh.p) take(p[0], p[1]);
    else if (sh.t === 'cap') {
      take(sh.a[0], sh.a[1], sh.r);
      take(sh.b[0], sh.b[1], sh.r2 ?? sh.r);
    } else if (sh.t === 'ell') take(sh.c[0], sh.c[1], Math.max(sh.rx, sh.ry));
    else sh.p.forEach((p, i) => take(p[0], p[1], sh.r[i]));
  }
  return b;
}
/** Its parts, laid to fill the frame: drawn once, then moved and made smaller as need be so they sit in its middle, with room. */
function partsOf(take: TakeId, r: Rar): Part[] {
  const make = (L: Lay): Part[] => (take === 'axeA' || take === 'axeB' || take === 'axeC' ? axeParts(take, r, L) : hammerParts(take, r, L));
  const first = reach(make(layFor(take)));
  const ROOM = 28.6;
  const k = Math.min(1, ROOM / (first.x1 - first.x0), ROOM / (first.y1 - first.y0));
  // (made smaller, then its box's middle brought to the frame's)
  const b = reach(make(layFor(take, { dx: 0, dy: 0, k })));
  return make(layFor(take, { dx: 16 - (b.x0 + b.x1) / 2, dy: 16 - (b.y0 + b.y1) / 2, k }));
}

/** One take as an item at one rarity: a 32 by 32 picture (two picture pixels to a game pixel), as art/items_a.ts paints one. */
export function paintWeaponItem(take: TakeId, rarity: Rarity): Px {
  return paintItemParts(partsOf(take, rarity as Rar), rarity as Rar);
}

const made = new Map<string, Sprite>();
/** The picture of a take as an item, for the bag and the floor: 16 by 16 game pixels, anchor the middle, as itemArt gives. */
export function weaponItemArt(take: TakeId, rarity: Rarity): Sprite {
  const id = `${take}:${rarity}`;
  let s = made.get(id);
  if (!s) made.set(id, (s = paintWeaponItem(take, rarity).sprite(16, 16, 2)));
  return s;
}
