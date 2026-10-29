// FLOOR 18, THE GLASS GALLERY (THE MIRROR HALL): ITS OWN PIECES, themed after its boss, the Queen (a mock-up; nothing of
// the game imports it).
//
// His rule for a set of floors from the second on (10 Oct, 14:54): “Going forward, let’s do 25 that are the theme of the 5
// levels, then 25 for each boss.” This floor's boss is the Queen (his doc "Wordsmith Act 2, Part Two: The High City
// (Levels 16–20)", approved by him, "Yes, go (Recommended)"): "Her floor is the Mirror Hall. Tall and cold in silver and
// violet, a crown of glass spikes, and her poisoned comb in her hand. Her mirror hangs at the end of the hall and talks to
// her the whole fight." The level, "The queen's wing: long galleries of mirrors and a great glasshouse on the roof."; its
// layout "indoors and up: mirrored halls and dressing rooms, a chapel of stained glass, and the glasshouse of dead orchids
// under a roof of panes"; its hazards "mirrors that crack and burst into shards when anything strikes near them;
// skylights to fall through to the floor below"; its palette "Silver, cold blue glass, dark violet"; its story beat "The
// only voice left is her mirror's." From the Brothers Grimm, "Snow White" (1812), only from the book: the queen and her
// mirror; the queen sewing at a window framed in ebony, the snow, three drops of blood; the apple she made, white with a
// red cheek, the red cheek poisoned; the coffin of glass. Its ground: art/glassgallery.ts; its first look, painted:
// src/dev/gallery_paint.ts.
//
// THE RULES THEY KEEP: as art/act2_kit.ts says (built in depth in floor 4's Scene, a step quieter than any word through
// art/act2_quiet.ts, seams of ink where one thing ends before another). Nothing glows but the candles (an honest flame:
// the candelabrum's, the sconce's) and the quest's own pale light (the apple on its dish); nothing cyan (every glass a
// cold grey-blue, its hue well past the hero's), no pink. Real shapes, not circles and squares: a frame is carved, an
// apple has its dimple and stalk, a bust has shoulders and a face. Her mirror itself, the one that talks, is hers: it
// goes with the boss, not here.

import type { Sprite } from '../engine/px';
import type { Piece } from './floorkit';
import { toneAt } from './floor4';
import type { Scene, V3 } from './floor4';
import { hash, mix } from './kit';
import type { Ramp } from './kit';
import { EMBER } from './props';
import { checker, cylinder, done, frontPiece, lying, scene, slab, turned } from './act2_kit';
import { galleryMarble } from './glassgallery';

const fr = (t: number): number => t - Math.floor(t);
const AXES: readonly [V3, V3, V3] = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
const clamp = (a: number, lo: number, hi: number): number => Math.max(lo, Math.min(hi, a));
const hex2 = (v: number): string => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0');
const toHex = (c: readonly number[]): string => '#' + hex2(c[0]) + hex2(c[1]) + hex2(c[2]);

// =================================================================================================
// THE QUEEN'S MATERIALS (each from its deep shade to its lit top), as the ground's and the first look's

/** Grey marble, silver-grey. */
export const SILVER: Ramp = ['#3a3a4c', '#5e5e72', '#7c7c90', '#9898aa', '#b6b6c6'];
/** Silver, the metal: candelabra, dishes, a gate. A cold grey, its lit edge bright. */
export const METAL: Ramp = ['#2c2c3a', '#4e4e60', '#74748a', '#a0a0b4', '#cacad6'];
/** Dark violet marble. */
export const VIOLET: Ramp = ['#17121f', '#231b30', '#312641', '#3f3253', '#544668'];
/** Violet velvet. */
export const VELVET: Ramp = ['#1a1224', '#291c38', '#372749', '#46345a', '#5c4a72'];
/** Violet silk, paler, for gowns and hangings. */
export const SILK: Ramp = ['#221a2e', '#352a46', '#4a3d5d', '#615276', '#7a6c8e'];
/** Old gilt, rubbed. Metal, never a glow. */
export const GILT: Ramp = ['#2a2117', '#45372a', '#665238', '#88704a', '#ab9363'];
/** A mirror's glass: a cold grey-blue (its hue past 220: never the hero's cyan). */
export const MIRROR: Ramp = ['#22252f', '#343846', '#4a4f60', '#646a7c', '#868c9e'];
/** Panes of plain glass, the sky's grey-blue in them. */
export const PANE: Ramp = ['#4c5262', '#687083', '#8890a2', '#a6adbc', '#c4c9d4'];
/** Iron, near black. */
export const IRONS: Ramp = ['#14141c', '#1f2029', '#2e303b', '#444756', '#62667a'];
/** The chapel's pale stone. */
export const CSTONE: Ramp = ['#2e2c38', '#4a4754', '#5f5c69', '#77737f', '#928e9a'];
/** Dark oak, the pews and the wardrobe. */
export const POAK: Ramp = ['#1c1416', '#2c2020', '#3e2e2a', '#524036', '#6a5444'];
/** Terracotta, the orchids' pots, dull. */
export const CLAYPOT: Ramp = ['#2e1e1e', '#46302a', '#5e4034', '#765442', '#8e6a54'];
/** The orchids, dead: dry leaves and stems; withered blooms, a faded mauve; dry roots, an old ivory. */
export const DRY: Ramp = ['#221c18', '#342a20', '#4a3e2c', '#625438', '#7a6c4a'];
export const BLOOM: Ramp = ['#3a2e40', '#4e3e56', '#66546e', '#7e6c84', '#9a8a9e'];
export const IVORY: Ramp = ['#5a5446', '#787060', '#968e7a', '#b0a890', '#c8c0a8'];
/** Candle wax. */
export const WAX: Ramp = ['#6a6456', '#8a8472', '#a8a28c', '#c4bea6', '#dcd6be'];
/** Gowns: a pale silver-grey satin, an ivory. */
export const SATIN: Ramp = ['#3e3e4e', '#5e5e70', '#80809a', '#a2a2b8', '#c0c0d0'];
/** Marble for a bust: white gone grey. */
export const STATUARY: Ramp = ['#4e4c5a', '#706e7e', '#8e8c9a', '#a8a6b4', '#c2c0cc'];
/** THE APPLE she made (the book): white, its cheek red; its stalk and leaf. */
export const APPLE_WHITE: Ramp = ['#8a8270', '#a8a08a', '#c4bca4', '#d8d0b8', '#e8e2cc'];
export const APPLE_RED: Ramp = ['#4e1a1c', '#6e2426', '#8e3230', '#a8443a', '#c05a48'];
/** Pearls. */
const PEARL: Ramp = ['#6e6a72', '#8e8a92', '#aeaab2', '#cac6cc', '#e0dce2'];
/** The stained glass, lit by the day: lead, and the panes (each dull, old glass: Colour 4). */
const LEADING = '#16131c';
const GLASS_C: Record<string, readonly [string, string]> = {
  ruby: ['#6e2c30', '#8e4440'],
  blue: ['#2e3666', '#46508a'],
  gold: ['#7a6634', '#9e8a4e'],
  violet: ['#463064', '#5e4880'],
  snow: ['#a4a2ae', '#c4c2cc'],
  ebony: ['#1e1a22', '#2c2630'],
  green: ['#2e4430', '#425c40'],
  pale: ['#7c8090', '#9a9eac'],
};
/** The candles' flames: an honest fire (EMBER, Colour 3), and their light. */
const FLAME = [EMBER[2], EMBER[3], EMBER[4]] as const;
/** The quest's own pale light. */
const QUEST_LIGHT = '#e8e2d2';
/** The deep dark of a hole, the backing of a mirror. */
const HOLE = '#0c0a10';

// =================================================================================================
// A MIRROR: its frame (carved gilt), its glass (giving back the floor before it), cracked, burst

/**
 * A FRAME of carved gilt round a mirror's glass (on the picture's own grain: across it `A` picture pixels, up it `Z`): an
 * inner bead, a carved flat, an outer bead; a leaf of acanthus curling out at each corner, a shell under its foot, and its
 * crest, a cartouche between two scrolls with a crown of glass spikes on it (the Queen's: her doc's "a crown of glass
 * spikes"). Its tone: an index into GILT (or a glass spike's into MIRROR, as 10 + k), or null where there is nothing.
 */
export function mirrorFrameAt(A: number, Z: number, A0: number, A1: number, Z0: number, Z1: number, crest = true, arch = 0): number | null {
  const FW = 5;
  const am = (A0 + A1) / 2;
  const half = (A1 - A0) / 2;
  if (arch > 0 && Z >= Z1) {
    // AN ARCHED HEAD: the glass under a half-ellipse `arch` high; the frame a band round it, its crown lit
    const r = Math.hypot((A - am) / half, (Z - Z1) / arch);
    if (r < 1) return null;
    const x = A - am;
    const y = Z - (Z1 + arch + FW);
    if (crest) {
      if (y >= 8 && y < 10 && Math.abs(x) < 8) return y === 9 ? 4 : 2;
      for (let i = -2; i <= 2; i++) {
        const h = i === 0 ? 11 : Math.abs(i) === 1 ? 8 : 6;
        const t = (y - 10) / h;
        if (t >= 0 && t < 1 && Math.abs(x - i * 3.4) < 1.7 * (1 - t) + 0.2) return 10 + (x - i * 3.4 < -0.3 ? 4 : t > 0.6 ? 3 : 2);
      }
      const sh = Math.abs(x) / 6 + Math.max(0, -y) / 4 + Math.max(0, y - 6) / 3;
      if (y > -3 && y < 8 && sh < 1) return sh > 0.75 ? (x < 0 || y > 4 ? 4 : 1) : Math.abs(x) < 2 && y > 1 && y < 5 ? 1 : 3;
    }
    const d = (r - 1) * Math.min(half, arch);
    if (d > FW) return null;
    const lit = x < 0;
    if (d < 1) return 0;
    if (d < 2) return lit ? 4 : 2;
    if (d < 4) return Math.floor((Math.atan2(Z - Z1, A - am) * 18) / Math.PI) % 3 === 0 ? 1 : lit ? 3 : 2;
    return lit ? 3 : 1;
  }
  if (A >= A0 && A < A1 && Z >= Z0 && Z < Z1) return null;
  const ox = Math.max(A0 - A, A - A1 + 1, 0);
  const oz = Math.max(Z0 - Z, Z - Z1 + 1, 0);
  if (crest && arch === 0) {
    const x = A - am;
    const y = Z - (Z1 + FW);
    if (y >= 8 && y < 10 && Math.abs(x) < 8) return y === 9 ? 4 : 2;
    for (let i = -2; i <= 2; i++) {
      const h = i === 0 ? 11 : Math.abs(i) === 1 ? 8 : 6;
      const xi = i * 3.4;
      const t = (y - 10) / h;
      if (t >= 0 && t < 1 && Math.abs(x - xi) < 1.7 * (1 - t) + 0.2) return 10 + (x - xi < -0.3 ? 4 : t > 0.6 ? 3 : 2);
    }
    const sh = Math.abs(x) / 6 + Math.max(0, -y) / 4 + Math.max(0, y - 6) / 3;
    if (y > -3 && y < 8 && sh < 1) return sh > 0.75 ? (x < 0 || y > 4 ? 4 : 1) : Math.abs(x) < 2 && y > 1 && y < 5 ? 1 : 3;
    for (const s of [-1, 1]) {
      const dx = x - s * 8.5;
      const dy = y - 2;
      const r = Math.hypot(dx, dy * 1.2);
      const ang = Math.atan2(dy, dx * s);
      if (r > 2.2 && r < 4.2 && !(ang > 2.2 || ang < -2.6)) return dy > 0 ? 4 : r > 3.4 ? 1 : 3;
      if (r <= 1.4 && dy > -1) return 2;
    }
  }
  {
    const x = A - am;
    const y = Z0 - FW - Z;
    if (y >= -1 && y < 7) {
      const r = Math.hypot(x, y * 1.4);
      if (r < 8) {
        const rib = Math.abs(fr((Math.atan2(y, x) / Math.PI) * 5) - 0.5) < 0.16;
        return r > 6.6 ? 1 : rib ? 4 : 2;
      }
    }
  }
  for (const [cxA, czA, sx, sz] of [[A0 - FW / 2, Z1 + FW / 2, -1, 1], [A1 + FW / 2, Z1 + FW / 2, 1, 1], [A0 - FW / 2, Z0 - FW / 2, -1, -1], [A1 + FW / 2, Z0 - FW / 2, 1, -1]] as const) {
    if (arch > 0 && sz > 0) continue;
    const x = (A - cxA) * sx;
    const y = (Z - czA) * sz;
    if (x < -2 || y < -2) continue;
    const r = Math.hypot(x, y);
    const th = Math.atan2(y, x);
    const lobe = 4.2 + 1.6 * Math.cos(th * 6);
    if (r < lobe && th > -0.3 && th < Math.PI / 2 + 0.3) {
      const vein = Math.abs(th - Math.PI / 4) < 0.12 && r > 1.5;
      return vein ? 1 : r > lobe - 1 ? (sx < 0 || sz > 0 ? 4 : 1) : 3;
    }
  }
  if (ox > FW || oz > FW || (arch > 0 && Z >= Z1)) return null;
  const d = Math.max(ox, oz);
  const lit = (oz >= ox && Z >= Z1) || (ox > oz && A < A0);
  if (d < 1) return 0;
  if (d < 2) return lit ? 4 : 2;
  if (d < 4) {
    const along = oz >= ox ? A : Z;
    return (Math.floor(along / 2) + Math.floor(d)) % 3 === 0 ? 1 : lit ? 3 : 2;
  }
  return lit ? 3 : 1;
}

/**
 * WHAT A MIRROR'S GLASS GIVES BACK at its point (`a` along its wall in the world's units, `z` up): the floor before it,
 * the galleries' marble (art/glassgallery.ts), turned back off the glass as the eye's way is, in the glass's cold grey;
 * a sheen across it; foxed with age at its edges. `shifted`: a piece of it knocked askew (a crack).
 */
export function reflectionAt(a: number, z: number, alongX: boolean, px: number, py: number, edge: number, da = 0, dz = 0): string {
  const d = (z + dz) / 32;
  const along = (a + da) / 40;
  const [fx, fy] = alongX ? [along - d + 7.3, d + 0.7] : [d + 0.7, -along - d + 7.3];
  let out = mix(mix(toHex(galleryMarble(fx, fy, px, py, 9)), MIRROR[2], 0.42), MIRROR[3], 0.12);
  const sheen = fr((a * 0.8 - z * 0.9) / 46 + 0.2);
  if (sheen < 0.05) out = mix(out, MIRROR[4], 0.62);
  else if (sheen < 0.09) out = mix(out, MIRROR[4], 0.3);
  else if (sheen > 0.55 && sheen < 0.58) out = mix(out, MIRROR[4], 0.3);
  const fox = hash(Math.floor(a / 3), Math.floor(z / 3), 1861);
  if (edge < 5 && fox > 0.5) out = mix(out, MIRROR[1], 0.5);
  return out;
}

/** A MIRROR'S GLASS CRACKED from a blow at (ca, cz): rays and rings of cracks; each piece a little askew; near the blow, pieces gone to the backing. Null: its normal glass. */
function crackedAt(a: number, z: number, ca: number, cz: number, alongX: boolean, px: number, py: number, edge: number): string {
  const da = (a - ca) * 0.8;
  const dz = z - cz;
  const r = Math.hypot(da, dz * 1.1);
  const ang = Math.atan2(dz, da);
  const rays = 11;
  const s = ((ang / (Math.PI * 2)) * rays + rays) % rays;
  const wob = 0.35 * Math.sin(r * 0.11 + Math.floor(s));
  const sector = Math.floor(s + wob);
  const sOff = s + wob - sector;
  const ringR = [6, 13, 22, 34];
  const ring = ringR.findIndex((rr) => r < rr + 2 * Math.sin(ang * 3 + rr));
  const band = ring < 0 ? ringR.length : ring;
  const onRay = (sOff < 0.04 || sOff > 0.96) && r > 2 && r < 60 - 10 * hash(sector, 0, 1871);
  const onRing = ringR.some((rr, i) => i < 3 && Math.abs(r - (rr + 2 * Math.sin(ang * 3 + rr))) < 0.7 && hash(sector, i, 1873) > 0.3);
  if (r < 5 || band === 0 || (band === 1 && hash(sector, 1, 1875) > 0.55)) return r < 2.5 ? HOLE : (px + py) % 5 === 0 ? '#2a2024' : '#1e171c';
  if (onRay || onRing) return (px + py) % 2 ? MIRROR[4] : MIRROR[3];
  const h = hash(sector, band, 1877);
  return reflectionAt(a, z, alongX, px, py, edge, (h - 0.5) * 12, (hash(sector, band, 1879) - 0.5) * 10 + band * 2);
}

/** A MIRROR BURST: its frame empty but for teeth of glass round its edge; the backing boards behind, the silver's stains on them. */
function burstAt(a: number, z: number, a0: number, a1: number, z0: number, z1: number, alongX: boolean, px: number, py: number): string {
  const ea = Math.min(a - a0, a1 - a) * 0.8;
  const ez = Math.min(z - z0, z1 - z);
  const tooth = 1.5 + 4.5 * Math.abs(Math.sin(a * 0.31 + z * 0.21)) * hash(Math.floor(a / 6), Math.floor(z / 8), 1881);
  if (ea < tooth || ez < tooth * 0.8) {
    if (ea < 1 || ez < 1) return MIRROR[0];
    return reflectionAt(a, z, alongX, px, py, 9, 4, 4);
  }
  if (fr((a * 0.8) / 7) < 0.14) return '#120e12';
  const stain = hash(Math.floor(a / 4), Math.floor(z / 5), 1883) > 0.7;
  return stain ? '#3c383c' : hash(Math.floor((a * 0.8) / 7), 0, 1885) > 0.5 ? '#2a2026' : '#241c22';
}

/** Lay a framed glass in a scene: its glass a quad (`glass(a, z, px, py, edge)` its colour), its frame a quad a little proud of it. */
function framedGlass(S: Scene, w: (a: number, b: number, z: number) => V3, alongX: boolean, a0: number, a1: number, z0: number, z1: number, glass: (a: number, z: number, px: number, py: number, edge: number) => string | null, id: number, b = 0.6, crest = true, arch = 0): void {
  const aOf = (p: V3): number => (alongX ? p[0] : -p[1]);
  const am = (a0 + a1) / 2;
  const half = (a1 - a0) / 2;
  S.quad([w(a0, b, z0), w(a1, b, z0), w(a1, b, z1 + arch), w(a0, b, z1 + arch)], (_u, _v, p) => {
    const [x, y] = S.at(p);
    const a = aOf(p);
    if (arch > 0 && p[2] > z1 && Math.hypot((a - am) / half, (p[2] - z1) / arch) >= 1) return null;
    return glass(a, p[2], Math.floor(x), Math.floor(y), Math.min(a - a0, a1 - a) * 0.8);
  }, id);
  const A0 = Math.round(a0 * 0.8);
  const A1 = Math.round(a1 * 0.8);
  const ma = 14 / 0.8;
  S.quad([w(a0 - ma, b + 0.4, z0 - 16), w(a1 + ma, b + 0.4, z0 - 16), w(a1 + ma, b + 0.4, z1 + arch + (crest ? 30 : 10)), w(a0 - ma, b + 0.4, z1 + arch + (crest ? 30 : 10))], (_u, _v, p) => {
    const t = mirrorFrameAt(Math.floor(aOf(p) * 0.8), Math.floor(p[2]), A0, A1, z0, z1, crest, arch);
    if (t === null) return null;
    return t >= 10 ? MIRROR[t - 10] : GILT[t];
  }, id + 1);
}

/**
 * A TALL MIRROR in its carved gilt frame, its head arched, hung on the wall (THE HAZARD: it cracks and bursts into shards
 * when anything strikes near it): whole, giving back the floor before it; cracked from a blow; burst, its frame empty, its
 * shards strewn on the floor before the wall. Taller than a man. On the face turned to screen-left and the one turned to
 * screen-right. 160 x 200 at (80, 156).
 */
function tallMirror(state: number): { left: Sprite; right: Sprite } {
  return frontPiece((S, w, alongX) => {
    // (its glass the size the reflections' step-out is made for, branch mockup/reflections, GALLERY_MIRROR: 58 across on
    // the picture, 84 high to the arch, the arch 22 higher)
    const a0 = -29 / 0.8;
    const a1 = 29 / 0.8;
    const z0 = 8;
    const z1 = z0 + 84;
    const arch = 22;
    const top = (a: number): number => z1 + arch * Math.sqrt(Math.max(0, 1 - (a / a1) ** 2));
    framedGlass(S, w, alongX, a0, a1, z0, z1, (a, z, px, py, edge) => {
      if (state === 1) return crackedAt(a, z, -6, 62, alongX, px, py, edge);
      if (state === 2) return burstAt(a, z, a0, a1, z0, top(a), alongX, px, py);
      return reflectionAt(a, z, alongX, px, py, Math.min(edge, top(a) - z));
    }, 1, 0.6, true, arch);
    if (state === 2) shardsIn(S, (a, b) => w(a, b, 0.6), 40, 1887, 20, 30);
  }, 160, 200, undefined, 44);
}
/** SHARDS OF A MIRROR strewn on the floor: slivers of its glass, each catching the light; laid by `at(a, b)` (along, out). */
function shardsIn(S: Scene, at: (a: number, b: number) => V3, n: number, seed: number, id: number, spread = 26): void {
  for (let i = 0; i < n; i++) {
    const a = (hash(i, 1, seed) - 0.5) * 40;
    const b = 3 + Math.pow(hash(i, 2, seed), 0.8) * spread;
    const L = 3 + hash(i, 3, seed) * 4;
    const t = hash(i, 4, seed) * Math.PI;
    const p0 = at(a, b);
    const p1: V3 = [p0[0] + Math.cos(t) * L, p0[1] + Math.sin(t) * L, p0[2]];
    const p2: V3 = [p0[0] + Math.cos(t + 1.4) * L * 0.6, p0[1] + Math.sin(t + 1.4) * L * 0.6, p0[2]];
    const lit = hash(i, 5, seed);
    S.quad([p0, p1, p2, p2], (u) => (u > 0.55 ? MIRROR[4] : lit > 0.5 ? MIRROR[3] : MIRROR[2]), id);
  }
}

/** A MIRROR'S SHARDS, fallen on the floor: a scatter of slivers of its glass, some catching the light, a corner of its frame. On the floor. 110 x 60 at (55, 30). */
function mirrorShards(): Sprite {
  const S = scene(110, 60, 55, 30);
  shardsIn(S, (a, b) => [a * 0.9 + b * 0.3 - 12, b * 0.9 - 14, 0.6], 34, 1889, 1, 22);
  // a corner of its frame, broken off: carved gilt
  S.rod([10, 6, 1.6], [20, 6, 1.6], 1.6, 1.6, GILT, 2);
  S.rod([10, 6, 1.6], [10, 15, 1.6], 1.6, 1.6, GILT, 2);
  S.egg([10, 6, 2.2], AXES, [3.2, 3.2, 2], (n) => toneAt(n, GILT, 0.1), 2);
  return done(S, 55, 30);
}

/**
 * A CHEVAL MIRROR: a tall glass, arched at its head, swung between two uprights of carved gilt on splayed feet, a finial on
 * each; its glass gives back the floor; or burst, its glass gone but for teeth, its shards about its feet (breakable).
 * 90 x 140 at (45, 116).
 */
function chevalMirror(burst: boolean): Sprite {
  const S = scene(90, 140, 45, 116);
  // the feet: each upright on two splayed legs
  for (const x of [-16, 16]) {
    S.rod([x, -7, 0], [x, 0, 9], 1.4, 1.2, GILT, 1);
    S.rod([x, 7, 0], [x, 0, 9], 1.4, 1.2, GILT, 1);
    S.rod([x, 0, 8], [x, 0, 70], 1.5, 1.2, GILT, 1);
    S.egg([x, 0, 73], AXES, [2.2, 2.2, 3.2], (n) => toneAt(n, GILT, 0.1), 1);
    S.rod([x, 0, 75], [x, 0, 80], 0.9, 0.2, GILT, 1);
  }
  S.rod([-16, 0, 14], [16, 0, 14], 1, 1, GILT, 1);
  // the glass, tilted back a little on its pivots; its frame; an arched head
  const tilt = 0.12;
  const w = (a: number, b: number, z: number): V3 => [a, b - (z - 44) * tilt + 0.5, z];
  const A0 = -12;
  const A1 = 12;
  const Z0 = 18;
  const Z1 = 72;
  const archTop = (a: number): number => Z1 - 8 + 8 * Math.sqrt(Math.max(0, 1 - (a / 12) ** 2));
  S.quad([w(A0, 0, Z0), w(A1, 0, Z0), w(A1, 0, Z1), w(A0, 0, Z1)], (_u, _v, p) => {
    const a = p[0];
    const z = p[2];
    if (z > archTop(a)) return null;
    const [x, y] = S.at(p);
    const edge = Math.min(a - A0, A1 - a, (archTop(a) - z) * 1.2) * 0.8;
    if (burst) return burstAt(a, z, A0, A1, Z0, archTop(a), true, Math.floor(x), Math.floor(y));
    return reflectionAt(a, z, true, Math.floor(x), Math.floor(y), edge);
  }, 2);
  // its frame: a moulding round it, the arch, a crest of glass spikes over the arch
  S.quad([w(A0 - 5, 0.5, Z0 - 5), w(A1 + 5, 0.5, Z0 - 5), w(A1 + 5, 0.5, Z1 + 16), w(A0 - 5, 0.5, Z1 + 16)], (_u, _v, p) => {
    const a = p[0];
    const z = p[2];
    const top = archTop(clamp(a, A0, A1));
    const inside = a >= A0 && a < A1 && z >= Z0 && z < top;
    if (inside) return null;
    const ox = Math.max(A0 - a, a - A1, 0) * 0.8;
    const oz = Math.max(Z0 - z, z - top, 0);
    const d = Math.max(ox, oz);
    // the crest: three glass spikes over the arch's crown
    const x = a * 0.8;
    const y = z - (Z1 + 3);
    for (let i = -1; i <= 1; i++) {
      const h = i === 0 ? 10 : 6;
      const t = y / h;
      if (t >= 0 && t < 1 && Math.abs(x - i * 4) < 1.8 * (1 - t) + 0.2) return MIRROR[x - i * 4 < 0 ? 4 : 3];
    }
    if (d > 4.5) return null;
    if (d < 1) return GILT[0];
    const lit = a < A0 || z > top;
    return d < 2 ? GILT[lit ? 4 : 2] : (Math.floor((a + z) / 2.5) % 3 === 0 ? GILT[1] : GILT[lit ? 3 : 2]);
  }, 3);
  // the pivots
  for (const x of [-14.5, 14.5]) S.egg([x, 0.5, 44], AXES, [2, 2, 2], (n) => toneAt(n, GILT, 0.2), 4);
  if (burst) shardsIn(S, (a, b) => [a * 0.7, b * 0.6 + 2, 0.6], 22, 1891, 5, 22);
  return done(S, 45, 116);
}

// =================================================================================================
// THE DRESSING ROOMS: the dressing table, the screen, the wardrobe of gowns, the banquette, the console

/**
 * A DRESSING TABLE: a table of gilt on cabriole legs, skirted in violet silk, a top of violet marble; on it a looking-glass
 * of three leaves, the middle one arched and crested; and her things: two combs of ivory, a jewel box, a powder jar, a
 * silver hand mirror laid face up. Its front along +y (`k` 0) or along +x (1). 120 x 140 at (60, 104).
 */
function dressingTable(k: number): Sprite {
  const S = turned(scene(120, 140, 60, 104), k);
  // the skirt: violet silk gathered in folds to the floor, round the front and sides
  S.box([0, 0, 13], AXES, [22, 11, 13], (f, u, v, n) => {
    if (f === 4) return null;
    const fold = fr((f === 2 || f === 3 ? u : v) * 9);
    const hem = v < 0.08;
    return toneAt(n, SILK, hem ? -0.4 : fold < 0.35 ? -0.25 : 0.12);
  }, 1);
  slab(S, -23, -12, 23, 12, 26, 28.5, VIOLET, 2, 0.15);
  slab(S, -23, -12, 23, -11, 24, 26, GILT, 3, 0.2);
  // the looking-glass: three leaves on the top's back edge, the side ones angled in
  const back = -9;
  const leaf = (x0: number, x1: number, ang: number, zTop: number, id: number, crest: boolean): void => {
    const hinge = ang > 0 ? x1 : ang < 0 ? x0 : (x0 + x1) / 2;
    const P = (a: number, z: number): V3 => {
      const dx = a - hinge;
      return [hinge + dx * Math.cos(ang), back + Math.abs(dx) * Math.sin(Math.abs(ang)), z];
    };
    S.quad([P(x0, 30), P(x1, 30), P(x1, zTop), P(x0, zTop)], (u, v, p) => {
      const [px, py] = S.at(p);
      const ex = Math.min(u, 1 - u) * (x1 - x0) * 0.8;
      const ez = Math.min(v, 1 - v) * (zTop - 30);
      if (ex < 1.6 || ez < 1.6) return GILT[ex < 0.8 || ez < 0.8 ? 1 : u < 0.5 || v > 0.5 ? 4 : 2];
      if (crest && v > 0.86 && Math.abs(u - 0.5) > 0.5 - Math.sqrt(Math.max(0, 1 - ((v - 0.86) / 0.14) ** 2)) * 0.5) return null;
      return reflectionAt(p[0], p[2], true, Math.floor(px), Math.floor(py), Math.min(ex, ez), 0, 6);
    }, id);
  };
  leaf(-21, -8, 0.6, 58, 4, false);
  leaf(8, 21, -0.6, 58, 5, false);
  leaf(-8, 8, 0, 70, 6, true);
  // its crest: a little crown of glass spikes over the middle leaf
  for (let i = -1; i <= 1; i++) S.rod([i * 3, back + 0.5, 70], [i * 3.4, back + 0.5, 70 + (i === 0 ? 8 : 5)], 1.1, 0.3, MIRROR, 7);
  // her things on the top: two combs of ivory, a jewel box, a powder jar, a hand mirror
  for (const [x, y] of [[-14, 5], [-10, 7]] as const) {
    S.box([x, y, 29.2], [[0.9, 0.44, 0], [-0.44, 0.9, 0], [0, 0, 1]], [3.4, 1, 0.6], (f, u) => (f === 4 && fr(u * 7) < 0.4 ? IVORY[1] : IVORY[3]), 8);
  }
  slab(S, -2, -2, 6, 4, 28.5, 33, POAK, 9, 0.1, (f, u) => (f !== 4 && (u < 0.12 || u > 0.88) ? 0.7 : 0));
  slab(S, -2.4, -2.4, 6.4, 4.4, 33, 34.4, METAL, 9, 0.2);
  cylinder(S, 12, 3, 2.6, 28.5, 32, (n) => toneAt(n, SATIN, 0.1), 10, () => SATIN[4]);
  S.egg([12, 3, 32.4], AXES, [2.2, 2.2, 1.2], (n) => toneAt(n, METAL, 0.2), 10);
  S.egg([17, 7, 29.2], [[0.7, -0.7, 0], [0.7, 0.7, 0], [0, 0, 1]], [3, 2.3, 0.6], (n) => (n[2] > 0.9 ? MIRROR[3] : METAL[3]), 11);
  S.rod([19, 5, 29.2], [23, 1, 29.2], 0.6, 0.5, METAL, 11);
  return done(S, 60, 104);
}

/**
 * A DRESSING SCREEN: three tall leaves of violet silk in frames of gilt, folded in a zigzag, a gown of grey satin flung over
 * its top; whole, or half there while someone is behind it. 120 x 130 at (60, 100).
 */
function dressingScreen(half: boolean): Sprite {
  const S = scene(120, 130, 60, 100);
  const keep = half ? (w: V3): boolean => checker(S, w) : undefined;
  const pts: [number, number][] = [[-24, 6], [-8, -6], [8, 6], [24, -6]];
  for (let i = 0; i < 3; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[i + 1];
    S.quad([[x0, y0, 2], [x1, y1, 2], [x1, y1, 66], [x0, y0, 66]], (u, v, p) => {
      if (keep && !keep(p)) return null;
      const L = Math.hypot(x1 - x0, y1 - y0);
      const eu = Math.min(u, 1 - u) * L;
      const ev = Math.min(v, 1 - v) * 64;
      const n: V3 = [-(y1 - y0) / L, (x1 - x0) / L, 0];
      const lit = toneAt(n, ['0', '1', '2', '3', '4'] as unknown as Ramp, 0);
      const k = Number(lit);
      if (eu < 1.5 || ev < 1.5) return GILT[Math.min(4, k + 1)];
      // the silk: a damask in it, a panel's moulding
      if (eu < 3 || ev < 3) return GILT[Math.max(1, k - 1)];
      const ua = fr(u * L / 12);
      const uz = fr(v * 64 / 16);
      const ogee = Math.abs(Math.abs(ua - 0.5) - 0.3 * Math.cos((uz - 0.5) * Math.PI)) < 0.06;
      return SILK[clamp(k + (ogee ? 1 : 0) - 1, 0, 4)];
    }, 1 + i);
  }
  // a gown of grey satin flung over its top, hanging down both sides of the middle leaf
  S.egg([0, 0, 64], [[0.8, 0.6, 0], [-0.6, 0.8, 0], [0, 0, 1]], [9, 3.4, 4], (n) => toneAt(n, SATIN, 0.05), 5, keep);
  for (const [dx, dy] of [[2, 3], [-3, -3]] as const) {
    S.box([dx, dy, 52], [[0.8, 0.6, 0], [-0.6, 0.8, 0], [0, 0, 1]], [6, 0.8, 12], (f, u, _v, n) => toneAt(n, SATIN, fr(u * 4) < 0.3 ? -0.3 : 0.05), 5);
  }
  return done(S, 60, 100);
}

/**
 * A WARDROBE OF GOWNS: a tall armoire of dark oak, its cornice and mouldings picked out in gilt, its doors stood open on
 * her gowns hanging inside, silver-grey satin, violet silk, an old ivory; a crown of glass spikes carved on its cornice.
 * Its front along +y (`k` 0) or +x (1). 130 x 170 at (65, 130).
 */
function wardrobe(k: number): Sprite {
  const S = turned(scene(130, 170, 65, 130), k);
  // the carcass: its back, sides, top and base; inside it dark
  slab(S, -22, -10, 22, -8, 0, 92, POAK, 1, -0.1);
  slab(S, -24, -10, -22, 10, 0, 92, POAK, 1, 0, (f, _u, v) => (f !== 4 && v > 0.9 ? 0.3 : 0));
  slab(S, 22, -10, 24, 10, 0, 92, POAK, 1, 0, (f, _u, v) => (f !== 4 && v > 0.9 ? 0.3 : 0));
  slab(S, -25, -11, 25, 11, 92, 98, POAK, 2, 0.1, (f, _u, v) => (f !== 4 && v > 0.7 ? 0.6 : 0));
  slab(S, -25, -11, 25, 11, 0, 6, POAK, 2, 0);
  S.quad([[-22, -8, 6], [22, -8, 6], [22, -8, 92], [-22, -8, 92]], () => '#140e10', 3);
  // the rail, the gowns on it: long falls of cloth from their shoulders, folds down them
  S.rod([-21, -2, 84], [21, -2, 84], 0.8, 0.8, METAL, 4);
  const gowns: [number, Ramp][] = [[-15, SATIN], [-7, SILK], [1, IVORY], [9, VELVET], [16, SATIN]];
  gowns.forEach(([x, R], i) => {
    S.box([x, -1 + (i % 2), 50], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [4.2, 3, 32], (f, u, v, n) => {
      const flare = 1 - v;
      if (f === 2 && Math.abs(u - 0.5) > 0.5 - flare * 0.1) return null;
      return toneAt(n, R, fr(u * 3 + v * 0.3) < 0.3 ? -0.3 : 0.05);
    }, 5 + i);
    S.egg([x, -1 + (i % 2), 81], AXES, [4.4, 2.6, 2.4], (n) => toneAt(n, R, 0.1), 5 + i);
  });
  // the doors, stood open wide: oak panels framed in gilt beads, a long glass in each (its silver gone grey)
  for (const s of [-1, 1]) {
    const hinge = s * 23;
    const ang = 1.9;
    const P = (a: number, z: number): V3 => [hinge - s * Math.cos(ang) * a, 10 + Math.sin(ang) * a, z];
    S.quad([P(0, 7), P(22, 7), P(22, 90), P(0, 90)], (u, v, p) => {
      const e = Math.min(u * 22, (1 - u) * 22, v * 83, (1 - v) * 83);
      if (e < 1.2) return GILT[3];
      if (e < 3) return POAK[s < 0 ? 3 : 2];
      const inner = Math.min(u * 22 - 4, (1 - u) * 22 - 4, v * 83 - 6, (1 - v) * 83 - 6);
      if (inner > 0) return inner < 1 ? GILT[2] : mix(MIRROR[2], MIRROR[s < 0 ? 3 : 1], fr((p[2] + u * 22) / 30) < 0.15 ? 0.6 : 0.2);
      return POAK[s < 0 ? 3 : 2];
    }, 10 + (s > 0 ? 1 : 0));
  }
  // the cornice's crest: a crown of glass spikes, carved and gilt
  for (let i = -2; i <= 2; i++) S.rod([i * 4, 10.5, 98], [i * 4.4, 11, 98 + (i === 0 ? 10 : Math.abs(i) === 1 ? 7 : 5)], 1.3, 0.3, MIRROR, 12);
  S.rod([-10, 11, 98.5], [10, 11, 98.5], 1.2, 1.2, GILT, 12);
  return done(S, 65, 130);
}

/** A VELVET BANQUETTE: a long seat of violet velvet, buttoned, on six turned legs of gilt, its ends rolled. Along x (`k` 0) or along y (1). 110 x 70 at (55, 46). */
function banquette(k: number): Sprite {
  const S = turned(scene(110, 70, 55, 46), k);
  for (const x of [-26, 0, 26]) for (const y of [-7, 7]) S.rod([x, y, 0], [x, y, 10], 1.3, 1.1, GILT, 1);
  slab(S, -28, -9, 28, 9, 9, 12, GILT, 2, 0.1);
  S.box([0, 0, 15], AXES, [27, 8.5, 3.6], (f, u, v, n) => {
    if (f === 4) {
      // the buttons, in a lozenge
      const bu = fr(u * 7);
      const bv = fr(v * 2 + (Math.floor(u * 7) % 2) * 0.5);
      if (Math.abs(bu - 0.5) < 0.08 && Math.abs(bv - 0.5) < 0.12) return VELVET[0];
      return toneAt(n, VELVET, Math.abs(bu - 0.5) < 0.25 ? 0.15 : 0);
    }
    return toneAt(n, VELVET, 0);
  }, 3);
  // its ends rolled: a bolster across each, a gilt boss at its end
  for (const x of [-27, 27]) {
    S.egg([x, 0, 17], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [3.4, 8.6, 3.6], (nn, w) => toneAt(nn, VELVET, fr(w[1] / 3) < 0.3 ? -0.25 : 0.05), 4);
    S.egg([x, 8.4, 17], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [1.6, 0.8, 1.6], (nn) => toneAt(nn, GILT, 0.2), 4);
  }
  return done(S, 55, 46);
}

/**
 * A CONSOLE TABLE of gilt, its legs scrolled, a top of violet marble; on it a tall silver vase of lilies, dead and
 * bowed; or knocked over (breakable): on its back, its marble cracked, the vase rolled and the lilies strewn. 110 x 120 at (55, 96).
 */
function consoleTable(broken: boolean): Sprite {
  const S = scene(110, 120, 55, 96);
  if (!broken) {
    for (const x of [-16, 16]) {
      S.rod([x, -5, 0], [x * 0.9, 0, 14], 1.6, 1.2, GILT, 1);
      S.rod([x * 0.9, 0, 14], [x, -3, 26], 1.2, 1.7, GILT, 1);
      S.egg([x * 0.9, 0.5, 14], AXES, [2.2, 2.2, 2.6], (n) => toneAt(n, GILT, 0.1), 1);
    }
    slab(S, -20, -8, 20, 6, 24, 28, GILT, 2, 0, (f, u) => (f === 2 && fr(u * 10) < 0.25 ? -0.5 : 0));
    slab(S, -22, -9, 22, 7, 28, 30.5, VIOLET, 3, 0.15);
    // the vase: a foot, a slender belly, a flared lip
    cylinder(S, 0, -1, (z) => (z < 33 ? 3.6 : z < 36 ? 2 : 2 + Math.sin(((z - 36) / 20) * Math.PI) * 3.6 + (z > 52 ? (z - 52) * 0.6 : 0)), 30.5, 57, (n) => toneAt(n, METAL, 0.05), 4, () => '#141018');
    // the lilies, dead: long stems bowed over, the heads hung, browned
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 + 0.4;
      const p0: V3 = [Math.cos(a) * 1.5, -1 + Math.sin(a) * 1.5, 56];
      const p1: V3 = [Math.cos(a) * 7, -1 + Math.sin(a) * 7, 74 + (i % 2) * 5];
      const p2: V3 = [Math.cos(a) * 13, -1 + Math.sin(a) * 13, 66 + (i % 3) * 3];
      S.rod(p0, p1, 0.6, 0.5, DRY, 5);
      S.rod(p1, p2, 0.5, 0.4, DRY, 5);
      S.egg([p2[0], p2[1], p2[2] - 2.5], AXES, [2, 2, 3], (n) => toneAt(n, i % 2 ? IVORY : DRY, -0.1), 6);
    }
  } else {
    // on its back, its legs in the air, the marble cracked across; the vase rolled off, the lilies strewn
    slab(S, -20, -8, 20, 6, 0, 4, GILT, 2, 0.1);
    for (const x of [-16, 16]) S.rod([x, -2, 3], [x * 0.9, 2, 26], 1.4, 1.2, GILT, 1);
    S.quad([[-22, 7, 0.4], [22, 7, 0.4], [22, 16, 0.4], [-22, 16, 0.4]], (u, v) => (Math.abs(u - 0.4 - v * 0.2) < 0.015 ? VIOLET[0] : VIOLET[v > 0.85 ? 3 : 2]), 3);
    S.rod([14, 18, 3], [28, 12, 3], 3.2, 2.2, METAL, 4);
    for (let i = 0; i < 5; i++) S.rod([26 - i * 3, 10 + i * 2, 0.8], [10 - i * 4, 20 + i * 3, 0.8], 0.5, 0.4, DRY, 5);
  }
  return done(S, 55, 96);
}

// =================================================================================================
// LIGHT: the silver candelabrum, the sconce

/** Candles at points of a scene: each a stick of wax in its cup, its flame (an honest fire); their lights. */
function candlesAt(S: Scene, tops: readonly V3[], id: number): { at: V3; r: number; color: string; a: number }[] {
  const lights: { at: V3; r: number; color: string; a: number }[] = [];
  for (const t of tops) {
    cylinder(S, t[0], t[1], 2.4, t[2] - 1, t[2] + 1, (n) => toneAt(n, METAL, 0.2), id, () => METAL[4]);
    cylinder(S, t[0], t[1], 1.3, t[2] + 1, t[2] + 7, (n) => toneAt(n, WAX, 0.1), id + 1, () => WAX[3]);
    const [fx, fy] = S.at([t[0], t[1], t[2] + 8]);
    const X = Math.round(fx);
    const Y = Math.round(fy);
    S.put(X, Y, 1e4, FLAME[0], id + 2);
    S.put(X, Y - 1, 1e4, FLAME[2], id + 2);
    S.put(X, Y - 2, 1e4, FLAME[2], id + 2);
    S.put(X + 1, Y - 1, 1e4, FLAME[1], id + 2);
    S.put(X, Y - 3, 1e4, FLAME[1], id + 2);
    lights.push({ at: [t[0], t[1], t[2] + 9], r: 12, color: EMBER[2], a: 0.26 });
  }
  return lights;
}
/** A SILVER CANDELABRUM standing tall: three scrolled feet, a turned stem with its knops, five arms curving up, five candles burning (an honest flame). 80 x 130 at (40, 112). */
function candelabrum(): Sprite {
  const S = scene(80, 130, 40, 112);
  const R = METAL;
  for (let i = 0; i < 3; i++) {
    const ang = (i / 3) * Math.PI * 2 + 0.5;
    S.rod([0, 0, 7], [Math.cos(ang) * 6, Math.sin(ang) * 6, 3], 1.4, 1.2, R, 1);
    S.rod([Math.cos(ang) * 6, Math.sin(ang) * 6, 3], [Math.cos(ang) * 10, Math.sin(ang) * 10, 0.6], 1.2, 1.4, R, 1);
  }
  S.rod([0, 0, 4], [0, 0, 66], 1.6, 1.3, R, 2);
  // the knops: each a flattened swelling where the stem's turnings meet
  for (const [z, r] of [[12, 3.4], [30, 2.8], [50, 3]] as const) S.egg([0, 0, z], AXES, [r, r, 1.8], (n) => toneAt(n, R, 0.1), 2);
  S.egg([0, 0, 60], AXES, [2.6, 2.6, 3.4], (n) => toneAt(n, R, 0.1), 2);
  const tops: V3[] = [[0, 0, 74]];
  for (const s of [-1, 1]) {
    for (const reach of [8, 15]) {
      const mid: V3 = [s * reach * 0.62, -s * reach * 0.62, 55];
      const top: V3 = [s * reach * 0.71, -s * reach * 0.71, reach > 10 ? 64 : 68];
      S.rod([0, 0, 58], mid, 1, 1, R, 3);
      S.rod(mid, top, 1, 1, R, 3);
      tops.push(top);
    }
  }
  const lights = candlesAt(S, tops, 4);
  return done(S, 40, 112, lights);
}
/**
 * A SCONCE OF CANDLES on the wall (a girandole): a backplate of mirror glass in a carved gilt frame, three scrolled arms
 * out from it, three candles burning (an honest flame), their likeness in the glass behind. 90 x 130 at (45, 112).
 */
function sconce(): { left: Sprite; right: Sprite } {
  let lights: { at: V3; r: number; color: string; a: number }[] = [];
  const out = frontPiece((S, w, alongX) => {
    const z0 = 34;
    const z1 = 62;
    framedGlass(S, w, alongX, -9, 9, z0, z1, (a, z, px, py, edge) => {
      // the candles' likeness in the glass, warm
      for (const ca of [-12, 0, 12]) {
        const ez = z - (ca === 0 ? 70 : 62) - 6;
        if (Math.abs((a - ca * 0.5) * 0.8) < 1 && ez > -2 && ez < 1) return FLAME[1];
      }
      return reflectionAt(a, z, alongX, px, py, edge, 0, 10);
    }, 1, 0.6, false);
    const tops: V3[] = [];
    for (const [ca, h] of [[-12, 58], [0, 66], [12, 58]] as const) {
      const root = w(ca * 0.3, 1.5, 40);
      const mid = w(ca * 0.8, 8, 44);
      const top = w(ca, 10, h);
      S.rod(root, mid, 1, 1, GILT, 3);
      S.rod(mid, top, 1, 1, GILT, 3);
      tops.push(top);
    }
    lights = candlesAt(S, tops, 4);
  }, 90, 130, () => lights, 18);
  return out;
}

// =================================================================================================
// THE GALLERIES: a bust on a plinth, a tapestry in rags, the queen's doors, a gate of wrought silver

/**
 * A BUST of a lady of the court on a plinth: her shoulders draped, her neck long, her hair up in a knot, her face turned a
 * little to her right; marble gone grey; the plinth fluted, its top and foot of violet marble. Or toppled (breakable): the
 * plinth stands, the bust thrown down beside it, its head broken off. 80 x 130 at (40, 112).
 */
function bust(toppled: boolean): Sprite {
  const S = scene(80, 130, 40, 112);
  slab(S, -8, -8, 8, 8, 0, 4, VIOLET, 1, 0.1);
  cylinder(S, 0, 0, (z) => 6 - (z - 4) * 0.02, 4, 40, (n, a) => toneAt(n, STATUARY, Math.abs(Math.sin(a * 8)) < 0.3 ? -0.35 : 0), 2);
  slab(S, -8, -8, 8, 8, 40, 44, VIOLET, 3, 0.15);
  const R = STATUARY;
  const at = toppled ? null : 44;
  if (at !== null) {
    // the shoulders and breast, draped: wide, sloping, cut off in a curve under the breast
    S.egg([0, 0, at + 6], [[0.707, -0.707, 0], [0.707, 0.707, 0], [0, 0, 1]], [11, 6, 7], (n, w) => (w[2] < at + 0.5 ? null : toneAt(n, R, fr((w[0] - w[1]) * 0.12 + w[2] * 0.1) < 0.2 ? -0.3 : 0.05)), 4);
    // the neck, long; the head, an egg longer than wide, its face turned a little to her right (toward the eye)
    S.rod([0, 0, at + 10], [0.6, 0.6, at + 17], 2.4, 2.2, R, 5);
    const F: V3 = [0.84, 0.54, 0];
    S.egg([0.8, 0.8, at + 21], [F, [-F[1], F[0], 0], [0, 0, 1]], [4, 3.6, 5], (n) => toneAt(n, R, 0.05), 6);
    // her nose, her brow, the hollow of her eyes, her lips: a few strokes
    const face: V3 = [0.8 + F[0] * 3.9, 0.8 + F[1] * 3.9, at + 21];
    S.egg(face, AXES, [1, 1, 1.7], (n) => toneAt(n, R, 0.25), 7);
    const [ex, ey] = S.at([face[0], face[1], at + 22.5]);
    S.put(Math.round(ex) - 2, Math.round(ey), 1e4, R[1], 7);
    S.put(Math.round(ex) + 1, Math.round(ey), 1e4, R[1], 7);
    S.put(Math.round(ex), Math.round(ey) + 3, 1e4, R[1], 7);
    // her hair up in a knot, a band round it
    S.egg([-0.6, -0.6, at + 25], AXES, [3.6, 3.6, 2.6], (n) => toneAt(n, R, -0.1), 8);
    S.egg([-2.2, -2.2, at + 27], AXES, [2.2, 2.2, 2.2], (n) => toneAt(n, R, -0.05), 8);
  } else {
    // thrown down: the bust on its back on the floor beside the plinth, its head rolled from it, a shard of the shoulder
    S.egg([16, 10, 5], [[0.7, 0.7, 0], [-0.7, 0.7, 0], [0, 0, 1]], [11, 6, 4.5], (n) => toneAt(n, R, 0.05), 4);
    S.rod([22, 16, 5], [25, 19, 5], 2.4, 2.2, R, 5);
    S.egg([30, 6, 3.6], AXES, [4, 4.4, 3.6], (n) => toneAt(n, R, 0.05), 6);
    S.egg([28, 3, 4.4], AXES, [2.4, 2.4, 2], (n) => toneAt(n, R, -0.1), 6);
    S.egg([8, 20, 1.4], AXES, [3, 2, 1.4], (n) => toneAt(n, R, 0), 7);
  }
  return done(S, 40, 112);
}

/**
 * A TAPESTRY IN RAGS on the wall: hung from a rod of gilt, its weaving a dark forest of the book (the huntsman's wood, a
 * boar in it), a border of violet and silver; torn and burnt, hanging in strips, the wall behind it. 90 x 140 at (45, 116).
 */
function tapestry(): { left: Sprite; right: Sprite } {
  return frontPiece((S, w) => {
    const a0 = -26;
    const a1 = 26;
    const top = 92;
    const bottom = 22;
    S.rod(w(a0 - 4, 2, top + 2), w(a1 + 4, 2, top + 2), 1.1, 1.1, GILT, 1);
    for (const a of [a0 - 4, a1 + 4]) S.egg(w(a, 2, top + 2), AXES, [2, 2, 2], (n) => toneAt(n, GILT, 0.2), 1);
    S.quad([w(a0, 1, bottom), w(a1, 1, bottom), w(a1, 1, top), w(a0, 1, top)], (u, v) => {
      const a = a0 + (a1 - a0) * u;
      const z = bottom + (top - bottom) * v;
      // torn in strips from its foot, each its own length, their ends burnt dark
      const strip = Math.floor((a - a0) / 7);
      const end = bottom + 6 + 34 * hash(strip, 0, 1901);
      if (z < end) return null;
      if (z < end + 2) return '#1a1416';
      if (fr((a - a0) / 7) < 0.08 && z < top - 30) return null;
      // a hole burnt through
      if (Math.hypot((a - 10) * 0.8, z - 62) < 6 + 2 * Math.sin(a)) return Math.hypot((a - 10) * 0.8, z - 62) > 5 ? '#1a1416' : null;
      // the border: violet, a silver line
      const ea = Math.min(a - a0, a1 - a) * 0.8;
      const ez = top - z;
      if (ea < 4 || ez < 5) return ea < 1.5 || ez < 1.5 ? SILVER[1] : VIOLET[3];
      // the weaving: a dark wood, trees in rows, a pale boar among them; its threads in rows
      const tx = fr((a * 0.8) / 9);
      const trunk = Math.abs(tx - 0.5) < 0.08 && z < 78;
      const crown = Math.hypot((tx - 0.5) * 9, (z - 74 - 4 * hash(Math.floor((a * 0.8) / 9), 1, 1903)) / 1.4) < 4.5;
      const boar = Math.hypot((a + 6) * 0.8 / 7, (z - 40) / 3.4) < 1 || Math.hypot((a + 12) * 0.8 / 3, (z - 41) / 2.4) < 1;
      const row = Math.floor(z) % 2 === 0;
      if (boar) return row ? SILVER[2] : SILVER[1];
      if (crown) return row ? '#2c3a30' : '#24302a';
      if (trunk) return '#2a2020';
      return row ? '#2e2638' : '#282032';
    }, 2);
  }, 90, 140, undefined, 24);
}

/**
 * THE QUEEN'S DOORS: a tall pair of doors lacquered dark violet, each leaf two panels of mirror glass in silver mouldings,
 * their handles silver; over them a pediment of gilt, a crown of glass spikes in it. Shut, or stood open on the dark.
 * On both faces. 120 x 150 at (60, 128).
 */
function queensDoors(open: boolean): { left: Sprite; right: Sprite } {
  return frontPiece((S, w, alongX) => {
    const HW = 22;
    const HT = 72;
    // the doorcase: grey marble jambs, the lintel, the pediment over it
    for (const s of [-1, 1]) S.box(w(s * (HW + 3), 1.5, HT / 2), [[1, 0, 0], [0, 1, 0], [0, 0, 1]].map((v) => w(v[0], v[1], v[2]).map((c, i) => c - w(0, 0, 0)[i])) as unknown as [V3, V3, V3], [3, 1.5, HT / 2], (f, _u, v, n) => toneAt(n, SILVER, f === 4 ? 0.3 : v > 0.95 ? 0.4 : 0), 1);
    S.rod(w(-HW - 6, 2, HT + 2), w(HW + 6, 2, HT + 2), 2.4, 2.4, SILVER, 2);
    // the pediment: a broken scroll of gilt, a crown of glass spikes between its ends
    for (const s of [-1, 1]) {
      S.rod(w(s * (HW + 4), 3, HT + 5), w(s * 8, 3, HT + 14), 1.4, 1.4, GILT, 3);
      S.egg(w(s * 8, 3, HT + 15), AXES, [2.2, 2.2, 2.2], (n) => toneAt(n, GILT, 0.2), 3);
    }
    for (let i = -2; i <= 2; i++) S.rod(w(i * 3.2, 3, HT + 6), w(i * 3.6, 3, HT + 6 + (i === 0 ? 12 : Math.abs(i) === 1 ? 9 : 6)), 1.2, 0.3, MIRROR, 4);
    S.rod(w(-8, 3, HT + 6), w(8, 3, HT + 6), 1.2, 1.2, GILT, 4);
    S.quad([w(-HW, 0.2, 0), w(HW, 0.2, 0), w(HW, 0.2, HT), w(-HW, 0.2, HT)], () => HOLE, 5);
    const leaf = (side: number, id: number): void => {
      const hinge = side * HW;
      const ang = open ? 1.3 : 0;
      const P = (a: number, z: number): V3 => w(hinge + (a - hinge) * Math.cos(ang), 0.8 + Math.abs(a - hinge) * Math.sin(ang), z);
      const a0 = side < 0 ? -HW : 0;
      const a1 = side < 0 ? 0 : HW;
      S.quad([P(a0, 0), P(a1, 0), P(a1, HT), P(a0, HT)], (u, v, p) => {
        const a = a0 + (a1 - a0) * u;
        const z = v * HT;
        const [px, py] = S.at(p);
        // two tall panels of mirror glass in silver mouldings, the lower short, the upper long
        const ea = Math.min(a - a0, a1 - a);
        for (const [z0, z1] of [[6, 24], [30, 66]] as const) {
          const inA = ea > 4;
          if (inA && z > z0 && z < z1) {
            const e = Math.min(ea - 4, z - z0, z1 - z);
            if (e < 1.2) return METAL[e < 0.6 ? 1 : 3];
            return open ? mix(MIRROR[1], MIRROR[2], 0.5) : reflectionAt(a, z, alongX, Math.floor(px), Math.floor(py), e * 0.8, 0, 8);
          }
        }
        // the handle, silver
        if (Math.abs(a - (side < 0 ? -2.4 : 2.4)) < 1.2 && Math.abs(z - 34) < 4) return METAL[4];
        // the lacquer: dark violet, a lit edge
        if (ea < 1) return VIOLET[open ? 2 : 4];
        return VIOLET[open ? 1 : 2];
      }, id);
    };
    leaf(-1, 6);
    leaf(1, 7);
  }, 120, 150, undefined, 22);
}

/**
 * A GATE OF WROUGHT SILVER across a gallery: two piers of grey marble, each crowned with a crown of glass spikes; between them
 * two leaves of silvered iron, their bars twisted, scrolls at their feet and heads, their tops spiked; shut or open. Across
 * x (`k` 0) or across y (1). 130 x 150 at (65, 116).
 */
function silverGate(open: boolean, k: number): Sprite {
  const S = turned(scene(130, 150, 65, 116), k);
  for (const x of [-30, 30]) {
    slab(S, x - 6, -6, x + 6, 6, 0, 60, SILVER, 1, 0, (f, u, v) => (f !== 4 && (fr(v * 6) < 0.07 || fr((f === 2 ? u : v) * 2) < 0.04) ? -0.6 : 0));
    slab(S, x - 7, -7, x + 7, 7, 60, 64, SILVER, 1, 0.2);
    for (let i = -2; i <= 2; i++) S.rod([x + i * 2.4, 0, 64], [x + i * 2.7, 0, 64 + (i === 0 ? 12 : Math.abs(i) === 1 ? 9 : 6)], 1.1, 0.3, MIRROR, 2);
  }
  const ang = open ? 1.25 : 0;
  for (const side of [-1, 1]) {
    const hx = side * 24;
    const P = (a: number, z: number): V3 => [hx - side * Math.cos(ang) * a, -Math.sin(ang) * a, z];
    S.rod(P(0, 6), P(24, 6), 0.9, 0.9, METAL, 3);
    S.rod(P(0, 50), P(24, 52), 0.9, 0.9, METAL, 3);
    for (let b = 1; b <= 7; b++) {
      const a = b * 3.2;
      // a twisted bar: a lit fleck down it every few pixels
      S.rod(P(a, 3), P(a, 52), 0.65, 0.65, METAL, 3);
      S.rod(P(a, 52), P(a, 58 + (b % 2) * 3), 0.7, 0.15, METAL, 3);
    }
    // scrolls at its foot: a C of iron in each space
    for (let b = 0; b < 3; b++) {
      for (let i = 0; i < 8; i++) {
        const t0 = (i / 8) * Math.PI * 1.5;
        const t1 = ((i + 1) / 8) * Math.PI * 1.5;
        const c = 4 + b * 8;
        S.rod(P(c + Math.cos(t0) * 2.6, 14 + Math.sin(t0) * 2.6), P(c + Math.cos(t1) * 2.6, 14 + Math.sin(t1) * 2.6), 0.5, 0.5, METAL, 4);
      }
    }
  }
  return done(S, 65, 116);
}

// =================================================================================================
// THE CHAPEL: a stained-glass window, a pew, the glass coffin; the colours on the floor

/**
 * A STAINED-GLASS WINDOW in the wall: two tall lancets under a quatrefoil, the stone's tracery between, lit by the day
 * (colour, never a glow). The book's first page: in the left lancet the queen sewing at her window framed in black ebony,
 * the snow falling; in the right, three drops of red on the snow; in the quatrefoil, her crown. 100 x 150 at (50, 128).
 */
function stainedWindow(): { left: Sprite; right: Sprite } {
  return frontPiece((S, w) => {
    const glass = (a: number, z: number): string | null => {
      // the two lancets, pointed; the quatrefoil over them
      const lancet = (c: number): number | null => {
        const half = 8;
        const u = a - c;
        if (Math.abs(u) > half || z < 18) return null;
        const spring = 72;
        if (z > spring && Math.hypot(Math.abs(u) + half, (z - spring) * 1.4) > 2 * half) return null;
        return u;
      };
      const qa = a;
      const qz = z - 92;
      const qr = Math.min(...[[0, 4], [0, -4], [4, 0], [-4, 0]].map(([dx, dz]) => Math.hypot(qa - dx * 1.25, qz - dz)));
      if (qr < 5) {
        if (qr > 4) return LEADING;
        // her crown: a band of gold, spikes of pale glass over it
        if (qz > -2 && qz < 0) return GLASS_C.gold[1];
        if (qz >= 0 && qz < 5 && Math.abs(fr(qa / 3) - 0.5) < 0.25 * (1 - qz / 5)) return GLASS_C.pale[1];
        return GLASS_C.blue[0];
      }
      for (const [c, k] of [[-11, 0], [11, 1]] as const) {
        const u = lancet(c);
        if (u === null) continue;
        if (8 - Math.abs(u) < 1.2 || z < 19.5) return LEADING;
        if (Math.abs(fr(u / 4 + 0.5) - 0.5) < 0.12 || Math.abs(fr(z / 8) - 0.5) > 0.44) return LEADING;
        const tone = hash(Math.floor(u / 4 + 9), Math.floor(z / 8), 1911 + k) > 0.6 ? 1 : 0;
        if (8 - Math.abs(u) < 2.8) return GLASS_C.gold[tone];
        const t = (z - 18) / 70;
        if (k === 0) {
          // the queen at her window: the ebony frame, her violet gown and pale head within, the snow outside
          const inFrame = Math.abs(u) < 4.5 && t > 0.3 && t < 0.8;
          const onFrame = inFrame && (4.5 - Math.abs(u) < 1.2 || t < 0.34 || t > 0.76);
          if (onFrame) return GLASS_C.ebony[tone];
          if (inFrame) {
            if (Math.hypot(u, (t - 0.64) * 40) < 1.8) return GLASS_C.snow[1];
            if (t < 0.6 && Math.abs(u) < 1 + (0.6 - t) * 12) return GLASS_C.violet[tone];
            return GLASS_C.blue[tone];
          }
          return t > 0.85 ? GLASS_C.blue[tone] : GLASS_C.snow[tone];
        }
        // the three drops of red on the snow
        if ([0.3, 0.42, 0.52].some((dz, i) => Math.hypot(u - (i - 1) * 2.2, (t - dz) * 50) < 1.8)) return GLASS_C.ruby[1];
        return t > 0.85 ? GLASS_C.blue[tone] : GLASS_C.snow[tone];
      }
      return null;
    };
    // the stone: its tracery, a surround round the whole, its sill
    S.quad([w(-24, 0.5, 12), w(24, 0.5, 12), w(24, 0.5, 104), w(-24, 0.5, 104)], (u, v) => {
      const a = -24 + 48 * u;
      const z = 12 + 92 * v;
      const g = glass(a, z);
      if (g) return g;
      // within the window's outline the tracery's stone; round it, its moulded surround
      const near = [glass(a - 2, z), glass(a + 2, z), glass(a, z - 2), glass(a, z + 2)].some((q) => q !== null);
      if (near) return CSTONE[a < 0 ? 3 : 2];
      const surround = (Math.abs(a) < 21 && z > 15 && z < 80) || Math.hypot(a, z - 80) < 21;
      if (surround) return Math.hypot(a, z - 80) > 19 || Math.abs(a) > 19 ? CSTONE[1] : CSTONE[2];
      return null;
    }, 1);
    // the sill, stepped out
    S.box(w(0, 3, 13), [[1, 0, 0], [0, 1, 0], [0, 0, 1]].map((v) => w(v[0], v[1], v[2]).map((c, i) => c - w(0, 0, 0)[i])) as unknown as [V3, V3, V3], [22, 3, 1.5], (f, _u, _v, n) => toneAt(n, CSTONE, f === 4 ? 0.4 : 0), 2);
  }, 100, 150, undefined, 22);
}

/** A CHAPEL PEW: a bench of dark oak, its back panelled, its ends carved with a pointed arch, a violet cushion along its seat. Along x (`k` 0) or along y (1). 120 x 90 at (60, 62). */
function pew(k: number): Sprite {
  const S = turned(scene(120, 90, 60, 62), k);
  slab(S, -26, -4, 26, 4, 10, 12, POAK, 1, 0.15);
  slab(S, -25, -3, 25, 3, 12, 14, VELVET, 2, 0.1);
  slab(S, -26, -6, 26, -4, 10, 28, POAK, 3, -0.05, (f, u) => (f === 2 && fr(u * 6) < 0.05 ? -0.6 : 0));
  slab(S, -27, -6.5, 27, -3.5, 28, 30, POAK, 3, 0.25);
  for (const s of [-1, 1]) {
    S.box([s * 27, -1, 15], AXES, [1.2, 6, 15], (f, u, v, n) => {
      // the end: a pointed arch carved in it, a finial
      if ((f === 0 || f === 1) && Math.abs(u - 0.5) < 0.22 && v > 0.15 && v < 0.6 + 0.2 * (1 - Math.abs(u - 0.5) / 0.22)) return toneAt(n, POAK, -0.5);
      return toneAt(n, POAK, v > 0.94 ? 0.4 : 0);
    }, 4);
  }
  return done(S, 60, 62);
}

/**
 * A GLASS COFFIN (the book's: a coffin of glass, so that she could be seen from every side), on a bier of dark oak draped
 * in violet: empty, its lid stood ajar, dust on its panes, its frame of silver; inside, a pale silk lining and a pillow.
 * Its panes drawn as glass is in pixels: every other pixel, so what is in it shows through. 150 x 110 at (75, 74).
 */
function glassCoffin(): Sprite {
  const S = scene(150, 110, 75, 74);
  // the bier: four legs, a top, a cloth of violet over it hanging in folds
  for (const x of [-28, 28]) for (const y of [-10, 10]) S.rod([x, y, 0], [x, y, 14], 1.4, 1.4, POAK, 1);
  S.box([0, 0, 15], AXES, [32, 13, 2], (f, u, v, n) => (f === 4 ? toneAt(n, VELVET, 0) : toneAt(n, VELVET, fr((f < 2 ? v : u) * 12) < 0.35 ? -0.3 : 0.05)), 2);
  S.box([0, 0, 12], AXES, [31, 12.5, 3], (f, u, _v, n) => (f === 4 ? null : toneAt(n, VELVET, fr(u * 14) < 0.4 ? -0.35 : 0)), 2);
  // the lining: pale silk, a pillow at its head
  const z0 = 17;
  S.quad([[-26, -9, z0 + 1], [26, -9, z0 + 1], [26, 9, z0 + 1], [-26, 9, z0 + 1]], (u, v) => (fr(u * 8 + v * 0.5) < 0.2 ? SATIN[2] : SATIN[3]), 3);
  S.egg([-21, 0, z0 + 3], AXES, [4, 7, 2], (n) => toneAt(n, SATIN, 0.15), 4);
  // the glass: the box's sides and ends, in silver frames; every other pixel, dusty
  const frame = (a: V3, b: V3): void => S.rod(a, b, 0.9, 0.9, METAL, 5);
  const top = z0 + 14;
  for (const [x0, y0, x1, y1] of [[-27, -10, 27, -10], [-27, 10, 27, 10], [-27, -10, -27, 10], [27, -10, 27, 10]] as const) {
    S.quad([[x0, y0, z0], [x1, y1, z0], [x1, y1, top], [x0, y0, top]], (_u, v, p) => {
      if (!checker(S, p)) return null;
      return hash(Math.floor(p[0] + p[1]), Math.floor(p[2] / 3), 1921) > 0.75 ? PANE[1] : v > 0.85 ? PANE[3] : PANE[2];
    }, 6);
    frame([x0, y0, z0], [x1, y1, z0]);
    frame([x0, y0, top], [x1, y1, top]);
  }
  for (const [x, y] of [[-27, -10], [27, -10], [-27, 10], [27, 10]] as const) frame([x, y, z0], [x, y, top]);
  // the lid, stood ajar: lifted at its foot end, slid aside; its glass dusty, a silver edge
  const L = (x: number, y: number): V3 => [x + 4, y + 7, top + 2 + (x + 27) * 0.18];
  S.quad([L(-27, -10), L(27, -10), L(27, 10), L(-27, 10)], (u, v, p) => {
    const e = Math.min(u * 54, (1 - u) * 54, v * 20, (1 - v) * 20);
    if (e < 1.2) return METAL[e < 0.6 ? 2 : 4];
    if (!checker(S, p)) return null;
    return fr(u * 3 + v * 0.4) < 0.1 ? PANE[4] : hash(Math.floor(u * 20), Math.floor(v * 8), 1923) > 0.7 ? PANE[1] : PANE[2];
  }, 7);
  return done(S, 75, 74);
}

/**
 * THE COLOURS OF THE STAINED GLASS lying on the floor where the day comes through it: long patches of ruby, blue, gold and
 * white, the leading's lines dark across them; drawn as light lies in pixels, every other pixel, the floor showing between.
 * A floor tile. 110 x 60 at (55, 30).
 */
function windowColours(): Sprite {
  return lying(110, 60, 55, 30, (u, v, px, py) => {
    if (((px + py) & 1) === 1) return null;
    // three patches, slanting away from the light: each a lancet's shape laid long on the floor
    for (const [cu, cv, k] of [[-0.3, -0.1, 0], [0.05, 0.05, 1], [0.38, 0.18, 2]] as const) {
      const a = (u - cu) * 0.7 - (v - cv) * 0.7;
      const b = (u - cu) * 0.7 + (v - cv) * 0.7;
      if (Math.abs(a) > 0.08 || b < -0.3 || b > 0.3) continue;
      if (b > 0.18 && Math.hypot(Math.abs(a) + 0.08, (b - 0.18) * 1.3) > 0.16) continue;
      const qa = fr(a / 0.05 + 0.5);
      const qb = fr(b / 0.08);
      if (qa < 0.12 || qb < 0.1) return LEADING;
      const t = (b + 0.3) / 0.6;
      if (k === 1 && [0.3, 0.45].some((d) => Math.abs(t - d) < 0.05) && Math.abs(a) < 0.03) return GLASS_C.ruby[1];
      if (Math.abs(a) > 0.055) return GLASS_C.gold[0];
      return t > 0.8 ? GLASS_C.blue[1] : k === 2 ? GLASS_C.violet[1] : GLASS_C.snow[0];
    }
    return null;
  });
}

// =================================================================================================
// THE GLASSHOUSE: a bench of dead orchids, an orchid in its pot, a pane fallen from the roof; the skylight

/** AN ORCHID, DEAD, in its pot: broad leathery leaves gone yellow-brown and flopped over the rim, dry grey roots, its flower spike arched and bowed, the last blooms shrivelled. */
function deadOrchid(S: Scene, x: number, y: number, z: number, seed: number, id: number): void {
  cylinder(S, x, y, (zz) => 3.8 + (zz - z) * 0.2, z, z + 8, (n) => toneAt(n, CLAYPOT, 0), id, () => '#1a1210');
  const top = z + 7.5;
  const nl = 3 + Math.floor(hash(seed, 1, 1930) * 2);
  for (let i = 0; i < nl; i++) {
    const a = (i / nl) * Math.PI * 2 + hash(i, seed, 1931) * 0.8;
    const d: V3 = [Math.cos(a), Math.sin(a), 0];
    const mid: V3 = [x + d[0] * 5, y + d[1] * 5, top + 1.5];
    const A0: V3 = [d[0] * 0.8 / 1.0, d[1] * 0.8 / 1.0, -0.6];
    const n = Math.hypot(A0[0], A0[1], A0[2]);
    const a0: V3 = [A0[0] / n, A0[1] / n, A0[2] / n];
    const a1: V3 = [-d[1], d[0], 0];
    const a2: V3 = [a0[1] * a1[2] - a0[2] * a1[1], a0[2] * a1[0] - a0[0] * a1[2], a0[0] * a1[1] - a0[1] * a1[0]];
    S.egg(mid, [a0, a1, a2], [6, 2.3, 0.7], (nn) => toneAt(nn, DRY, 0.15), id + 1);
  }
  for (let r = 0; r < 2; r++) {
    const a = hash(r, seed, 1932) * Math.PI * 2;
    S.rod([x + Math.cos(a) * 3, y + Math.sin(a) * 3, top], [x + Math.cos(a) * 7, y + Math.sin(a) * 7, top - 4], 0.5, 0.4, IVORY, id + 1);
  }
  const b = hash(seed, 2, 1933) * Math.PI * 2;
  const pts: V3[] = [];
  for (let k = 0; k <= 6; k++) {
    const t = k / 6;
    pts.push([x + Math.cos(b) * t * 12, y + Math.sin(b) * t * 12, top + Math.sin(t * Math.PI * 0.85) * 22 - t * 6]);
  }
  for (let k = 0; k < pts.length - 1; k++) S.rod(pts[k], pts[k + 1], 0.55, 0.5, DRY, id + 2);
  for (let k = 3; k < pts.length; k++) {
    const p = pts[k];
    S.egg([p[0], p[1], p[2] - 1.6], AXES, [1.7, 1.7, 1.4], (nn) => toneAt(nn, hash(seed, k, 1934) > 0.4 ? BLOOM : DRY, -0.1), id + 3);
  }
}
/** A BENCH OF DEAD ORCHIDS (the glasshouse's staging): slats of oak on iron trestles, two tiers, the dead orchids in their pots along them. Along x (`k` 0) or along y (1). 150 x 130 at (75, 92). */
function orchidBench(k: number): Sprite {
  const S = turned(scene(150, 130, 75, 92), k);
  for (const x of [-30, 0, 30]) {
    for (const y of [-7, 7]) S.rod([x, y, 0], [x, y, 18], 0.9, 0.9, IRONS, 1);
    S.rod([x, -7, 18], [x, 3, 34], 0.9, 0.9, IRONS, 1);
  }
  slab(S, -34, -9, 34, 9, 16, 18, POAK, 2, 0.1, (f, _u, v) => (f === 4 && fr(v * 5) < 0.18 ? -0.7 : 0));
  slab(S, -34, -6, 34, 2, 32, 34, POAK, 3, 0.1, (f, _u, v) => (f === 4 && fr(v * 3) < 0.2 ? -0.7 : 0));
  let seed = 0;
  for (let x = -29; x <= 29; x += 11) {
    deadOrchid(S, x + (hash(seed, 0, 1935) - 0.5) * 3, 5, 18, seed++, 10);
    deadOrchid(S, x + 5 + (hash(seed, 0, 1935) - 0.5) * 3, -2, 34, seed++, 20);
  }
  return done(S, 75, 92);
}
/** AN ORCHID IN ITS POT, DEAD, on a saucer; or knocked over (breakable): the pot broken in pieces, its bark spilled, the plant thrown out on its side. 70 x 90 at (35, 72). */
function orchidPot(broken: boolean): Sprite {
  const S = scene(70, 90, 35, 72);
  if (!broken) {
    cylinder(S, 0, 0, 6, 0, 1.5, (n) => toneAt(n, CLAYPOT, 0), 1, () => CLAYPOT[3]);
    deadOrchid(S, 0, 0, 1.5, 7, 2);
  } else {
    // the pot in pieces: curved sherds, the bark and moss it held spilled dark
    S.egg([0, 0, 0.6], AXES, [10, 7, 0.8], (n, w) => (hash(Math.floor(w[0] / 2), Math.floor(w[1] / 2), 1937) > 0.5 ? DRY[1] : DRY[0]), 1);
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      const c: V3 = [Math.cos(a) * 9, Math.sin(a) * 7, 1.6];
      // a curved sherd lying tipped: its face along the pot's round, leaning out
      const A0: V3 = [-Math.sin(a), Math.cos(a), 0];
      const A1: V3 = [Math.cos(a) * 0.5, Math.sin(a) * 0.5, 0.866];
      const A2: V3 = [A0[1] * A1[2] - A0[2] * A1[1], A0[2] * A1[0] - A0[0] * A1[2], A0[0] * A1[1] - A0[1] * A1[0]];
      S.egg(c, [A0, A1, A2], [3.4, 2.2, 0.8], (n) => toneAt(n, CLAYPOT, 0.1), 2);
    }
    // the plant thrown on its side: its leaves fanned along the floor, its spike broken
    for (let i = 0; i < 4; i++) S.egg([-6 + i * 1.5, 8 + i * 2, 1], [[0.9, 0.44, 0], [-0.44, 0.9, 0], [0, 0, 1]], [6, 2.2, 0.8], (n) => toneAt(n, DRY, 0.1), 3);
    S.rod([4, 10, 1], [16, 14, 2], 0.5, 0.5, DRY, 3);
    S.egg([16, 14, 2.4], AXES, [1.6, 1.6, 1.4], (n) => toneAt(n, BLOOM, -0.1), 3);
  }
  return done(S, 35, 72);
}
/** A PANE FALLEN FROM THE ROOF: a big pane of glass come down from the glasshouse's roof in its iron glazing bar, burst across the floor, slivers flung out from it. On the floor. 120 x 64 at (60, 32). */
function fallenPane(): Sprite {
  const S = scene(120, 64, 60, 32);
  // the bar, bent where it struck
  S.rod([-30, -6, 1.4], [0, 0, 2.2], 1.3, 1.3, IRONS, 1);
  S.rod([0, 0, 2.2], [22, 10, 1.2], 1.3, 1.3, IRONS, 1);
  // the pane: burst in a star of pieces from where it hit, each a little apart
  for (let i = 0; i < 12; i++) {
    const a0 = (i / 12) * Math.PI * 2 + hash(i, 0, 1941) * 0.3;
    const a1 = ((i + 1) / 12) * Math.PI * 2;
    const r0 = 3 + hash(i, 1, 1941) * 3;
    const r1 = 14 + hash(i, 2, 1941) * 8;
    const c: V3 = [Math.cos((a0 + a1) / 2) * 1.5 - 4, Math.sin((a0 + a1) / 2) * 1.5 + 2, 0.7];
    const P = (a: number, r: number): V3 => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r * 0.8, 0.7];
    S.quad([P(a0, r0), P(a1, r0), P(a1, r1), P(a0, r1)], (u, v) => (v > 0.85 || u < 0.08 ? PANE[4] : hash(i, 3, 1941) > 0.5 ? PANE[2] : PANE[1]), 2 + (i % 2));
  }
  shardsIn(S, (a, b) => [a * 0.9 - 2, b - 14, 0.6], 16, 1943, 4, 26);
  return done(S, 60, 32);
}

/**
 * A SKYLIGHT IN THE FLOOR (THE HAZARD: it gives way under whoever stands on it, and they fall to the floor below): an iron
 * frame a tile across, its glazing bars in a grid of nine panes of thick frosted glass, the hall below a dim blur through
 * them; then cracking, cracks run across its panes; then broken through, its panes gone but for teeth, the bars bent down,
 * and far down through the hole the hall below, the day lying on its marble in a square. A trap, laid as a floor tile, at
 * its middle. 100 x 56 at (50, 28).
 */
function skylight(state: number): Sprite {
  const BELOW = 112;
  const THICK = 16;
  const half = 0.46;
  // (what is seen far down through the hole: the hall below's marble, the day in a square on it, the grid's shadow)
  const below = (u: number, v: number, px: number, py: number): string => {
    const c = toHex(galleryMarble(u + 3.4, v + 3.4, px, py, 9));
    if (Math.abs(u) < half && Math.abs(v) < half) {
      const g = Math.abs(fr((u + half) / (2 * half) * 3) - 0.5) > 0.44 || Math.abs(fr((v + half) / (2 * half) * 3) - 0.5) > 0.44;
      return g ? mix(c, HOLE, 0.5) : mix(mix(c, SILVER[4], 0.25), HOLE, 0.2);
    }
    return mix(c, HOLE, 0.66);
  };
  return lying(100, 56, 50, 28, (u, v, px, py) => {
    const au = Math.abs(u);
    const av = Math.abs(v);
    if (au > 0.5 || av > 0.5) return null;
    // the frame: a kerb of iron round it, lit on its far edges
    if (au > half || av > half) return u < 0 || v < 0 ? IRONS[3] : IRONS[1];
    const gu = fr((u + half) / (2 * half) * 3);
    const gv = fr((v + half) / (2 * half) * 3);
    const bar = Math.abs(gu - 0.5) > 0.47 || Math.abs(gv - 0.5) > 0.47;
    if (state === 2) {
      // broken through: teeth of glass round its edge; the bars bent down into the hole, broken off; through it the drop
      const ed = half - Math.max(au, av);
      const tooth = 0.03 + 0.05 * Math.abs(Math.sin(u * 40 + v * 30));
      if (ed < tooth) return (px + py) % 3 ? PANE[4] : PANE[3];
      // down the hole: its far sides (the floor's thickness) and then the hall below, along the eye's way back
      for (let d = 0; d <= BELOW; d++) {
        const x = u - d / 32;
        const y = v - d / 32;
        if ((x < -half || y < -half) && d < THICK) return d < 3 ? SILVER[3] : d < 5 ? SILVER[1] : fr((x + y) * 6) < 0.4 ? '#33282c' : '#1e171c';
        if (d === BELOW) return below(x, y, px, py);
      }
      return HOLE;
    }
    if (bar) return IRONS[Math.abs(gu - 0.5) > 0.47 && u < 0 ? 3 : 2];
    // the panes: thick frosted glass; the hall below dim through them; a lit edge on each
    if (gu < 0.08 || gv < 0.08) return PANE[3];
    let c = mix(mix(PANE[hash(px >> 1, py, 1951) > 0.93 ? 3 : 2], below(u - 0.9, v - 0.9, px, py), 0.35), MIRROR[1], 0.2);
    if (state === 1) {
      // cracking: cracks running out across the panes from a point near its middle
      const ang = Math.atan2(v - 0.06, u + 0.04);
      const r = Math.hypot(u + 0.04, v - 0.06);
      const ray = Math.abs(fr((ang / (Math.PI * 2)) * 7 + 0.3 * Math.sin(r * 9)) - 0.5) > 0.47;
      if (ray && r < 0.42) c = PANE[4];
      if (Math.abs(r - 0.14) < 0.012) c = PANE[4];
    }
    return c;
  });
}

// =================================================================================================
// HER THINGS ON THE FLOOR: a jewel box spilled, a hand mirror dropped

/** A JEWEL BOX, SPILLED: a casket of dark wood bound in silver tipped on its side, its lid sprung, a rope of pearls run out of it, rings, a silver comb. On the floor. 100 x 60 at (50, 32). */
function jewelBox(): Sprite {
  const S = scene(100, 60, 50, 32);
  // the casket on its side, its lid sprung back
  S.box([-10, -4, 4.5], [[1, 0, 0], [0, 0, 1], [0, -1, 0]], [7, 4.5, 4.5], (f, u, v, n) => (f === 3 ? HOLE : toneAt(n, POAK, u < 0.1 || u > 0.9 || v < 0.1 || v > 0.9 ? 0.9 : 0)), 1);
  S.box([-10, 3, 0.8], AXES, [7, 4.5, 0.8], (f, u, _v, n) => toneAt(n, f === 4 && (u < 0.1 || u > 0.9) ? METAL : POAK, 0.1), 2);
  // a rope of pearls run out across the floor in a loose curve
  for (let i = 0; i < 22; i++) {
    const t = i / 21;
    const x = -4 + t * 30;
    const y = 2 + Math.sin(t * 5) * 5 + t * 6;
    S.ball([x, y, 1], 1.15, PEARL, 3, undefined, 0.2);
  }
  // rings: a gilt band, a stone of violet in one
  for (const [x, y, c] of [[10, -6, 0], [18, -2, 1]] as const) {
    S.egg([x, y, 0.8], AXES, [2.2, 2.2, 0.8], (n, w) => (Math.hypot(w[0] - x, w[1] - y) < 1.2 ? null : toneAt(n, GILT, 0.2)), 4);
    if (c) S.ball([x, y - 2, 1.6], 1, VIOLET, 4, undefined, 0.6);
  }
  // a silver comb, its teeth
  S.box([22, 10, 0.6], [[0.9, -0.44, 0], [0.44, 0.9, 0], [0, 0, 1]], [5, 1.2, 0.6], (f, u, v) => (f === 4 && v > 0.45 && fr(u * 9) < 0.45 ? null : METAL[f === 4 ? 3 : 2]), 5);
  return done(S, 50, 32);
}
/** A HAND MIRROR, DROPPED: an oval glass in a frame of chased silver, a long handle, lying face up, its glass cracked across. On the floor. 70 x 44 at (35, 22). */
function handMirror(): Sprite {
  const S = scene(70, 44, 35, 22);
  const F: V3 = [0.8, -0.6, 0];
  const Sd: V3 = [0.6, 0.8, 0];
  S.egg([-4, 2, 0.8], [F, Sd, [0, 0, 1]], [8.5, 6.5, 0.8], (n, w) => {
    const q = [w[0] + 4, w[1] - 2];
    const a = (q[0] * F[0] + q[1] * F[1]) / 8.5;
    const b = (q[0] * Sd[0] + q[1] * Sd[1]) / 6.5;
    const r = Math.hypot(a, b);
    if (r > 0.82) return toneAt(n, METAL, fr(Math.atan2(b, a) * 3) < 0.4 ? 0.3 : -0.1);
    // its glass: the sky's grey in it, a crack across
    if (Math.abs(a * 0.6 - b - 0.1) < 0.05) return MIRROR[4];
    return a - b > 0.3 ? MIRROR[3] : MIRROR[2];
  }, 1);
  S.rod([-4 + F[0] * 8, 2 + F[1] * 8, 0.8], [-4 + F[0] * 22, 2 + F[1] * 22, 0.8], 1.2, 1, METAL, 2);
  S.egg([-4 + F[0] * 22.5, 2 + F[1] * 22.5, 0.9], AXES, [1.8, 1.8, 1], (n) => toneAt(n, METAL, 0.2), 2);
  return done(S, 35, 22);
}

// =================================================================================================
// THE QUEST: THE APPLE SHE MADE (the book)

/**
 * THE APPLE ON A SILVER DISH (the quest): from the book, the apple she made, white with a red cheek, and only its red
 * cheek poisoned; set on a footed dish of chased silver on a low stand draped in violet. Its own pale light. 70 x 90 at (35, 72).
 */
function apple(): Sprite {
  const S = scene(70, 90, 35, 72);
  // the stand: a round table on a turned stem, its cloth of violet
  cylinder(S, 0, 0, 7, 0, 2, (n) => toneAt(n, GILT, 0), 1, () => GILT[3]);
  cylinder(S, 0, 0, (z) => 2.2 + Math.max(0, 6 - Math.abs(z - 12)) * 0.25, 2, 24, (n) => toneAt(n, GILT, 0.05), 1);
  cylinder(S, 0, 0, 11, 24, 26, (n, a) => toneAt(n, VELVET, Math.abs(Math.sin(a * 6)) < 0.3 ? -0.3 : 0.05), 2, () => VELVET[3]);
  cylinder(S, 0, 0, (z) => 11 + (26 - z) * 0.15, 18, 24, (n, a) => toneAt(n, VELVET, Math.abs(Math.sin(a * 7)) < 0.35 ? -0.35 : 0), 2);
  // the dish: a foot, a shallow bowl, its lip chased
  cylinder(S, 0, 0, 2.6, 26, 29, (n) => toneAt(n, METAL, 0.1), 3);
  cylinder(S, 0, 0, (z) => 3 + (z - 29) * 2.4, 29, 32, (n) => toneAt(n, METAL, 0.15), 3, (a, rr) => (rr > 0.9 ? (Math.abs(Math.sin(a * 10)) < 0.4 ? METAL[2] : METAL[4]) : METAL[2]));
  // the apple: round but not a ball, broader at its shoulder, a dimple at its top, its stalk and a leaf; white, its cheek
  // (toward the light) red
  const c: V3 = [0, 0, 36.4];
  S.egg(c, AXES, [4.6, 4.6, 4.2], (n, w) => {
    const top = w[2] > c[2] + 3.2 && Math.hypot(w[0] - c[0], w[1] - c[1]) < 1.6;
    const cheek = n[0] * -0.6 + n[1] * 0.5 + n[2] * 0.2 > 0.25;
    const R = cheek ? APPLE_RED : APPLE_WHITE;
    return toneAt(n, R, top ? -0.6 : n[2] < -0.3 ? -0.2 : 0.05);
  }, 4);
  S.rod([0, 0, 40], [0.6, -0.6, 43], 0.5, 0.4, DRY, 5);
  S.egg([1.8, -1.6, 42.4], [[0.7, -0.7, 0], [0.7, 0.7, 0], [0, 0, 1]], [2.2, 1, 0.5], (n) => toneAt(n, ['#1e261c', '#2c3826', '#3a4a30', '#4c5e3c', '#5e6e48'], 0.1), 5);
  return done(S, 35, 72, [{ at: [0, 0, 36], r: 30, color: QUEST_LIGHT, a: 0.3 }]);
}

// =================================================================================================
// THE SET

let made: Piece[] | null = null;
/** THE GLASS GALLERY'S OWN PIECES, the Queen's twenty-five, made the first time they are asked for and kept. */
export function glassGalleryPieces(): Piece[] {
  if (made) return made;
  const two = (f: (s: number) => { left: Sprite; right: Sprite }, states: number[]): { left: Sprite[]; right: Sprite[] } => {
    const ss = states.map(f);
    return { left: ss.map((s) => s.left), right: ss.map((s) => s.right) };
  };
  made = [
    // THE MIRRORS (the hazard): on the wall, both faces: whole, cracked, burst (its shards on the floor before it)
    { name: 'a tall mirror', kind: 'trap', ...two(tallMirror, [0, 1, 2]) },
    { name: "a mirror's shards", kind: 'on the floor', frames: [mirrorShards()] },
    // (frames: whole, burst)
    { name: 'a cheval mirror', kind: 'breakable', frames: [chevalMirror(false), chevalMirror(true)], shadow: 0.4 },
    // THE DRESSING ROOMS (frames: its front along +y, along +x; the screen whole, half there)
    { name: 'a dressing table', kind: 'obstacle', frames: [dressingTable(0), dressingTable(1)], shadow: 0.7 },
    { name: 'a dressing screen', kind: 'obstacle', frames: [dressingScreen(false), dressingScreen(true)], shadow: 0.7 },
    { name: 'a wardrobe of gowns', kind: 'obstacle', frames: [wardrobe(0), wardrobe(1)], shadow: 0.8 },
    { name: 'a velvet banquette', kind: 'obstacle', frames: [banquette(0), banquette(1)], shadow: 0.6 },
    { name: 'a console table', kind: 'breakable', frames: [consoleTable(false), consoleTable(true)], shadow: 0.5 },
    // LIGHT: only candles (Colour 3)
    { name: 'a silver candelabrum', kind: 'obstacle', frames: [candelabrum()], shadow: 0.3 },
    { name: 'a sconce of candles', kind: 'on the wall', ...two(() => sconce(), [0]) },
    // THE GALLERIES
    { name: 'a bust on a plinth', kind: 'breakable', frames: [bust(false), bust(true)], shadow: 0.3 },
    { name: 'a tapestry in rags', kind: 'on the wall', ...two(() => tapestry(), [0]) },
    { name: "the queen's doors", kind: 'door', ...two((s) => queensDoors(s === 1), [0, 1]) },
    // (frames: shut and open across x, shut and open across y)
    { name: 'a gate of wrought silver', kind: 'gate', frames: [0, 1].flatMap((k) => [silverGate(false, k), silverGate(true, k)]), shadow: 0.6 },
    // THE CHAPEL
    { name: 'a stained-glass window', kind: 'wall tile', ...two(() => stainedWindow(), [0]) },
    { name: 'a chapel pew', kind: 'obstacle', frames: [pew(0), pew(1)], shadow: 0.7 },
    { name: 'a glass coffin', kind: 'obstacle', frames: [glassCoffin()], shadow: 0.9 },
    { name: 'the colours of the stained glass', kind: 'floor tile', frames: [windowColours()] },
    // THE GLASSHOUSE
    { name: 'a bench of dead orchids', kind: 'obstacle', frames: [orchidBench(0), orchidBench(1)], shadow: 0.9 },
    { name: 'an orchid in its pot, dead', kind: 'breakable', frames: [orchidPot(false), orchidPot(true)], shadow: 0.25 },
    { name: 'a pane fallen from the roof', kind: 'on the floor', frames: [fallenPane()] },
    // (frames: whole, cracking, broken through: the hazard)
    { name: 'a skylight', kind: 'trap', frames: [0, 1, 2].map(skylight) },
    // HER THINGS
    { name: 'a jewel box, spilled', kind: 'on the floor', frames: [jewelBox()] },
    { name: 'a hand mirror, dropped', kind: 'on the floor', frames: [handMirror()] },
    // THE QUEST: the apple she made (the book)
    { name: 'the apple on a silver dish', kind: 'quest', frames: [apple()], shadow: 0.3 },
  ];
  return made;
}
