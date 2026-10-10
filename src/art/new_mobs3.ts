// THREE NEW MONSTERS ON THE HEROES' BONES: A MOCK-UP (the art chat, 9 Oct 2026). NOT IN THE GAME.
//
// The owner asked the art chat to "go into new mob types". These are its three designs, as
// pictures for him to judge. NOTHING HERE IS IN THE GAME: there are no rules for them and nothing
// spawns them; no file of the game imports this one; and `NEW_MOBS.on`, the switch a later chat
// would put them in by, is off.
//
// They are painted as the skeleton and the bone archer now are (art/monster_bones3.ts, whose
// structure this copies): posed on the heroes' bones (art/skeleton.ts: `buildOf`, `bonesAt`,
// `solve`, `project`), dressed in the heroes' solids (art/skin.ts) in the heroes' one light from
// the upper left and flat tones, every pixel as near the eye as its skin is, the indigo seam where
// one part ends in front of another, and round each living one the ENEMY'S PINK EDGE. Whatever
// glows on them is hot pink burning to gold (`FLAME`, `SOCKET`); nothing on them is cyan.
//
//   THE SHADE (small; fun to smash; comes in threes). A scrap of the dead that will not rest. A
//     hooded tatter of dull grey-violet cloth, a little shorter than the skeleton, that FLOATS a
//     hand's breadth off the floor, bobbing, the robe's tail streaming behind it in four tapering
//     tongues; two hot pink eyes in the dark of the hood; long thin pale arms ending in hooked
//     claws. Its warning: both arms drawn back high over the hood, claws spread, leaning back. It
//     rakes with both claws. It dies coming apart: the robe crumples and goes up in wisps and pink
//     motes.
//   THE BONEWARD (medium; a shield wall; slow). A skeleton soldier of the vault still at its
//     post: the skeleton's own body made a head taller and broader. A tall tower shield of bone
//     planks bound with dark iron, a pink rune burning on its face; a horned iron half-helm;
//     rusted, broken plates on its shoulders; a short heavy spear resting low. Its warning: the
//     spear drawn back to its shoulder over the shield's rim, the shield braced, knees bent. It
//     thrusts past the shield's edge. It dies sagging to its knees behind the shield; the shield
//     topples flat; its bones scatter.
//   THE OSSUARY GOLEM (big; menacing; slow). Hundreds of bones bound with iron into a hulk, a
//     head and a half taller than the knight: a cage of ribs with a pink-to-gold fire burning in
//     it, skulls piled into its shoulders, a skull sunk low between them, short legs, and one long
//     arm ending in a club of fused skulls that rests on the floor. Its warning: the club raised
//     high behind its head, leaning back, the fire flaring. It slams the club down. It dies with
//     its fire guttering out, falling apart into a heap of bones and iron.
//
// AFTER HIS YES TO ALL THREE (9 Oct, by 05:26: "All three (Recommended)"): their walks, a reel for
// when each is struck, and each made as the game takes a monster (`makeShadeArt3`,
// `makeBonewardArt3`, `makeGolemArt3`: an ActorArt, as art/monster_bones3.ts makes the skeleton's),
// so that the main chat can give them rules. Still unused by the game.
//   glide   the Shade has no steps: it leans into its way and bobs, its arms trailing low, its robe
//           and tails streaming back (cloth is left behind by the ground it covers: `MobMove.ground`).
//   plod    the Boneward walks as the skeleton does, the shield before it, the spear low.
//   stride  the Golem's heavy, swaying steps, its bulk rolling onto the foot that is down.
//   For the two that walk, A FOOT THAT IS DOWN STAYS ON ITS SPOT OF THE FLOOR (the art rulebook:
//   "Feet grip the floor"): each walk is painted for a pace (`Mob.pace`, tiles a second), and at
//   another pace the same frames are shown faster or slower (`walkFpsAt`).
//
// What the numbers of a pose mean to these painters besides the bones:
//   draw  the Shade: how far its claws are spread (0 curled, 1 spread wide). The Boneward: its jaw
//         (0 shut, 1 wide). The Golem: how high its fire burns (0 embers, 1 flaring).
//   out   the light going out of it (eyes, rune, fire), 0 lit to 1 dark.
//   gale  the Shade's robe flaring out round it as it is struck, 0 to 1.
//   pAz, pEl  the Boneward's shield: the way its face is turned (degrees to the left of the way
//         the figure faces) and how far its top is tipped back.

import type { Light, Sprite } from '../engine/px';
import type { ActorArt, AnimSet, Clip } from './actor_types';
import { BONE, INDIGO, INK, PINK, PLUM, dim, dir, hash, lazyFrames, toSprite } from './kit';
import type { Painted, Ramp } from './kit';
import { BLOOD, DEATH_FPS, ENEMY_RIM, FLAME, IRON, RUST, SOCKET } from './mkit';
import { SKELETON3_BODY } from './monster_bones3';
import { CANVAS3, band, ball, cloth, eyesToward, laidAlong, mid, rod, stage, thread, toneOf, wornOn } from './skin';
import type { ClothLook, GameView, Ring, Sheet, Skin, Stage } from './skin';
import { GRID, about, add, aimFor, bonesAt, buildOf, cross, dot, elbowFor, heading, len, lerp3, mul, norm, solve, standing, sub } from './skeleton';
import type { Bones, Build, Key3, Motion, Posed, Skeleton, V3 } from './skeleton';

/** THE SWITCH, OFF. Nothing of the game reads this file; a chat that puts these monsters in, on the owner's yes, does it behind this. */
export const NEW_MOBS = { on: false };

const D = Math.PI / 180;
const FR = 1 / 30;
/** The light, as the eye sees it (skin.ts's own: from the left, from above, a little from the eye's side). */
const LX = -0.52;
const LY = -0.62;
const LZ = 0.59;
type P = Partial<Bones>;
type Frame3 = readonly [V3, V3, V3];
const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));

// ---------------------------------------------------------------------------------------------
// The colours

/** The Shade's cloth: a dull, dark grey-violet (not the cultist's purple, not a white sheet). */
export const SHROUD: Ramp = ['#191529', '#191529', '#363150', '#5c567c', '#5c567c'];
/** The Shade's arms: the pallor of the dead, a little greyer than bone. */
export const PALLOR: Ramp = ['#463f6c', '#463f6c', '#958dbf', '#c9c2e6', '#c9c2e6'];
/** The Boneward's shield: planks of old bone, a step darker than the bones behind it. */
export const PLANK: Ramp = ['#463a72', '#463a72', '#9286c0', '#d2c9ee', '#d2c9ee'];
/** Spear shafts: the world's dark wood. */
const SHAFT: Ramp = dim(INDIGO);
/** The Golem's bones: old, grey bone, packed. */
export const OSSUARY: Ramp = ['#463e70', '#463e70', '#948bbf', '#d3cbec', '#d3cbec'];

// ---------------------------------------------------------------------------------------------
// Solids, as a list (art/monster_bones3.ts does the same; its painter is its own and not shared)

/** A flat panel's skin: `a` across it and `b` up it (the figure's own lengths, from its middle); whether its face (not its back) is toward the eye; and the tone the light gives it. */
export type PanelSkin = (a: number, b: number, front: boolean, tone: number) => string | null;

type Shape =
  | { k: 'rod'; a: V3; b: V3; ra: number; rb: number; ramp: Ramp; far?: boolean }
  | { k: 'ball'; c: V3; ax: Frame3; skin: Skin; far?: boolean }
  /** Cloth, or anything shaped as a tube through rings; `rigid`: a solid that falls whole (a helm), where cloth does not. */
  | { k: 'cloth'; rings: Ring[]; ramp: Ramp; look: ClothLook; torn?: ReadonlyArray<number>; rigid?: boolean }
  /** An iron band round something: the half of the ring toward the eye. */
  | { k: 'band'; ring: Ring; ramp: Ramp; rows: number }
  /** A flat panel (a shield): its middle, and its half-width and half-height as directions. */
  | { k: 'panel'; c: V3; u: V3; v: V3; skin: PanelSkin }
  | { k: 'thread'; a: V3; b: V3; c: string; lift: number }
  /** A pixel ON a part already painted (an eye), and a second beside it if `c2`; only where the skin faces the eye. */
  | { k: 'dot'; p: V3; c: string; facing: V3; c2?: string }
  /** A row of teeth on a part already painted, light and dark by turns. */
  | { k: 'teeth'; pts: V3[]; facing: V3[] }
  /** A speck over everything, with no seam (a mote, a streak). */
  | { k: 'mote'; p: V3; c: string; size: number }
  /** A light it gives off: not painted, drawn over the dark by the game. */
  | { k: 'glow'; p: V3; c: string; r: number; a: number }
  /** The champion's great sword: its grip (his right hand), and the way its blade points. */
  | { k: 'greatsword'; grip: V3; point: V3 };

interface Bit {
  part: string;
  piece: string;
  shape: Shape;
}
type Put = (part: string, piece: string, shape: Shape) => void;

function sphere(r: number): Frame3 {
  return [[r, 0, 0], [0, r, 0], [0, 0, r]];
}
function at3(c: V3, r: Frame3, f: number, l: number, u: number): V3 {
  return add(c, add(mul(r[0], f), add(mul(r[1], l), mul(r[2], u))));
}
function farSide(st: Stage, ref: V3, ramp: Ramp, p: V3): Ramp {
  return st.near(p) < st.near(ref) - 1.6 ? dim(ramp) : ramp;
}

/** A FLAT PANEL, lit as one face (a shield of planks is flat, and reads as one plane in this light). */
function panel(p: Sheet, st: Stage, c: V3, u: V3, v: V3, skin: PanelSkin): void {
  const [cx, cy] = st.at(c);
  const su = st.seen(u);
  const sv = st.seen(v);
  const det = su[0] * sv[1] - su[1] * sv[0];
  if (Math.abs(det) < 0.05) return;
  const lu = len(u);
  const lv = len(v);
  const n = st.seen(norm(cross(u, v)));
  const nn = Math.hypot(n[0], n[1], n[2]) || 1;
  const front = n[2] > 0;
  const tone = toneOf(((front ? 1 : -1) * (n[0] * LX + n[1] * LY + n[2] * LZ)) / nn);
  const zc = st.near(c);
  const xs = [su[0] + sv[0], su[0] - sv[0], -su[0] + sv[0], -su[0] - sv[0]];
  const ys = [su[1] + sv[1], su[1] - sv[1], -su[1] + sv[1], -su[1] - sv[1]];
  for (let y = Math.floor(cy + Math.min(...ys)) - 1; y <= Math.ceil(cy + Math.max(...ys)) + 1; y++) {
    for (let x = Math.floor(cx + Math.min(...xs)) - 1; x <= Math.ceil(cx + Math.max(...xs)) + 1; x++) {
      const dx = x + 0.5 - cx;
      const dy = y + 0.5 - cy;
      const a = (dx * sv[1] - dy * sv[0]) / det;
      const b = (su[0] * dy - su[1] * dx) / det;
      if (a < -1 || a > 1 || b < -1 || b > 1) continue;
      const col = skin(a * lu, b * lv, front, tone);
      if (col) p.put(x, y, col, zc + a * su[2] + b * sv[2]);
    }
  }
}

/** A hem torn into tongues (art/monster_bones3.ts, `tear`): from the foot of each column, `torn` pixels taken away. */
function tear(p: Sheet, torn: ReadonlyArray<number>): void {
  let x0 = p.w;
  let x1 = -1;
  const lowest = new Int16Array(p.w).fill(-1);
  for (let y = 0; y < p.h; y++) {
    for (let x = 0; x < p.w; x++) {
      if (!p.has(x, y)) continue;
      x0 = Math.min(x0, x);
      x1 = Math.max(x1, x);
      lowest[x] = y;
    }
  }
  if (x1 < 0) return;
  for (let x = x0; x <= x1; x++) {
    const n = torn[Math.min(torn.length - 1, Math.floor(((x - x0 + 0.5) / (x1 - x0 + 1)) * torn.length))];
    for (let k = 0, y = lowest[x]; k < n && y >= 0 && p.has(x, y); k++, y--) {
      p.erase(x, y);
      p.z[y * p.w + x] = NaN;
    }
  }
}

/** Paint solids on a stage, a part for each part named; the lights they give off. `ref`: the middle of the body (a far limb is a step darker). */
function paintBits(st: Stage, bits: ReadonlyArray<Bit>, ref: V3): Light[] {
  const parts = new Map<string, Sheet>();
  const lights: Light[] = [];
  const whereOf = (sh: Shape): V3 => {
    switch (sh.k) {
      case 'rod':
      case 'thread':
        return mid(sh.a, sh.b);
      case 'ball':
      case 'panel':
        return sh.c;
      case 'band':
        return sh.ring.c;
      case 'cloth':
        return sh.rings[0].c;
      case 'teeth':
        return sh.pts[0];
      case 'greatsword':
        return sh.grip;
      default:
        return sh.p;
    }
  };
  const sheet = (b: Bit): Sheet => {
    let p = parts.get(b.part);
    if (!p) {
      p = st.part(whereOf(b.shape));
      parts.set(b.part, p);
    }
    return p;
  };
  const after: Bit[] = [];
  for (const b of bits) {
    const sh = b.shape;
    if (sh.k === 'dot' || sh.k === 'mote' || sh.k === 'glow' || sh.k === 'teeth') {
      after.push(b);
      continue;
    }
    const p = sheet(b);
    if (sh.k === 'rod') rod(p, st, sh.a, sh.b, sh.ra, sh.rb, sh.far ? farSide(st, ref, sh.ramp, mid(sh.a, sh.b)) : sh.ramp);
    else if (sh.k === 'ball') ball(p, st, sh.c, sh.ax, typeof sh.skin !== 'function' && sh.far ? farSide(st, ref, sh.skin, sh.c) : sh.skin);
    else if (sh.k === 'cloth') {
      cloth(p, st, sh.rings, sh.ramp, sh.look);
      if (sh.torn) tear(p, sh.torn);
    } else if (sh.k === 'band') band(p, st, sh.ring, sh.ramp, sh.rows);
    else if (sh.k === 'panel') panel(p, st, sh.c, sh.u, sh.v, sh.skin);
    else if (sh.k === 'thread') thread(p, st, sh.a, sh.b, sh.c, sh.lift);
    else if (sh.k === 'greatsword') {
      const [gx, gy] = st.at(sh.grip);
      const [px, py] = st.seen(sh.point);
      greatSword(p, gx, gy, (Math.atan2(-py, px) * 180) / Math.PI, Math.hypot(px, py));
      laidAlong(p, st, add(sh.grip, mul(sh.point, -GS_GRIP - 3)), add(sh.grip, mul(sh.point, GS_REACH + 1)), 0.3);
    }
  }
  for (const b of after) {
    const sh = b.shape;
    if (sh.k === 'dot') {
      const p = parts.get(b.part);
      if (!p || dot(norm(sh.facing), st.eye) < 0.1) continue;
      const [x, y] = st.at(sh.p);
      const xi = Math.round(x - 0.5);
      const yi = Math.round(y - 0.5);
      p.mark(xi, yi, sh.c);
      if (sh.c2) p.mark(xi + 1, yi, sh.c2);
    } else if (sh.k === 'teeth') {
      const p = parts.get(b.part);
      if (!p) continue;
      const row = new Map<number, number>();
      for (let i = 0; i < sh.pts.length; i++) {
        if (dot(norm(sh.facing[i]), st.eye) < 0.12) continue;
        const [x, y] = st.at(sh.pts[i]);
        const xi = Math.round(x - 0.5);
        if (!row.has(xi)) row.set(xi, Math.round(y - 0.5));
      }
      if (!row.size) continue;
      const x0 = Math.min(...row.keys());
      for (const [x, y] of row) p.mark(x, y, (x - x0) % 2 === 0 ? BONE[3] : INK);
    } else if (sh.k === 'mote') {
      const [x, y] = st.at(sh.p);
      const xi = Math.round(x - 0.5);
      const yi = Math.round(y - 0.5);
      for (let dy = 0; dy < sh.size; dy++) for (let dx = 0; dx < sh.size; dx++) st.over.set(xi + dx, yi + dy, sh.c);
    } else if (sh.k === 'glow') {
      const [x, y] = st.at(sh.p);
      lights.push({ x, y, r: sh.r, color: sh.c, a: sh.a });
    }
  }
  return lights;
}

// ---------------------------------------------------------------------------------------------
// Things more than one of them has

/** A body's lengths, all made `k` times as long (and `more`: some of them further, each by its own share). */
function scaled(b: Build, k: number, more: Partial<Record<'shoulderHalf' | 'ribHalf' | 'ribDeep' | 'pelvisHalf' | 'waistHalf', number>> = {}): Build {
  const out: Record<string, unknown> = {};
  for (const [key, v] of Object.entries(b)) {
    if (typeof v === 'number') out[key] = v * k * ((more as Record<string, number>)[key] ?? 1);
    else if (Array.isArray(v)) out[key] = v.map((x: number) => x * k);
    else out[key] = v;
  }
  return out as unknown as Build;
}

/**
 * A SKULL: a cranium on its own face's lines with two sockets and the hole of the nose, turned
 * toward whoever looks (as the heroes' eyes are, `eyesToward`: given as `mid`, degrees round from
 * the nose), and a row of teeth. `lit`: a point of hot pink in each socket (0 none, 1 burning).
 */
function skull(st0: Stage, put: Put, part: string, piece: string, c: V3, face: Frame3, r: V3, ramp: Ramp, midDeg: number, lit: number, teeth: boolean, glowR = 4, shade?: (u: V3, tone: number) => number): void {
  const [ff, fl, fu] = face;
  const midA = midDeg * D;
  const onCran = (az: number, el: number): V3 => norm([Math.cos(az) * Math.cos(el), Math.sin(az) * Math.cos(el), Math.sin(el)]);
  const sock = [onCran(midA - 29 * D, 0.3), onCran(midA + 29 * D, 0.3)];
  const nose = onCran(midA, -0.16);
  const cosS = Math.cos(0.36);
  const cosN = Math.cos(0.16);
  const skin: Skin = (u, tone) => {
    for (const d of sock) if (u[0] * d[0] + u[1] * d[1] + u[2] * d[2] > cosS) return INK;
    if (u[0] * nose[0] + u[1] * nose[1] + u[2] * nose[2] > cosN && u[2] < nose[2] + 0.05) return INK;
    // (in the shade of a hood, if it is under one: the marksman's)
    return ramp[shade ? Math.max(0, Math.min(4, shade(u, tone))) : tone];
  };
  put(part, piece, { k: 'ball', c, ax: [mul(ff, r[0]), mul(fl, r[1]), mul(fu, r[2])], skin });
  const onSkull = (d: V3, k = 0.95): V3 => add(c, add(add(mul(ff, d[0] * r[0] * k), mul(fl, d[1] * r[1] * k)), mul(fu, d[2] * r[2] * k)));
  const facingOf = (d: V3): V3 => norm(add(add(mul(ff, d[0] / r[0]), mul(fl, d[1] / r[1])), mul(fu, d[2] / r[2])));
  if (lit > 0.05) {
    for (const d of sock) {
      put(part, piece, { k: 'dot', p: onSkull(d, 0.97), c: lit > 0.5 ? SOCKET : FLAME[1], facing: facingOf(d) });
      if (dot(facingOf(d), st0.eye) > 0.05) put(part, piece, { k: 'glow', p: onSkull(d, 0.97), c: SOCKET, r: glowR, a: 0.42 * lit });
    }
  }
  if (teeth) {
    const pts: V3[] = [];
    const facing: V3[] = [];
    for (let i = 0; i <= 20; i++) {
      const a = midA + (-40 + (80 * i) / 20) * D;
      const d = onCran(a, -0.62);
      pts.push(onSkull(d, 0.98));
      facing.push(facingOf(d));
    }
    put(part, piece, { k: 'teeth', pts, facing });
  }
}

/** The way a skull at `c` looks out along `fwd` (level-ish), as a frame of three lines. */
function faceAlong(fwd: V3, upHint: V3 = [0, 0, 1]): Frame3 {
  const f = norm(fwd, [1, 0, 0]);
  const l = norm(cross(upHint, f), [0, 1, 0]);
  return [f, l, cross(f, l)];
}

/** Where, round a skull, the eye sees its face from: as `eyesToward` does for a head, for a skull that is not on bones. */
function eyesOf(st: Stage, face: Frame3): number {
  const cam = Math.atan2(dot(st.eye, face[1]), dot(st.eye, face[0])) / D;
  const front = clamp01((110 - Math.abs(cam)) / 40);
  return Math.max(-40, Math.min(40, cam * 0.67)) * front;
}

/**
 * PACKED BONES: the skin of a mass of bones crammed together (a golem's trunk, a shoulder): cells
 * on the solid's own surface, each a bone's end catching the light, the dark between them.
 */
function packed(ramp: Ramp, cells: number, seed: number, open?: (u: V3) => boolean): Skin {
  return (u, tone) => {
    if (open && open(u)) return null;
    const px = u[0] * cells;
    const py = u[1] * cells;
    const pz = u[2] * cells;
    const ix = Math.floor(px);
    const iy = Math.floor(py);
    const iz = Math.floor(pz);
    let d1 = 9;
    let d2 = 9;
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        for (let dz = -1; dz <= 1; dz++) {
          const cx = ix + dx;
          const cy = iy + dy;
          const cz = iz + dz;
          const jx = cx + hash(cx + 37 * cz, cy, seed);
          const jy = cy + hash(cx + 37 * cz, cy, seed + 1);
          const jz = cz + hash(cx + 37 * cz, cy, seed + 2);
          const d = (px - jx) ** 2 + (py - jy) ** 2 + (pz - jz) ** 2;
          if (d < d1) {
            d2 = d1;
            d1 = d;
          } else if (d < d2) d2 = d;
        }
      }
    }
    const edge = Math.sqrt(d2) - Math.sqrt(d1);
    if (edge < 0.17) return ramp[Math.max(0, Math.min(tone, 3) - 2)];
    if (Math.sqrt(d1) < 0.2 && tone >= 2) return ramp[Math.min(4, tone + 1)];
    return ramp[tone];
  };
}

/** A BUNDLE OF BONES from `a` to `b`, `r` round: `n` long bones side by side, knobbed at their ends, on a dark core; each bone a piece of its own (to fall by itself). */
function bundle(put: Put, part: string, piece: string, a: V3, b: V3, r: number, n: number, seed: number, ramp: Ramp): void {
  const axis = norm(sub(b, a), [0, 0, -1]);
  const e1 = norm(cross(axis, Math.abs(axis[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0]));
  const e2 = cross(axis, e1);
  const along = sub(b, a);
  put(part, piece + 'c', { k: 'rod', a, b, ra: r * 0.74, rb: r * 0.7, ramp: dim(dim(ramp)), far: true });
  for (let i = 0; i < n; i++) {
    const ang = (i / n) * Math.PI * 2 + seed;
    const twist = (hash(i, seed * 13, 7) - 0.5) * 1.4;
    const off = add(mul(e1, Math.cos(ang) * r * 0.55), mul(e2, Math.sin(ang) * r * 0.55));
    const off2 = add(mul(e1, Math.cos(ang + twist) * r * 0.5), mul(e2, Math.sin(ang + twist) * r * 0.5));
    const s0 = hash(i, seed * 13, 5) - 0.5;
    const s1 = hash(i, seed * 13, 6) - 0.5;
    const pa = add(add(a, off), mul(along, -0.05 + s0 * 0.22));
    const pb = add(add(b, off2), mul(along, 0.05 + s1 * 0.22));
    const rr = r * (0.3 + 0.18 * hash(i, seed * 13, 8));
    const pc = `${piece}${i}`;
    put(`${part}${i % 2}`, pc, { k: 'rod', a: pa, b: pb, ra: rr, rb: rr * 0.9, ramp, far: true });
    put(`${part}${i % 2}`, pc, { k: 'ball', c: pa, ax: sphere(rr * 1.7), skin: ramp, far: true });
    put(`${part}${i % 2}`, pc, { k: 'ball', c: pb, ax: sphere(rr * 1.6), skin: ramp, far: true });
  }
}

/** An iron band round a line from `a` to `b`, at `k` of the way, `r` round. */
function bandOn(put: Put, part: string, piece: string, a: V3, b: V3, k: number, r: number, rows = 2): void {
  const axis = norm(sub(b, a), [0, 0, -1]);
  const e1 = norm(cross(axis, Math.abs(axis[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0]));
  const e2 = cross(axis, e1);
  put(part, piece, { k: 'band', ring: { c: lerp3(a, b, k), u: mul(e1, r), v: mul(e2, r) }, ramp: IRON, rows });
}

// ---------------------------------------------------------------------------------------------
// Moves

/** A move: its keys on the bones, from its rest. */
export interface MobMove {
  name: string;
  motion: Motion;
  rest: Bones;
  /** A walk: the wind (cloth, tails) goes round once in this many seconds (its own round, so that it loops); and how fast the body goes over the floor, in the figure's own lengths a second (cloth is left behind by it). */
  period?: number;
  ground?: number;
  /**
   * THEIR ATTACKS (9 Oct): `t` seconds in, how bright the GLINT on its weapon is (the Shade's claws,
   * the Boneward's spear-head: the warning, "Pose and a glint"); whether the Boneward is BARE, its
   * spear thrown; whether a SKULL is in the Golem's fist. And when its blow lands, for its streak.
   */
  glint?: (t: number) => number;
  bare?: (t: number) => boolean;
  skull?: (t: number) => boolean;
  blurAt?: number;
  /** The Golem's club is swung round (a streak is drawn behind its head as the blow lands), not brought down. */
  sweep?: boolean;
  /** THE BONEWARD'S BLOWS: the points of it (a spear's tip, a shield's edges) whose way through the air is streaked as the blow lands; and over how many frames before it (1.6 if not said). */
  trail?: (s: Skeleton) => V3[];
  trailSpan?: number;
  /** THE CHAMPION'S: his blow kicks up the floor's dust round his front foot; and how bright his rallying cry is, `t` seconds in. */
  dust?: boolean;
  rally?: (t: number) => number;
  /** THE MARKSMAN'S: his jaw, `t` seconds in (0 shut to 1 wide: his `draw` is his bow's); and how much light his great arrow has gathered (0 none, 1 all of it). */
  jaw?: (t: number) => number;
  charge?: (t: number) => number;
}

/** A tile of the floor along the grid, in the figure's own lengths: 32 picture pixels across the screen and 16 down (skeleton.ts, `project`). */
export const TILE3 = 32 / GRID;

/** What a frame is painted from. */
interface Moment {
  s: Skeleton;
  q: Posed;
  t: number;
  /** How far the body has come since a moment before (cloth hangs back by some of it). */
  come: V3;
  wind: number;
  /** The blow is being struck this frame (a streak is drawn). */
  blur: boolean;
  /** For the Shade's claws: where the claw tips have just been, newest first, each hand. */
  trailL?: V3[];
  trailR?: V3[];
  /** The glint on its weapon (0 none), whether the Boneward's spear is gone from its hand, whether a skull is in the Golem's fist (MobMove). */
  glint: number;
  bare: boolean;
  skull: boolean;
  /** For the Golem's club as it sweeps: where the middle of its head has just been, newest first. */
  trailC?: V3[];
  /** For the Boneward's blows: where each point of its `trail` has just been, newest first. */
  trails?: V3[][];
  /** Seconds since the move's blow landed (negative before it; absent for a move with no blow): what is kicked up by it lasts a moment. */
  since?: number;
  /** The champion's: whether his blow kicks up dust, and how bright his rallying cry is (0 none). */
  dust?: boolean;
  rally: number;
  /** The marksman's jaw (if the move says), and the light his great arrow has gathered (0 none); and whether this is a frame of its death (`dyingMoment`). */
  jaw?: number;
  charge: number;
  dying?: boolean;
}

function folded(m: MobMove, t: number): number {
  const keys = m.motion.keys;
  const end = keys.length ? keys[keys.length - 1].at : 0;
  const from = m.motion.loop;
  if (from === undefined) return Math.max(0, Math.min(end, t));
  const long = end - from;
  if (long <= 1e-6) return from;
  return from + ((((t - from) % long) + long) % long);
}
function posedAt(m: MobMove, t: number): Posed {
  return bonesAt(m.motion.keys, m.rest, folded(m, t));
}
function windOf(t: number): number {
  return (((t / 1.2) % 1) + 1) % 1;
}

/** A monster of this file: how it is built, how it moves, how it is painted and how it dies. */
export interface Mob {
  id: 'shade' | 'boneward' | 'golem' | 'champion' | 'marksman';
  name: string;
  /** Small, medium or big, in a word or two. */
  size: string;
  build: Build;
  stand: MobMove;
  attack: MobMove;
  /** Its standing loop: how many frames, at how many a second. */
  idleFrames: number;
  idleFps: number;
  /**
   * ITS WALK: a loop of `walkFrames` frames at `walkFps` a second, painted for a pace of `pace`
   * tiles a second. At that pace a foot that is down stays where it is on the floor (the art
   * rulebook: "Feet grip the floor"). At another pace the same frames are shown faster or slower
   * (`walkFpsAt`), so that they still grip.
   */
  walk: MobMove;
  walkFrames: number;
  walkFps: number;
  pace: number;
  /** STRUCK: what it does when a blow lands on it, from standing (`reelTime` seconds). */
  reel: MobMove;
  reelTime: number;
  hit: number;
  warn: number;
  /** How long its death takes (seconds), and the bones as it gives way. */
  dieTime: number;
  dying: MobMove;
  /** The pool of light the game puts behind it (picture pixels on the bones' canvas), and the soft shadow under it (its half-width on the floor, picture pixels). */
  aura: Light;
  shadow: number;
  bits(st: Stage, m: Moment): Bit[];
  /** How a piece of it falls when it comes apart (null: it does not fall by itself). */
  fall?(piece: string): Fall | null;
  /**
   * ITS OTHER MOVES (9 Oct: by its size, the owner's rules in the main chat), by name: the Golem's
   * `swing` and `throw`; the Boneward's `throw`, `bash`, `pickUp`, and `standBare` and `walkBare`
   * for while its spear is thrown. Each is played once, or goes round (a loop) if its motion loops.
   */
  more?: Readonly<Record<string, MobMove>>;
}
/** The moves a monster of this file is painted in. */
export type MobAct = 'stand' | 'attack' | 'walk' | 'reel';

function momentOf(mob: Mob, mv: MobMove, t: number, blurAt?: number): Moment {
  const q = posedAt(mv, t);
  const s = solve(mob.build, q);
  const before = solve(mob.build, posedAt(mv, t - FR));
  const loops = mv.motion.loop !== undefined;
  let come = loops || t >= FR ? sub(s.pelvis, before.pelvis) : ([0, 0, 0] as V3);
  if (mv.ground) come = add(come, [mv.ground * FR, 0, 0]);
  const blur = blurAt !== undefined && Math.abs(t - blurAt) < FR * 0.6;
  const wind = mv.period ? ((((t / mv.period) % 1) + 1) % 1) : windOf(t);
  // (the moment within its round, for what flickers frame by frame: so that a loop closes)
  const m: Moment = { s, q, t: folded(mv, t), come, wind, blur, glint: mv.glint ? Math.max(0, mv.glint(t)) : 0, bare: mv.bare ? mv.bare(t) : false, skull: mv.skull ? mv.skull(t) : false, rally: mv.rally ? Math.max(0, mv.rally(t)) : 0, charge: mv.charge ? Math.max(0, mv.charge(t)) : 0 };
  if (mv.jaw) m.jaw = clamp01(mv.jaw(t));
  if (mv.motion.hit !== undefined && !loops) m.since = t - mv.motion.hit;
  if (mv.dust) m.dust = true;
  if (blur && mv.trail) {
    const T: V3[][] = [];
    for (let i = 0; i <= 8; i++) {
      const pts = mv.trail(solve(mob.build, posedAt(mv, t - (FR * (mv.trailSpan ?? 1.6) * i) / 8)));
      pts.forEach((p, j) => (T[j] ??= []).push(p));
    }
    m.trails = T;
  }
  if (blur && mob.id === 'golem' && mv.sweep) {
    const C: V3[] = [];
    for (let i = 0; i <= 8; i++) {
      const sk = solve(mob.build, posedAt(mv, t - (FR * 1.6 * i) / 8));
      C.push(add(sk.handL, mul(norm(sub(sk.handL, sk.elbowL)), CLUB_OUT)));
    }
    m.trailC = C;
  }
  if (blur && mob.id === 'shade') {
    const L: V3[] = [];
    const R: V3[] = [];
    for (let i = 0; i <= 8; i++) {
      const sk = solve(mob.build, posedAt(mv, t - (FR * 0.55 * i) / 8));
      L.push(add(sk.handL, mul(norm(sub(sk.handL, sk.elbowL)), 3.2)));
      R.push(add(sk.handR, mul(norm(sub(sk.handR, sk.elbowR)), 3.2)));
    }
    m.trailL = L;
    m.trailR = R;
  }
  return m;
}

/** One of its moves, by name: its four (stand, attack, walk, reel), its dying, or one of its others (`more`). */
function moveOf(mob: Mob, which: MobAct | string): MobMove {
  const base = which === 'stand' || which === 'attack' || which === 'walk' || which === 'reel';
  const mv = base ? mob[which as MobAct] : which === 'dying' ? mob.dying : mob.more?.[which];
  if (!mv) throw new Error(`${mob.id} has no move ${which}`);
  return mv;
}

/** ONE FRAME of a monster's move, seen from in front or from behind, with its pink edge (or `rim`). */
export function paintMob(mob: Mob, which: MobAct | string, t: number, view: GameView, rim: string | null = ENEMY_RIM): Painted {
  const st = stage(view);
  const mv = moveOf(mob, which);
  const m = momentOf(mob, mv, t, which === 'attack' ? mob.hit : mv.blurAt);
  const bits = mob.bits(st, m);
  const lights = paintBits(st, bits, m.s.pelvis);
  return { px: st.whole(rim), lights };
}

// ---------------------------------------------------------------------------------------------
// Coming apart (as the skeleton's death in art/monster_bones3.ts, shortened)

/**
 * How a piece falls: when it lets go (seconds from the blow), where it comes to lie (`to`:
 * forward and to the left of where it was), turned `spin` degrees about the upright, and laid
 * down by its long line (`axis`), with `up` (a line of it as it was) turned to the sky (`flat`),
 * squashed into a mound (`mound`: a mass of bones), or as it is (`keep`). `pile`: how high on the
 * heap it comes to rest.
 */
export interface Fall {
  from: number;
  to: readonly [number, number];
  spin: number;
  lay: 'axis' | 'flat' | 'mound' | 'keep';
  up?: V3;
  hop?: number;
  pile?: number;
  /** How high it is flung up on its way down (a limb of the marksman's bow as it snaps): none if not said. */
  rise?: number;
}
const G = 400;
type Turn = (v: V3) => V3;
const noTurn: Turn = (v) => v;
function turnOnto(a: V3, b: V3, k = 1): Turn {
  const ax = cross(a, b);
  const sn = len(ax);
  const cs = Math.max(-1, Math.min(1, dot(a, b)));
  const ang = (Math.atan2(sn, cs) / D) * k;
  if (sn < 1e-6) {
    if (cs > 0) return noTurn;
    const other = norm(cross(a, Math.abs(a[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0]));
    return (v) => about(v, other, 180 * k);
  }
  const axis = mul(ax, 1 / sn);
  return (v) => about(v, axis, ang);
}
function moved(sh: Shape, turn: Turn, c0: V3, c1: V3, squash = 0): Shape {
  const P = (p: V3): V3 => add(c1, turn(sub(p, c0)));
  const sq = (v: V3): V3 => [v[0] * (1 - 0.1 * squash), v[1] * (1 - 0.1 * squash), v[2] * (1 - 0.5 * squash)];
  switch (sh.k) {
    case 'rod':
    case 'thread':
      return { ...sh, a: P(sh.a), b: P(sh.b) };
    case 'ball': {
      const ax = [turn(sh.ax[0]), turn(sh.ax[1]), turn(sh.ax[2])] as const;
      return { ...sh, c: P(sh.c), ax: squash > 0 ? [sq(ax[0]), sq(ax[1]), sq(ax[2])] : ax };
    }
    case 'band':
      return { ...sh, ring: { c: P(sh.ring.c), u: turn(sh.ring.u), v: turn(sh.ring.v) } };
    case 'panel':
      return { ...sh, c: P(sh.c), u: turn(sh.u), v: turn(sh.v) };
    case 'dot':
      return { ...sh, p: P(sh.p), facing: turn(sh.facing) };
    case 'teeth':
      return { ...sh, pts: sh.pts.map(P), facing: sh.facing.map(turn) };
    case 'mote':
    case 'glow':
      return { ...sh, p: P(sh.p) };
    case 'greatsword':
      return { ...sh, grip: P(sh.grip), point: turn(sh.point) };
    case 'cloth':
      return { ...sh, rings: sh.rings.map((r) => ({ c: P(r.c), u: turn(r.u), v: turn(r.v), pts: r.pts?.map(P) })) };
    default:
      return sh;
  }
}
function extent(sh: Shape): [V3, number][] {
  switch (sh.k) {
    case 'rod':
      return [[sh.a, sh.ra], [sh.b, sh.rb]];
    case 'thread':
      return [[sh.a, 0.3], [sh.b, 0.3]];
    case 'ball':
      return [[sh.c, Math.hypot(sh.ax[0][2], sh.ax[1][2], sh.ax[2][2])]];
    case 'panel':
      return [[add(add(sh.c, sh.u), sh.v), 0.5], [add(sub(sh.c, sh.u), sh.v), 0.5], [sub(add(sh.c, sh.u), sh.v), 0.5], [sub(sub(sh.c, sh.u), sh.v), 0.5]];
    case 'band':
      return [[add(sh.ring.c, sh.ring.u), 0.6], [sub(sh.ring.c, sh.ring.u), 0.6], [add(sh.ring.c, sh.ring.v), 0.6], [sub(sh.ring.c, sh.ring.v), 0.6]];
    case 'greatsword':
      return [[add(sh.grip, mul(sh.point, -GS_GRIP)), 1.5], [add(sh.grip, mul(sh.point, GS_REACH)), 0.5]];
    case 'cloth':
      return sh.rings.flatMap((r) => [[add(r.c, r.u), 0.4], [sub(r.c, r.u), 0.4], [add(r.c, r.v), 0.4], [sub(r.c, r.v), 0.4]] as [V3, number][]);
    default:
      return [];
  }
}
function middleOf(bits: ReadonlyArray<Bit>): V3 {
  let sum: V3 = [0, 0, 0];
  let n = 0;
  for (const b of bits) {
    for (const [p] of extent(b.shape)) {
      sum = add(sum, p);
      n++;
    }
  }
  return n ? mul(sum, 1 / n) : [0, 0, 0];
}
const easeIO = (k: number): number => {
  const v = clamp01(k);
  return v * v * (3 - 2 * v);
};

/** The bones of one dying at a moment (before the pieces let go). */
function dyingMoment(mob: Mob, t: number): Moment {
  const q = posedAt(mob.dying, t);
  return { s: solve(mob.build, q), q, t, come: [0, 0, 0], wind: windOf(t), blur: false, glint: 0, bare: false, skull: false, rally: 0, charge: 0, dying: true, jaw: mob.dying.jaw ? clamp01(mob.dying.jaw(t)) : undefined };
}

const THEN = new Map<string, Bit[]>();
/** Its solids as they were at the moment `t` of its death, seen this way (kept: every piece that lets go then is cut from them). */
function bitsThen(mob: Mob, st: Stage, t: number): Bit[] {
  const key = `${mob.id}:${st.view}:${t.toFixed(4)}`;
  let b = THEN.get(key);
  if (!b) THEN.set(key, (b = mob.bits(st, dyingMoment(mob, t))));
  return b;
}

/** A MONSTER OF BONES `k` OF THE WAY THROUGH ITS DEATH: the bones give way, then each piece lets go and falls to lie on the floor. */
function fallApart(mob: Mob, k: number, view: GameView): Painted {
  const st = stage(view);
  const t = clamp01(k) * mob.dieTime;
  const now = dyingMoment(mob, t);
  const live = mob.bits(st, now);
  const plan = (piece: string): Fall | null => (mob.fall ? mob.fall(piece) : null);
  const gone = (piece: string): boolean => {
    const f = plan(piece);
    return f !== null && t >= f.from;
  };
  const bits: Bit[] = live.filter((b) => !gone(b.piece));
  const pieces = new Set(live.map((b) => b.piece));
  let ref: V3 = now.s.pelvis;
  for (const piece of pieces) {
    const f = plan(piece);
    if (!f || t < f.from) continue;
    const was = bitsThen(mob, st, f.from).filter((b) => b.piece === piece && b.shape.k !== 'glow' && (b.shape.k !== 'cloth' || b.shape.rigid === true));
    if (!was.length) continue;
    const c0 = middleOf(was);
    // its long line: the furthest two of its points apart
    let axis: V3 = [0, 0, 1];
    let best = -1;
    const pts: V3[] = [];
    for (const b of was) for (const [p] of extent(b.shape)) pts.push(p);
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const d = len(sub(pts[i], pts[j]));
        if (d > best) {
          best = d;
          axis = sub(pts[j], pts[i]);
        }
      }
    }
    axis = norm(axis, [0, 0, 1]);
    const Z: V3 = [0, 0, 1];
    // (a ring or a panel lies flat on its face: its own up is the line square to it)
    let flatUp: V3 = Z;
    for (const b of was) {
      if (b.shape.k === 'band') flatUp = norm(cross(b.shape.ring.u, b.shape.ring.v), Z);
      else if (b.shape.k === 'panel') flatUp = norm(cross(b.shape.u, b.shape.v), Z);
    }
    if (dot(flatUp, Z) < 0) flatUp = mul(flatUp, -1);
    const lay = (kk: number): Turn => {
      if (f.lay === 'axis') return turnOnto(axis, norm([axis[0], axis[1], 0], norm([c0[0], c0[1], 0], [1, 0, 0])), kk);
      if (f.lay === 'flat') return turnOnto(norm(f.up ?? flatUp), Z, kk);
      return noTurn;
    };
    const turn = (kk: number): Turn => {
      const t1 = lay(kk);
      return (v) => about(t1(v), Z, f.spin * kk);
    };
    const squashed = f.lay === 'mound' ? 1 : 0;
    const full = turn(1);
    let lowest = Infinity;
    for (const b of was) for (const [p, r] of extent(moved(b.shape, full, c0, [0, 0, 0], squashed))) lowest = Math.min(lowest, p[2] - r);
    if (!Number.isFinite(lowest)) lowest = 0;
    const rest: V3 = [c0[0] + f.to[0], c0[1] + f.to[1], -lowest + 0.3 + (f.pile ?? 0)];
    const fallT = Math.sqrt((2 * Math.max(0.5, c0[2] - rest[2])) / G);
    const hop = f.hop ?? 0.6;
    const bounceT = Math.sqrt((2 * hop) / G) * 2;
    const tau = t - f.from;
    const p = Math.min(1, tau / fallT);
    let z = c0[2] + (rest[2] - c0[2]) * p * p + (f.rise ?? 0) * 4 * p * (1 - p);
    if (tau > fallT && tau < fallT + bounceT) z = rest[2] + hop * Math.sin((Math.PI * (tau - fallT)) / bounceT);
    const across = 1 - (1 - Math.min(1, tau / (fallT + bounceT * 0.5))) ** 2;
    const c1: V3 = [c0[0] + (rest[0] - c0[0]) * across, c0[1] + (rest[1] - c0[1]) * across, z];
    const kk = easeIO(tau / (fallT + bounceT * 0.6));
    const tr = turn(kk);
    for (const b of was) bits.push({ part: `p_${b.part}_${piece}`, piece, shape: moved(b.shape, tr, c0, c1, squashed * kk) });
    if (piece === 'pelvis' || piece === 'hips') ref = c1;
  }
  const lights = paintBits(st, bits, ref);
  return { px: st.whole(null), lights };
}

/** A piece's fall when the plan does not name it: it lets go between `t0` and `t1`, and lies about where it was, spread out by `spread`. */
function scatter(piece: string, t0: number, t1: number, spread: number, lay: Fall['lay'] = 'axis'): Fall {
  let h = 0;
  for (let i = 0; i < piece.length; i++) h = (h * 31 + piece.charCodeAt(i)) | 0;
  const a = hash(h, 1, 7);
  const b = hash(h, 2, 7);
  const c = hash(h, 3, 7);
  return { from: t0 + (t1 - t0) * a, to: [(b - 0.5) * spread * 2, (c - 0.5) * spread * 2], spin: (a - 0.5) * 140, lay, hop: 0.4 + b };
}

// =============================================================================================
// 1. THE SHADE

const SH_BODY: Build = { ...buildOf(40, 1, { shoulders: 1.05, chest: 0.85, waist: 0.7, hips: 0.8, arms: 1.2, limbs: 0.5, pad: 1.6 }), neck: 2.2, headUp: 3.0, headFwd: 0.9, headR: [4.0, 3.6, 4.2] };
/** How far it floats: its pelvis above where a body's would be, standing (its lowest tail clears the floor by about a hand). */
export const SHADE_FLOAT = 8;
const SB = SH_BODY;

const SH_REST: Bones = {
  ...standing(SB),
  pz: SHADE_FLOAT, px: 0, yaw: -6, pitch: 8, roll: 0, twist: 4, bend: 12, side: 0,
  faceTurn: 0, faceUp: -2, faceTilt: 4,
  lfz: SHADE_FLOAT, rfz: SHADE_FLOAT,
  // the long arms hang in front of it, the claws curled at the hem
  lhIn: 0, lhx: 7.0, lhy: 3.0, lhz: -14.0, le: -14,
  rhIn: 0, rhx: 6.5, rhy: -3.4, rhz: -14.0, re: -14,
  draw: 0.4,
};

/** How much is torn off the robe's hem, across it. */
const ROBE_TORN: readonly number[] = [3, 1, 4, 2, 0, 3, 1, 2, 4, 1, 0, 2, 3, 1, 4, 2];

/** THE SHADE AS SOLIDS. `fade`: how far it has come apart (its death: the arms go first, then the robe thins). */
function shadeBits(st: Stage, m: Moment, fade = 0, eyes = 1): Bit[] {
  const { s, q } = m;
  const B = SB;
  const bits: Bit[] = [];
  const put: Put = (part, piece, shape) => {
    bits.push({ part, piece, shape });
  };
  const [cf, cl, cu] = s.chest;
  const f = norm([s.hips[0][0], s.hips[0][1], 0], [1, 0, 0]);
  const l: V3 = [-f[1], f[0], 0];
  // (cloth is left behind by however far the body has just come: gliding, that is far, and the
  // robe streams; struck, the robe flares out round it: `gale`)
  const lagRaw = mul(m.come, -1.4);
  const lagLen = len(lagRaw);
  const lag = lagLen > 2.6 ? mul(lagRaw, 2.6 / lagLen) : lagRaw;
  const stream = clamp01(len(m.come) / FR / 120);
  const flare = clamp01(q.gale);
  const wave = m.wind * Math.PI * 2;
  const flutter = 1 + Math.round(stream);

  // --- the robe: from round the neck, over the shoulders, down to a torn hem below where its knees would be ---
  const collar: Ring = { c: add(s.neck, mul(cu, 0.5)), u: mul(cf, 2.4), v: mul(cl, 2.8) };
  const shoulders: Ring = { c: add(s.neck, mul(cu, -1.6)), u: mul(cf, B.ribDeep + 1.5), v: mul(cl, B.shoulderHalf + 1.3) };
  const waist: Ring = { c: add(lerp3(s.waist, s.ribs, 0.3), mul(lag, 0.25)), u: mul(f, B.ribDeep + 1.3), v: mul(l, B.ribHalf + 1.5) };
  const hz = Math.max(1.2, s.pelvis[2] - (B.thigh * 0.95 + 2)) + 2.6 * flare;
  const short = clamp01((s.pelvis[2] - B.thigh - 3 - hz) / 10);
  const hc: V3 = [s.pelvis[0] - 2.0 * f[0] + lag[0], s.pelvis[1] - 2.0 * f[1] + lag[1], hz];
  const wide = (6.2 + short * 3.5) * (1 + 0.45 * flare);
  const deep = (5.0 + short * 3) * (1 + 0.4 * flare);
  const pts: V3[] = [];
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const rear = Math.max(0, -Math.cos(a));
    const p0 = add(hc, add(mul(f, Math.cos(a) * deep), mul(l, Math.sin(a) * wide)));
    pts.push(add(p0, add(mul(f, -rear * (1.6 + 3 * stream)), [0, 0, Math.sin(wave * flutter + a * 2) * (0.7 + 0.8 * stream + 1.4 * flare) + rear * (1.2 + 1.5 * stream)])));
  }
  const hem: Ring = { c: hc, u: mul(f, deep), v: mul(l, wide), pts };
  if (fade < 0.85) put('robe', 'robe', { k: 'cloth', rings: [collar, shoulders, waist, hem], ramp: fade > 0.45 ? dim(SHROUD) : SHROUD, look: { folds: [25, -25, 70, -70, 180], lift: 0.25 }, torn: ROBE_TORN });

  // --- its tail: four tongues of the robe streaming out behind and below it, tapering ---
  if (fade < 0.5) {
    const along = 1 - fade * 1.6;
    for (let j = 0; j < 4; j++) {
      const ang = [138, 162, 198, 222][j] * D;
      const L = [12, 15, 14, 11][j] * along * (1 + 0.35 * stream);
      const base = add(hc, add(mul(f, Math.cos(ang) * deep * 0.8), mul(l, Math.sin(ang) * wide * 0.8)));
      let last: V3 = add(base, [0, 0, 1.2]);
      for (let i = 1; i <= 4; i++) {
        const k = i / 4;
        const sway = Math.sin(wave * flutter + j * 1.9 + k * 3.2) * (1.3 + 1.1 * stream) * k;
        const p = add(base, add(add(mul(f, -L * k), mul(l, Math.sin(ang) * k * (3.4 + 2 * flare) + sway)), [0, 0, -L * (0.42 - 0.24 * stream - 0.2 * flare) * k + Math.cos(wave * 2 * flutter + j + k * 2) * (0.7 + 0.6 * stream) * k]));
        const pp: V3 = [p[0], p[1], Math.max(1.6, p[2])];
        put(`tail${j}`, 'robe', { k: 'rod', a: last, b: pp, ra: 1.9 * (1 - (i - 1) / 4) + 0.3, rb: 1.9 * (1 - k) + 0.3, ramp: SHROUD });
        last = pp;
      }
    }
  }

  // --- the arms: a ragged sleeve to the elbow, a long thin pale forearm, a hand of three hooked claws, spread by `draw` ---
  if (fade < 0.3) {
    for (const side of ['L', 'R'] as const) {
      const sh = side === 'L' ? s.shoulderL : s.shoulderR;
      const el = side === 'L' ? s.elbowL : s.elbowR;
      const hand = side === 'L' ? s.handL : s.handR;
      const fore = norm(sub(hand, el), [0, 0, -1]);
      const cuff = add(el, mul(fore, 1.4));
      put(`sleeve${side}`, `arm${side}`, { k: 'rod', a: sh, b: cuff, ra: 1.8, rb: 2.3, ramp: SHROUD, far: true });
      const wrist = add(hand, mul(fore, -0.5));
      put(`arm${side}`, `arm${side}`, { k: 'rod', a: cuff, b: wrist, ra: 0.75, rb: 0.6, ramp: PALLOR, far: true });
      put(`arm${side}`, `arm${side}`, { k: 'ball', c: hand, ax: sphere(1.0), skin: PALLOR, far: true });
      const want = add(cf, mul(cu, -0.5));
      const hook = norm(sub(want, mul(fore, dot(want, fore))), mul(cu, -1));
      const across = norm(cross(fore, hook), cl);
      const spread = 0.3 + 0.7 * clamp01(q.draw);
      for (const kf of [-1, 0, 1]) {
        const base = add(hand, add(mul(across, kf * 0.85), mul(fore, 0.6)));
        const dirF = norm(add(fore, mul(across, kf * spread * 0.75)));
        const knuckle = add(base, mul(dirF, 3.0 + (kf === 0 ? 0.7 : 0)));
        const tip = add(knuckle, add(mul(hook, 2.4), mul(dirF, 0.8)));
        put(`arm${side}`, `arm${side}`, { k: 'rod', a: base, b: knuckle, ra: 0.7, rb: 0.6, ramp: BONE, far: true });
        put(`arm${side}`, `arm${side}`, { k: 'rod', a: knuckle, b: tip, ra: 0.6, rb: 0.22, ramp: BONE, far: true });
        // THE GLINT (its warning, with the pose): its claws' points flare pink, hottest just before they come down
        if (m.glint > 0.05) {
          const g = m.glint;
          if (kf === 0 || g > 0.6) put('glint', 'glint', { k: 'mote', p: tip, c: g > 0.9 ? FLAME[4] : FLAME[3], size: kf === 0 && g > 0.75 ? 2 : 1 });
          if (kf === 0) put('glint', 'glint', { k: 'glow', p: tip, c: SOCKET, r: 3 + 4 * g, a: Math.min(0.85, 0.5 * g) });
        }
      }
    }
  }

  // --- the hood: a tatter of the same cloth, open in front from the brow down, the dark inside it,
  // its point drooping back; and in the dark, two hot pink eyes ---
  if (fade < 0.7) {
    const face = wornOn(st, s, 14);
    const [ff, fl, fu] = face;
    const hc2 = add(s.head, add(mul(ff, -0.5), mul(fu, 0.3)));
    const hr: V3 = [4.5, 4.1, 4.7];
    const hoodSkin: Skin = (u, tone) => {
      if (u[0] > 0.22 && u[2] < 0.4 && Math.abs(u[1]) < 0.74) return null;
      if (u[0] > 0.04 && u[2] < 0.55 && Math.abs(u[1]) < 0.88) return SHROUD[Math.max(0, tone - 2)];
      return (fade > 0.45 ? dim(SHROUD) : SHROUD)[tone];
    };
    put('hood', 'hood', { k: 'ball', c: hc2, ax: [mul(ff, hr[0]), mul(fl, hr[1]), mul(fu, hr[2])], skin: hoodSkin });
    const ic = add(hc2, add(mul(ff, -1.2), mul(fu, -0.3)));
    const ir: V3 = [3.6, 3.5, 3.9];
    put('hood', 'hood', { k: 'ball', c: ic, ax: [mul(ff, ir[0]), mul(fl, ir[1]), mul(fu, ir[2])], skin: (u) => (u[0] < -0.05 ? null : INK) });
    put('hood', 'hood', { k: 'rod', a: add(hc2, add(mul(fu, hr[2] * 0.8), mul(ff, -1.4))), b: add(add(hc2, add(mul(fu, hr[2] + 1.3), mul(ff, -4.6))), mul(lag, 0.5)), ra: 1.6, rb: 0.35, ramp: SHROUD });
    if (eyes > 0.05) {
      for (const k of [-1, 1]) {
        const e = add(ic, add(mul(ff, ir[0] * 0.86), add(mul(fl, k * 1.3), mul(fu, -0.1))));
        const hot = eyes > 1.2 ? FLAME[4] : eyes > 0.5 ? SOCKET : FLAME[1];
        put('hood', 'hood', { k: 'dot', p: e, c: hot, facing: ff });
        // (its light only where the eyes are seen: none through the back of the hood)
        if (dot(ff, st.eye) > 0.05) put('hood', 'hood', { k: 'glow', p: e, c: SOCKET, r: 3.5 + Math.max(0, eyes - 1) * 3, a: Math.min(0.75, 0.45 * eyes) });
      }
    }
  }

  // --- the rake: three pale streaks where the claws of each hand have just been ---
  if (m.blur) {
    for (const trail of [m.trailL, m.trailR]) {
      if (!trail) continue;
      for (let i = 1; i < trail.length; i++) {
        const a = trail[i - 1];
        const b = trail[i];
        const [ax, ay] = st.at(a);
        const [bx, by] = st.at(b);
        const n = Math.max(1, Math.ceil(Math.hypot(bx - ax, by - ay)));
        for (let j = 0; j < n; j++) {
          const p = lerp3(a, b, j / n);
          for (const kf of [-1.3, 0, 1.3]) put('streak', 'streak', { k: 'mote', p: add(p, [0, 0, kf]), c: i < trail.length / 2 ? PALLOR[3] : PALLOR[2], size: 1 });
        }
      }
    }
  }
  return bits;
}

/** Standing, it bobs: up and down on nothing, swaying, the claws stirring. */
function shadeHover(): Motion {
  const R = SH_REST;
  return {
    loop: 0,
    keys: [
      { at: 0, pose: {} },
      { at: 0.3, pose: { pz: R.pz + 1.0, pitch: R.pitch - 1, faceTilt: 2, lhx: R.lhx + 0.6, rhx: R.rhx + 0.3, draw: 0.32 }, ease: 'io' },
      { at: 0.6, pose: { pz: R.pz + 1.7, roll: 2, pitch: R.pitch - 2, faceTilt: 1, lhx: R.lhx + 0.4, rhx: R.rhx + 0.6, draw: 0.2 }, ease: 'io' },
      { at: 0.9, pose: { pz: R.pz + 0.8, roll: 1, faceTilt: 3, draw: 0.3 }, ease: 'io' },
      { at: 1.2, pose: {}, ease: 'io' },
    ],
  };
}

/** The moment its claws land (it has no rules yet: a quick monster's wind-up). */
export const SHADE_HIT = 0.5;
const SH_WARN: P = {
  px: -1.6, pz: SHADE_FLOAT + 2.4, yaw: -2, pitch: -12, bend: -14, twist: 0, faceUp: 14, faceTilt: 0,
  lhIn: 1, lhx: -3.6, lhy: 5.0, lhz: 14.0, le: 0,
  rhIn: 1, rhx: -3.6, rhy: -5.0, rhz: 14.0, re: 0,
  draw: 1,
};
const SH_RAKE: P = {
  px: 6, pz: SHADE_FLOAT - 1.5, yaw: -4, pitch: 24, bend: 22, twist: 0, faceUp: -6, faceTilt: 2,
  lhIn: 1, lhx: 12.5, lhy: 2.0, lhz: -9.5, le: 0,
  rhIn: 1, rhx: 11.5, rhy: -3.0, rhz: -11.0, re: 0,
  draw: 0.75,
};
/** THE RAKE: both arms flung back high over the hood, claws spread, leaning back, held (the warning); then down and through with both claws. */
function shadeRake(): Motion {
  const shake = (dx: number, dz: number): P => ({ ...SH_WARN, lhx: (SH_WARN.lhx ?? 0) + dx, rhx: (SH_WARN.rhx ?? 0) - dx, lhz: (SH_WARN.lhz ?? 0) + dz, rhz: (SH_WARN.rhz ?? 0) + dz });
  return {
    hit: SHADE_HIT,
    keys: [
      { at: 0, pose: {} },
      { at: 0.17, pose: SH_WARN, ease: 'out' },
      { at: 0.25, pose: shake(0.4, 0.4), ease: 'hold' },
      { at: 0.33, pose: shake(-0.3, -0.2), ease: 'hold' },
      { at: 0.41, pose: shake(0.3, 0.5), ease: 'hold' },
      { at: SHADE_HIT, pose: SH_RAKE, ease: 'in' },
      { at: SHADE_HIT + 0.1, pose: { ...SH_RAKE, px: 7, pitch: 27, lhx: 8.5, lhz: -16, rhx: 7.5, rhz: -17, draw: 0.4 }, ease: 'out' },
      { at: SHADE_HIT + 0.35, pose: {}, ease: 'io' },
    ],
  };
}
/** Dying: a jolt (thrown up, arms flung out, the eyes flaring), then it sinks into its own robe. */
function shadeGiving(): Motion {
  const limp: P = { lhIn: 0, lhx: 2, lhy: 3, lhz: -18, rhIn: 0, rhx: 2, rhy: -3, rhz: -18, draw: 0 };
  return {
    keys: [
      { at: 0, pose: {} },
      { at: 0.07, pose: { pz: SHADE_FLOAT + 3.5, pitch: -14, bend: -12, faceUp: 18, lhIn: 1, lhx: -1, lhy: 7, lhz: 10, rhIn: 1, rhx: -1, rhy: -7, rhz: 10, draw: 1 }, ease: 'out' },
      { at: 0.3, pose: { ...limp, pz: SHADE_FLOAT - 9, pitch: 18, bend: 28, faceUp: -24 }, ease: 'in' },
      { at: 0.6, pose: { ...limp, pz: SHADE_FLOAT - 19, pitch: 26, bend: 34, faceUp: -36 }, ease: 'in' },
      { at: 1.0, pose: { ...limp, pz: SHADE_FLOAT - 23, pitch: 28, bend: 36, faceUp: -40 }, ease: 'out' },
    ],
  };
}

/** ITS GLIDE: eight frames at twelve a second, painted for a pace a little quicker than the skeleton's (3 tiles a second in the rules). It has no feet: it leans into its way and goes, bobbing, the arms trailing low behind it and the robe's tails streaming back and fluttering. */
const SHADE_WALK_FRAMES = 8;
const SHADE_WALK_FPS = 12;
export const SHADE_PACE = 3.4;
function shadeGlide(): Motion {
  const R = SH_REST;
  const n = SHADE_WALK_FRAMES;
  const keys: Key3[] = [];
  for (let i = 0; i <= n; i++) {
    const a = ((i % n) / n) * Math.PI * 2;
    keys.push({
      at: i / SHADE_WALK_FPS,
      ease: 'lin',
      pose: {
        px: 0.6, pz: R.pz + 1.0 + 1.3 * Math.sin(a), yaw: -4 + 2 * Math.sin(a + 0.6), pitch: 11 + 2 * Math.sin(a + 1.2), bend: 9, roll: 2.5 * Math.sin(a), twist: 2, side: 0,
        faceUp: 4 + 2 * Math.sin(a + 1.6), faceTilt: 2 * Math.sin(a + 0.4), faceTurn: 0,
        lhIn: 0, lhx: -3.0 + Math.sin(a + 0.8), lhy: 5.0, lhz: -13.5, le: -16,
        rhIn: 0, rhx: -2.6 + Math.sin(a + 0.8 + Math.PI), rhy: -5.2, rhz: -13.5, re: -16,
        draw: 0.2,
      },
    });
  }
  return { keys, loop: 0 };
}
/** STRUCK: jolted back, the robe flaring out round it, the arms flung up, the eyes flaring; then it rights itself. */
function shadeStruck(): Motion {
  const R = SH_REST;
  return {
    keys: [
      { at: 0, pose: {} },
      { at: 0.05, pose: { px: -4.5, pz: R.pz + 2.5, pitch: -20, bend: -16, yaw: -2, faceUp: 18, faceTilt: -8, lhIn: 1, lhx: 7, lhy: 7, lhz: 3, le: 0, rhIn: 1, rhx: 6, rhy: -7, rhz: 5, re: 0, draw: 1, gale: 1 }, ease: 'out' },
      { at: 0.15, pose: { px: -3.0, pz: R.pz + 1.5, pitch: -6, bend: -4, faceUp: 6, faceTilt: -3, lhIn: 1, lhx: 5, lhy: 5, lhz: -6, le: 0, rhIn: 1, rhx: 4.5, rhy: -5, rhz: -5, re: 0, draw: 0.6, gale: 0.45 }, ease: 'out' },
      { at: 0.33, pose: {}, ease: 'io' },
    ],
  };
}

/**
 * A GLINT over a wind-up (his "Pose and a glint", 9 Oct, by 09:30): from nothing at the start, to
 * `held` as the warning pose is reached at `pose`, flaring to full just before the blow at `hit`, and
 * out the moment it lands.
 */
function glintOver(pose: number, hit: number, held = 0.6): (t: number) => number {
  return (t) => (t < 0 || t >= hit ? 0 : t < pose ? (held * t) / pose : held + (1.25 - held) * ((t - pose) / (hit - pose)));
}

export const SHADE: Mob = {
  id: 'shade',
  name: 'The Shade',
  size: 'small: comes in threes',
  build: SB,
  stand: { name: 'The Shade hovers', motion: shadeHover(), rest: SH_REST },
  attack: { name: 'The Shade rakes', motion: shadeRake(), rest: SH_REST, glint: glintOver(0.17, SHADE_HIT) },
  idleFrames: 12,
  idleFps: 10,
  walk: { name: 'The Shade glides', motion: shadeGlide(), rest: SH_REST, period: SHADE_WALK_FRAMES / SHADE_WALK_FPS, ground: SHADE_PACE * TILE3 },
  walkFrames: SHADE_WALK_FRAMES,
  walkFps: SHADE_WALK_FPS,
  pace: SHADE_PACE,
  reel: { name: 'The Shade is struck', motion: shadeStruck(), rest: SH_REST },
  reelTime: 0.33,
  hit: SHADE_HIT,
  warn: 0.37,
  dieTime: 1.0,
  dying: { name: 'The Shade comes apart', motion: shadeGiving(), rest: SH_REST },
  aura: { x: CANVAS3.ax - 2, y: CANVAS3.ay - 30, r: 34, color: '#ff3a78', a: 0.13 },
  shadow: 9,
  bits: (st, m) => shadeBits(st, m),
};

/** Its wisps and motes as it comes apart: each born at its own moment somewhere on it, drifting up and away. */
const WISPS = 11;
const MOTES = 18;

/** THE SHADE `k` OF THE WAY THROUGH ITS DEATH: the robe crumples down and comes apart into wisps of itself and pink motes, and is gone. */
export function shadeDeath(k: number, view: GameView): Painted {
  const st = stage(view);
  const t = clamp01(k) * SHADE.dieTime;
  const m = dyingMoment(SHADE, t);
  const fade = clamp01((t - 0.18) / 0.62);
  // (the eyes flare as it is struck, and are out before it is down)
  const eyes = t < 0.05 ? 1 + t / 0.05 : t < 0.16 ? 2 : Math.max(0, 2 - (t - 0.16) / 0.1);
  const bits = shadeBits(st, m, fade, eyes);
  const top = m.s.neck;
  for (let i = 0; i < WISPS; i++) {
    const born = 0.12 + 0.5 * hash(i, 3, 11);
    const age = t - born;
    if (age < 0 || age > 0.45) continue;
    const a = hash(i, 4, 11) * Math.PI * 2;
    const h = hash(i, 5, 11);
    const from: V3 = [top[0] + Math.cos(a) * 5, top[1] + Math.sin(a) * 5, 4 + h * Math.max(4, top[2] - 4)];
    const go: V3 = [Math.cos(a) * 9 * age, Math.sin(a) * 9 * age, 22 * age];
    const p = add(from, go);
    const r = 1.8 * (1 - age / 0.45) + 0.3;
    const tail = add(p, [-Math.cos(a) * 2.5, -Math.sin(a) * 2.5, -3.2]);
    bits.push({ part: `wisp${i}`, piece: 'wisp', shape: { k: 'rod', a: p, b: tail, ra: r, rb: 0.25, ramp: SHROUD } });
  }
  for (let i = 0; i < MOTES; i++) {
    const born = 0.06 + 0.62 * hash(i, 7, 13);
    const age = t - born;
    if (age < 0 || age > 0.38) continue;
    const a = hash(i, 8, 13) * Math.PI * 2;
    const r0 = 2 + hash(i, 9, 13) * 5;
    const h = 3 + hash(i, 10, 13) * Math.max(6, top[2] - 2);
    const p: V3 = [top[0] + Math.cos(a) * r0 + Math.sin(age * 20 + i) * 1.2, top[1] + Math.sin(a) * r0, h + 26 * age];
    const c = age < 0.12 ? FLAME[3] : age < 0.26 ? SOCKET : FLAME[1];
    bits.push({ part: 'motes', piece: 'mote', shape: { k: 'mote', p, c, size: age < 0.08 && i % 3 === 0 ? 2 : 1 } });
    if (i % 2 === 0) bits.push({ part: 'motes', piece: 'mote', shape: { k: 'glow', p, c: SOCKET, r: 2.5, a: 0.3 * (1 - age / 0.38) } });
  }
  const lights = paintBits(st, bits, m.s.pelvis);
  return { px: st.whole(null), lights };
}

// =============================================================================================
// 2. THE BONEWARD

/** The skeleton's own body (art/monster_bones3.ts), a head taller and broader. */
const BW_K = 1.18;
const BW_BODY: Build = scaled(SKELETON3_BODY, BW_K, { shoulderHalf: 1.12, ribHalf: 1.08, ribDeep: 1.05 });
const WB = BW_BODY;
/** Its bones, a little thicker than the skeleton's for its size: it is old, and heavy, and brittle. */
const BK = BW_K * 1.08;
const BW_RIBS: ReadonlyArray<readonly [number, number, number, number, number]> = [
  [1.7, 3.9, 2.8, 0.3, 1.0],
  [4.0, 4.8, 3.2, 0.34, 1.3],
  [6.3, 5.1, 3.4, 0.42, 1.5],
  [8.6, 4.9, 3.3, 0.6, 1.6],
  [10.8, 4.3, 3.0, 0.9, 1.5],
];
/** The tower shield: half its width and half its height, and how far in front of the hand that holds it its face is. */
const SHIELD_W = 7.6;
const SHIELD_H = 20.5;
const SHIELD_PLANKS = 4;
/** The spear: all its length, and how much of it is behind the hand. */
const SPEAR = 34;
const SPEAR_BACK = 11;
/**
 * THE RUNE on its shield (an original mark: a stave forked at its head, a diamond round its heart,
 * a bar at its foot), as strokes across and up the shield's face from a little above its middle.
 */
const RUNE: ReadonlyArray<readonly [number, number, number, number]> = [
  [0, -7.5, 0, 7.5],
  [0, 3.6, -3.6, 7.6],
  [0, 3.6, 3.6, 7.6],
  [0, -3.3, 3.1, 0],
  [3.1, 0, 0, 3.3],
  [0, 3.3, -3.1, 0],
  [-3.1, 0, 0, -3.3],
  [-2.6, -7.5, 2.6, -7.5],
];
function runeDist(a: number, b: number): number {
  let best = 99;
  for (const [x0, y0, x1, y1] of RUNE) {
    const dx = x1 - x0;
    const dy = y1 - y0;
    const t = clamp01(((a - x0) * dx + (b - y0) * dy) / (dx * dx + dy * dy || 1));
    best = Math.min(best, Math.hypot(a - (x0 + dx * t), b - (y0 + dy * t)));
  }
  return best;
}
/** The planks' ends at the top and the foot (each plank its own length, as bones are). */
const PLANK_TOP = [0.9, 0, 1.6, 0.6];
const PLANK_FOOT = [0.4, 0, 0.5, 0.2];

/** The shield's face: bone planks with dark seams, two iron bands with rivets, and the rune burning `lit` (0 dark, 1 burning). */
function shieldSkin(lit: number): PanelSkin {
  const W = SHIELD_W;
  const H = SHIELD_H;
  const pw = (2 * W) / SHIELD_PLANKS;
  return (a, b, front, tone) => {
    const i = Math.max(0, Math.min(SHIELD_PLANKS - 1, Math.floor((a + W) / pw)));
    const x = a + W - i * pw;
    const top = H - PLANK_TOP[i];
    const foot = -H + PLANK_FOOT[i];
    if (b > top || b < foot) return null;
    // (the ends of a plank rounded off)
    if (b > top - 1 && (x < 0.6 || x > pw - 0.6)) return null;
    if (i > 0 && x < 0.5) return INK;
    const banded = Math.abs(b - 13.5) < 1.2 || Math.abs(b + 13) < 1.2;
    if (!front) {
      if (banded) return IRON[Math.max(0, tone - 1)];
      return PLANK[Math.max(0, tone - 1)];
    }
    if (banded) return Math.abs(x - pw / 2) < 0.55 ? IRON[3] : IRON[Math.min(2, tone)];
    const r = runeDist(a, b - 1.5);
    if (r < 0.7) return lit > 0.6 ? FLAME[4] : lit > 0.25 ? FLAME[2] : lit > 0.05 ? FLAME[1] : PLANK[0];
    if (r < 1.35) return lit > 0.6 ? FLAME[2] : lit > 0.25 ? FLAME[1] : PLANK[0];
    // (the face of the shield takes a step more of the light than it should: a flat face square to the
    // eye is in the dark tone in this light, and the bone must read as bone)
    const t2 = Math.max(2, Math.min(3, tone + 1));
    if (x < 0.95) return PLANK[Math.min(4, t2 + 1)];
    // (a crack or two in the old bone)
    if ((i === 1 && Math.abs(b - 6 + x * 0.8) < 0.3 && b > 3) || (i === 2 && Math.abs(b + 6 - x * 0.6) < 0.3 && b < -2)) return PLANK[1];
    return PLANK[t2];
  };
}

const BW_HANG = -(WB.upperArm + WB.foreArm) * 0.94;
const BW_REST: Bones = {
  ...standing(WB),
  pz: -0.8, px: 0, yaw: -8, pitch: 3, roll: 0, twist: -4, bend: 6, side: 0,
  faceTurn: 4, faceUp: 2, faceTilt: 3,
  lfx: 1.6, lfy: 1.2, lft: 10, lk: 8, rfx: -1.0, rfy: -0.8, rft: -14, rk: -8,
  // the shield on the left arm, held before it, its foot just off the floor
  lhIn: 1, lhx: 7.5, lhy: -10.5, lhz: -13.6, le: 0,
  // the spear low in the right hand, its point toward the floor ahead
  rhIn: 0, rhx: 3.2, rhy: -2.2, rhz: BW_HANG + 0.4, re: 6,
  wAz: -22, wEl: -30, wRoll: 0,
  pAz: -12, pEl: 4,
  draw: 0.12, out: 0, pt: 0,
};

/** THE BONEWARD AS SOLIDS: the skeleton's bones, bigger; a horned iron half-helm; broken rusted plates on the shoulders; the shield; the spear. */
function bonewardBits(st: Stage, m: Moment): Bit[] {
  const { s, q } = m;
  const B = WB;
  const K = BK;
  const bits: Bit[] = [];
  const put: Put = (part, piece, shape) => {
    bits.push({ part, piece, shape });
  };
  const [cf, cl, cu] = s.chest;
  const lit = 1 - clamp01(q.out);

  // --- the legs ---
  for (const side of ['L', 'R'] as const) {
    const hip = side === 'L' ? s.hipL : s.hipR;
    const knee = side === 'L' ? s.kneeL : s.kneeR;
    const ankle = side === 'L' ? s.ankleL : s.ankleR;
    const heel = side === 'L' ? s.heelL : s.heelR;
    const toe = side === 'L' ? s.toeL : s.toeR;
    put(`leg${side}`, `leg${side}`, { k: 'rod', a: hip, b: knee, ra: 1.0 * K, rb: 0.85 * K, ramp: BONE, far: true });
    put(`leg${side}`, `leg${side}`, { k: 'ball', c: knee, ax: sphere(1.45 * K), skin: BONE, far: true });
    put(`leg${side}`, `shin${side}`, { k: 'rod', a: knee, b: ankle, ra: 0.85 * K, rb: 0.72 * K, ramp: BONE, far: true });
    put(`leg${side}`, `shin${side}`, { k: 'ball', c: ankle, ax: sphere(1.0 * K), skin: BONE, far: true });
    put(`leg${side}`, `foot${side}`, { k: 'rod', a: add(heel, [0, 0, 0.95 * K]), b: add(toe, [0, 0, 0.75 * K]), ra: 0.95 * K, rb: 0.75 * K, ramp: BONE, far: true });
  }

  // --- the pelvis, the spine, the rib cage ---
  const [hf, hl, hu] = s.hips;
  put('pelvis', 'pelvis', { k: 'ball', c: add(s.pelvis, mul(hu, 0.9 * K)), ax: [mul(hf, 3.1 * K), mul(hl, 5.0 * K), mul(hu, 2.2 * K)], skin: (u, tone) => (u[0] > 0.42 && u[2] < 0.25 && Math.abs(u[1]) > 0.16 && Math.abs(u[1]) < 0.56 ? INK : BONE[tone]) });
  const low = add(s.pelvis, mul(hu, 2.6 * K));
  const backOf = (p: V3, k: number): V3 => add(p, mul(cf, -k));
  for (let i = 0; i < 4; i++) put('spine', 'cage', { k: 'ball', c: lerp3(low, backOf(s.ribs, 0.4), (i + 0.5) / 4), ax: sphere(1.12 * K), skin: BONE });
  const fromBehind = dot(cf, st.eye) < 0.1;
  if (fromBehind) {
    put('ribs', 'cage', { k: 'rod', a: backOf(s.ribs, 1.6 * K), b: backOf(s.neck, 1.3 * K), ra: 1.0 * K, rb: 0.9 * K, ramp: BONE });
    for (const sg of [1, -1] as const) {
      const c = add(add(add(s.neck, mul(cu, -3.6 * K)), mul(cf, -2.3 * K)), mul(cl, sg * 3.1 * K * 1.1));
      put('blades', 'cage', { k: 'ball', c, ax: [mul(norm(add(cf, mul(cl, sg * 0.3))), 0.6 * K), mul(cl, 2.0 * K), mul(cu, 2.4 * K)], skin: BONE });
    }
  }
  const neckRoot = s.neck;
  for (let i = 0; i < BW_RIBS.length; i++) {
    const [down, W, Dp, gap, slope] = BW_RIBS[i];
    const c = add(add(neckRoot, mul(cu, -down * K)), mul(cf, Dp * 0.55 * K));
    for (const sg of [1, -1] as const) {
      let last: V3 | null = null;
      for (let k = 0; k <= 6; k++) {
        const th = gap + ((Math.PI - gap) * k) / 6;
        const p = add(add(add(c, mul(cf, Dp * K * Math.cos(th))), mul(cl, sg * W * K * 1.08 * Math.sin(th))), mul(cu, -slope * K * (1 + Math.cos(th)) * 0.5));
        if (last) {
          const midP = mid(last, p);
          const out = sub(midP, add(c, mul(cu, dot(sub(midP, c), cu))));
          if (dot(norm(out), st.eye) > -0.12) put('ribs', 'cage', { k: 'rod', a: last, b: p, ra: 0.72 * K, rb: 0.72 * K, ramp: BONE });
        }
        last = p;
      }
    }
  }
  const sternumTop = add(add(neckRoot, mul(cu, -1.0 * K)), mul(cf, 2.8 * 1.5 * K));
  const sternumLow = add(add(neckRoot, mul(cu, -7.5 * K)), mul(cf, 3.4 * 1.5 * K));
  put('ribs', 'cage', { k: 'rod', a: sternumTop, b: sternumLow, ra: 0.95 * K, rb: 0.75 * K, ramp: BONE });

  // --- the arms (both hands closed: on the shield's grip, and on the spear) ---
  for (const side of ['L', 'R'] as const) {
    const sh = side === 'L' ? s.shoulderL : s.shoulderR;
    const el = side === 'L' ? s.elbowL : s.elbowR;
    const hand = side === 'L' ? s.handL : s.handR;
    const fore = norm(sub(hand, el), [0, 0, -1]);
    put(`upper${side}`, `arm${side}`, { k: 'ball', c: sh, ax: sphere(1.45 * K), skin: BONE, far: true });
    put(`upper${side}`, `arm${side}`, { k: 'rod', a: sh, b: el, ra: 0.85 * K, rb: 0.75 * K, ramp: BONE, far: true });
    put(`fore${side}`, `fore${side}`, { k: 'ball', c: el, ax: sphere(1.3 * K), skin: BONE, far: true });
    put(`fore${side}`, `fore${side}`, { k: 'rod', a: el, b: add(hand, mul(fore, -1.1)), ra: 0.75 * K, rb: 0.66 * K, ramp: BONE, far: true });
    put(`fore${side}`, `fore${side}`, { k: 'ball', c: hand, ax: sphere(1.4 * K), skin: BONE, far: true });
    put('ribs', 'cage', { k: 'rod', a: sternumTop, b: add(sh, mul(cu, 0.3)), ra: 0.72 * K, rb: 0.72 * K, ramp: BONE, far: true });
    // a rusted plate on each shoulder, broken: the right one half gone
    const pc = add(add(sh, mul(cu, 1.3 * K)), mul(cl, (side === 'L' ? 1 : -1) * 0.8));
    const out = side === 'L' ? cl : mul(cl, -1);
    put(`plate${side}`, `plate${side}`, {
      k: 'ball',
      c: pc,
      ax: [mul(cf, 3.6 * K), mul(out, 3.2 * K), mul(cu, 2.1 * K)],
      skin: (u, tone) => {
        if (u[2] < -0.1) return null;
        // (broken: a bite out of its front edge, jagged)
        if (side === 'R' && u[0] > 0.1 && u[1] > -0.2 + 0.25 * Math.sin(u[0] * 14)) return null;
        if (side === 'L' && u[0] < -0.45 && u[1] > 0.55 + 0.2 * Math.sin(u[0] * 17)) return null;
        if (u[2] < 0.12) return IRON[0];
        if (hash(Math.round(u[0] * 6), Math.round(u[1] * 6), side === 'L' ? 3 : 4) < 0.28) return RUST[Math.min(2, tone)];
        return IRON[tone];
      },
    });
  }

  // --- the neck and the skull, under a horned iron half-helm ---
  for (const k of [0.3, 0.75]) put('neck', 'neck', { k: 'ball', c: lerp3(s.neck, s.skull, k), ax: sphere(1.05 * K), skin: BONE });
  const face = wornOn(st, s, 26);
  const [ff, fl, fu] = face;
  const eyes = eyesToward(st, s);
  const midDeg = (eyes[0] + eyes[1]) / 2;
  const cran = at3(s.head, face, -0.4 * K, 0, 1.2 * K);
  const R: V3 = [5.3 * K, 5.1 * K, 4.7 * K];
  skull(st, put, 'skull', 'skull', cran, face, R, BONE, midDeg, lit, true, 4.5);
  // the jaw, hinged at the back
  const hinge = at3(s.head, face, -1.8 * K, 0, -2.0 * K);
  const open = clamp01(q.draw) * 34;
  const jf = about(ff, fl, open);
  const ju = about(fu, fl, open);
  const jawC = add(hinge, add(mul(jf, 3.2 * K), mul(ju, -1.4 * K)));
  put('mouth', 'skull', { k: 'ball', c: at3(s.head, face, 0.9 * K, 0, -2.3 * K), ax: [mul(ff, 2.0 * K), mul(fl, 2.8 * K), mul(fu, 1.05 * K)], skin: () => INK });
  put('jaw', 'jaw', { k: 'ball', c: jawC, ax: [mul(jf, 2.9 * K), mul(fl, 3.5 * K), mul(ju, 1.35 * K)], skin: BONE });
  // the helm: an iron cap over the crown and the back of the skull, its rim low at the back, a ridge down the middle
  const helmC = add(cran, mul(fu, 0.4 * K));
  const HR: V3 = [R[0] + 0.8, R[1] + 0.8, R[2] + 0.9];
  put('helm', 'skull', {
    k: 'ball',
    c: helmC,
    ax: [mul(ff, HR[0]), mul(fl, HR[1]), mul(fu, HR[2])],
    skin: (u, tone) => {
      const rim = 0.2 - 0.5 * Math.max(0, -u[0]);
      if (u[2] < rim) return null;
      if (u[2] < rim + 0.13) return IRON[Math.max(0, tone - 1)];
      if (Math.abs(u[1]) < 0.1 && u[2] > 0.35) return IRON[Math.min(4, tone + 1)];
      return IRON[tone];
    },
  });
  // its horns: out from either side of the helm, curving forward and up
  for (const sg of [1, -1] as const) {
    const base = at3(helmC, face, -0.3, sg * (HR[1] - 0.3), 0.6 * K);
    const p1 = at3(base, face, 0.3, sg * 3.2, 1.2);
    const p2 = at3(p1, face, 1.0, sg * 1.8, 3.4);
    const p3 = at3(p2, face, 1.8, sg * -0.3, 2.8);
    const hornRamp = BONE;
    put(`horn${sg}`, 'skull', { k: 'rod', a: base, b: p1, ra: 1.8, rb: 1.45, ramp: hornRamp });
    put(`horn${sg}`, 'skull', { k: 'rod', a: p1, b: p2, ra: 1.45, rb: 0.95, ramp: hornRamp });
    put(`horn${sg}`, 'skull', { k: 'rod', a: p2, b: p3, ra: 0.95, rb: 0.2, ramp: hornRamp });
  }

  // --- the tower shield, on the right arm, held before it ---
  const n = heading(q.pAz, 0);
  const up = norm(add([0, 0, 1], mul(n, -Math.tan(q.pEl * D))));
  const across = norm(cross(up, n));
  const sc = add(add(s.handL, mul(n, 1.7)), mul(up, -8.6));
  const runeLit = lit * (0.85 + 0.15 * clamp01(q.draw * 2));
  put('shield', 'shield', { k: 'panel', c: sc, u: mul(across, SHIELD_W), v: mul(up, SHIELD_H), skin: shieldSkin(runeLit) });
  // (its thickness: the same planks a little further back, dark)
  put('shieldback', 'shield', { k: 'panel', c: add(sc, mul(n, -1.3)), u: mul(across, SHIELD_W), v: mul(up, SHIELD_H), skin: (a, b) => (b > SHIELD_H - 1.6 && Math.abs(a) > SHIELD_W - 0.6 ? null : PLANK[0]) });
  const front = dot(n, st.eye) > 0;
  if (runeLit > 0.05 && front) put('shield', 'shield', { k: 'glow', p: add(add(sc, mul(up, 1.5)), mul(n, 0.5)), c: SOCKET, r: 9 + 3 * clamp01(q.draw), a: 0.32 * runeLit });

  // --- the spear in the right hand (none when it has been thrown: m.bare) ---
  if (!m.bare) {
    const dirS = s.point;
    const butt = add(s.handR, mul(dirS, -SPEAR_BACK));
    const socket = add(s.handR, mul(dirS, SPEAR - SPEAR_BACK - 7));
    const tip = add(s.handR, mul(dirS, SPEAR - SPEAR_BACK));
    put('spear', 'spear', { k: 'rod', a: butt, b: socket, ra: 0.85, rb: 0.8, ramp: SHAFT });
    put('spear', 'spear', { k: 'ball', c: butt, ax: sphere(1.0), skin: IRON });
    put('spearhead', 'spear', { k: 'rod', a: add(socket, mul(dirS, -0.8)), b: add(socket, mul(dirS, 0.9)), ra: 1.1, rb: 1.1, ramp: RUST });
    put('spearhead', 'spear', { k: 'rod', a: add(socket, mul(dirS, 0.9)), b: add(socket, mul(dirS, 3.0)), ra: 1.0, rb: 1.8, ramp: IRON });
    put('spearhead', 'spear', { k: 'rod', a: add(socket, mul(dirS, 3.0)), b: tip, ra: 1.8, rb: 0.15, ramp: IRON });
    // THE GLINT (its warning, with the pose): the spear-head flares pink, hottest just before the blow
    if (m.glint > 0.05) {
      const g = m.glint;
      put('glint', 'glint', { k: 'mote', p: tip, c: g > 0.9 ? FLAME[4] : FLAME[3], size: g > 0.75 ? 2 : 1 });
      put('glint', 'glint', { k: 'mote', p: add(socket, mul(dirS, 4.5)), c: FLAME[2], size: 1 });
      put('glint', 'glint', { k: 'glow', p: tip, c: SOCKET, r: 4 + 5 * g, a: Math.min(0.85, 0.55 * g) });
    }
  }

  // --- THE WEIGHT OF ITS BLOWS (his word by 11:22: "There’s no power in his attacks"): the way its
  // spear's tip or its shield's edges went through the air, streaked as the blow lands; and the
  // floor's dust kicked up round its front foot as it stamps down into the blow ---
  if (m.blur && m.trails) {
    for (const tr of m.trails) {
      for (let i = 1; i < tr.length; i++) {
        const a = tr[i - 1];
        const b = tr[i];
        const n = Math.max(1, Math.ceil(Math.hypot(...(st.at(b).map((v, k) => v - st.at(a)[k]) as [number, number]))));
        for (let j = 0; j < n; j++) {
          const p = lerp3(a, b, j / n);
          for (const off of [-1.1, 0, 1.1]) put('streak', 'streak', { k: 'mote', p: add(p, [0, 0, off]), c: i < tr.length / 2 ? BONE[3] : BONE[2], size: 1 });
        }
      }
    }
  }
  if (m.since !== undefined && m.since >= 0 && m.since < BW_DUST_FOR) {
    const k = m.since / BW_DUST_FOR;
    const foot = lerp3(s.heelL, s.toeL, 0.6);
    for (let i = 0; i < 16; i++) {
      // (fewer of it as it settles)
      if (hash(i, 7, 13) < k * 0.9) continue;
      const a = (i / 16) * Math.PI * 2 + hash(i, 1, 13);
      const r = 2.5 + (6 + 6 * hash(i, 2, 13)) * Math.sqrt(k);
      const z = 0.4 + (1.5 + 3.5 * hash(i, 3, 13)) * Math.sin(Math.PI * Math.min(1, k * 1.3));
      put('dust', 'dust', { k: 'mote', p: [foot[0] + Math.cos(a) * r * 1.2, foot[1] + Math.sin(a) * r, z], c: i % 3 ? OSSUARY[2] : OSSUARY[1], size: i % 3 === 0 ? 2 : 1 });
    }
  }
  return bits;
}
/** How long the dust its stamping foot kicks up hangs (seconds from the blow). */
const BW_DUST_FOR = 0.3;
/** Where its spear's tip is. */
const spearTipOf = (s: Skeleton): V3 => add(s.handR, mul(s.point, SPEAR - SPEAR_BACK));
/** Where its shield's top and foot are, about, at its face (its hand on the grip, the shield upright before it). */
const shieldEdgesOf = (s: Skeleton): V3[] => [add(add(s.handL, mul(s.chest[0], 2)), mul(s.chest[2], 9)), add(add(s.handL, mul(s.chest[0], 2)), mul(s.chest[2], -9))];

/** Standing, it keeps its post: a slow sway, the spear point drifting, the jaw hanging and clacking. */
function bwPost(): Motion {
  const R = BW_REST;
  return {
    loop: 0,
    keys: [
      { at: 0, pose: {} },
      { at: 0.5, pose: { pz: R.pz - 0.5, roll: 1, faceTilt: 5, faceTurn: 8, wEl: R.wEl + 2, draw: 0.2 }, ease: 'io' },
      { at: 0.8, pose: { pz: R.pz - 0.6, roll: 1, faceTilt: 5, faceTurn: 8, wEl: R.wEl + 2, draw: 0.05 }, ease: 'hold' },
      { at: 1.1, pose: { pz: R.pz - 0.3, roll: -0.5, faceTilt: 2, faceTurn: 2, wEl: R.wEl - 1, draw: 0.3 }, ease: 'io' },
      { at: 1.6, pose: {}, ease: 'io' },
    ],
  };
}

/** The moment its thrust lands (it has no rules yet: a slow monster's wind-up). */
export const BW_HIT = 0.7;
/**
 * ITS BLOWS WITH ITS WEIGHT BEHIND THEM (his word by 11:22, of the first drawing: "There’s no power in
 * his attacks"). Each coils back on its back foot and holds, then STEPS INTO THE BLOW: its front foot
 * goes out and stamps down (kicking up the floor's dust), its hips drive forward, its chest whips round
 * and its arm goes all the way out; it holds there a beat, then hauls itself back. Its back foot stays
 * where it is on the floor, and its front foot is off the floor only while it steps.
 */
const BW_WOUND: P = {
  px: -3.2, pz: -5.6, yaw: -12, pitch: 3, roll: 0, twist: -30, bend: 4, side: 0,
  faceUp: 2, faceTurn: 16, faceTilt: 0,
  lfx: 3.4, lfy: 1.6, lft: 8, lk: 24, rfx: -5.6, rfy: -1.4, rft: -18, rk: -18,
  lhIn: 1, lhx: 9.5, lhy: -9.0, lhz: -12.0, le: 0,
  rhIn: 1, rhx: -13.0, rhy: -6.0, rhz: 1.5, re: 30,
  wAz: 2, wEl: -2, pAz: -18, pEl: -3,
  draw: 0.55,
};
const BW_THRUST: P = {
  ...BW_WOUND,
  px: 6.8, pz: -7.6, yaw: -4, pitch: 20, twist: 24, bend: 10,
  faceUp: -2, faceTurn: 0,
  lfx: 13.5, lfz: 0, lk: 32, rk: -2,
  lhx: 4.0, lhy: -4.0, lhz: -13.0,
  rhx: 21.0, rhy: 1.0, rhz: -1.0, re: 0,
  wAz: 0, wEl: -3, pAz: 8, pEl: 0,
  draw: 0.95,
};
/** THE THRUST: coiled back on its back foot behind the shield, the spear drawn right back to its shoulder (the warning, its head glinting); then a step and a lunge, its whole weight driving the spear out past the shield's edge. */
function bwThrust(): Motion {
  const shake = (dz: number, more: P = {}): P => ({ ...BW_WOUND, rhz: (BW_WOUND.rhz ?? 0) + dz, ...more });
  return {
    hit: BW_HIT,
    keys: [
      { at: 0, pose: {} },
      { at: 0.3, pose: BW_WOUND, ease: 'out' },
      { at: 0.42, pose: shake(0.4, { draw: 0.6 }), ease: 'hold' },
      { at: 0.54, pose: shake(-0.2, { draw: 0.5 }), ease: 'hold' },
      { at: 0.62, pose: shake(0.3, { draw: 0.62, px: -3.6, twist: -32, rhx: -14 }), ease: 'hold' },
      // (the step: its front foot off the floor, the spear starting out)
      { at: BW_HIT - 0.035, pose: { ...BW_WOUND, px: 1.5, pz: -6, pitch: 10, twist: -6, lfx: 9, lfz: 3.2, rhx: -2, draw: 0.8 }, ease: 'in' },
      { at: BW_HIT, pose: BW_THRUST, ease: 'lin' },
      { at: BW_HIT + 0.14, pose: { ...BW_THRUST, px: 7.4, pz: -8.0, rhx: 22, draw: 0.75 }, ease: 'out' },
      // (hauled back: the front foot comes off the floor again on its way home)
      { at: BW_HIT + 0.34, pose: { ...BW_WOUND, px: 1.5, pz: -4.0, pitch: 8, twist: -4, lfx: 7.5, lfz: 2.4, rhIn: 0, rhx: 4.0, rhy: -2.2, rhz: BW_HANG + 4, re: 10, wAz: -10, wEl: -16, pAz: -12, draw: 0.4 }, ease: 'io' },
      { at: BW_HIT + 0.55, pose: {}, ease: 'io' },
    ],
  };
}
/** Dying: a jolt; then it sags to its knees behind the shield, the light going out of its eyes and its rune. */
function bwGiving(): Motion {
  return {
    keys: [
      { at: 0, pose: {} },
      { at: 0.06, pose: { px: -1.0, pz: -0.4, pitch: -4, bend: -3, faceUp: 14, draw: 1, pt: 0.6 }, ease: 'out' },
      { at: 0.3, pose: { pz: -13.5, px: -0.5, pitch: 12, bend: 16, faceUp: -10, faceTilt: 14, lfx: -6, rfx: -7.5, lfp: 50, rfp: 50, lk: 0, rk: 0, lhz: -10, lhx: 7, draw: 0.6, out: 0.4, rhIn: 0, rhx: 3, rhy: -2.5, rhz: BW_HANG + 1, wEl: -40 }, ease: 'in' },
      { at: 0.5, pose: { pz: -15, px: 0, pitch: 22, bend: 26, faceUp: -30, faceTilt: 22, lfx: -7, rfx: -8, lfp: 60, rfp: 60, lk: 0, rk: 0, lhz: -12, lhx: 5, pEl: 14, draw: 0.5, out: 1, rhIn: 0, rhx: 3, rhy: -3, rhz: BW_HANG + 1, wEl: -45 }, ease: 'out' },
    ],
  };
}
const BW_FALLS: Readonly<Record<string, Fall>> = {
  spear: { from: 0.22, to: [6, -11], spin: 20, lay: 'axis', hop: 1.5 },
  shield: { from: 0.42, to: [8, 7], spin: 8, lay: 'flat', hop: 1.2 },
  armR: { from: 0.56, to: [2, -10], spin: -40, lay: 'axis', hop: 1 },
  foreR: { from: 0.57, to: [6, -7], spin: 30, lay: 'axis', hop: 0.8 },
  armL: { from: 0.6, to: [2, 9], spin: 35, lay: 'axis', pile: 0.8 },
  foreL: { from: 0.61, to: [6, 11], spin: -25, lay: 'axis', pile: 1.2 },
  plateL: { from: 0.58, to: [-4, 10], spin: 40, lay: 'keep', hop: 1.2 },
  plateR: { from: 0.57, to: [-3, -11], spin: -30, lay: 'keep', hop: 1.2 },
  cage: { from: 0.64, to: [0, 1], spin: 15, lay: 'axis', hop: 0.8 },
  pelvis: { from: 0.66, to: [-4, 1], spin: 0, lay: 'keep' },
  legL: { from: 0.62, to: [-8, 6], spin: 30, lay: 'axis' },
  legR: { from: 0.63, to: [-8, -6], spin: -30, lay: 'axis' },
  shinL: { from: 0.63, to: [-4, 11], spin: -20, lay: 'axis' },
  shinR: { from: 0.64, to: [-5, -12], spin: 25, lay: 'axis' },
  footL: { from: 0.64, to: [-10, 10], spin: 40, lay: 'keep' },
  footR: { from: 0.65, to: [-11, -10], spin: -40, lay: 'keep' },
  neck: { from: 0.7, to: [3, -4], spin: 60, lay: 'axis' },
  jaw: { from: 0.66, to: [10, -3], spin: 50, lay: 'keep', hop: 1 },
  skull: { from: 0.78, to: [7, -5], spin: 25, lay: 'keep', hop: 1.4, pile: 0.6 },
};

/**
 * ITS PLOD, AS THE SKELETON'S (art/monster_bones3.ts: "plodding and brittle"): eight frames at
 * eleven a second, painted for a pace of a tile a second. The right leg steps long and the whole
 * frame falls onto it, the knee locked; the left is dragged after it, stiff, swung out round the
 * side from a hitched hip, its toe scraping the floor. A FOOT THAT IS DOWN STAYS WHERE IT IS ON
 * THE FLOOR (the art rulebook: "Feet grip the floor"): it goes back under the body by as much as
 * the floor goes by. The shield is kept before it and the spear low.
 */
const BW_WALK_FRAMES = 8;
const BW_WALK_FPS = 11;
export const BW_PACE = 1.0;
function bwPlod(): Motion {
  const R = BW_REST;
  const n = BW_WALK_FRAMES;
  const d = (BW_PACE * TILE3) / BW_WALK_FPS;
  // the right foot: down far out in front at frame 0, down through frame 5, swung through 6 and 7
  const RL = 10.4;
  const rfx = (j: number): number => (j <= 5 ? RL - d * j : RL - 5 * d + 5 * d * (j === 6 ? 0.4 : 0.82));
  const RFZ = [0, 0, 0, 0, 0, 0, 3.6, 1.8];
  const RFP = [-6, 0, 0, 0, 4, 20, 10, -4];
  // the left foot: down from frame 4 to frame 0 of the next round, dragged through frames 1 to 3
  const LL = 3.4;
  const lfx = (j: number): number => (j >= 4 ? LL - d * (j - 4) : j === 0 ? LL - 4 * d : LL - 4 * d + 4 * d * [0, 0.14, 0.45, 0.76][j]);
  const LFZ = [0, 0.8, 1.0, 0.7, 0, 0, 0, 0];
  const LFP = [10, 32, 30, 14, 0, 0, 0, 4];
  const LFY = [0, 0.8, 2.2, 1.2, 0, 0, 0, 0];
  //                0     1     2     3     4     5     6     7
  const PZ = [-3.4, -4.4, -3.0, -1.4, -2.2, -1.4, -0.8, -2.2];
  const PITCH = [8, 10, 8, 5, 6, 5, 7, 9];
  const BEND = [10, 14, 12, 8, 9, 8, 9, 11];
  const ROLL = [-4, -6, 1, 5, 2, -1, -2, -3];
  const YAW = [6, 6, 3, -2, -5, -5, 0, 4];
  const FACEUP = [-2, -12, -10, -5, -4, -8, -6, -3];
  const TILT = [4, 12, 10, 6, 3, 7, 9, 6];
  const JAW = [0.1, 0.6, 0.35, 0.1, 0.3, 0.12, 0.05, 0.05];
  const RATTLE = [0, 0.8, -0.6, 0.2, 0.5, -0.4, 0, 0];
  const keys: Key3[] = [];
  for (let i = 0; i <= n; i++) {
    const j = i % n;
    const a = (j / n) * Math.PI * 2;
    keys.push({
      at: i / BW_WALK_FPS,
      ease: 'lin',
      pose: {
        px: 0, pz: PZ[j], pitch: PITCH[j], bend: BEND[j], roll: ROLL[j], yaw: R.yaw + YAW[j], twist: R.twist - YAW[j] * 0.5, side: -ROLL[j] * 0.4,
        faceUp: R.faceUp + FACEUP[j], faceTilt: TILT[j], faceTurn: R.faceTurn - YAW[j] * 0.3,
        rfx: rfx(j), rfy: -0.2, rfz: RFZ[j], rfp: RFP[j], rft: -12, rk: -6,
        lfx: lfx(j), lfy: LFY[j], lfz: LFZ[j], lfp: LFP[j], lft: 8 + LFY[j] * 3, lk: 14 + LFY[j] * 5,
        lhIn: 1, lhx: R.lhx, lhy: R.lhy, lhz: R.lhz + 0.6 * Math.sin(a), le: 0,
        rhIn: 0, rhx: R.rhx + 1.4 * Math.sin(a + 2.5), rhy: R.rhy, rhz: R.rhz, re: R.re,
        wAz: R.wAz, wEl: R.wEl + 3 * Math.sin(a + 2.5),
        draw: JAW[j], pt: RATTLE[j],
      },
    });
  }
  return { keys, loop: 0 };
}
/** STRUCK: rocked back behind its shield, the shield driven in against it, the jaw knocked open and the bones rattling on their pins; its feet stay where they are. */
function bwStruck(): Motion {
  const R = BW_REST;
  return {
    keys: [
      { at: 0, pose: {} },
      { at: 0.06, pose: { px: -2.2, pz: R.pz - 0.6, pitch: -5, bend: -7, twist: R.twist - 6, faceUp: 12, faceTilt: -4, lhx: R.lhx - 2.5, lhz: R.lhz + 1.0, pEl: 9, draw: 0.85, pt: 0.9 }, ease: 'out' },
      { at: 0.14, pose: { px: -1.4, pz: R.pz - 0.8, pitch: 0, bend: 0, faceUp: 4, lhx: R.lhx - 1.2, draw: 0.4, pt: -0.7 }, ease: 'io' },
      { at: 0.3, pose: {}, ease: 'io' },
    ],
  };
}

/**
 * THE BONEWARD'S OTHER MOVES (9 Oct). By its size (medium) two attacks: its thrust, the basic one;
 * and, his pick by 09:33, "Spear throw": it hurls its spear at you from afar, then fights with its
 * shield until it picks the spear up. So: the throw (the spear raised back over its shoulder like a
 * javelin and held, its head glinting: the warning; then hurled, and its hand is empty), the bash
 * (the shield shoved into you, while it has no spear), picking the spear up off the floor, and its
 * stand and plod with no spear in its hand.
 */
export const BW_THROW_HIT = 0.75;
export const BW_BASH_HIT = 0.55;
/** In picking it up: the moment its hand closes on the spear. */
export const BW_GRAB = 0.5;
function bwThrow(): Motion {
  // (raised like a javelin: the hand up over its shoulder and right back, higher than its helm, the
  // spear over its head, its point up and forward; it leans back over its back foot, its shield held
  // out before it toward what it will throw at)
  const wound: P = {
    px: -3.4, pz: -2.8, yaw: -14, pitch: -12, twist: -30, bend: -4, side: 2,
    faceUp: 6, faceTurn: 16, lfx: 5.5, lfy: 1.8, lk: 14, rfx: -5.6, rfy: -1.2, rk: -18,
    lhIn: 1, lhx: 10.0, lhy: -6.0, lhz: -9.0,
    rhIn: 1, rhx: -14.0, rhy: -6.0, rhz: 15.0, re: 70,
    wAz: -6, wEl: 40, pAz: -6, pEl: 4, draw: 0.6,
  };
  // (hurled: it steps through and drives its hips forward, its chest whips round, the arm comes over
  // the top and out in front, and it bends right over after it)
  const loosed: P = {
    ...wound,
    px: 7.2, pz: -5.6, yaw: -2, pitch: 24, twist: 26, bend: 12, side: 0,
    faceUp: -4, faceTurn: 0, lfx: 13.5, lfz: 0, lk: 30, rk: -4,
    lhx: 3.0, lhy: -2.0, lhz: -14.0, pAz: 14,
    rhIn: 1, rhx: 15.0, rhy: -3.0, rhz: 9.0, re: 10,
    wAz: 0, wEl: 5, draw: 0.95,
  };
  return {
    hit: BW_THROW_HIT,
    keys: [
      { at: 0, pose: {} },
      { at: 0.35, pose: wound, ease: 'out' },
      { at: 0.5, pose: { ...wound, rhz: 15.4, twist: -31 }, ease: 'hold' },
      { at: 0.62, pose: { ...wound, rhz: 14.8, twist: -30.5, draw: 0.65 }, ease: 'hold' },
      { at: BW_THROW_HIT - 0.06, pose: { ...wound, px: -3.8, pitch: -14, rhx: -16.0, twist: -33 }, ease: 'lin' },
      // (the step through, the arm coming over the top)
      { at: BW_THROW_HIT - 0.03, pose: { ...wound, px: 2.0, pz: -4.0, pitch: 6, twist: -4, lfx: 9.5, lfz: 3.0, rhx: -2.0, rhz: 18.0, draw: 0.85 }, ease: 'in' },
      { at: BW_THROW_HIT, pose: loosed, ease: 'lin' },
      // (the follow-through: its arm on down across it, bent over after the throw)
      { at: BW_THROW_HIT + 0.14, pose: { ...loosed, px: 7.6, pitch: 30, bend: 16, twist: 30, rhIn: 0, rhx: 9.0, rhy: 9.0, rhz: -20.0, re: 20, draw: 0.6 }, ease: 'out' },
      { at: BW_THROW_HIT + 0.36, pose: { px: 2.0, pz: -3.0, pitch: 10, twist: 6, bend: 6, lfx: 7.0, lfz: 2.4, rhIn: 0, rhx: 5.0, rhy: -1.0, rhz: -18.0, draw: 0.4 }, ease: 'io' },
      { at: BW_THROW_HIT + 0.58, pose: {}, ease: 'io' },
    ],
  };
}
function bwBash(): Motion {
  // (coiled: the shield drawn in tight against it, its left shoulder back behind it, crouched on its back foot)
  const coiled: P = {
    px: -3.6, pz: -5.0, yaw: 4, pitch: 0, twist: 26, bend: 4,
    faceTurn: -12, lfx: 3.0, lk: 20, rfx: -6.0, rk: -16,
    lhIn: 1, lhx: 1.0, lhy: -6.0, lhz: -9.0, pAz: -22, pEl: 4, draw: 0.5,
  };
  // (the shove: a step and its whole weight behind the shield, its shoulder in it, driven out into you)
  const shove: P = {
    ...coiled,
    px: 8.5, pz: -6.4, yaw: -6, pitch: 18, twist: -24, bend: 10,
    faceTurn: 0, lfx: 13.0, lfz: 0, lk: 30, rk: -2,
    lhx: 18.0, lhy: -6.0, lhz: -10.0, pAz: -10, pEl: -4, draw: 0.9,
  };
  return {
    hit: BW_BASH_HIT,
    keys: [
      { at: 0, pose: {} },
      { at: 0.3, pose: coiled, ease: 'out' },
      { at: BW_BASH_HIT - 0.06, pose: { ...coiled, px: -4.2, twist: 29, lfz: 1.2 }, ease: 'lin' },
      // (the step, the shield starting out)
      { at: BW_BASH_HIT - 0.03, pose: { ...coiled, px: 2.0, pitch: 8, twist: 4, lfx: 8.5, lfz: 3.0, lhx: 8.0, draw: 0.75 }, ease: 'in' },
      { at: BW_BASH_HIT, pose: shove, ease: 'lin' },
      { at: BW_BASH_HIT + 0.14, pose: { ...shove, px: 9.2, lhx: 19.0, draw: 0.6 }, ease: 'out' },
      { at: BW_BASH_HIT + 0.34, pose: { ...coiled, px: 2.0, pz: -3.0, twist: 4, lfx: 7.0, lfz: 2.4, lhx: 6.0, draw: 0.4 }, ease: 'io' },
      { at: BW_BASH_HIT + 0.55, pose: {}, ease: 'io' },
    ],
  };
}
/** In picking it up: where its hand closes on the spear lying on the floor (forward, to its left, up, from its floor point: its own lengths). */
export const BW_GRIP_AT: V3 = [19, -10, 2.5];
function bwPickUp(): Motion {
  // (a deep stoop, the knees bent, its hand down on the floor where the spear lies, the spear in it
  // lying flat along the floor; the shield lifted with it, so that its foot stays off the floor)
  const down: P = {
    px: 2.5, pz: -14, pitch: 42, bend: 32, faceUp: -30,
    lfx: 6.5, lk: 40, rfx: -4.5, rk: -32,
    lhx: 9.5, lhz: -4.0,
    rhIn: 2, rhx: BW_GRIP_AT[0], rhy: BW_GRIP_AT[1], rhz: BW_GRIP_AT[2], re: 0, wAz: 0, wEl: -2, draw: 0.3,
  };
  return {
    // (its `hit`: the moment it has its spear again)
    hit: BW_GRAB,
    keys: [
      { at: 0, pose: {} },
      { at: 0.35, pose: down, ease: 'out' },
      { at: BW_GRAB, pose: { ...down, rhz: BW_GRIP_AT[2] - 0.5 }, ease: 'lin' },
      { at: 0.75, pose: { px: 1.2, pz: -4, pitch: 14, bend: 10, faceUp: -8, lhx: 8.5, lhz: -10, rhIn: 0, rhx: 6, rhy: -2, rhz: -16, re: 20, wAz: 0, wEl: -25, draw: 0.2 }, ease: 'io' },
      { at: 1.0, pose: {}, ease: 'io' },
    ],
  };
}

export const BONEWARD: Mob = {
  id: 'boneward',
  name: 'The Boneward',
  size: 'medium: a shield wall',
  build: WB,
  stand: { name: 'The Boneward keeps its post', motion: bwPost(), rest: BW_REST },
  attack: { name: 'The Boneward thrusts', motion: bwThrust(), rest: BW_REST, glint: glintOver(0.3, BW_HIT), trail: (sk) => [spearTipOf(sk)] },
  idleFrames: 16,
  idleFps: 10,
  walk: { name: 'The Boneward plods', motion: bwPlod(), rest: BW_REST, period: BW_WALK_FRAMES / BW_WALK_FPS, ground: BW_PACE * TILE3 },
  more: {
    throw: { name: 'The Boneward throws its spear', motion: bwThrow(), rest: BW_REST, glint: glintOver(0.35, BW_THROW_HIT), bare: (t) => t >= BW_THROW_HIT, blurAt: BW_THROW_HIT, trail: (sk) => [sk.handR] },
    bash: { name: 'The Boneward bashes with its shield', motion: bwBash(), rest: BW_REST, bare: () => true, blurAt: BW_BASH_HIT, trail: shieldEdgesOf, trailSpan: 0.8 },
    pickUp: { name: 'The Boneward picks its spear up', motion: bwPickUp(), rest: BW_REST, bare: (t) => t < BW_GRAB },
    standBare: { name: 'The Boneward keeps its post, its spear thrown', motion: bwPost(), rest: BW_REST, bare: () => true },
    walkBare: { name: 'The Boneward plods, its spear thrown', motion: bwPlod(), rest: BW_REST, period: BW_WALK_FRAMES / BW_WALK_FPS, ground: BW_PACE * TILE3, bare: () => true },
  },
  walkFrames: BW_WALK_FRAMES,
  walkFps: BW_WALK_FPS,
  pace: BW_PACE,
  reel: { name: 'The Boneward is struck', motion: bwStruck(), rest: BW_REST },
  reelTime: 0.3,
  hit: BW_HIT,
  warn: 0.55,
  dieTime: 1.5,
  dying: { name: 'The Boneward falls', motion: bwGiving(), rest: BW_REST },
  aura: { x: CANVAS3.ax - 2, y: CANVAS3.ay - 32, r: 46, color: '#ff3a78', a: 0.13 },
  shadow: 13,
  bits: (st, m) => bonewardBits(st, m),
  fall(piece) {
    const f = BW_FALLS[piece];
    if (f) {
      // (the shield falls flat on its back, its face, and its dead rune, to the sky)
      if (piece === 'shield') return { ...f, up: heading(BW_REST.pAz, 0) };
      return f;
    }
    if (piece === 'streak' || piece === 'dust' || piece === 'glint') return null;
    return scatter(piece, 0.58, 0.74, piece.startsWith('rib') || piece.startsWith('plate') ? 9 : 6, piece.startsWith('rib') || piece === 'pelvis' || piece.startsWith('plate') ? 'flat' : 'axis');
  },
};

// =============================================================================================
// 3. THE OSSUARY GOLEM

const GOLEM_BODY: Build = { ...buildOf(94, 1, { shoulders: 1.38, chest: 1.5, depth: 1.4, waist: 1.3, hips: 1.25, legs: 0.62, arms: 1.4, trunk: 1.1, limbs: 2.0, pad: 3.2 }), neck: 5.2, headUp: 2.2, headFwd: 5.0, headR: [5, 5, 5] };
const GB = GOLEM_BODY;

const GOLEM_REST: Bones = {
  ...standing(GB),
  pz: -2.5, px: -1, yaw: -10, pitch: 6, roll: 0, twist: -2, bend: 9, side: 0,
  faceTurn: 6, faceUp: 4, faceTilt: 0,
  lfx: 3, lfy: 2.5, lft: 14, lk: 14, rfx: -2.5, rfy: -2, rft: -16, rk: -14,
  // the club arm: the hand low ahead and out to its left, the club of skulls resting on the floor
  lhIn: 2, lhx: 17, lhy: 19, lhz: 16, le: -10,
  // the other arm hangs heavy, its fist by its knee
  rhIn: 0, rhx: 4, rhy: -4, rhz: -36, re: 0,
  draw: 0.45, out: 0,
};

/** The golem's rib cage: [how far below the root of the neck, half its width, how deep forward, how short of the middle its front ends are (radians), how far the front is lower than the back]. */
const G_RIBS: ReadonlyArray<readonly [number, number, number, number, number]> = [
  [4.6, 10.6, 9.6, 0.62, 2.2],
  [9.6, 11.6, 10.2, 0.56, 2.8],
  [14.6, 10.8, 9.4, 0.62, 2.8],
];
/** The club: how far beyond the hand its middle is, and how big round it is. */
const CLUB_OUT = 7.6;
const CLUB_R = 7.8;

/** THE GOLEM AS SOLIDS. */
function golemBits(st: Stage, m: Moment): Bit[] {
  const { s, q } = m;
  const B = GB;
  const bits: Bit[] = [];
  const put: Put = (part, piece, shape) => {
    bits.push({ part, piece, shape });
  };
  const [cf, cl, cu] = s.chest;
  const lit = 1 - clamp01(q.out);
  const burn = clamp01(q.draw) * lit;
  const frame = Math.floor(m.t * 30 + 1e-6);

  // --- the legs: short thick bundles of bone, an iron band at each knee, a slab of a foot ---
  for (const side of ['L', 'R'] as const) {
    const hip = side === 'L' ? s.hipL : s.hipR;
    const knee = side === 'L' ? s.kneeL : s.kneeR;
    const ankle = side === 'L' ? s.ankleL : s.ankleR;
    const heel = side === 'L' ? s.heelL : s.heelR;
    const toe = side === 'L' ? s.toeL : s.toeR;
    bundle(put, `thigh${side}`, `thigh${side}`, hip, knee, 4.6, 5, side === 'L' ? 1 : 2, OSSUARY);
    put(`knee${side}`, `knee${side}`, { k: 'ball', c: knee, ax: sphere(3.3), skin: packed(OSSUARY, 2.2, 21), far: true });
    bandOn(put, `kband${side}`, `kband${side}`, knee, ankle, 0.12, 3.6);
    bundle(put, `shin${side}`, `shin${side}`, knee, ankle, 4.0, 5, side === 'L' ? 3 : 4, OSSUARY);
    const fc = add(lerp3(heel, toe, 0.45), [0, 0, 1.9]);
    const fwd = norm(sub(toe, heel), [1, 0, 0]);
    put(`foot${side}`, `foot${side}`, { k: 'ball', c: fc, ax: [mul(fwd, 6.2), mul(norm(cross([0, 0, 1], fwd)), 3.9), [0, 0, 2.2]], skin: packed(OSSUARY, 2.0, side === 'L' ? 31 : 32), far: true });
  }

  // --- the hips: a mass of bones, an iron band round it, a chain hanging from it ---
  const pel = add(s.pelvis, mul(s.hips[2], 1.5));
  put('hips', 'hips', { k: 'ball', c: pel, ax: [mul(s.hips[0], B.pelvisDeep + 1), mul(s.hips[1], B.pelvisHalf + 1.5), mul(s.hips[2], 5.5)], skin: packed(OSSUARY, 2.4, 41) });
  put('belt', 'belt', { k: 'band', ring: { c: add(pel, mul(s.hips[2], 2.2)), u: mul(s.hips[0], B.pelvisDeep + 1.4), v: mul(s.hips[1], B.pelvisHalf + 1.9) }, ramp: IRON, rows: 3 });

  // --- the trunk: a hulk of packed bones, open in front onto the cage of ribs, the fire inside it ---
  const chestC = add(add(s.ribs, mul(cu, B.chest * 0.42)), mul(cf, -1.2));
  const H: V3 = [B.ribDeep + 2.2, B.ribHalf + 2.6, B.chest * 0.72];
  const opening = (u: V3): boolean => u[0] > 0.22 && Math.abs(u[1]) < 0.72 && u[2] > -0.8 && u[2] < 0.78;
  put('trunk', 'trunk', { k: 'ball', c: chestC, ax: [mul(cf, H[0]), mul(cl, H[1]), mul(cu, H[2])], skin: packed(OSSUARY, 2.1, 51, opening) });
  const belly = lerp3(s.waist, s.ribs, 0.4);
  put('belly', 'belly', { k: 'ball', c: belly, ax: [mul(s.belly[0], B.waistDeep + 1.5), mul(s.belly[1], B.waistHalf + 2), mul(s.belly[2], 6)], skin: packed(OSSUARY, 2.4, 61) });
  // the dark of the cage behind the fire (the front half of a ball set back in the trunk)
  const cav = add(chestC, mul(cf, -H[0] * 0.55));
  put('cavity', 'trunk', { k: 'ball', c: cav, ax: [mul(cf, H[0] * 0.9), mul(cl, H[1] * 0.8), mul(cu, H[2] * 0.72)], skin: (u) => (u[0] < 0 ? null : INK) });
  // THE FIRE: pink burning to gold at its heart, flickering; it flares as it winds up, and gutters out as it dies
  if (burn > 0.02) {
    const fc = add(chestC, add(mul(cf, H[0] * 0.42), mul(cu, -1.5)));
    const fr = 5.6 + 3.4 * burn;
    const eyeIn: V3 = [dot(st.eye, cf), dot(st.eye, cl), dot(st.eye, cu)];
    const fire: Skin = (u, _tone, x, y) => {
      const centre = u[0] * eyeIn[0] + u[1] * eyeIn[1] + u[2] * eyeIn[2];
      const flick = (hash(x, y, frame) - 0.5) * 0.24;
      const v = centre + flick + (burn - 0.5) * 0.3 + u[2] * 0.12;
      if (lit < 0.5) return v > 0.7 ? FLAME[1] : FLAME[0];
      return v > 0.92 ? FLAME[4] : v > 0.74 ? FLAME[3] : v > 0.42 ? FLAME[2] : v > 0.12 ? FLAME[1] : FLAME[0];
    };
    put('fire', 'fire', { k: 'ball', c: fc, ax: [mul(cf, fr * 0.8), mul(cl, fr), mul(cu, fr * 1.15)], skin: fire });
    const toward = dot(cf, st.eye) > -0.1 ? 1 : 0.35;
    put('fire', 'fire', { k: 'glow', p: add(fc, mul(cf, fr)), c: '#ff3a78', r: 20 + 14 * burn, a: (0.22 + 0.3 * burn) * toward });
    if (toward === 1) put('fire', 'fire', { k: 'glow', p: add(fc, mul(cf, fr)), c: '#ffb070', r: 7 + 6 * burn, a: 0.18 + 0.3 * burn });
  }
  // the ribs across the front of the cage (only those on the near side: the fire shows between them)
  const neckRoot = s.neck;
  for (let i = 0; i < G_RIBS.length; i++) {
    const [down, W, Dp, gap, slope] = G_RIBS[i];
    const c = add(neckRoot, mul(cu, -down));
    for (const sg of [1, -1] as const) {
      let last: V3 | null = null;
      for (let k = 0; k <= 5; k++) {
        const th = gap + ((Math.PI * 0.6 - gap) * k) / 5;
        const p = add(add(add(c, mul(cf, Dp * Math.cos(th))), mul(cl, sg * W * Math.sin(th))), mul(cu, -slope * (1 + Math.cos(th)) * 0.5));
        if (last) put(`rib${i}${sg > 0 ? 'L' : 'R'}`, `grib${i}${sg > 0 ? 'L' : 'R'}`, { k: 'rod', a: last, b: p, ra: 1.5, rb: 1.35, ramp: OSSUARY });
        last = p;
      }
    }
  }
  // iron bands round the cage, and a chain slung across it
  put('cband2', 'cband2', { k: 'band', ring: { c: add(chestC, mul(cu, -H[2] * 0.62)), u: mul(cf, H[0] * 0.8), v: mul(cl, H[1] * 0.8) }, ramp: IRON, rows: 2 });
  // --- the shoulders: masses of bones with skulls piled into them ---
  for (const side of ['L', 'R'] as const) {
    const sg = side === 'L' ? 1 : -1;
    const sh = side === 'L' ? s.shoulderL : s.shoulderR;
    const mc = add(add(sh, mul(cu, 2.6)), add(mul(cf, -0.8), mul(cl, sg * -1.2)));
    put(`smass${side}`, `smass${side}`, { k: 'ball', c: mc, ax: [mul(cf, 7.2), mul(cl, 7.0), mul(cu, 6.2)], skin: packed(OSSUARY, 2.3, side === 'L' ? 71 : 72), far: true });
    const piles: [number, number, number, number][] = [
      [1.8, sg * 1.5, 6.4, 3.4],
      [-3.0, sg * 3.8, 5.0, 3.0],
      [4.6, sg * 4.6, 2.6, 2.8],
      [-1.6, sg * -2.4, 6.6, 2.7],
    ];
    piles.forEach(([fx, ly, uz, r], j) => {
      // (the skull it takes to throw is gone from its right shoulder until the throw is over: m.bare)
      if (side === 'R' && j === 0 && m.bare) return;
      const c = add(mc, add(add(mul(cf, fx), mul(cl, ly)), mul(cu, uz)));
      const look = faceAlong(add(add(cf, mul(cl, sg * (0.5 + j * 0.25))), mul(cu, 0.15 + (j % 2) * 0.25)));
      skull(st, put, `sk${side}${j}`, `sk${side}${j}`, c, look, [r, r * 0.92, r * 0.88], OSSUARY, eyesOf(st, look), 0, false);
    });
  }

  // --- the head: a skull sunk low between the shoulders, an iron band across its brow, its eyes burning ---
  {
    const face = wornOn(st, s, 22);
    const eyes = eyesToward(st, s);
    const c = at3(s.head, face, 0, 0, 0);
    skull(st, put, 'head', 'head', c, face, [5.2, 5.0, 4.8], OSSUARY, (eyes[0] + eyes[1]) / 2, lit, true, 6);
    put('gjaw', 'gjaw', { k: 'ball', c: at3(c, face, 1.4, 0, -4.0), ax: [mul(face[0], 3.4), mul(face[1], 3.8), mul(face[2], 1.6)], skin: OSSUARY });
  }

  // --- the arms: bundles of bones bound with iron; the right ends in a great fist, the left in the club of fused skulls ---
  for (const side of ['L', 'R'] as const) {
    const sh = side === 'L' ? s.shoulderL : s.shoulderR;
    const el = side === 'L' ? s.elbowL : s.elbowR;
    const hand = side === 'L' ? s.handL : s.handR;
    const fore = norm(sub(hand, el), [0, 0, -1]);
    bundle(put, `uarm${side}`, `uarm${side}`, sh, el, 4.4, 5, side === 'L' ? 5 : 6, OSSUARY);
    put(`elbow${side}`, `elbow${side}`, { k: 'ball', c: el, ax: sphere(3.6), skin: packed(OSSUARY, 2.2, side === 'L' ? 81 : 82), far: true });
    bundle(put, `farm${side}`, `farm${side}`, el, hand, side === 'L' ? 5.6 : 4.8, 6, side === 'L' ? 7 : 8, OSSUARY);
    if (side === 'L') bandOn(put, `aband${side}`, `aband${side}`, el, hand, 0.5, 5.4, 2);
    if (side === 'R') {
      // (a skull in its fist, to throw: its eyes lit by the fire in the golem)
      if (m.skull) {
        const look = faceAlong(norm(add(cf, mul(cu, 0.3))));
        skull(st, put, 'held', 'held', add(hand, add(mul(fore, 4.2), mul(cu, 1.5))), look, [3.6, 3.3, 3.2], OSSUARY, eyesOf(st, look), lit, true, 4);
      }
      put('fist', 'fist', { k: 'ball', c: add(hand, mul(fore, 1.5)), ax: sphere(4.0), skin: packed(OSSUARY, 2.2, 91), far: true });
      const acr = norm(cross(fore, cf), cl);
      for (const k of [-1, 0, 1]) {
        const base = add(add(hand, mul(fore, 3.4)), mul(acr, k * 2.0));
        put('fist', 'fist', { k: 'rod', a: base, b: add(add(base, mul(fore, 2.2)), mul(cf, 1.6)), ra: 1.3, rb: 1.1, ramp: OSSUARY, far: true });
      }
    } else {
      const cc = add(hand, mul(fore, CLUB_OUT));
      const e1 = norm(cross(fore, Math.abs(fore[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0]));
      const e2 = cross(fore, e1);
      const spots: [number, number, number][] = [[2.8, 0, 0], [0.4, 0, 1], [0.4, 72, 1], [0.4, 144, 1], [0.4, 216, 1], [0.4, 288, 1], [-1.9, 36, 0.9], [-1.9, 180, 0.9]];
      spots.forEach(([along, deg, outK], j) => {
        const a = deg * D;
        const out = add(mul(e1, Math.cos(a)), mul(e2, Math.sin(a)));
        const c = add(add(cc, mul(fore, along)), mul(out, CLUB_R * 0.62 * outK));
        const look = faceAlong(j === 0 ? fore : norm(add(out, mul(fore, 0.3))), Math.abs(dot(out, [0, 0, 1])) > 0.8 ? cf : [0, 0, 1]);
        const r = j === 0 ? 5.6 : 4.7 + hash(j, 2, 3) * 0.9;
        skull(st, put, `club${j}`, 'club', c, look, [r, r * 0.92, r * 0.9], OSSUARY, eyesOf(st, look), 0, false);
      });
      bandOn(put, 'clubband', 'club', add(cc, mul(fore, -4)), add(cc, mul(fore, 2)), 0.25, CLUB_R * 0.9, 2);
    }
  }

  // --- the swing: the streak of the club's head where it has just been ---
  if (m.blur && m.trailC) {
    const tr = m.trailC;
    for (let i = 1; i < tr.length; i++) {
      const a = tr[i - 1];
      const b = tr[i];
      const n = Math.max(1, Math.ceil(Math.hypot(...(st.at(b).map((v, k) => v - st.at(a)[k]) as [number, number]))));
      for (let j = 0; j < n; j++) {
        const p = lerp3(a, b, j / n);
        for (const off of [-3, 0, 3]) put('streak', 'streak', { k: 'mote', p: add(p, [0, 0, off]), c: i < tr.length / 2 ? OSSUARY[3] : OSSUARY[2], size: off === 0 ? 2 : 1 });
      }
    }
  }
  // --- the slam: dust and chips of bone thrown up where the club comes down ---
  if (m.blur && !m.trailC) {
    const hand = s.handL;
    const fore = norm(sub(hand, s.elbowL), [0, 0, -1]);
    const cc = add(hand, mul(fore, CLUB_OUT));
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      const r = 7 + hash(i, 1, 9) * 6;
      put('dust', 'dust', { k: 'mote', p: [cc[0] + Math.cos(a) * r, cc[1] + Math.sin(a) * r, 0.5 + hash(i, 2, 9) * 4], c: i % 3 ? OSSUARY[2] : OSSUARY[3], size: i % 4 === 0 ? 2 : 1 });
    }
  }
  return bits;
}

/** Standing, it breathes: the cage heaves, the fire swells and sinks, the head shifts. */
function golemBreath(): Motion {
  const R = GOLEM_REST;
  return {
    loop: 0,
    keys: [
      { at: 0, pose: {} },
      { at: 0.8, pose: { pz: R.pz + 0.6, bend: R.bend - 2, pitch: R.pitch - 1, faceUp: R.faceUp + 3, draw: 0.62 }, ease: 'io' },
      { at: 1.2, pose: { pz: R.pz + 0.6, bend: R.bend - 2, pitch: R.pitch - 1, faceUp: R.faceUp + 3, faceTurn: R.faceTurn + 6, draw: 0.6 }, ease: 'io' },
      { at: 2.1, pose: { draw: 0.4, faceTurn: R.faceTurn + 2 }, ease: 'io' },
      { at: 2.4, pose: {}, ease: 'io' },
    ],
  };
}

/** The moment its club lands (it has no rules yet: a big monster's long wind-up). */
export const GOLEM_HIT = 1.0;
const G_WOUND: P = {
  px: -3.5, pz: -1.0, yaw: -4, pitch: -10, roll: 0, twist: 18, bend: -10, side: -3,
  faceUp: 16, faceTurn: 0,
  lfx: 3.6, lfy: 3.0, lk: 16, rfx: -4.4, rfy: -2.4, rk: -16,
  lhIn: 1, lhx: -9, lhy: 3, lhz: 30, le: 20,
  rhIn: 0, rhx: 8, rhy: -6, rhz: -28, re: 0,
  draw: 1,
};
const G_SLAM: P = {
  px: 5, pz: -6.5, yaw: -12, pitch: 24, roll: 0, twist: -14, bend: 22, side: 0,
  faceUp: -6, faceTurn: 4,
  lfx: 8.5, lfy: 3.0, lk: 14, rfx: -5, rfy: -2.4, rk: -14,
  lhIn: 2, lhx: 26, lhy: 10, lhz: 9.5, le: 0,
  rhIn: 0, rhx: 2, rhy: -6, rhz: -34, re: 0,
  draw: 0.8,
};
/** THE SLAM: the club drags up off the floor and goes high behind its head, the hulk leaning back and the fire flaring, held (the warning: a wind-up you dread); then down in front with all of it behind the blow. */
function golemSlam(): Motion {
  const tremble = (d: number, more: P = {}): P => ({ ...G_WOUND, lhz: (G_WOUND.lhz ?? 0) + d, ...more });
  return {
    hit: GOLEM_HIT,
    keys: [
      { at: 0, pose: {} },
      { at: 0.22, pose: { px: -1.5, pz: -2.0, pitch: 2, bend: 4, twist: 8, lhIn: 1, lhx: 8, lhy: 8, lhz: -14, le: 0, draw: 0.65 }, ease: 'out' },
      { at: 0.5, pose: G_WOUND, ease: 'out' },
      { at: 0.64, pose: tremble(0.6, { draw: 0.95 }), ease: 'hold' },
      { at: 0.78, pose: tremble(-0.3, { draw: 1 }), ease: 'hold' },
      { at: 0.9, pose: tremble(0.5, { draw: 0.98 }), ease: 'hold' },
      { at: GOLEM_HIT, pose: G_SLAM, ease: 'in' },
      { at: GOLEM_HIT + 0.15, pose: { ...G_SLAM, pz: -7.2, pitch: 26, bend: 24, draw: 0.6 }, ease: 'out' },
      { at: GOLEM_HIT + 0.55, pose: {}, ease: 'io' },
    ],
  };
}
/** Dying: its fire flares once, then gutters; it sags to its knees, the club on the floor; and it comes apart. */
function golemGiving(): Motion {
  return {
    keys: [
      { at: 0, pose: {} },
      { at: 0.1, pose: { pitch: -4, bend: -4, faceUp: 18, draw: 1 }, ease: 'out' },
      { at: 0.42, pose: { pz: -12, px: 1, pitch: 18, bend: 22, faceUp: -14, lfx: -5, rfx: -7, lfp: 40, rfp: 40, lk: 4, rk: -4, draw: 0.3, out: 0.45, rhz: -30, rhx: 8 }, ease: 'in' },
      { at: 0.62, pose: { pz: -15, px: 2, pitch: 26, bend: 28, faceUp: -26, lfx: -6, rfx: -8, lfp: 50, rfp: 50, lk: 4, rk: -4, draw: 0.08, out: 1, rhz: -28, rhx: 10 }, ease: 'out' },
    ],
  };
}

/**
 * ITS STRIDE: heavy, swaying steps, eight frames at eight a second (the skeleton's walk is twelve),
 * painted for a pace of 0.9 tiles a second. Its whole bulk rolls over onto the foot that is down,
 * and sinks as each foot comes down; the club of skulls is dragged along the floor beside it,
 * swinging as the arm swings; the fire swells at every footfall. A foot that is down stays where it
 * is on the floor.
 */
const G_WALK_FRAMES = 8;
const G_WALK_FPS = 8;
export const GOLEM_PACE = 0.9;
function golemStride(): Motion {
  const R = GOLEM_REST;
  const n = G_WALK_FRAMES;
  const d = (GOLEM_PACE * TILE3) / G_WALK_FPS;
  // (a foot comes down two frames' worth of floor ahead of the hips and leaves as far behind them: down five frames, off the floor three)
  const half = 2 * d;
  const SW = [0.22, 0.55, 0.85];
  const SZ = [3.4, 5.0, 2.6];
  const foot = (j: number): [number, number] => (j <= 4 ? [half - d * j, 0] : [-half + 2 * half * SW[j - 5], SZ[j - 5]]);
  const keys: Key3[] = [];
  for (let i = 0; i <= n; i++) {
    const j = i % n;
    const a = (j / n) * Math.PI * 2;
    const [rx, rz] = foot(j);
    const [lx, lz] = foot((j + 4) % n);
    keys.push({
      at: i / G_WALK_FPS,
      ease: 'lin',
      pose: {
        px: -1, py: -2.2 * Math.sin(a), pz: -3.2 - 1.5 * Math.cos(2 * a),
        yaw: R.yaw + 5 * Math.cos(a), twist: R.twist - 4 * Math.cos(a), pitch: R.pitch + 1.2 * Math.cos(2 * a), bend: R.bend + 1.5 * Math.cos(2 * a),
        roll: 5 * Math.sin(a), side: 3 * Math.sin(a),
        faceUp: R.faceUp - 1.5 * Math.cos(2 * a), faceTurn: R.faceTurn - 3 * Math.cos(a), faceTilt: -3 * Math.sin(a),
        rfx: rx, rfz: rz, rfy: -2, rft: -16, rk: -14, rfp: rz > 0 ? 12 : j === 0 ? -6 : 0,
        lfx: lx, lfz: lz, lfy: 2.5, lft: 14, lk: 14, lfp: lz > 0 ? 12 : j === 4 ? -6 : 0,
        lhIn: 2, lhx: 15 + 4.5 * Math.cos(a), lhy: 19 + 1.5 * Math.sin(a), lhz: 16 + 1.4 * Math.max(0, Math.sin(a + 0.6)), le: -10,
        rhIn: 0, rhx: 4 - 3.5 * Math.cos(a), rhy: -4, rhz: -36, re: 0,
        draw: 0.5 + 0.14 * Math.cos(2 * a),
      },
    });
  }
  return { keys, loop: 0 };
}
/** STRUCK: it barely notices. A shudder through the bulk, and the fire in its cage gutters and flares. */
function golemStruck(): Motion {
  const R = GOLEM_REST;
  return {
    keys: [
      { at: 0, pose: {} },
      { at: 0.04, pose: { roll: 1.6, pitch: R.pitch - 1.5, pz: R.pz - 0.6, draw: 0.2 }, ease: 'out' },
      { at: 0.09, pose: { roll: -1.2, pitch: R.pitch - 0.8, draw: 0.8 }, ease: 'io' },
      { at: 0.14, pose: { roll: 0.7, draw: 0.3 }, ease: 'io' },
      { at: 0.19, pose: { roll: -0.3, draw: 0.62 }, ease: 'io' },
      { at: 0.25, pose: {}, ease: 'io' },
    ],
  };
}

/**
 * THE GOLEM'S ATTACKS (9 Oct). By its size (large) two or three, one of them a basic single-target
 * blow; and his pick by 09:30, "Hurl skulls (Recommended)": it pulls a skull off its shoulders and
 * throws it, and it bursts into flying bone (where it will land shown by the skull's own shadow on the
 * floor: art/mob_shots.ts). So its first attack is now a SWING of its club of skulls (the club dragged
 * up and back to its left and held, the fire flaring; then round in front of it and through, its head
 * leaving a streak); its big one the THROW (its fist goes up to its right shoulder and takes a skull
 * off the pile; it rears back with it and holds, the fire flaring; it hurls it overarm, and the skull
 * is gone from its fist at the blow; the skull's place on its shoulder is empty until the throw is
 * over). Its slam, as it was, stays as `slam`, a third the rules may give it (or not: "every attack
 * is a big slam on the ground").
 */
export const GOLEM_SWING_HIT = 0.6;
export const GOLEM_THROW_HIT = 0.95;
/** In the throw: when its fist closes on the skull, and when the skull's place on its shoulder fills again. */
export const GOLEM_TAKE = 0.32;
export const GOLEM_THROW_END = 1.5;
function golemSwing(): Motion {
  // (the club is the end of its left arm: it points the way the forearm does, so the elbow is set
  // with the hand, `le`: forward of the hand when the club is cocked back behind its shoulder)
  const gather: P = { lhIn: 2, lhx: 4, lhy: 36, lhz: 46, le: 150, twist: 18, pitch: 2, bend: 6, draw: 0.7 };
  const wound: P = { lhIn: 2, lhx: -6, lhy: 38, lhz: 54, le: 140, twist: 30, pitch: -4, bend: 2, px: -1.5, rhx: 6, rhy: -8, rhz: -26, draw: 0.95 };
  const blow: P = { lhIn: 2, lhx: 44, lhy: 2, lhz: 40, le: 45, twist: -22, pitch: 10, bend: 10, px: 3, rhx: 2, rhy: -4, rhz: -30, draw: 0.8 };
  const thru: P = { ...blow, lhx: 18, lhy: -36, lhz: 40, le: 0, twist: -30, pitch: 8, bend: 10 };
  return {
    hit: GOLEM_SWING_HIT,
    keys: [
      { at: 0, pose: {} },
      { at: 0.22, pose: gather, ease: 'out' },
      { at: 0.38, pose: wound, ease: 'out' },
      { at: GOLEM_SWING_HIT - 0.06, pose: { ...wound, lhz: 55.5, twist: 31.5, draw: 1 }, ease: 'lin' },
      // (round it comes, out at its side and level, not through the body)
      { at: GOLEM_SWING_HIT - 0.03, pose: { ...blow, lhx: 18, lhy: 40, lhz: 48, le: 90, twist: 6, pitch: 4, bend: 6, px: 1 }, ease: 'in' },
      { at: GOLEM_SWING_HIT, pose: blow, ease: 'lin' },
      { at: GOLEM_SWING_HIT + 0.08, pose: thru, ease: 'out' },
      { at: GOLEM_SWING_HIT + 0.22, pose: { ...thru, lhx: 16, lhy: -28, lhz: 30, twist: -20, draw: 0.6 }, ease: 'out' },
      { at: GOLEM_SWING_HIT + 0.6, pose: {}, ease: 'io' },
    ],
  };
}
function golemThrow(): Motion {
  const reach: P = { rhIn: 0, rhx: 2, rhy: 3, rhz: 6, re: 30, twist: -6, faceTurn: -10, draw: 0.6 };
  const cocked: P = { rhIn: 0, rhx: -12, rhy: -8, rhz: 16, re: 40, twist: -24, pitch: -8, bend: 2, px: -2, lfx: 5, draw: 0.9 };
  const loosed: P = { ...cocked, rhx: 18, rhy: 2, rhz: 14, re: 10, twist: 20, pitch: 12, bend: 12, px: 3, draw: 0.8 };
  return {
    hit: GOLEM_THROW_HIT,
    keys: [
      { at: 0, pose: {} },
      { at: 0.3, pose: reach, ease: 'out' },
      { at: 0.36, pose: { ...reach, rhz: 5 }, ease: 'lin' },
      { at: 0.58, pose: cocked, ease: 'out' },
      { at: 0.72, pose: { ...cocked, rhz: 16.6, twist: -24.6 }, ease: 'hold' },
      { at: GOLEM_THROW_HIT - 0.08, pose: { ...cocked, rhz: 17, twist: -25, draw: 1 }, ease: 'hold' },
      { at: GOLEM_THROW_HIT, pose: loosed, ease: 'in' },
      { at: GOLEM_THROW_HIT + 0.1, pose: { ...loosed, rhx: 16, rhy: 6, rhz: -8, twist: 16, pitch: 10, draw: 0.6 }, ease: 'out' },
      { at: GOLEM_THROW_END, pose: {}, ease: 'io' },
    ],
  };
}

export const GOLEM: Mob = {
  id: 'golem',
  name: 'The Ossuary Golem',
  size: 'big: slow, and menacing',
  build: GB,
  stand: { name: 'The Golem breathes', motion: golemBreath(), rest: GOLEM_REST },
  attack: { name: 'The Golem swings its club', motion: golemSwing(), rest: GOLEM_REST, sweep: true },
  idleFrames: 24,
  idleFps: 10,
  walk: { name: 'The Golem strides', motion: golemStride(), rest: GOLEM_REST, period: G_WALK_FRAMES / G_WALK_FPS, ground: GOLEM_PACE * TILE3 },
  more: {
    throw: { name: 'The Golem hurls a skull', motion: golemThrow(), rest: GOLEM_REST, skull: (t) => t >= GOLEM_TAKE && t < GOLEM_THROW_HIT, bare: (t) => t >= GOLEM_TAKE && t < GOLEM_THROW_END - 0.05 },
    slam: { name: 'The Golem slams', motion: golemSlam(), rest: GOLEM_REST, blurAt: GOLEM_HIT },
  },
  walkFrames: G_WALK_FRAMES,
  walkFps: G_WALK_FPS,
  pace: GOLEM_PACE,
  reel: { name: 'The Golem is struck', motion: golemStruck(), rest: GOLEM_REST },
  reelTime: 0.25,
  hit: GOLEM_SWING_HIT,
  warn: 0.5,
  dieTime: 1.6,
  dying: { name: 'The Golem falls apart', motion: golemGiving(), rest: GOLEM_REST },
  aura: { x: CANVAS3.ax - 2, y: CANVAS3.ay - 40, r: 64, color: '#ff3a78', a: 0.14 },
  shadow: 24,
  bits: (st, m) => golemBits(st, m),
  fall(piece) {
    if (piece === 'fire' || piece === 'dust') return null;
    if (piece.startsWith('sk')) return { ...scatter(piece, 0.34, 0.5, 9, 'keep'), hop: 1.6 };
    if (piece === 'club') return { from: 0.55, to: [3, 2], spin: 20, lay: 'keep', hop: 0.8 };
    if (piece === 'head') return { from: 0.86, to: [4, -2], spin: 30, lay: 'keep', hop: 1.4, pile: 5 };
    if (piece === 'gjaw') return { from: 0.8, to: [9, 3], spin: 50, lay: 'keep', hop: 1 };
    if (piece === 'trunk' || piece === 'belly' || piece === 'hips' || piece.startsWith('smass')) return { ...scatter(piece, 0.62, 0.72, 3, 'mound'), hop: 0.5 };
    if (piece.includes('band') || piece === 'belt' || piece === 'chain') return { ...scatter(piece, 0.66, 0.78, 10, 'flat'), hop: 1 };
    return scatter(piece, 0.56, 0.8, 12, 'axis');
  },
};

// =============================================================================================
// 4. THE SKELETON CHAMPION: A YELLOW PACK'S LEADER (9 Oct)
//
// His words in the main chat (its post of 08:30): "So we have a pack of skeletons.  The skeleton
// champion, who let’s say has an old rusty helmet and a two handed sword, has Flame, and the smaller
// minions would essentially have a 50% Flame." And at 08:24: "Pack leaders that are different mobs
// can have an extra attack if it seems right." The brief, answered by 11:51 (our picks, each his
// pick): "A head taller (Recommended)": he stands over his skeletons, as tall as the Boneward but
// leaner, no shield; "Proud and heavy (Recommended)": standing with his sword planted point-down,
// his hands on its hilt, and walking, dragging its point along the floor; "Cleave and a rallying cry
// (Recommended)": a great two-handed cleave, and he raises his sword and roars, his minions' words
// flaring to full for a moment (the flare is the rules' and the game's: here, his part of it); "To his
// knees on his sword (Recommended)": he sinks to his knees leaning on his sword, then crumbles, and
// his helm rolls away. His word, whichever it is, is not painted on him: the game marks it.

/** His body: the skeleton's own (art/monster_bones3.ts), a head taller, as tall as the Boneward and leaner. */
const CH_K = 1.18;
const CH_BODY: Build = scaled(SKELETON3_BODY, CH_K, { shoulderHalf: 1.06, ribHalf: 1.03 });
const CB = CH_BODY;
/** His bones' thickness. */
const CK = CH_K * 1.05;
/** His two-handed sword: the blade, the grip, and where his left hand is on it (behind his right, toward the pommel), all in the figure's own lengths. */
const GS_BLADE = 30;
const GS_GRIP = 8;
const GS_LEFT = -4.2;
/** From his right hand to the sword's point (the crossguard is just beyond the hand). */
const GS_REACH = GS_BLADE + 3.2;
/** His cape: an old wine-dark cloth, faded; and his helm's crest, of the same cloth where the light catches it. */
export const CAPE: Ramp = ['#2a0c22', '#2a0c22', '#511a3c', '#7a2c56', '#7a2c56'];
const CREST: Ramp = ['#511a3c', '#511a3c', '#7a2c56', '#a8426e', '#a8426e'];
/** The cape's torn hem (as the Shade's: how far up each piece of it is gone). */
const CAPE_TORN: readonly number[] = [2, 0, 3, 1, 4, 1, 0, 2, 3, 0, 2, 4, 1, 3, 0, 2];
/** The notches in his blade (how far along it, and which edge). */
const GS_NOTCHES: ReadonlyArray<readonly [number, number]> = [[0.31, 1], [0.55, -1], [0.72, 1]];

/**
 * HIS GREAT SWORD, laid along its line as the skeleton's sword is (art/monster_bones3.ts,
 * `rustSword`): drawn at the angle the eye sees it and as long as the eye sees it. (hx, hy) is his
 * right hand on the grip; `seen` how much of a length along the sword the eye sees. A long blade of
 * old iron with a dark groove down its middle, rust on it and notches in its edges; a broad
 * crossguard rusted at its ends; a long grip bound in dark cord; a round pommel.
 */
function greatSword(p: Sheet, hx: number, hy: number, deg: number, seen: number): void {
  const [dx, dy] = dir(deg);
  const litSide = 0.65 * dy - 0.75 * dx > 0 ? 1 : -1;
  const len = Math.max(4, GS_BLADE * seen);
  const grip = Math.max(2, GS_GRIP * seen);
  const W = 2.7;
  const G0 = 1.2;
  const G1 = 2.8;
  const tip = G1 + len;
  const reach = tip + grip + 5;
  for (let y = Math.floor(hy - reach); y <= Math.ceil(hy + reach); y++) {
    for (let x = Math.floor(hx - reach); x <= Math.ceil(hx + reach); x++) {
      const rx = x + 0.5 - hx;
      const ry = y + 0.5 - hy;
      const u = rx * dx + ry * dy;
      const v = (-rx * dy + ry * dx) * litSide;
      let c: string | null = null;
      if (u >= G1 && u <= tip) {
        const half = u > tip - 6 ? (tip - u) * (W / 6) : W;
        if (Math.abs(v) <= half) {
          c = v > half - 0.95 ? PALLOR[3] : v < -half + 0.95 ? IRON[2] : IRON[3];
          // (the groove down its middle, for the first two thirds)
          if (u < G1 + len * 0.62 && Math.abs(v) < 0.55) c = IRON[2];
          // (rust on it, in patches)
          if (hash(Math.round(u / 2.2), Math.round(v * 0.8), 17) < 0.14) c = RUST[2];
          for (const [k, side] of GS_NOTCHES) if (Math.abs(u - (G1 + k * len)) < 0.9 && v * side > half - 1.05) c = null;
        }
      } else if (u >= G0 && u < G1 && Math.abs(v) <= W + 4.4) {
        c = Math.abs(v) > W + 3 ? RUST[2] : v > 0.8 ? IRON[3] : v < -0.8 ? IRON[1] : IRON[2];
      } else if (u >= -grip && u < G0 && Math.abs(v) <= 1.15) {
        // (the grip, bound in dark cord: bands across it)
        c = Math.floor(u * 0.9) % 2 === 0 ? SHAFT[3] : SHAFT[2];
      } else if (u >= -grip - 2.6 && u < -grip && Math.abs(v) <= 1.8 - Math.abs(u + grip + 1.3) * 0.5) {
        c = v > 0.3 ? IRON[3] : IRON[2];
      }
      if (c) p.set(x, y, c);
    }
  }
}

const CH_HANG = -(CB.upperArm + CB.foreArm) * 0.94;
/** Standing as he does: his sword planted point-down before him, both hands on its hilt at his chest; upright, his feet set wide. */
const CH_REST: Bones = {
  ...standing(CB),
  pz: -0.6, px: 0, yaw: -4, pitch: 2, roll: 0, twist: 0, bend: -2, side: 0,
  faceTurn: 2, faceUp: 4, faceTilt: 0,
  lfx: 2.4, lfy: 3.8, lft: 12, lk: 6, rfx: -0.6, rfy: -3.8, rft: -12, rk: -6,
  rhIn: 2, rhx: 10.5, rhy: -0.5, rhz: GS_REACH + 0.9, re: -20,
  lhIn: 3, lhx: GS_LEFT, lhy: 0, lhz: 0, le: 20,
  wAz: 0, wEl: -88, wRoll: 0,
  draw: 0.1, out: 0, pt: 0,
};

/** Where his sword's point is. */
const swordTipOf = (s: Skeleton): V3 => add(s.handR, mul(s.point, GS_REACH));

/** THE CHAMPION AS SOLIDS: the skeleton's bones, a head taller; an old rusty great helm, his eyes burning in its slit, a torn plume; a torn cape; his great sword. */
function championBits(st: Stage, m: Moment): Bit[] {
  const { s, q } = m;
  const B = CB;
  const K = CK;
  const bits: Bit[] = [];
  const put: Put = (part, piece, shape) => {
    bits.push({ part, piece, shape });
  };
  const [cf, cl, cu] = s.chest;
  const lit = 1 - clamp01(q.out);
  // (his eyes: burning, and burning hotter as he winds up or roars: `glint`)
  const glare = lit * (1 + 0.6 * clamp01(m.glint));
  const lagRaw = mul(m.come, -1.4);
  const lagLen = len(lagRaw);
  const lag = lagLen > 2.6 ? mul(lagRaw, 2.6 / lagLen) : lagRaw;
  const flare = clamp01(q.gale);
  const wave = m.wind * Math.PI * 2;

  // --- the legs ---
  for (const side of ['L', 'R'] as const) {
    const hip = side === 'L' ? s.hipL : s.hipR;
    const knee = side === 'L' ? s.kneeL : s.kneeR;
    const ankle = side === 'L' ? s.ankleL : s.ankleR;
    const heel = side === 'L' ? s.heelL : s.heelR;
    const toe = side === 'L' ? s.toeL : s.toeR;
    put(`leg${side}`, `leg${side}`, { k: 'rod', a: hip, b: knee, ra: 1.0 * K, rb: 0.85 * K, ramp: BONE, far: true });
    put(`leg${side}`, `leg${side}`, { k: 'ball', c: knee, ax: sphere(1.45 * K), skin: BONE, far: true });
    put(`leg${side}`, `shin${side}`, { k: 'rod', a: knee, b: ankle, ra: 0.85 * K, rb: 0.72 * K, ramp: BONE, far: true });
    put(`leg${side}`, `shin${side}`, { k: 'ball', c: ankle, ax: sphere(1.0 * K), skin: BONE, far: true });
    put(`leg${side}`, `foot${side}`, { k: 'rod', a: add(heel, [0, 0, 0.95 * K]), b: add(toe, [0, 0, 0.75 * K]), ra: 0.95 * K, rb: 0.75 * K, ramp: BONE, far: true });
  }

  // --- the pelvis, the spine, the rib cage ---
  const [hf, hl, hu] = s.hips;
  put('pelvis', 'pelvis', { k: 'ball', c: add(s.pelvis, mul(hu, 0.9 * K)), ax: [mul(hf, 3.1 * K), mul(hl, 4.8 * K), mul(hu, 2.2 * K)], skin: (u, tone) => (u[0] > 0.42 && u[2] < 0.25 && Math.abs(u[1]) > 0.16 && Math.abs(u[1]) < 0.56 ? INK : BONE[tone]) });
  const low = add(s.pelvis, mul(hu, 2.6 * K));
  const backOf = (p: V3, k: number): V3 => add(p, mul(cf, -k));
  for (let i = 0; i < 4; i++) put('spine', 'cage', { k: 'ball', c: lerp3(low, backOf(s.ribs, 0.4), (i + 0.5) / 4), ax: sphere(1.12 * K), skin: BONE });
  if (dot(cf, st.eye) < 0.1) {
    put('ribs', 'cage', { k: 'rod', a: backOf(s.ribs, 1.6 * K), b: backOf(s.neck, 1.3 * K), ra: 1.0 * K, rb: 0.9 * K, ramp: BONE });
    for (const sg of [1, -1] as const) {
      const c = add(add(add(s.neck, mul(cu, -3.6 * K)), mul(cf, -2.3 * K)), mul(cl, sg * 3.0 * K));
      put('blades', 'cage', { k: 'ball', c, ax: [mul(norm(add(cf, mul(cl, sg * 0.3))), 0.6 * K), mul(cl, 2.0 * K), mul(cu, 2.4 * K)], skin: BONE });
    }
  }
  for (let i = 0; i < BW_RIBS.length; i++) {
    const [down, W, Dp, gap, slope] = BW_RIBS[i];
    const c = add(add(s.neck, mul(cu, -down * K)), mul(cf, Dp * 0.55 * K));
    for (const sg of [1, -1] as const) {
      let last: V3 | null = null;
      for (let k = 0; k <= 6; k++) {
        const th = gap + ((Math.PI - gap) * k) / 6;
        const p = add(add(add(c, mul(cf, Dp * K * Math.cos(th))), mul(cl, sg * W * K * 1.02 * Math.sin(th))), mul(cu, -slope * K * (1 + Math.cos(th)) * 0.5));
        if (last) {
          const midP = mid(last, p);
          const out = sub(midP, add(c, mul(cu, dot(sub(midP, c), cu))));
          if (dot(norm(out), st.eye) > -0.12) put('ribs', 'cage', { k: 'rod', a: last, b: p, ra: 0.72 * K, rb: 0.72 * K, ramp: BONE });
        }
        last = p;
      }
    }
  }
  const sternumTop = add(add(s.neck, mul(cu, -1.0 * K)), mul(cf, 2.8 * 1.5 * K));
  const sternumLow = add(add(s.neck, mul(cu, -7.5 * K)), mul(cf, 3.4 * 1.5 * K));
  put('ribs', 'cage', { k: 'rod', a: sternumTop, b: sternumLow, ra: 0.95 * K, rb: 0.75 * K, ramp: BONE });

  // --- the arms (his hands closed on the sword's grip, or the left hanging open as he walks) ---
  for (const side of ['L', 'R'] as const) {
    const sh = side === 'L' ? s.shoulderL : s.shoulderR;
    const el = side === 'L' ? s.elbowL : s.elbowR;
    const hand = side === 'L' ? s.handL : s.handR;
    const fore = norm(sub(hand, el), [0, 0, -1]);
    put(`upper${side}`, `arm${side}`, { k: 'ball', c: sh, ax: sphere(1.45 * K), skin: BONE, far: true });
    put(`upper${side}`, `arm${side}`, { k: 'rod', a: sh, b: el, ra: 0.85 * K, rb: 0.75 * K, ramp: BONE, far: true });
    put(`fore${side}`, `fore${side}`, { k: 'ball', c: el, ax: sphere(1.3 * K), skin: BONE, far: true });
    put(`fore${side}`, `fore${side}`, { k: 'rod', a: el, b: add(hand, mul(fore, -1.1)), ra: 0.75 * K, rb: 0.66 * K, ramp: BONE, far: true });
    put(`fore${side}`, `fore${side}`, { k: 'ball', c: hand, ax: sphere(1.4 * K), skin: BONE, far: true });
    put('ribs', 'cage', { k: 'rod', a: sternumTop, b: add(sh, mul(cu, 0.3)), ra: 0.72 * K, rb: 0.72 * K, ramp: BONE, far: true });
    // a rusted pauldron on each shoulder, its edge ragged
    const pc = add(add(sh, mul(cu, 1.5 * K)), mul(cl, (side === 'L' ? 1 : -1) * 0.6));
    const out = side === 'L' ? cl : mul(cl, -1);
    put(`plate${side}`, `plate${side}`, {
      k: 'ball',
      c: pc,
      ax: [mul(cf, 3.4 * K), mul(out, 3.4 * K), mul(cu, 2.3 * K)],
      skin: (u, tone) => {
        if (u[2] < -0.05 + 0.12 * Math.sin(u[0] * 9 + (side === 'L' ? 0 : 1.7))) return null;
        if (u[2] < 0.14) return RUST[Math.max(0, Math.min(2, tone - 1))];
        if (Math.abs(u[2] - 0.5) < 0.07) return IRON[Math.max(0, tone - 1)];
        if (hash(Math.round(u[0] * 5), Math.round(u[1] * 5), side === 'L' ? 5 : 6) < 0.34) return RUST[Math.min(3, tone)];
        return IRON[tone];
      },
    });
  }

  // --- the neck, the skull and its jaw, under an old rusty great helm ---
  for (const k of [0.3, 0.75]) put('neck', 'neck', { k: 'ball', c: lerp3(s.neck, s.skull, k), ax: sphere(1.05 * K), skin: BONE });
  const face = wornOn(st, s, 26);
  const [ff, fl, fu] = face;
  const cran = at3(s.head, face, -0.4 * K, 0, 1.2 * K);
  const R: V3 = [5.3 * K, 5.1 * K, 4.7 * K];
  // (the skull is all but hidden in the helm: its eyes burn in the helm's slit, below)
  skull(st, put, 'skull', 'skull', cran, face, R, BONE, 0, 0, false);
  const hinge = at3(s.head, face, -1.8 * K, 0, -2.0 * K);
  const open = clamp01(q.draw) * 36;
  const jf = about(ff, fl, open);
  const ju = about(fu, fl, open);
  const jawC = add(hinge, add(mul(jf, 3.2 * K), mul(ju, -1.4 * K)));
  put('mouth', 'skull', { k: 'ball', c: at3(s.head, face, 0.9 * K, 0, -2.3 * K), ax: [mul(ff, 2.0 * K), mul(fl, 2.8 * K), mul(fu, 1.05 * K)], skin: () => INK });
  put('jaw', 'jaw', { k: 'ball', c: jawC, ax: [mul(jf, 2.9 * K), mul(fl, 3.5 * K), mul(ju, 1.35 * K)], skin: BONE });
  // the helm: a great helm, old: a tube of iron with straight sides and a flat top, closed but for
  // a slit across it for the eyes; a band round its brow, riveted; a ridge down its face; breathing
  // holes on its right cheek; rust in spots; on its crown a crest of the cape's torn cloth
  const HD = R[0] + 0.7;
  const HW = R[1] + 0.9;
  const hBot = at3(cran, face, 0.2, 0, -R[2] * 0.62);
  const hTop = at3(cran, face, -0.2, 0, R[2] + 3.0);
  const along = (k: number): V3 => lerp3(hBot, hTop, k);
  const hUp = norm(sub(hTop, hBot), fu);
  const ring = (k: number, w = 1): Ring => ({ c: along(k), u: mul(ff, HD * w), v: mul(fl, HW * w) });
  put('helm', 'helm', { k: 'cloth', rings: [ring(0), ring(0.55, 1.02), ring(1, 0.96)], ramp: IRON, look: {}, rigid: true });
  put('helm', 'helm', { k: 'ball', c: hTop, ax: [mul(ff, HD * 0.96), mul(fl, HW * 0.96), mul(hUp, 0.6)], skin: (u, tone) => (Math.hypot(u[0], u[1]) > 0.84 ? IRON[Math.max(0, tone - 1)] : IRON[Math.min(4, tone + 1)]) });
  /** A point on the helm's face: `deg` round from straight ahead (to his left), `k` of the way up it. */
  const onHelm = (deg: number, k: number, out = 1.0): { p: V3; n: V3 } => {
    const a = deg * D;
    const w = k > 0.55 ? 1.02 - (k - 0.55) * 0.13 : 1 + k * 0.036;
    const n = norm(add(mul(ff, Math.cos(a) / HD), mul(fl, Math.sin(a) / HW)));
    return { p: add(along(k), add(mul(ff, Math.cos(a) * HD * w * out), mul(fl, Math.sin(a) * HW * w * out))), n };
  };
  const SLIT_K = 0.5;
  const dot1 = (deg: number, k: number, c: string): void => {
    const { p, n } = onHelm(deg, k);
    put('helm', 'helm', { k: 'dot', p, c, facing: n });
  };
  // the slit: two rows of the dark across its face
  for (let deg = -62; deg <= 62; deg += 4) {
    dot1(deg, SLIT_K, INK);
    dot1(deg, SLIT_K - 0.035, INK);
  }
  // the ridge down its face, from the slit to the band
  for (let k = SLIT_K + 0.06; k < 0.8; k += 0.035) dot1(0, k, IRON[3]);
  // the band round its brow, and its rivets
  for (let deg = -180; deg < 180; deg += 5) dot1(deg, 0.84, deg % 30 === 0 ? IRON[3] : IRON[0]);
  // breathing holes on its right cheek
  for (const [deg, k] of [[-30, 0.3], [-38, 0.3], [-46, 0.3], [-30, 0.22], [-38, 0.22], [-46, 0.22], [-34, 0.14], [-42, 0.14]] as const) dot1(deg, k, INK);
  // rust in spots
  for (let i = 0; i < 26; i++) {
    const deg = -180 + 360 * hash(i, 1, 51);
    const k = 0.05 + 0.88 * hash(i, 2, 51);
    const c = hash(i, 3, 51) < 0.6 ? RUST[2] : RUST[1];
    // (a patch: a spot and its neighbours)
    dot1(deg, k, c);
    if (hash(i, 4, 51) < 0.6) dot1(deg + 4, k, c);
    if (hash(i, 5, 51) < 0.5) dot1(deg, k - 0.04, c);
  }
  // his eyes in the slit, burning
  if (glare > 0.05) {
    for (const sg of [-1, 1]) {
      const { p: e } = onHelm(sg * 21, SLIT_K - 0.018, 1.02);
      put('helm', 'helm', { k: 'dot', p: e, c: glare > 1.3 ? FLAME[4] : glare > 0.5 ? SOCKET : FLAME[1], facing: ff, c2: glare > 1.3 ? FLAME[3] : undefined });
      if (dot(ff, st.eye) > 0.05) put('helm', 'helm', { k: 'glow', p: e, c: SOCKET, r: 3.5 + 3 * Math.max(0, glare - 1), a: Math.min(0.8, 0.42 * glare) });
    }
  }
  // its crest: the cape's torn cloth, in tufts along its crown from front to back, streaming behind
  {
    const tufts = 5;
    for (let j = 0; j < tufts; j++) {
      const k = j / (tufts - 1);
      const base = add(hTop, add(mul(ff, (0.7 - 1.5 * k) * HD), mul(hUp, 0.4)));
      const sway = Math.sin(wave * 1.5 + j * 1.3) * (0.4 + 1.2 * flare) * (0.4 + k);
      const tipP = add(base, add(add(mul(hUp, 4.6 - 1.8 * k), mul(ff, -1.6 - 4.0 * k * k)), add(mul(fl, sway), mul(lag, 0.5 * k))));
      put('crest', 'helm', { k: 'rod', a: base, b: tipP, ra: 1.5, rb: 0.6, ramp: CREST });
    }
    // (and its tail, down the back of the helm)
    const tail0 = add(hTop, add(mul(ff, -HD * 0.9), mul(hUp, 0.2)));
    let last = tail0;
    for (let i = 1; i <= 3; i++) {
      const k = i / 3;
      const sway = Math.sin(wave * 1.5 + k * 3.1) * (0.8 + 1.4 * flare) * k;
      const p = add(tail0, add(add(mul(ff, -3.2 * k), mul(fl, sway)), add(mul(hUp, -5.5 * k), mul(lag, 0.8 * k))));
      put('crest', 'helm', { k: 'rod', a: last, b: p, ra: 1.4 * (1 - (i - 1) / 3) + 0.45, rb: 1.4 * (1 - k) + 0.45, ramp: CREST });
      last = p;
    }
  }

  // --- the cape: torn, from his shoulders down his back to his knees, left behind as he goes ---
  {
    const f = norm([s.hips[0][0], s.hips[0][1], 0], [1, 0, 0]);
    const l: V3 = [-f[1], f[0], 0];
    const top: Ring = { c: add(add(s.neck, mul(cu, -1.2)), mul(cf, -0.6)), u: mul(cf, B.ribDeep + 1.4), v: mul(cl, B.shoulderHalf + 1.4) };
    const midR: Ring = { c: add(add(lerp3(s.waist, s.ribs, 0.4), mul(lag, 0.35)), mul(f, -0.8)), u: mul(f, B.ribDeep + 2.2), v: mul(l, B.ribHalf + 2.6) };
    const hz = Math.max(3, s.pelvis[2] - B.thigh * 0.9) + 2.2 * flare;
    const hc: V3 = [s.pelvis[0] - 2.6 * f[0] + lag[0] * 1.6, s.pelvis[1] - 2.6 * f[1] + lag[1] * 1.6, hz];
    const wide = (B.ribHalf + 4.0) * (1 + 0.3 * flare);
    const deep = (B.ribDeep + 3.0) * (1 + 0.35 * flare);
    const pts: V3[] = [];
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      const rear = Math.max(0, -Math.cos(a));
      const p0 = add(hc, add(mul(f, Math.cos(a) * deep), mul(l, Math.sin(a) * wide)));
      pts.push(add(p0, add(mul(f, -rear * (1.4 + 2 * clamp01(len(m.come) / FR / 60))), [0, 0, Math.sin(wave + a * 2) * (0.6 + 1.2 * flare) + rear * 0.8])));
    }
    const hem: Ring = { c: hc, u: mul(f, deep), v: mul(l, wide), pts };
    if (q.pt < 0.5) put('cape', 'cape', { k: 'cloth', rings: [top, midR, hem], ramp: CAPE, look: { arc: [100, 260], folds: [150, 180, 210], lift: 0.15 }, torn: CAPE_TORN });
    // (fallen, it lies in a heap where he knelt)
    else {
      const at: V3 = [s.pelvis[0] + 2, s.pelvis[1], 0];
      put('heap', 'heap', { k: 'cloth', rings: [{ c: add(at, [0, 0, 3.0]), u: mul(f, 4.5), v: mul(l, 5.5) }, { c: add(at, [0, 0, 0.6]), u: mul(f, 8.5), v: mul(l, 10.0) }], ramp: CAPE, look: { folds: [30, -40, 100, -120, 200], lift: 0.4 }, torn: CAPE_TORN });
    }
  }

  // --- his great sword, in his right hand (both hands on it, mostly) ---
  put('sword', 'sword', { k: 'greatsword', grip: s.handR, point: s.point });

  // --- HIS BLOWS, AS THE BONEWARD'S (with his weight behind them): the way his blade went through the
  // air streaked as the cleave lands, and the floor's dust kicked up round his front foot ---
  if (m.blur && m.trails) {
    for (const tr of m.trails) {
      for (let i = 1; i < tr.length; i++) {
        const a = tr[i - 1];
        const b = tr[i];
        const n = Math.max(1, Math.ceil(Math.hypot(...(st.at(b).map((v, k) => v - st.at(a)[k]) as [number, number]))));
        for (let j = 0; j < n; j++) put('streak', 'streak', { k: 'mote', p: lerp3(a, b, j / n), c: i < tr.length / 2 ? BONE[3] : BONE[2], size: 1 });
      }
    }
  }
  if (m.dust && m.since !== undefined && m.since >= 0 && m.since < BW_DUST_FOR) {
    const k = m.since / BW_DUST_FOR;
    const foot = lerp3(s.heelL, s.toeL, 0.6);
    for (let i = 0; i < 16; i++) {
      if (hash(i, 7, 13) < k * 0.9) continue;
      const a = (i / 16) * Math.PI * 2 + hash(i, 1, 13);
      const r = 2.5 + (6 + 6 * hash(i, 2, 13)) * Math.sqrt(k);
      const z = 0.4 + (1.5 + 3.5 * hash(i, 3, 13)) * Math.sin(Math.PI * Math.min(1, k * 1.3));
      put('dust', 'dust', { k: 'mote', p: [foot[0] + Math.cos(a) * r * 1.2, foot[1] + Math.sin(a) * r, z], c: i % 3 ? OSSUARY[2] : OSSUARY[1], size: i % 3 === 0 ? 2 : 1 });
    }
  }
  // --- THE RALLYING CRY: his sword raised high, light bursts from its point and runs down it, and
  // embers rise round him (the minions' flare is the game's) ---
  if (m.rally > 0.05) {
    const g = m.rally;
    const tip = swordTipOf(s);
    put('rally', 'rally', { k: 'glow', p: tip, c: SOCKET, r: 6 + 10 * g, a: Math.min(0.9, 0.6 * g) });
    put('rally', 'rally', { k: 'mote', p: tip, c: FLAME[4], size: 2 });
    for (let i = 0; i < 6; i++) {
      const k = (i + 0.5) / 6;
      if (hash(i, Math.floor(m.t * 20), 37) > 0.45 + 0.4 * g) continue;
      put('rally', 'rally', { k: 'mote', p: add(s.handR, mul(s.point, GS_REACH * (0.25 + 0.75 * k))), c: k > 0.7 ? FLAME[4] : FLAME[3], size: 1 });
    }
    for (let i = 0; i < 12; i++) {
      const life = (m.t * 1.6 + hash(i, 1, 41)) % 1;
      const a = hash(i, 2, 41) * Math.PI * 2;
      const r = 7 + 9 * hash(i, 3, 41);
      put('rally', 'rally', { k: 'mote', p: [s.pelvis[0] + Math.cos(a) * r, s.pelvis[1] + Math.sin(a) * r, 2 + life * 34], c: life < 0.5 ? FLAME[3] : FLAME[2], size: life < 0.3 && i % 3 === 0 ? 2 : 1 });
    }
    // (the cry itself: a burst of embers out from his chest the moment he roars, thrown out round him)
    if (m.since !== undefined && m.since >= 0 && m.since < 0.32) {
      const k = m.since / 0.32;
      const c0 = lerp3(s.ribs, s.neck, 0.5);
      for (let i = 0; i < 20; i++) {
        if (hash(i, 9, 43) < k * 0.8) continue;
        const a = (i / 20) * Math.PI * 2;
        const r = 5 + 22 * Math.sqrt(k) * (0.8 + 0.4 * hash(i, 8, 43));
        put('rally', 'rally', { k: 'mote', p: [c0[0] + Math.cos(a) * r, c0[1] + Math.sin(a) * r, c0[2] + (hash(i, 7, 43) - 0.5) * 8 - k * 6], c: k < 0.4 ? FLAME[4] : FLAME[3], size: k < 0.5 && i % 2 === 0 ? 2 : 1 });
      }
    }
  }
  return bits;
}

/** Standing, he keeps his ground: leaning on his planted sword, his weight shifting, his head turning to look over his pack, his jaw hanging and clacking; the cape and plume stirring. */
function chPost(): Motion {
  const R = CH_REST;
  return {
    loop: 0,
    keys: [
      { at: 0, pose: {} },
      { at: 0.7, pose: { pz: R.pz - 0.5, px: 0.6, pitch: R.pitch + 2, faceTurn: R.faceTurn + 14, faceUp: R.faceUp - 2, draw: 0.2 }, ease: 'io' },
      { at: 1.2, pose: { pz: R.pz - 0.5, px: 0.6, pitch: R.pitch + 2, faceTurn: R.faceTurn + 16, faceUp: R.faceUp - 2, draw: 0.05 }, ease: 'hold' },
      { at: 1.8, pose: { pz: R.pz - 0.2, px: -0.3, faceTurn: R.faceTurn - 12, faceTilt: 3, draw: 0.3 }, ease: 'io' },
      { at: 2.4, pose: {}, ease: 'io' },
    ],
  };
}

/** The moment his cleave lands, and his cry rings out (they have no rules yet: the main chat's). */
export const CHAMPION_HIT = 0.8;
export const RALLY_CRY = 0.85;
/** HIS CLEAVE, wound up: the sword swung up and back over his right shoulder in both hands, his body turned away, his weight on his back foot, his eyes flaring in the slit (the warning). */
const CH_WOUND: P = {
  px: -2.6, pz: -4.6, yaw: -10, pitch: -6, roll: 0, twist: -32, bend: -2, side: 2,
  faceUp: 4, faceTurn: 18, faceTilt: 0,
  lfx: 4.2, lfy: 3.6, lk: 18, rfx: -5.2, rfy: -3.6, rk: -16,
  rhIn: 1, rhx: -5.0, rhy: -6.5, rhz: 9.0, re: 50,
  lhIn: 3, lhx: GS_LEFT, lhy: 0, lhz: 0, le: 30,
  wAz: -150, wEl: 34, wRoll: 0,
  draw: 0.5,
};
/** ... and landed: a step into it, his hips driving forward, the blade cleaving down across him to his left. */
const CH_CLEAVE: P = {
  ...CH_WOUND,
  px: 6.4, pz: -7.4, yaw: 2, pitch: 22, twist: 26, bend: 12, side: 0,
  faceUp: -6, faceTurn: 0,
  lfx: 13.0, lfz: 0, lk: 30, rk: -4,
  rhIn: 1, rhx: 13.0, rhy: 5.0, rhz: -15.0, re: 10,
  wAz: 34, wEl: -26,
  draw: 0.95,
};
function chCleave(): Motion {
  const shake = (dz: number, more: P = {}): P => ({ ...CH_WOUND, rhz: (CH_WOUND.rhz ?? 0) + dz, ...more });
  return {
    hit: CHAMPION_HIT,
    keys: [
      { at: 0, pose: {} },
      // (the sword wrenched up out of the floor, then swung up and back)
      { at: 0.18, pose: { px: -0.6, pz: -1.6, twist: -10, rhIn: 1, rhx: 6.0, rhy: -3.0, rhz: -6.0, re: 10, wAz: -30, wEl: 20, draw: 0.3 }, ease: 'out' },
      { at: 0.42, pose: CH_WOUND, ease: 'out' },
      { at: 0.55, pose: shake(0.4, { draw: 0.55 }), ease: 'hold' },
      { at: 0.66, pose: shake(-0.3, { draw: 0.5, twist: -33 }), ease: 'hold' },
      { at: CHAMPION_HIT - 0.07, pose: shake(0.3, { px: -3.0, twist: -34, rhx: -5.6 }), ease: 'hold' },
      // (the step: his front foot off the floor, the sword starting down)
      { at: CHAMPION_HIT - 0.035, pose: { ...CH_WOUND, px: 1.8, pz: -5.6, pitch: 8, twist: -6, lfx: 9.0, lfz: 3.0, rhx: 3.0, rhy: -2.0, rhz: 4.0, wAz: -40, wEl: 10, draw: 0.8 }, ease: 'in' },
      { at: CHAMPION_HIT, pose: CH_CLEAVE, ease: 'lin' },
      { at: CHAMPION_HIT + 0.14, pose: { ...CH_CLEAVE, px: 7.0, pz: -8.0, rhx: 11.0, rhy: 8.0, rhz: -18.0, wAz: 62, wEl: -34, draw: 0.7 }, ease: 'out' },
      // (hauled back, and the sword set point-down again)
      { at: CHAMPION_HIT + 0.38, pose: { px: 2.0, pz: -3.0, pitch: 8, twist: 6, lfx: 7.5, lfz: 2.4, rhIn: 2, rhx: 12.0, rhy: 0.0, rhz: GS_REACH + 3.0, wAz: 10, wEl: -70, draw: 0.4 }, ease: 'io' },
      { at: CHAMPION_HIT + 0.62, pose: {}, ease: 'io' },
    ],
  };
}
/** HIS RALLYING CRY: the sword wrenched up and raised high in both hands, its point to the roof; his head thrown back, his jaw wide, his eyes and the sword's point flaring, embers rising round him; then set down again. */
function chRally(): Motion {
  const up: P = {
    px: -1.0, pz: -1.6, pitch: -8, bend: -10, twist: -4,
    faceUp: 30, faceTurn: 0,
    lfx: 3.6, lk: 10, rfx: -2.4, rk: -8,
    rhIn: 1, rhx: 3.0, rhy: -4.0, rhz: 24.0, re: 30,
    lhIn: 3, lhx: GS_LEFT, lhy: 0, lhz: 0, le: 30,
    wAz: 0, wEl: 82, draw: 0.6,
  };
  return {
    hit: RALLY_CRY,
    keys: [
      { at: 0, pose: {} },
      { at: 0.2, pose: { px: -0.4, pz: -2.4, pitch: 6, rhIn: 1, rhx: 7.0, rhy: -3.0, rhz: -2.0, wAz: 0, wEl: 30, draw: 0.2 }, ease: 'out' },
      { at: 0.55, pose: up, ease: 'out' },
      { at: RALLY_CRY - 0.08, pose: { ...up, rhz: 25.0, faceUp: 32, draw: 0.75 }, ease: 'io' },
      { at: RALLY_CRY, pose: { ...up, rhz: 26.0, bend: -12, faceUp: 36, draw: 1.0 }, ease: 'out' },
      { at: RALLY_CRY + 0.4, pose: { ...up, rhz: 25.4, bend: -11, faceUp: 34, draw: 0.95 }, ease: 'io' },
      { at: RALLY_CRY + 0.7, pose: { px: 0.6, pz: -1.0, pitch: 4, rhIn: 2, rhx: 11.0, rhy: -0.4, rhz: GS_REACH + 4.0, wAz: 4, wEl: -80, draw: 0.3 }, ease: 'io' },
      { at: RALLY_CRY + 0.95, pose: {}, ease: 'io' },
    ],
  };
}
/** How bright his cry is (0 none): up as the sword goes up, at its brightest as he roars, then out. */
function rallyOver(t: number): number {
  if (t < 0.4) return 0;
  if (t < RALLY_CRY) return (t - 0.4) / (RALLY_CRY - 0.4);
  if (t < RALLY_CRY + 0.4) return 1.25;
  return Math.max(0, 1.25 - (t - RALLY_CRY - 0.4) * 4);
}

/**
 * HIS MARCH, proud and heavy (his pick by 11:51): eight frames at ten a second, painted for 1.2
 * tiles a second. Upright, each step coming down heavily and the body sinking onto it, the shoulders
 * rolling, his free left hand swinging; his sword in his right hand, low at his side, its point
 * dragged along the floor behind him. A foot that is down stays where it is on the floor.
 */
const CH_WALK_FRAMES = 8;
const CH_WALK_FPS = 10;
export const CHAMPION_PACE = 1.2;
function chMarch(): Motion {
  const R = CH_REST;
  const n = CH_WALK_FRAMES;
  const d = (CHAMPION_PACE * TILE3) / CH_WALK_FPS;
  // (a foot comes down two frames' worth of floor ahead of the hips and leaves as far behind them: down five frames, off the floor three)
  const half = 2 * d;
  const SW = [0.22, 0.55, 0.85];
  const SZ = [2.6, 3.8, 2.0];
  const foot = (j: number): [number, number] => (j <= 4 ? [half - d * j, 0] : [-half + 2 * half * SW[j - 5], SZ[j - 5]]);
  const keys: Key3[] = [];
  for (let i = 0; i <= n; i++) {
    const j = i % n;
    const a = (j / n) * Math.PI * 2;
    const [rx, rz] = foot(j);
    const [lx, lz] = foot((j + 4) % n);
    keys.push({
      at: i / CH_WALK_FPS,
      ease: 'lin',
      pose: {
        px: 0.4, py: -1.0 * Math.sin(a), pz: -1.6 - 1.2 * Math.cos(2 * a),
        yaw: R.yaw + 4 * Math.cos(a), twist: -3 * Math.cos(a), pitch: 4 + 1.2 * Math.cos(2 * a), bend: 1 + Math.cos(2 * a),
        roll: 3 * Math.sin(a), side: 1.5 * Math.sin(a),
        faceUp: R.faceUp - 1 * Math.cos(2 * a), faceTurn: -2 * Math.cos(a), faceTilt: -2 * Math.sin(a),
        rfx: rx, rfz: rz, rfy: -2.6, rft: -10, rk: -10, rfp: rz > 0 ? 12 : j === 0 ? -6 : 0,
        lfx: lx, lfz: lz, lfy: 2.6, lft: 10, lk: 10, lfp: lz > 0 ? 12 : j === 4 ? -6 : 0,
        lhIn: 0, lhx: 2.0 + 3.2 * Math.cos(a), lhy: 1.0, lhz: CH_HANG + 1.5 + 1.2 * Math.max(0, Math.cos(a)), le: -10,
        rhIn: 0, rhx: -1.0 - 1.0 * Math.cos(a), rhy: -2.0, rhz: CH_HANG + 3.0, re: 6,
        // (the sword trailed behind him, its point on the floor)
        wAz: -168, wEl: -38 + 1.5 * Math.cos(2 * a), wRoll: 0,
        draw: 0.15 + 0.1 * Math.max(0, Math.cos(2 * a)),
      },
    });
  }
  return { keys, loop: 0 };
}
/** STRUCK: rocked back on his heels, his hands keeping their hold on the planted sword, his head knocked back, the cape flaring; then he settles again. */
function chStruck(): Motion {
  const R = CH_REST;
  return {
    keys: [
      { at: 0, pose: {} },
      { at: 0.06, pose: { px: -2.6, pz: R.pz - 0.8, pitch: -7, bend: -6, twist: -5, faceUp: 14, faceTilt: -6, draw: 0.8, gale: 0.8 }, ease: 'out' },
      { at: 0.15, pose: { px: -1.5, pz: R.pz - 0.8, pitch: -1, bend: -3, faceUp: 6, draw: 0.35, gale: 0.35 }, ease: 'io' },
      { at: 0.3, pose: {}, ease: 'io' },
    ],
  };
}
/** DYING, TO HIS KNEES ON HIS SWORD (his pick by 11:51): a jolt; he sinks to his knees, both hands still on the hilt of the planted sword, his helm bowed against them, and the light goes out of his eyes; then he crumbles, his helm rolling away, his cape fallen in a heap, and his sword left standing in the floor. */
function chGiving(): Motion {
  const kneel: P = {
    px: 0.6, pz: -15.5, pitch: 4, bend: 7, twist: 0, faceUp: -30, faceTilt: 6,
    lfx: -5.5, rfx: -7.0, lfy: 3.4, rfy: -3.4, lfp: 55, rfp: 55, lk: 0, rk: 0,
    rhIn: 2, rhx: 10.5, rhy: -0.5, rhz: GS_REACH + 0.9, wAz: 0, wEl: -88,
  };
  return {
    keys: [
      { at: 0, pose: {} },
      { at: 0.08, pose: { px: -1.2, pz: -0.8, pitch: -5, bend: -4, faceUp: 16, draw: 0.9 }, ease: 'out' },
      { at: 0.55, pose: { ...kneel, draw: 0.6, out: 0.3 }, ease: 'in' },
      { at: 0.62, pose: { ...kneel, pz: -15.8, draw: 0.5, out: 0.4 }, ease: 'out' },
      { at: 1.05, pose: { ...kneel, faceUp: -38, bend: 10, draw: 0.35, out: 1 }, ease: 'io' },
      { at: 1.12, pose: { ...kneel, faceUp: -38, bend: 10, draw: 0.35, out: 1, pt: 1 }, ease: 'hold' },
      { at: 2.0, pose: { ...kneel, faceUp: -38, bend: 10, draw: 0.35, out: 1, pt: 1 }, ease: 'hold' },
    ],
  };
}
/** How each piece of him falls when he crumbles (seconds from the blow): his helm rolls away; his sword stays standing in the floor. */
const CH_FALLS: Readonly<Record<string, Fall>> = {
  helm: { from: 1.12, to: [15, -9], spin: 140, lay: 'axis', hop: 2.2 },
  jaw: { from: 1.16, to: [7, 2], spin: 50, lay: 'keep', hop: 1 },
  skull: { from: 1.2, to: [6, -3], spin: 30, lay: 'keep', hop: 1.2, pile: 0.6 },
  armR: { from: 1.2, to: [3, -8], spin: -40, lay: 'axis', hop: 1 },
  foreR: { from: 1.22, to: [6, -6], spin: 30, lay: 'axis', hop: 0.8 },
  armL: { from: 1.2, to: [3, 8], spin: 35, lay: 'axis', pile: 0.8 },
  foreL: { from: 1.23, to: [6, 9], spin: -25, lay: 'axis', pile: 1.2 },
  plateL: { from: 1.18, to: [-3, 10], spin: 40, lay: 'keep', hop: 1.2 },
  plateR: { from: 1.18, to: [-2, -11], spin: -30, lay: 'keep', hop: 1.2 },
  cage: { from: 1.25, to: [1, 1], spin: 15, lay: 'axis', hop: 0.8 },
  pelvis: { from: 1.27, to: [-2, 1], spin: 0, lay: 'keep' },
  neck: { from: 1.24, to: [3, -4], spin: 60, lay: 'axis' },
};

export const CHAMPION: Mob = {
  id: 'champion',
  name: 'The Skeleton Champion',
  size: 'a yellow pack’s leader: a head taller than his skeletons',
  build: CB,
  stand: { name: 'The Champion keeps his ground', motion: chPost(), rest: CH_REST },
  attack: { name: 'The Champion cleaves', motion: chCleave(), rest: CH_REST, glint: (t) => (t > 0.3 && t < CHAMPION_HIT ? Math.min(1, (t - 0.3) / 0.3) : 0), trail: (sk) => [swordTipOf(sk)], dust: true },
  idleFrames: 24,
  idleFps: 10,
  walk: { name: 'The Champion marches', motion: chMarch(), rest: CH_REST, period: CH_WALK_FRAMES / CH_WALK_FPS, ground: CHAMPION_PACE * TILE3 },
  walkFrames: CH_WALK_FRAMES,
  walkFps: CH_WALK_FPS,
  pace: CHAMPION_PACE,
  more: {
    rally: { name: 'The Champion rallies his pack', motion: chRally(), rest: CH_REST, rally: rallyOver, glint: (t) => Math.min(1, rallyOver(t)) },
  },
  reel: { name: 'The Champion is struck', motion: chStruck(), rest: CH_REST },
  reelTime: 0.3,
  hit: CHAMPION_HIT,
  warn: 0.62,
  dieTime: 2.0,
  dying: { name: 'The Champion falls to his knees', motion: chGiving(), rest: CH_REST },
  aura: { x: CANVAS3.ax - 2, y: CANVAS3.ay - 34, r: 46, color: '#ff3a78', a: 0.13 },
  shadow: 12,
  bits: (st, m) => championBits(st, m),
  fall(piece) {
    const f = CH_FALLS[piece];
    if (f) return f;
    // (his sword stays standing in the floor, and the cape lies where it fell)
    if (piece === 'sword' || piece === 'heap' || piece === 'cape' || piece === 'streak' || piece === 'dust' || piece === 'rally') return null;
    return scatter(piece, 1.2, 1.34, piece.startsWith('rib') || piece.startsWith('plate') ? 9 : 6, piece.startsWith('rib') || piece === 'pelvis' ? 'flat' : 'axis');
  },
};

/** THE SKELETON CHAMPION, as the game holds a monster (see makeShadeArt3). */
export function makeChampionArt3(pace = CHAMPION.pace): ActorArt {
  return { front: mobSet(CHAMPION, 'front', pace), back: mobSet(CHAMPION, 'back', pace) };
}

// =============================================================================================
// 5. THE BONE MARKSMAN: A YELLOW PACK'S LEADER OF BONE ARCHERS (9 Oct)
//
// Asked in the art chat who should lead each kind of yellow pack, his pick for the bone archers, by
// 14:32: "A bone marksman (Recommended)". His brief (the art rulebook's "A new character"), our
// picks, each his pick by 14:32: "A head taller (Recommended)", "Still and patient (Recommended)",
// "His bow snaps (Recommended)"; and for the Sound chat, "Creak, rattle, deep twang (Recommended)".
//
// So: one of the bone archers (art/monster_bones3.ts, the archer on the bones, his yes of 8 Oct), a
// head taller than they are and lean; the archers' red hood over his skull, its point hanging down
// his back; a long cloak of a deeper red, torn at the hem; a quiver of long arrows on his back; and
// A GREAT BOW AS TALL AS HE IS, of near-black wood, its tips ears of bone, its grip bound in red
// cord. He stands still and patient, resting on it, its lower tip on the floor: only his head
// turns, slowly, and his cloak stirs. He shoots as his archers do, slower. HIS OWN MOVE, THE GREAT
// SHOT (`moves.pierce`): he plants his feet, reaches back over his shoulder for an arrow from his
// quiver, nocks it, and draws the great bow past his jaw; he holds it there while its head gathers
// light, pink burning to gold (the warning), and looses it, to pierce. Dying, he draws his bow one
// last time, with no arrow on it, and it snaps; then he comes apart. His word is not painted on
// him: the ring under him shows it (render/pack_marks.ts).

/** His body: the skeleton's own (art/monster_bones3.ts), a head taller than his archers, as the champion is, and lean. */
const MK_K = 1.18;
const MK_BODY: Build = scaled(SKELETON3_BODY, MK_K, { shoulderHalf: 1.03, ribHalf: 1.02 });
const MB = MK_BODY;
/** His bones' thickness. */
const MKK = MK_K * 1.03;
/** HIS GREAT BOW: half its length, from the grip to either tip (the archers' is 20); how far the string stands off the grip; the ears of bone at its tips; an arrow, nock to point. */
const GB_HALF = 27;
const GB_BRACE = 6.2;
const GB_EAR = 4.2;
const GB_ARROW = 27;
/** His colours: his hood the archers' red (theirs: art/monster_bones3.ts); his cloak a red so deep it is nearly black, so that the hood stands out on it; the bow's wood near black; the cord on its grip red. */
const MK_HOOD: Ramp = BLOOD;
export const MK_CLOAK: Ramp = ['#1e0510', '#1e0510', '#46091f', '#6e1230', '#6e1230'];
export const MK_WOOD: Ramp = ['#16133a', '#16133a', '#2c2864', '#4a4494', '#4a4494'];
const MK_STRING = BONE[2];
const MK_SHAFT = PLUM[3];
/** How much is torn off his cloak's hem across it (as the champion's cape). */
const MK_CLOAK_TORN: readonly number[] = [3, 1, 4, 0, 2, 5, 1, 3, 0, 2, 4, 1, 3, 0, 1, 4];

/**
 * HIS STRING HAND (`prop`): on the string with an arrow nocked (1); just let go (2); an arrow in it,
 * taken from his quiver (3: it points along `pAz`, `pEl`); on the string with no arrow on it (4: his
 * last draw); and once his bow has snapped (5). Anything else (0, 6): off the string, empty. (Every
 * one of them is a number other than 0, so that between two keys the one shown changes half way.)
 */
const MK_NOCKED = 1;
const MK_LET_GO = 2;
const MK_TAKEN = 3;
const MK_BARE = 4;
const MK_SNAPPED = 5;
const MK_FREE = 6;
function mkHand(prop: number): number {
  const h = Math.round(prop);
  return h >= 1 && h <= 5 ? h : MK_FREE;
}

const MK_HANG = -(MB.upperArm + MB.foreArm) * 0.95;
/** How he stands: upright and still, his feet set, his head up. */
const MK_BASE: Bones = {
  ...standing(MB),
  pz: -0.4, px: 0, yaw: -6, pitch: 0, roll: 0, twist: -2, bend: 2, side: 0,
  faceTurn: 4, faceUp: 2, faceTilt: 0,
  lfx: 2.4, lfy: 1.6, lft: 10, lk: 4, rfx: -2.0, rfy: -1.5, rft: -16, rk: -6,
  lhIn: 0, lhx: 2.6, lhy: 2.4, lhz: MK_HANG + 2, le: -6,
  rhIn: 0, rhx: 0.6, rhy: -1.6, rhz: MK_HANG + 0.4, re: 6,
  wAz: 0, wEl: 0, wRoll: 0,
  draw: 0, pt: 0, out: 0, prop: MK_FREE, gale: 0,
};

/**
 * HIS GREAT BOW AT REST: standing on its lower tip on the floor beside his left foot, leaning out and
 * a little forward, his left hand on its grip (given from his place on the floor, `HandIn` 2, so that
 * the bow stays where it stands as he shifts); his right hand hanging empty. The belly of the bow
 * faces forward, the string behind it.
 */
const MK_LEAN: V3 = norm([0.12, 0.2, 0.97]);
const MK_GRIP_AT: V3 = [3.4, 13.4, 0.9 + GB_HALF * MK_LEAN[2]];
/** Which way the belly of the bow faces at rest and as he carries it: forward and out to his left, so that the eye sees its curve from in front and from behind (the string toward him). */
const MK_BELLY: V3 = norm([1, 1, 0]);
function mkRest(body: P, grip: V3 = MK_GRIP_AT, lean: V3 = MK_LEAN): P {
  const fwd = norm(sub(MK_BELLY, mul(lean, dot(MK_BELLY, lean))));
  const { wAz, wEl, wRoll } = aimFor(fwd, lean);
  return { rhIn: 0, rhx: 0.6, rhy: -1.6, rhz: MK_HANG + 0.4, re: 6, ...body, lhIn: 2, lhx: grip[0], lhy: grip[1], lhz: grip[2], le: -10, wAz, wEl, wRoll, draw: 0, prop: MK_FREE };
}
export const MK_REST: Bones = { ...MK_BASE, ...mkRest({}) };

/** The great bow carried as he walks: off the floor, upright at his left side and leaning forward, his hand on its grip at his hip. */
function mkCarry(body: P, swing = 0): P {
  const q: Bones = { ...MK_BASE, ...body };
  const s = solve(MB, { ...q, lhIn: 0, lhx: 2.8, lhy: 2.6, lhz: MK_HANG + 4.4 });
  const lean = norm([0.36 + 0.05 * swing, 0.16, 0.92]);
  const fwd = norm(sub(MK_BELLY, mul(lean, dot(MK_BELLY, lean))));
  const { wAz, wEl, wRoll } = aimFor(fwd, lean);
  const l = sub(s.handL, s.shoulderL);
  return { ...body, lhIn: 1, lhx: l[0], lhy: l[1], lhz: l[2], le: -12, wAz, wEl, wRoll, draw: 0, prop: MK_FREE };
}

/**
 * THE GREAT BOW DRAWN, as his archers draw theirs (art/monster_bones3.ts, `drawnBow`): the arrow `el`
 * degrees above level toward the mark straight ahead, the string `pull` of the way back (1: to his
 * jaw; for his great shot more, past it toward his ear). `prop`: what is on the string.
 */
function mkDrawn(body: P, el: number, pull: number, prop = MK_NOCKED): P {
  const q: Bones = { ...MK_BASE, ...body };
  const s = solve(MB, q);
  const aim = heading(0, el);
  const [ff, fl, fu] = s.face;
  const anchor = add(s.head, add(mul(ff, 0.4 * MK_K), add(mul(fl, -3.2 * MK_K), mul(fu, -5.6 * MK_K))));
  const armLen = (MB.upperArm + MB.foreArm) * 0.975;
  const from = sub(anchor, s.shoulderL);
  const along = dot(aim, from);
  const disc = along * along - dot(from, from) + armLen * armLen;
  const grip = disc >= 0 ? add(anchor, mul(aim, -along + Math.sqrt(disc))) : add(s.shoulderL, mul(aim, armLen));
  const full = len(sub(grip, anchor));
  const string = add(grip, mul(aim, -(GB_BRACE + (full - GB_BRACE) * Math.min(1, pull) + (pull - Math.min(1, pull)) * 5)));
  const l = sub(grip, s.shoulderL);
  const r = sub(string, s.shoulderR);
  const hands: P = { ...body, lhIn: 1, lhx: l[0], lhy: l[1], lhz: l[2], rhIn: 1, rhx: r[0], rhy: r[1], rhz: r[2], wAz: 0, wEl: el, wRoll: 0, draw: pull, prop };
  const slack = 1 - Math.min(1, pull);
  const re = elbowFor(MB, { ...q, ...hands }, false, add(add(mul(aim, -(0.3 + 0.7 * (1 - slack))), [0, 0, -0.35 * (1 - slack) - 0.6 * slack]), mul(s.chest[1], -0.7 * slack)), MK_BASE.re);
  const le = elbowFor(MB, { ...q, ...hands }, true, add(mul(s.chest[0], 1), [0, 0, -0.4]), MK_BASE.le);
  return { ...hands, re, le };
}
/** THE MOMENT THE STRING GOES (as `loosedBow`): the string hand flung back past his skull (`back`), the bow pushed on (`kick`) and rocked forward in his hand (`rock` degrees); the string empty, his fingers open. */
function mkLoosed(body: P, el: number, back: number, kick: number, rock: number, prop = MK_LET_GO): P {
  const d = mkDrawn(body, el, 1);
  const aim = heading(0, el);
  return {
    ...d,
    lhx: (d.lhx ?? 0) + aim[0] * kick, lhz: (d.lhz ?? 0) + aim[2] * kick,
    rhx: (d.rhx ?? 0) - aim[0] * back, rhy: (d.rhy ?? 0) - 1.8, rhz: (d.rhz ?? 0) - aim[2] * back - back * 1.0,
    wEl: el - rock, draw: 0, prop,
  };
}
/** Where the mouth of his quiver is, on his back behind his right shoulder. */
function quiverMouth(s: Skeleton): V3 {
  return at3(s.ribs, s.chest, -(MB.ribDeep + 2.6), -MB.shoulderHalf * 0.55, MB.chest + 3.6);
}
/** His right hand at his quiver's mouth (`pulled` 0), or drawn up out of it with an arrow (1). */
function mkReach(body: P, pulled: number): P {
  const q: Bones = { ...MK_BASE, ...body };
  const s = solve(MB, q);
  const hand = add(quiverMouth(s), add(mul(s.chest[2], 1.4 + 6.5 * pulled), mul(s.chest[0], 0.6 - 1.2 * pulled)));
  const r = sub(hand, s.shoulderR);
  return { rhIn: 1, rhx: r[0], rhy: r[1], rhz: r[2], re: 40 + 20 * pulled };
}

/** THE MARKSMAN AS SOLIDS: the skeleton's bones, a head taller; the archers' red hood, its point down his back; a long cloak; his quiver; his great bow, and the arrow on it. */
function marksmanBits(st: Stage, m: Moment): Bit[] {
  const { s, q } = m;
  const B = MB;
  const K = MKK;
  const bits: Bit[] = [];
  const put: Put = (part, piece, shape) => {
    bits.push({ part, piece, shape });
  };
  const [cf, cl, cu] = s.chest;
  const lit = 1 - clamp01(q.out);
  const hand = mkHand(q.prop);
  // (his eyes: burning, and hotter as he draws and holds: `glint`)
  const glare = lit * (1 + 0.8 * clamp01(m.glint));
  const lagRaw = mul(m.come, -1.4);
  const lagLen = len(lagRaw);
  const lag = lagLen > 2.6 ? mul(lagRaw, 2.6 / lagLen) : lagRaw;
  const flare = clamp01(q.gale);
  const wave = m.wind * Math.PI * 2;
  // (a rattle knocks his skull and his cage sideways on their pins; `pt` is the string's throw just after it is let go)
  const knock: V3 = hand === MK_LET_GO ? [0, 0, 0] : mul(cl, q.pt);
  const fallen = m.dying === true && m.t >= MK_CRUMBLE;

  // --- the legs ---
  for (const side of ['L', 'R'] as const) {
    const hip = side === 'L' ? s.hipL : s.hipR;
    const knee = side === 'L' ? s.kneeL : s.kneeR;
    const ankle = side === 'L' ? s.ankleL : s.ankleR;
    const heel = side === 'L' ? s.heelL : s.heelR;
    const toe = side === 'L' ? s.toeL : s.toeR;
    put(`leg${side}`, `leg${side}`, { k: 'rod', a: hip, b: knee, ra: 1.0 * K, rb: 0.85 * K, ramp: BONE, far: true });
    put(`leg${side}`, `leg${side}`, { k: 'ball', c: knee, ax: sphere(1.45 * K), skin: BONE, far: true });
    put(`leg${side}`, `shin${side}`, { k: 'rod', a: knee, b: ankle, ra: 0.85 * K, rb: 0.72 * K, ramp: BONE, far: true });
    put(`leg${side}`, `shin${side}`, { k: 'ball', c: ankle, ax: sphere(1.0 * K), skin: BONE, far: true });
    put(`leg${side}`, `foot${side}`, { k: 'rod', a: add(heel, [0, 0, 0.95 * K]), b: add(toe, [0, 0, 0.75 * K]), ra: 0.95 * K, rb: 0.75 * K, ramp: BONE, far: true });
  }

  // --- the pelvis, the spine, the rib cage ---
  const [hf, hl, hu] = s.hips;
  put('pelvis', 'pelvis', { k: 'ball', c: add(s.pelvis, mul(hu, 0.9 * K)), ax: [mul(hf, 3.1 * K), mul(hl, 4.8 * K), mul(hu, 2.2 * K)], skin: (u, tone) => (u[0] > 0.42 && u[2] < 0.25 && Math.abs(u[1]) > 0.16 && Math.abs(u[1]) < 0.56 ? INK : BONE[tone]) });
  const low = add(s.pelvis, mul(hu, 2.6 * K));
  const backOf = (p: V3, k: number): V3 => add(p, mul(cf, -k));
  for (let i = 0; i < 4; i++) put('spine', 'cage', { k: 'ball', c: lerp3(low, backOf(add(s.ribs, knock), 0.4), (i + 0.5) / 4), ax: sphere(1.12 * K), skin: BONE });
  const neckAt = add(s.neck, knock);
  if (dot(cf, st.eye) < 0.1) {
    put('ribs', 'cage', { k: 'rod', a: backOf(add(s.ribs, knock), 1.6 * K), b: backOf(neckAt, 1.3 * K), ra: 1.0 * K, rb: 0.9 * K, ramp: BONE });
    for (const sg of [1, -1] as const) {
      const c = add(add(add(neckAt, mul(cu, -3.6 * K)), mul(cf, -2.3 * K)), mul(cl, sg * 3.0 * K));
      put('blades', 'cage', { k: 'ball', c, ax: [mul(norm(add(cf, mul(cl, sg * 0.3))), 0.6 * K), mul(cl, 2.0 * K), mul(cu, 2.4 * K)], skin: BONE });
    }
  }
  for (let i = 0; i < BW_RIBS.length; i++) {
    const [down, W, Dp, gap, slope] = BW_RIBS[i];
    const c = add(add(neckAt, mul(cu, -down * K)), mul(cf, Dp * 0.55 * K));
    for (const sg of [1, -1] as const) {
      let last: V3 | null = null;
      for (let k = 0; k <= 6; k++) {
        const th = gap + ((Math.PI - gap) * k) / 6;
        const p = add(add(add(c, mul(cf, Dp * K * Math.cos(th))), mul(cl, sg * W * K * 1.0 * Math.sin(th))), mul(cu, -slope * K * (1 + Math.cos(th)) * 0.5));
        if (last) {
          const midP = mid(last, p);
          const out = sub(midP, add(c, mul(cu, dot(sub(midP, c), cu))));
          if (dot(norm(out), st.eye) > -0.12) put('ribs', 'cage', { k: 'rod', a: last, b: p, ra: 0.72 * K, rb: 0.72 * K, ramp: BONE });
        }
        last = p;
      }
    }
  }
  const sternumTop = add(add(neckAt, mul(cu, -1.0 * K)), mul(cf, 2.8 * 1.5 * K));
  const sternumLow = add(add(neckAt, mul(cu, -7.5 * K)), mul(cf, 3.4 * 1.5 * K));
  put('ribs', 'cage', { k: 'rod', a: sternumTop, b: sternumLow, ra: 0.95 * K, rb: 0.75 * K, ramp: BONE });

  // --- the arms: his left hand closed on the bow's grip; his right on the string, flung open, closed on an arrow, or hanging ---
  for (const side of ['L', 'R'] as const) {
    const sh = side === 'L' ? s.shoulderL : s.shoulderR;
    const el = side === 'L' ? s.elbowL : s.elbowR;
    const hnd = side === 'L' ? s.handL : s.handR;
    const fore = norm(sub(hnd, el), [0, 0, -1]);
    const wrist = add(hnd, mul(fore, -1.1 * K));
    put(`upper${side}`, `arm${side}`, { k: 'ball', c: sh, ax: sphere(1.45 * K), skin: BONE, far: true });
    put(`upper${side}`, `arm${side}`, { k: 'rod', a: sh, b: el, ra: 0.85 * K, rb: 0.75 * K, ramp: BONE, far: true });
    put(`fore${side}`, `fore${side}`, { k: 'ball', c: el, ax: sphere(1.3 * K), skin: BONE, far: true });
    put(`fore${side}`, `fore${side}`, { k: 'rod', a: el, b: wrist, ra: 0.75 * K, rb: 0.66 * K, ramp: BONE, far: true });
    put('ribs', 'cage', { k: 'rod', a: sternumTop, b: add(sh, mul(cu, 0.3)), ra: 0.72 * K, rb: 0.72 * K, ramp: BONE, far: true });
    const closed = side === 'L' || hand === MK_NOCKED || hand === MK_BARE || hand === MK_TAKEN;
    if (closed) put(`fore${side}`, `fore${side}`, { k: 'ball', c: hnd, ax: sphere((side === 'L' ? 1.45 : 1.3) * K), skin: BONE, far: true });
    else {
      // (open: just let go, the finger bones spring apart; or hanging, three finger bones curling)
      put(`fore${side}`, `fore${side}`, { k: 'ball', c: wrist, ax: sphere(1.0 * K), skin: BONE, far: true });
      const acrossH = norm(cross(fore, cu), cl);
      for (const k of [-1, 0, 1]) {
        const base = add(wrist, mul(acrossH, k * 0.75 * K));
        const tip = hand === MK_LET_GO ? add(add(base, mul(fore, 2.4 * K)), mul(acrossH, k * 1.5 * K)) : add(add(base, mul(fore, (2.8 - Math.abs(k) * 0.5) * K)), mul(cf, (0.4 + Math.abs(k) * 0.1) * K));
        put(`fore${side}`, `fore${side}`, { k: 'rod', a: base, b: tip, ra: 0.55 * K, rb: 0.5 * K, ramp: BONE, far: true });
      }
    }
  }

  // --- the neck, the skull in the shade of his hood, and the jaw ---
  for (const k of [0.3, 0.75]) put('neck', 'neck', { k: 'ball', c: add(lerp3(s.neck, s.skull, k), mul(knock, k)), ax: sphere(1.05 * K), skin: BONE });
  const skullAt = add(s.head, knock);
  const face = wornOn(st, s, 26);
  const [ff, fl, fu] = face;
  const eyes = eyesToward(st, s);
  const midDeg = (eyes[0] + eyes[1]) / 2;
  const cran = at3(skullAt, face, -0.4 * MK_K, 0, 1.2 * MK_K);
  const R: V3 = [5.3 * MK_K, 5.1 * MK_K, 4.7 * MK_K];
  // (under the hood his face is in its shade, his brow most: the pink in his sockets burns out of the dark)
  skull(st, put, 'skull', 'skull', cran, face, R, BONE, midDeg, 0, true, 4, (u, tone) => tone - (u[2] > 0.1 ? 2 : 1));
  {
    const midA = midDeg * D;
    const onCran = (az: number, el: number): V3 => norm([Math.cos(az) * Math.cos(el), Math.sin(az) * Math.cos(el), Math.sin(el)]);
    const onSkull = (d: V3, k = 0.97): V3 => add(cran, add(add(mul(ff, d[0] * R[0] * k), mul(fl, d[1] * R[1] * k)), mul(fu, d[2] * R[2] * k)));
    const facingOf = (d: V3): V3 => norm(add(add(mul(ff, d[0] / R[0]), mul(fl, d[1] / R[1])), mul(fu, d[2] / R[2])));
    if (glare > 0.05) {
      for (const d of [onCran(midA - 29 * D, 0.3), onCran(midA + 29 * D, 0.3)]) {
        const p = onSkull(d);
        const n = facingOf(d);
        put('skull', 'skull', { k: 'dot', p, c: glare > 1.45 ? FLAME[4] : glare > 0.5 ? SOCKET : FLAME[1], facing: n, c2: glare > 1.45 ? FLAME[3] : undefined });
        if (dot(n, st.eye) > 0.05) put('skull', 'eyes', { k: 'glow', p, c: SOCKET, r: 4.2 + 3.5 * Math.max(0, glare - 1), a: Math.min(0.85, 0.42 * glare) });
      }
    }
  }
  const hinge = at3(skullAt, face, -1.8 * MK_K, 0, -2.0 * MK_K);
  const open = clamp01(m.jaw ?? 0.12) * 34;
  const jf = about(ff, fl, open);
  const ju = about(fu, fl, open);
  const jawC = add(hinge, add(mul(jf, 3.2 * MK_K), mul(ju, -1.4 * MK_K)));
  put('mouth', 'skull', { k: 'ball', c: at3(skullAt, face, 0.9 * MK_K, 0, -2.3 * MK_K), ax: [mul(ff, 2.0 * MK_K), mul(fl, 2.8 * MK_K), mul(fu, 1.05 * MK_K)], skin: () => INK });
  put('jaw', 'jaw', { k: 'ball', c: jawC, ax: [mul(jf, 2.9 * MK_K), mul(fl, 3.5 * MK_K), mul(ju, 1.35 * MK_K)], skin: BONE });

  // --- his hood: the archers' red, a little bigger than his cranium and turned with it, open in front
  // from the brow down, its rim dark, the dark inside it round his face; at the back it hangs down his
  // nape, and its long point falls down his back ---
  {
    const hc = at3(cran, face, -0.9 * MK_K, 0, 0.7 * MK_K);
    const hr: V3 = [R[0] + 1.6, R[1] + 1.4, R[2] + 1.4];
    const hoodSkin: Skin = (u, tone) => {
      if (u[0] > 0.18 && u[2] < 0.38) return null;
      if (u[0] > 0.02 && u[2] < 0.54) return MK_HOOD[0];
      if (Math.hypot(u[0] + 0.15, u[1] - 0.38, u[2] - 0.86) < 0.2) return INK;
      if (u[0] < -0.35 && Math.abs(u[1]) < 0.06) return MK_HOOD[0];
      return MK_HOOD[tone];
    };
    put('hood', 'skull', { k: 'ball', c: hc, ax: [mul(ff, hr[0]), mul(fl, hr[1]), mul(fu, hr[2])], skin: hoodSkin });
    const ic = at3(cran, face, -0.9 * MK_K - 1.6, 0, 0.7 * MK_K - 0.2);
    put('hood', 'skull', { k: 'ball', c: ic, ax: [mul(ff, hr[0] - 1.1), mul(fl, hr[1] - 0.15), mul(fu, hr[2] - 0.3)], skin: (u) => (u[0] < -0.05 ? null : INK) });
    const nape = add(lerp3(neckAt, skullAt, 0.45), mul(ff, -(R[0] * 0.55)));
    put('hood', 'skull', { k: 'ball', c: nape, ax: [mul(ff, 3.4 * MK_K), mul(fl, R[1] + 0.4), mul(fu, 4.8 * MK_K)], skin: (u, tone) => (Math.abs(u[1]) < 0.06 && u[0] < -0.3 ? MK_HOOD[0] : MK_HOOD[tone]) });
    // (its point: out from the back of the crown, then falling down his back, left behind as he moves)
    const base = at3(hc, face, -hr[0] * 0.6, 0, hr[2] * 0.62);
    let last = base;
    const n = 5;
    for (let i = 1; i <= n; i++) {
      const k = i / n;
      const sway = Math.sin(wave + k * 2.4) * (0.5 + 1.6 * flare) * k;
      const p = add(base, add(add(mul(ff, -(3.0 * k + 1.2 * k * k) * MK_K), mul(fl, sway)), add(mul(fu, (1.2 * k - 12.5 * k * k) * MK_K), mul(lag, 1.4 * k))));
      put('hoodtail', 'skull', { k: 'rod', a: last, b: p, ra: 2.4 * (1 - (i - 1) / n) + 0.45, rb: 2.4 * (1 - k) + 0.45, ramp: MK_HOOD });
      last = p;
    }
  }

  // --- his long cloak: from his shoulders down his back to his calves, a deeper red, torn at the hem;
  // left behind as he goes, stirring as he stands; fallen, a heap where he stood ---
  {
    const f = norm([s.hips[0][0], s.hips[0][1], 0], [1, 0, 0]);
    const l: V3 = [-f[1], f[0], 0];
    if (!fallen) {
      const top: Ring = { c: add(add(neckAt, mul(cu, -1.0)), mul(cf, -0.5)), u: mul(cf, B.ribDeep + 1.6), v: mul(cl, B.shoulderHalf + 1.5) };
      const midR: Ring = { c: add(add(lerp3(s.waist, s.ribs, 0.3), mul(lag, 0.4)), mul(f, -0.7)), u: mul(f, B.ribDeep + 2.6), v: mul(l, B.ribHalf + 3.6) };
      const hz = Math.max(4, s.pelvis[2] - B.thigh - 4.0) + 3.0 * flare;
      const hcl: V3 = [s.pelvis[0] - 2.4 * f[0] + lag[0] * 2.0, s.pelvis[1] - 2.4 * f[1] + lag[1] * 2.0, hz];
      const wide = (B.ribHalf + 5.2) * (1 + 0.3 * flare);
      const deep = (B.ribDeep + 3.6) * (1 + 0.35 * flare);
      const pts: V3[] = [];
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * Math.PI * 2;
        const rear = Math.max(0, -Math.cos(a));
        const p0 = add(hcl, add(mul(f, Math.cos(a) * deep), mul(l, Math.sin(a) * wide)));
        pts.push(add(p0, add(mul(f, -rear * (1.6 + 2.4 * clamp01(len(m.come) / FR / 60))), [0, 0, Math.sin(wave + a * 2) * (0.7 + 1.4 * flare) + rear * 1.0])));
      }
      const hem: Ring = { c: hcl, u: mul(f, deep), v: mul(l, wide), pts };
      put('cloak', 'cloak', { k: 'cloth', rings: [top, midR, hem], ramp: MK_CLOAK, look: { arc: [80, 280], folds: [125, 155, 205, 235], lift: 0.12 }, torn: MK_CLOAK_TORN });
    } else {
      const at: V3 = [s.pelvis[0] - 1, s.pelvis[1], 0];
      put('heap', 'heap', { k: 'cloth', rings: [{ c: add(at, [0, 0, 3.2]), u: mul(f, 5.0), v: mul(l, 6.0) }, { c: add(at, [0, 0, 0.6]), u: mul(f, 9.5), v: mul(l, 11.0) }], ramp: MK_CLOAK, look: { folds: [30, -40, 100, -120, 200], lift: 0.4 }, torn: MK_CLOAK_TORN });
    }
  }

  // --- his quiver, slung on his back over the cloak: long, of the archers' plum leather, its mouth
  // behind his right shoulder, five long arrows standing out of it fletched in pink ---
  {
    const mouth = add(quiverMouth(s), knock);
    const foot = add(at3(s.ribs, s.chest, -(B.ribDeep + 2.4), B.shoulderHalf * 0.25, -7.0), knock);
    const up = norm(sub(mouth, foot));
    put('quiver', 'quiver', { k: 'rod', a: foot, b: mouth, ra: 1.5 * MK_K, rb: 1.85 * MK_K, ramp: PLUM });
    put('quiver', 'quiver', { k: 'rod', a: add(mouth, mul(up, -1.6)), b: add(mouth, mul(up, -0.6)), ra: 2.0 * MK_K, rb: 2.0 * MK_K, ramp: dim(PLUM) });
    put('quiver', 'quiver', { k: 'ball', c: mouth, ax: [mul(cf, 2.0 * MK_K), mul(cl, 2.0 * MK_K), mul(up, 0.5)], skin: () => INK });
    for (let i = 0; i < 5; i++) {
      const k = i - 2;
      const from = add(mouth, add(mul(cl, k * 0.7), mul(cf, Math.abs(k) % 2 === 0 ? 0.3 : -0.4)));
      const fan = norm(add(up, mul(cl, k * 0.22)));
      const mid3 = add(from, mul(fan, 1.8));
      const tip = add(from, mul(fan, 6.0 + (k === 0 ? 1.0 : Math.abs(k) === 1 ? 0.5 : 0)));
      // (each arrow whole, its shaft down inside the quiver where it is not seen: so that it spills out whole when he falls)
      put('shafts', `arrow${i}`, { k: 'thread', a: add(foot, mul(up, 1.4)), b: from, c: MK_SHAFT, lift: 0 });
      put('fletch', `arrow${i}`, { k: 'thread', a: from, b: mid3, c: MK_SHAFT, lift: 0.3 });
      put('fletch', `arrow${i}`, { k: 'thread', a: mid3, b: tip, c: PINK[i % 2 ? 2 : 3], lift: 0.3 });
      put('fletch', `arrow${i}`, { k: 'thread', a: add(mid3, mul(cf, 0.5)), b: add(tip, mul(cf, 0.5)), c: PINK[3], lift: 0.3 });
    }
  }

  // --- his great bow, and what is on its string ---
  greatBowBits(st, m, hand, put);

  // --- THE SHOT GOES: a flash at the bow and a streak out along the arrow's way, for an instant (his
  // great shot's in pink and gold, as bright as the light it had gathered; a plain shot's a pale puff) ---
  if (hand === MK_LET_GO && m.since !== undefined && m.since >= 0 && m.since < 0.2) {
    const k = m.since / 0.2;
    const p3 = s.point;
    const front = add(s.handL, mul(p3, 2.5));
    const great = m.charge > 0.05;
    if (great) {
      const g = m.charge;
      put('flash', 'flash', { k: 'glow', p: front, c: SOCKET, r: 7 + 9 * g * (1 - k), a: Math.min(0.9, 0.85 * g * (1 - k)) });
      // (a ring of sparks thrown out round the bow, square to the shot)
      const e1 = norm(cross(p3, [0, 0, 1]), [0, 1, 0]);
      const e2 = cross(e1, p3);
      for (let i = 0; i < 12; i++) {
        if (hash(i, 3, 61) < k * 0.9) continue;
        const a = (i / 12) * Math.PI * 2;
        const r = 2 + 9 * Math.sqrt(k);
        put('flash', 'flash', { k: 'mote', p: add(front, add(mul(e1, Math.cos(a) * r), add(mul(e2, Math.sin(a) * r), mul(p3, 2 * k)))), c: k < 0.4 ? FLAME[4] : FLAME[3], size: k < 0.3 && i % 3 === 0 ? 2 : 1 });
      }
      // (and the streak: where the arrow went, out ahead of him, bright at its head and fading behind)
      const reach = 10 + 70 * Math.min(1, k * 3);
      const tail = Math.max(0, reach - 34);
      for (let d = tail; d < reach; d += 0.8) {
        const w = (d - tail) / Math.max(1, reach - tail);
        if (hash(Math.round(d * 3), 1, 63) > 0.35 + 0.65 * w - k * 0.4) continue;
        put('flash', 'flash', { k: 'mote', p: add(front, mul(p3, d)), c: w > 0.8 ? FLAME[4] : w > 0.45 ? FLAME[3] : FLAME[2], size: w > 0.85 && k < 0.5 ? 2 : 1 });
      }
    } else if (k < 0.6) {
      for (let i = 0; i < 4; i++) put('flash', 'flash', { k: 'mote', p: add(front, add(mul(p3, 1.5 + i * 2.2 + 6 * k), [0, 0, (hash(i, 1, 67) - 0.5) * 1.6])), c: i < 2 ? BONE[3] : BONE[2], size: 1 });
    }
  }

  // --- HIS BOW SNAPS (dying): splinters burst from the break and fall ---
  if (m.dying === true && m.t >= MK_SNAP && m.t < MK_SNAP + 0.45) {
    const k = (m.t - MK_SNAP) / 0.45;
    const brk = add(s.handL, mul(s.across, 3.0));
    // (a flash at the break, for an instant)
    if (k < 0.16) put('snap', 'snap', { k: 'glow', p: brk, c: BONE[3], r: 7 * (1 - k / 0.16) + 3, a: 0.6 * (1 - k / 0.16) });
    for (let i = 0; i < 22; i++) {
      if (hash(i, 9, 71) < k * 0.75) continue;
      const a = (i / 22) * Math.PI * 2 + hash(i, 1, 71);
      const r = (3 + 10 * hash(i, 2, 71)) * Math.sqrt(k);
      const z = (3 + 9 * hash(i, 3, 71)) * k - 30 * k * k;
      put('snap', 'snap', { k: 'mote', p: add(brk, [Math.cos(a) * r, Math.sin(a) * r, z]), c: i % 3 === 0 ? BONE[3] : i % 3 === 1 ? MK_WOOD[3] : BONE[2], size: i % 3 === 0 && k < 0.5 ? 2 : 1 });
    }
  }
  return bits;
}

/**
 * HIS GREAT BOW in his left hand (as the archers' `bowBits`, bigger): its two limbs of near-black
 * wood bent from the grip to the tips, drawn back as the string comes; ears of bone at its tips,
 * curving forward; red cord bound round its grip; the string, to the fingers that hold it; the arrow
 * on it, whose head turns to a spark as it is drawn, or, his great shot's, burns from pink to gold
 * with the light it gathers (`charge`) and drips embers. SNAPPED, it is two pieces: the upper limb,
 * broken off above the grip (it flies), and the lower with the grip, its string hanging loose.
 */
function greatBowBits(st: Stage, m: Moment, hand: number, put: Put): void {
  const { s, q } = m;
  void st;
  const grip = s.handL;
  const p3 = s.point;
  const ac = s.across;
  const drawn = hand === MK_NOCKED || hand === MK_BARE;
  const draw = drawn ? Math.max(0, Math.min(1.3, q.draw)) : 0;
  const snapped = hand === MK_SNAPPED;
  const tipOf = (side: 1 | -1): V3 => add(grip, add(mul(ac, side * GB_HALF * (1 - 0.1 * draw)), mul(p3, -(GB_BRACE + 3.4 * draw))));
  const limbAt = (side: 1 | -1, k: number): V3 => {
    const ctl = add(grip, add(mul(ac, side * GB_HALF * 0.72), mul(p3, 1.8 - 0.6 * draw)));
    const t = tipOf(side);
    return add(add(mul(grip, (1 - k) * (1 - k)), mul(ctl, 2 * k * (1 - k))), mul(t, k * k));
  };
  /** Where a limb breaks when the bow snaps: this far along it from the grip. */
  const BREAK = 0.12;
  for (const side of [1, -1] as const) {
    const piece = snapped && side === 1 ? 'bowUp' : 'bow';
    const from = snapped && side === 1 ? BREAK + 0.03 : 0;
    let last = limbAt(side, from);
    for (let i = 1; i <= 8; i++) {
      const k = from + ((1 - from) * i) / 8;
      const pt = limbAt(side, k);
      const k0 = from + ((1 - from) * (i - 1)) / 8;
      put('bow', piece, { k: 'rod', a: last, b: pt, ra: 1.9 - 0.95 * k0, rb: 1.9 - 0.95 * k, ramp: MK_WOOD });
      last = pt;
    }
    // (its ear of bone, curving forward from the tip, a knob at its end)
    const tip = tipOf(side);
    const ear = add(tip, add(mul(ac, side * 1.6), mul(p3, GB_EAR)));
    const earMid = add(tip, add(mul(ac, side * 1.9), mul(p3, GB_EAR * 0.45)));
    put('bow', piece, { k: 'rod', a: tip, b: earMid, ra: 1.25, rb: 1.0, ramp: BONE });
    put('bow', piece, { k: 'rod', a: earMid, b: ear, ra: 1.0, rb: 0.55, ramp: BONE });
    put('bow', piece, { k: 'ball', c: ear, ax: sphere(0.85), skin: BONE });
    if (snapped) {
      // (the broken ends: splinters standing out of each)
      const end = limbAt(side, side === 1 ? BREAK + 0.03 : BREAK);
      for (let j = -1; j <= 1; j++) {
        const sp = add(end, add(mul(ac, side * -(1.2 + 0.6 * Math.abs(j))), mul(p3, j * 0.7)));
        put('bow', piece, { k: 'rod', a: end, b: sp, ra: 0.6, rb: 0.2, ramp: j === 0 ? BONE : MK_WOOD });
      }
    }
  }
  // the cord bound round the grip, in bands of red
  for (let i = 0; i < 3; i++) {
    const a = add(grip, mul(ac, -2.4 + i * 1.6));
    const b = add(grip, mul(ac, -2.4 + (i + 1) * 1.6));
    put('bow', 'bow', { k: 'rod', a, b, ra: 2.1, rb: 2.1, ramp: i % 2 ? MK_HOOD : dim(MK_HOOD) });
  }
  // the string: to the fingers that hold it, or straight; for the instant after it is let go, flung forward; snapped, hanging loose from the lower tip
  const top = tipOf(1);
  const bot = tipOf(-1);
  const rest = add(grip, mul(p3, -GB_BRACE));
  if (snapped) {
    const hangTo = add(add(rest, mul(ac, -6)), [0, 0, -4]);
    put('string', 'bow', { k: 'thread', a: bot, b: hangTo, c: MK_STRING, lift: 0.2 });
    return;
  }
  if (drawn) {
    put('string', 'bow', { k: 'thread', a: top, b: s.handR, c: MK_STRING, lift: 0.2 });
    put('string', 'bow', { k: 'thread', a: s.handR, b: bot, c: MK_STRING, lift: 0.2 });
  } else {
    const mid3 = hand === MK_LET_GO ? add(rest, mul(p3, q.pt)) : rest;
    put('string', 'bow', { k: 'thread', a: top, b: mid3, c: MK_STRING, lift: 0.2 });
    put('string', 'bow', { k: 'thread', a: mid3, b: bot, c: MK_STRING, lift: 0.2 });
  }
  // the arrow: on the string under his fingers, along the way the bow points; or in his hand, taken from the quiver
  let nock: V3;
  let way: V3;
  if (hand === MK_NOCKED) {
    nock = s.handR;
    way = p3;
  } else if (hand === MK_TAKEN) {
    way = heading(q.pAz, q.pEl);
    nock = add(s.handR, mul(way, -1.4));
  } else return;
  const head = add(nock, mul(way, GB_ARROW));
  const fl = norm(cross(way, ac), [0, 1, 0]);
  const great = m.charge > 0.02;
  put('arrow', 'arrow', { k: 'thread', a: add(nock, mul(way, 1.2)), b: add(head, mul(way, -2.0)), c: great ? MK_WOOD[2] : MK_SHAFT, lift: 0.35 });
  for (const side of [1, -1]) put('arrow', 'arrow', { k: 'thread', a: add(add(nock, mul(way, 0.4)), mul(fl, side * 0.7)), b: add(add(nock, mul(way, 4.0)), mul(fl, side * 0.35)), c: PINK[side > 0 ? 3 : 2], lift: 0.35 });
  const neck = add(head, mul(way, -2.0));
  if (great) {
    // HIS GREAT ARROW: a broad head that gathers light, pink burning to gold, and drips embers
    const g = clamp01(m.charge);
    put('arrow', 'arrow', { k: 'thread', a: neck, b: add(head, mul(way, -0.7)), c: g > 0.55 ? FLAME[3] : SOCKET, lift: 0.4 });
    put('arrow', 'arrow', { k: 'thread', a: add(neck, mul(fl, 0.6)), b: add(head, mul(way, -0.4)), c: g > 0.75 ? FLAME[4] : FLAME[2], lift: 0.4 });
    put('arrow', 'arrow', { k: 'thread', a: add(head, mul(way, -0.6)), b: head, c: g > 0.35 ? FLAME[4] : FLAME[3], lift: 0.45 });
    put('arrow', 'charge', { k: 'glow', p: head, c: SOCKET, r: 4 + 9 * g, a: 0.25 + 0.55 * g });
    if (g > 0.3) {
      for (let i = 0; i < 6; i++) {
        const life = (m.t * 1.7 + hash(i, 1, 59)) % 1;
        const p = add(add(head, mul(way, -1.2 * hash(i, 2, 59))), [(hash(i, 3, 59) - 0.5) * 1.6, (hash(i, 4, 59) - 0.5) * 1.6, -life * 9]);
        if (hash(i, 5, 59) > g) continue;
        put('arrow', 'charge', { k: 'mote', p, c: life < 0.4 ? FLAME[4] : life < 0.7 ? FLAME[3] : FLAME[2], size: 1 });
      }
    }
    return;
  }
  // a plain arrow's head: rusted; drawn, a spark of the enemy's pink burning to gold, spitting at full draw
  const hot = Math.max(0, Math.min(1, (draw - 0.25) / 0.6));
  const spits = draw >= 0.98 && Math.floor(m.t * 30 + 1e-6) % 2 === 1;
  if (hot > 0.05) {
    put('arrow', 'arrow', { k: 'thread', a: neck, b: add(head, mul(way, -0.6)), c: SOCKET, lift: 0.4 });
    put('arrow', 'arrow', { k: 'thread', a: add(head, mul(way, -0.5)), b: head, c: FLAME[spits ? 4 : 3], lift: 0.4 });
    put('arrow', 'charge', { k: 'glow', p: head, c: SOCKET, r: 4 + hot * 5 + (spits ? 1.5 : 0), a: 0.25 + hot * 0.3 + (spits ? 0.1 : 0) });
  } else {
    put('arrow', 'arrow', { k: 'thread', a: neck, b: head, c: RUST[2], lift: 0.4 });
    put('arrow', 'arrow', { k: 'thread', a: add(head, mul(way, -0.5)), b: head, c: RUST[3], lift: 0.45 });
  }
}

/** STILL AND PATIENT (his pick by 14:32): twenty-four tenths of a second round. Resting on his great bow, he does not move; his head turns slowly to look along his left, holds there, comes back past straight and settles. Only his cloak stirs. */
function mkStill(): Motion {
  return {
    loop: 0,
    keys: [
      { at: 0, pose: {} },
      { at: 0.8, pose: mkRest({ faceTurn: 30, faceUp: 0, faceTilt: -2, pz: -0.5 }), ease: 'io' },
      { at: 1.3, pose: mkRest({ faceTurn: 31, faceUp: 0, faceTilt: -2, pz: -0.5 }), ease: 'lin' },
      { at: 1.9, pose: mkRest({ faceTurn: -10, faceUp: 3, faceTilt: 1 }), ease: 'io' },
      { at: 2.4, pose: {}, ease: 'io' },
    ],
  };
}
/** His jaw: shut, but for a clack now and then. */
function mkStillJaw(t: number): number {
  const i = Math.floor((((t % 2.4) + 2.4) % 2.4) * 10 + 1e-6);
  return i === 20 ? 0.0 : i === 21 ? 0.35 : 0.08;
}

/**
 * HIS WALK: eight frames at ten a second, painted for 1.5 tiles a second (shown faster or slower for
 * another pace, `walkFpsAt`). Upright and unhurried, long smooth steps, no lurch; his bow carried off
 * the floor at his left side, his right arm swinging a little; his cloak and his hood's point
 * streaming back. A foot that is down stays where it is on the floor.
 */
const MK_WALK_FRAMES = 8;
const MK_WALK_FPS = 10;
export const MARKSMAN_PACE = 1.5;
function mkStalk(): Motion {
  const R = MK_BASE;
  const n = MK_WALK_FRAMES;
  const d = (MARKSMAN_PACE * TILE3) / MK_WALK_FPS;
  const half = 2 * d;
  const SW = [0.22, 0.55, 0.85];
  const SZ = [2.2, 3.2, 1.6];
  const foot = (j: number): [number, number] => (j <= 4 ? [half - d * j, 0] : [-half + 2 * half * SW[j - 5], SZ[j - 5]]);
  const keys: Key3[] = [];
  for (let i = 0; i <= n; i++) {
    const j = i % n;
    const a = (j / n) * Math.PI * 2;
    const [rx, rz] = foot(j);
    const [lx, lz] = foot((j + 4) % n);
    const body: P = {
      px: 0.6, py: -0.6 * Math.sin(a), pz: -1.0 - 0.8 * Math.cos(2 * a),
      yaw: R.yaw + 3 * Math.cos(a), twist: -2 * Math.cos(a), pitch: 3 + 0.6 * Math.cos(2 * a), bend: 2,
      roll: 1.6 * Math.sin(a), side: 0.8 * Math.sin(a),
      faceUp: 2, faceTurn: -1.5 * Math.cos(a), faceTilt: -1 * Math.sin(a),
      rfx: rx, rfz: rz, rfy: -2.2, rft: -10, rk: -8, rfp: rz > 0 ? 10 : j === 0 ? -4 : 0,
      lfx: lx, lfz: lz, lfy: 2.2, lft: 10, lk: 8, lfp: lz > 0 ? 10 : j === 4 ? -4 : 0,
      rhIn: 0, rhx: 0.6 - 2.4 * Math.cos(a), rhy: -1.8, rhz: MK_HANG + 1.0 + 0.8 * Math.max(0, -Math.cos(a)), re: 8,
    };
    keys.push({ at: i / MK_WALK_FPS, ease: 'lin', pose: mkCarry(body, Math.cos(a)) });
  }
  return { keys, loop: 0 };
}

/** How he stands to shoot: his front (left) foot toward the mark, side-on to it, upright. */
const MK_SET: P = { px: 0.8, pz: -1.2, yaw: -40, pitch: 0, roll: 0, twist: -36, bend: 0, side: 0, faceTurn: 0, faceUp: 0, faceTilt: 2, lfx: 5.8, lfy: 1.2, lfz: 0, lft: 4, lk: 6, rfx: -3.8, rfy: -1.0, rfz: 0, rft: -44, rk: -26 };
const MK_AIM = -2;
/** The moment his plain shot goes (its rules are the main chat's). */
export const MK_SHOT_HIT = 0.7;
/**
 * HIS SHOT, as his archers shoot (`loose`), slower and steadier: the bow lifted off the floor and
 * brought up as he turns side-on, his hand to the string with an arrow on it; one long pull to his
 * jaw; held, still but for the tremble of old bone under the strain, the arrowhead spitting (the
 * warning: the pose); then the string goes, the bow kicks, the string thrums; he watches it go, and
 * sets the bow down on its tip again.
 */
function mkShot(): Motion {
  const H = MK_SHOT_HIT;
  const tw = MK_SET.twist ?? 0;
  const hold = (n: number, twist: number, el: number, pull: number): Key3 => ({ at: n * FR, pose: mkDrawn({ ...MK_SET, twist: tw + twist }, MK_AIM + el, pull), ease: 'hold' });
  return {
    hit: H,
    keys: [
      { at: 0, pose: {} },
      { at: 4 * FR, pose: mkDrawn({ px: 0.4, pz: -0.8, yaw: -26, twist: -20, lfx: 4.0, lft: 6, rfx: -2.8, rft: -30, rk: -16 }, MK_AIM - 16, 0.08), ease: 'out' },
      { at: 11 * FR, pose: mkDrawn(MK_SET, MK_AIM, 1), ease: 'io' },
      hold(13, -0.6, 0.3, 1.01),
      hold(15, -1, -0.2, 1.02),
      hold(17, -0.8, 0.3, 1.03),
      hold(19, -1.2, -0.3, 1.04),
      { at: H, pose: { ...mkLoosed({ ...MK_SET, twist: tw - 5 }, MK_AIM, 4.0, 1.8, 10), pt: 3.2 }, ease: 'hold' },
      { at: H + 2 * FR, pose: { ...mkLoosed({ ...MK_SET, twist: tw - 6 }, MK_AIM, 4.6, 1.2, 7), pt: -1.4 }, ease: 'out' },
      { at: H + 4 * FR, pose: { ...mkLoosed({ ...MK_SET, twist: tw - 6 }, MK_AIM, 4.4, 1.0, 6), pt: 0.6 }, ease: 'lin' },
      { at: H + 6 * FR, pose: { ...mkLoosed({ ...MK_SET, twist: tw - 6 }, MK_AIM, 4.3, 0.9, 5), pt: 0 }, ease: 'lin' },
      { at: H + 0.3, pose: mkCarry({ px: 0.4, pz: -0.8, yaw: -18, twist: -10, lfx: 3.4, rfx: -2.6, rft: -26, rk: -14 }), ease: 'io' },
      { at: H + 0.55, pose: {}, ease: 'io' },
    ],
  };
}
function mkShotJaw(t: number): number {
  const H = MK_SHOT_HIT;
  if (t < 4 * FR) return 0.08 * (1 - t / (4 * FR));
  if (t < H - 1e-6) return 0;
  if (t < H + 3 * FR) return 0.55;
  if (t < H + 0.3) return 0.3;
  return 0.08;
}

/** The moment his great shot goes (its rules, and what it pierces, are the main chat's). */
export const MK_PIERCE_HIT = 1.6;
/** Planted for it: his feet wider, lower, side-on. */
const MK_PLANT: P = { ...MK_SET, px: 0.6, pz: -2.6, twist: -38, lfx: 7.0, lfy: 1.6, lk: 12, rfx: -5.0, rfy: -1.4, rk: -30 };
/**
 * HIS GREAT SHOT (his own move, `moves.pierce`): he plants his feet and brings the bow up; reaches back
 * over his right shoulder and draws a long arrow from his quiver, its head already smouldering; swings
 * it down and nocks it; draws the great bow slowly past his jaw toward his ear; and HOLDS, while its
 * head gathers light, pink burning to gold, embers dripping from it and his eyes burning (the
 * warning). Then the string goes: the bow kicks and rocks, his cloak flares, a flash at the bow and a
 * streak along the arrow's way; the string thrums; he holds, watching it go, and sets the bow down.
 */
function mkPierce(): Motion {
  const H = MK_PIERCE_HIT;
  const tw = MK_PLANT.twist ?? 0;
  const ready = mkDrawn(MK_PLANT, MK_AIM - 10, 0, MK_FREE);
  const hold = (at: number, twist: number, el: number, pull: number): Key3 => ({ at, pose: { ...mkDrawn({ ...MK_PLANT, twist: tw + twist }, MK_AIM + el, pull) }, ease: 'hold' });
  return {
    hit: H,
    keys: [
      { at: 0, pose: {} },
      // (the bow up, his hand back over his shoulder to the quiver)
      { at: 0.22, pose: { ...ready, ...mkReach(MK_PLANT, 0), prop: MK_FREE, pAz: -170, pEl: -60 }, ease: 'out' },
      { at: 0.24, pose: { ...ready, ...mkReach(MK_PLANT, 0.05), prop: MK_TAKEN, pAz: -170, pEl: -62 }, ease: 'hold' },
      // (an arrow drawn up out of it, and brought over his shoulder, its smouldering head up and forward)
      { at: 0.32, pose: { ...ready, ...mkReach(MK_PLANT, 0.7), prop: MK_TAKEN, pAz: -160, pEl: -40 }, ease: 'out' },
      { at: 0.42, pose: { ...ready, rhIn: 1, rhx: 2.0, rhy: -2.5, rhz: 12.5, re: 70, prop: MK_TAKEN, pAz: -40, pEl: 68 }, ease: 'io' },
      // (and down to the string)
      { at: 0.5, pose: { ...mkDrawn(MK_PLANT, MK_AIM - 6, 0.02, MK_TAKEN), pAz: 0, pEl: MK_AIM - 4 }, ease: 'io' },
      { at: 0.52, pose: mkDrawn(MK_PLANT, MK_AIM - 5, 0.04), ease: 'hold' },
      // (drawn slowly, all the way, past his jaw)
      { at: 0.75, pose: mkDrawn({ ...MK_PLANT, twist: tw - 1 }, MK_AIM - 1, 0.5), ease: 'in' },
      { at: 1.1, pose: mkDrawn({ ...MK_PLANT, twist: tw - 2 }, MK_AIM, 1.18), ease: 'out' },
      // (held)
      hold(1.17, -2.4, 0.3, 1.19),
      hold(1.24, -2.0, -0.2, 1.2),
      hold(1.31, -2.6, 0.3, 1.2),
      hold(1.38, -2.2, -0.3, 1.21),
      hold(1.45, -2.8, 0.3, 1.21),
      hold(1.52, -2.3, -0.3, 1.22),
      // the string goes
      { at: H, pose: { ...mkLoosed({ ...MK_PLANT, twist: tw - 8, pz: -3.2 }, MK_AIM, 6.0, 2.6, 16), pt: 4.4, gale: 0.9 }, ease: 'hold' },
      { at: H + 2 * FR, pose: { ...mkLoosed({ ...MK_PLANT, twist: tw - 9, pz: -3.0 }, MK_AIM, 6.6, 1.8, 12), pt: -2.0, gale: 0.8 }, ease: 'out' },
      { at: H + 4 * FR, pose: { ...mkLoosed({ ...MK_PLANT, twist: tw - 9, pz: -2.9 }, MK_AIM, 6.4, 1.5, 10), pt: 1.2, gale: 0.6 }, ease: 'lin' },
      { at: H + 6 * FR, pose: { ...mkLoosed({ ...MK_PLANT, twist: tw - 9, pz: -2.8 }, MK_AIM, 6.2, 1.4, 9), pt: -0.5, gale: 0.45 }, ease: 'lin' },
      { at: H + 8 * FR, pose: { ...mkLoosed({ ...MK_PLANT, twist: tw - 9, pz: -2.8 }, MK_AIM, 6.1, 1.3, 8), pt: 0, gale: 0.35 }, ease: 'lin' },
      // (held, watching it go; then the bow set down)
      { at: H + 0.45, pose: { ...mkLoosed({ ...MK_PLANT, twist: tw - 8, pz: -2.6 }, MK_AIM, 5.8, 1.2, 6), pt: 0, gale: 0.1 }, ease: 'io' },
      { at: H + 0.78, pose: mkCarry({ px: 0.4, pz: -1.2, yaw: -18, twist: -10, lfx: 3.6, rfx: -2.8, rft: -26, rk: -14 }), ease: 'io' },
      { at: H + 1.05, pose: {}, ease: 'io' },
    ],
  };
}
/** How much light his great arrow has gathered (0 none to 1): smouldering as he takes it, gathering as he draws and holds; after it goes, the flash it leaves. */
function pierceCharge(t: number): number {
  const H = MK_PIERCE_HIT;
  if (t < 0.26) return 0;
  if (t < 0.52) return 0.05 + 0.1 * ((t - 0.26) / 0.26);
  if (t < 1.1) return 0.15 + 0.55 * ((t - 0.52) / 0.58);
  if (t < H) return 0.7 + 0.3 * ((t - 1.1) / (H - 1.1));
  if (t < H + 0.2) return 1;
  return 0;
}
/** His eyes as he shoots: burning up as he draws, hottest as he holds, dying back after. */
function pierceGlare(t: number): number {
  const H = MK_PIERCE_HIT;
  if (t < 0.5) return 0;
  if (t < 1.1) return 0.6 * ((t - 0.5) / 0.6);
  if (t < H) return 0.6 + 0.4 * ((t - 1.1) / (H - 1.1));
  return Math.max(0, 1 - (t - H) / 0.35);
}
function pierceJaw(t: number): number {
  const H = MK_PIERCE_HIT;
  if (t < 0.5) return 0.08;
  if (t < H - 1e-6) return 0;
  if (t < H + 0.12) return 0.7;
  if (t < H + 0.45) return 0.4;
  return 0.12;
}

/** STRUCK: rocked back on his heels, his hand keeping hold of the bow where it stands, his head knocked back, his cloak flaring; then still again. */
function mkStruck(): Motion {
  const R = MK_BASE;
  return {
    keys: [
      { at: 0, pose: {} },
      { at: 0.06, pose: mkRest({ px: -2.4, pz: R.pz - 0.7, pitch: -6, bend: -5, twist: -6, faceUp: 14, faceTilt: -6, gale: 0.8, rhx: -1.5, rhz: MK_HANG + 2.0, pt: 0.8 }), ease: 'out' },
      { at: 0.15, pose: mkRest({ px: -1.4, pz: R.pz - 0.6, pitch: -2, bend: -2, faceUp: 6, gale: 0.35, pt: -0.3 }), ease: 'io' },
      { at: 0.3, pose: {}, ease: 'io' },
    ],
  };
}

/** When, as he dies, his bow snaps; and when he comes apart. */
export const MK_SNAP = 0.5;
const MK_CRUMBLE = 1.0;
/**
 * DYING, HIS BOW SNAPS (his pick by 14:32): a jolt; he heaves the great bow up and drags its string
 * back one last time, with no arrow on it, past his jaw, his bones shaking under the strain; and the
 * bow SNAPS above the grip: the upper limb flies off turning, splinters burst, his string hand is
 * flung back empty. The light goes out of his eyes; he sways, his knees go, and he comes apart, his
 * skull rolling away in its hood, his quiver spilling its arrows, his cloak a heap where he stood.
 */
function mkGiving(): Motion {
  const strain: P = { px: -1.2, pz: -2.0, yaw: -30, twist: -26, pitch: -5, bend: -5, faceUp: 8, lfx: 3.4, lft: 4, rfx: -3.4, rft: -30, rk: -16 };
  const last = (pull: number, more: P = {}): P => mkDrawn({ ...strain, ...more }, 8, pull, MK_BARE);
  const broke = mkLoosed({ ...strain, pz: -2.6, twist: -32, faceUp: 14 }, 8, 7.0, 0.6, -10, MK_SNAPPED);
  const sag: P = { ...broke, px: -0.4, pz: -6, pitch: 10, bend: 16, faceUp: -18, faceTilt: 12, lk: 6, rk: -6, lfx: 2.4, rfx: -1.6, rhIn: 0, rhx: 1.0, rhy: -2.2, rhz: MK_HANG + 1.0, re: 0, out: 0.7, prop: MK_SNAPPED };
  return {
    keys: [
      { at: 0, pose: {} },
      { at: 0.06, pose: mkRest({ px: -1.8, pz: -0.9, pitch: -6, bend: -6, faceUp: 18, faceTilt: 6, gale: 0.9, rhx: -0.5, rhz: MK_HANG + 3, pt: 0.9 }), ease: 'out' },
      { at: 0.22, pose: last(0.5, { pt: -0.4 }), ease: 'out' },
      { at: 0.36, pose: last(1.15, { pt: 0.5 }), ease: 'io' },
      { at: 0.4, pose: last(1.22, { pt: -0.6 }), ease: 'hold' },
      { at: 0.44, pose: last(1.26, { pt: 0.7 }), ease: 'hold' },
      { at: 0.47, pose: last(1.28, { pt: -0.7 }), ease: 'hold' },
      { at: MK_SNAP, pose: { ...broke, pt: 0, gale: 0.7 }, ease: 'hold' },
      { at: MK_SNAP + 0.1, pose: { ...broke, pz: -3.0, faceUp: 6, out: 0.3, gale: 0.5 }, ease: 'out' },
      { at: 0.82, pose: sag, ease: 'in' },
      { at: MK_CRUMBLE, pose: { ...sag, pz: -11.5, pitch: 18, bend: 26, faceUp: -30, lk: 8, rk: -8, out: 1 }, ease: 'in' },
      { at: 1.9, pose: { ...sag, pz: -11.5, pitch: 18, bend: 26, faceUp: -30, lk: 8, rk: -8, out: 1 }, ease: 'hold' },
    ],
  };
}
function givingJaw(t: number): number {
  if (t < 0.06) return 0.12 + t / 0.06;
  if (t < MK_SNAP) return 0.05;
  if (t < MK_SNAP + 0.12) return 0.8;
  return 0.55;
}
/** How each piece of him falls (seconds from the blow): the upper limb of his bow flies when it snaps; the rest when he comes apart. */
const MK_FALLS: Readonly<Record<string, Fall>> = {
  bowUp: { from: MK_SNAP, to: [12, 16], spin: 260, lay: 'axis', hop: 3.2, rise: 14 },
  bow: { from: MK_CRUMBLE + 0.02, to: [7, 8], spin: 40, lay: 'axis', hop: 1.2 },
  skull: { from: MK_CRUMBLE + 0.16, to: [9, -7], spin: 50, lay: 'keep', hop: 1.4, pile: 0.6 },
  jaw: { from: MK_CRUMBLE + 0.12, to: [6, 2], spin: 50, lay: 'keep', hop: 1 },
  quiver: { from: MK_CRUMBLE + 0.06, to: [-10, -6], spin: -50, lay: 'axis', hop: 1.2 },
  armR: { from: MK_CRUMBLE + 0.04, to: [3, -8], spin: -40, lay: 'axis', hop: 1 },
  foreR: { from: MK_CRUMBLE + 0.06, to: [6, -6], spin: 30, lay: 'axis', hop: 0.8 },
  armL: { from: MK_CRUMBLE + 0.04, to: [3, 8], spin: 35, lay: 'axis', pile: 0.8 },
  foreL: { from: MK_CRUMBLE + 0.07, to: [6, 9], spin: -25, lay: 'axis', pile: 1.2 },
  cage: { from: MK_CRUMBLE + 0.09, to: [1, 1], spin: 15, lay: 'axis', hop: 0.8 },
  pelvis: { from: MK_CRUMBLE + 0.11, to: [-2, 1], spin: 0, lay: 'keep' },
  neck: { from: MK_CRUMBLE + 0.08, to: [3, -4], spin: 60, lay: 'axis' },
};

export const MARKSMAN: Mob = {
  id: 'marksman',
  name: 'The Bone Marksman',
  size: 'a yellow pack’s leader: a head taller than his bone archers',
  build: MB,
  stand: { name: 'The Marksman waits', motion: mkStill(), rest: MK_REST, jaw: mkStillJaw },
  attack: { name: 'The Marksman shoots', motion: mkShot(), rest: MK_REST, jaw: mkShotJaw, glint: (t) => (t > 11 * FR && t < MK_SHOT_HIT ? 0.5 : 0) },
  idleFrames: 24,
  idleFps: 10,
  walk: { name: 'The Marksman stalks', motion: mkStalk(), rest: MK_REST, period: MK_WALK_FRAMES / MK_WALK_FPS, ground: MARKSMAN_PACE * TILE3, jaw: () => 0.1 },
  walkFrames: MK_WALK_FRAMES,
  walkFps: MK_WALK_FPS,
  pace: MARKSMAN_PACE,
  more: {
    pierce: { name: 'The Marksman’s great shot', motion: mkPierce(), rest: MK_REST, jaw: pierceJaw, charge: pierceCharge, glint: pierceGlare, blurAt: MK_PIERCE_HIT },
  },
  reel: { name: 'The Marksman is struck', motion: mkStruck(), rest: MK_REST, jaw: (t) => (t < 0.15 ? 0.6 : 0.2) },
  reelTime: 0.3,
  hit: MK_SHOT_HIT,
  warn: 0.55,
  dieTime: 1.9,
  dying: { name: 'The Marksman’s bow snaps', motion: mkGiving(), rest: MK_REST, jaw: givingJaw },
  aura: { x: CANVAS3.ax - 2, y: CANVAS3.ay - 34, r: 46, color: '#ff3a78', a: 0.13 },
  shadow: 12,
  bits: (st, m) => marksmanBits(st, m),
  fall(piece) {
    const f = MK_FALLS[piece];
    if (f) return f;
    // (his cloak lies where it fell; what flashes and bursts is not a piece of him)
    if (piece === 'cloak' || piece === 'heap' || piece === 'snap' || piece === 'flash' || piece === 'charge' || piece === 'eyes') return null;
    // (his arrows spill out of his quiver round where it falls)
    if (piece.startsWith('arrow')) {
      const i = Number(piece.slice(5)) || 0;
      return { from: MK_CRUMBLE + 0.1 + 0.03 * i, to: [-10 + (hash(i, 1, 73) - 0.5) * 12, -6 + (hash(i, 2, 73) - 0.5) * 12], spin: (hash(i, 3, 73) - 0.5) * 160, lay: 'axis', hop: 0.6 };
    }
    return scatter(piece, MK_CRUMBLE + 0.04, MK_CRUMBLE + 0.16, piece.startsWith('rib') ? 9 : 6, piece === 'pelvis' ? 'flat' : 'axis');
  },
};

/** THE BONE MARKSMAN, as the game holds a monster (see makeShadeArt3). */
export function makeMarksmanArt3(pace = MARKSMAN.pace): ActorArt {
  return { front: mobSet(MARKSMAN, 'front', pace), back: mobSet(MARKSMAN, 'back', pace) };
}

// ---------------------------------------------------------------------------------------------
// For the pictures

export const NEW_MOBS_LIST: ReadonlyArray<Mob> = [SHADE, BONEWARD, GOLEM];

/** A monster `k` of the way through its death (0: as the blow fell; 1: what is left). */
export function deathOfMob(mob: Mob, k: number, view: GameView): Painted {
  return mob.id === 'shade' ? shadeDeath(k, view) : fallApart(mob, k, view);
}

// ---------------------------------------------------------------------------------------------
// As the game holds a monster's pictures (art/actor_types.ts), as makeSkeletonArt3 makes the
// skeleton's: still unused by the game (no rules for them yet: the main chat's).

/** Frames a second of an attack and of a reel (the game's own for what is played once). */
const CLIP_FPS3 = 30;

/** Frames a second of a monster's walk at a pace of `pace` tiles a second: the same frames shown faster or slower, so that its feet still grip the floor. */
export function walkFpsAt(mob: Mob, pace: number): number {
  return (mob.walkFps * pace) / mob.pace;
}

/** A frame as the game holds it: cut down to the figure, with its lights and its pool of light. */
function frameOf3(mob: Mob, which: MobAct | string, t: number, view: GameView): Sprite {
  return toSprite(paintMob(mob, which, t, view), mob.aura, CANVAS3.ax, CANVAS3.ay);
}

function mobSet(mob: Mob, view: GameView, pace: number): AnimSet {
  const idle = lazyFrames(mob.idleFrames, (i) => frameOf3(mob, 'stand', i / mob.idleFps, view));
  const walk = lazyFrames(mob.walkFrames, (i) => frameOf3(mob, 'walk', i / mob.walkFps, view));
  const keys = mob.attack.motion.keys;
  const n = Math.round(keys[keys.length - 1].at * CLIP_FPS3) + 1;
  const attack: Clip = { frames: lazyFrames(n, (i) => frameOf3(mob, 'attack', i / CLIP_FPS3, view)), fps: CLIP_FPS3, hit: mob.hit };
  const pick = (seconds: number): number => Math.max(0, Math.min(n - 1, Math.round(seconds * CLIP_FPS3)));
  const picks = [pick(mob.hit * 0.7), pick(mob.hit + 0.035), pick(((n - 1) / CLIP_FPS3 + mob.hit) / 2)];
  const dieN = Math.round(mob.dieTime * DEATH_FPS) + 1;
  // (a dying thing has no pool of light behind it, and no edge of light round it)
  const die: Clip = { frames: lazyFrames(dieN, (i) => toSprite(deathOfMob(mob, i / (dieN - 1), view), null, CANVAS3.ax, CANVAS3.ay)), fps: DEATH_FPS };
  const rn = Math.round(mob.reelTime * CLIP_FPS3) + 1;
  const reel: Clip = { frames: lazyFrames(rn, (i) => frameOf3(mob, 'reel', i / CLIP_FPS3, view)), fps: CLIP_FPS3 };
  const clips: NonNullable<AnimSet['clips']> = { attack, die, reel };
  if (mob.more) {
    // ITS OTHER MOVES, by name: played once (a blow's `hit` where it lands), or going round (its stand and its walk while its spear is gone)
    const moves: Record<string, Clip> = {};
    for (const [name, mv] of Object.entries(mob.more)) {
      if (mv.motion.loop !== undefined) {
        const walking = mv.ground !== undefined;
        const fps = walking ? walkFpsAt(mob, pace) : mob.idleFps;
        const n2 = walking ? mob.walkFrames : mob.idleFrames;
        const at = walking ? mob.walkFps : mob.idleFps;
        moves[name] = { frames: lazyFrames(n2, (i) => frameOf3(mob, name, i / at, view)), fps, loop: 0 };
      } else {
        const ks = mv.motion.keys;
        const n2 = Math.round(ks[ks.length - 1].at * CLIP_FPS3) + 1;
        const c: Clip = { frames: lazyFrames(n2, (i) => frameOf3(mob, name, i / CLIP_FPS3, view)), fps: CLIP_FPS3 };
        if (mv.motion.hit !== undefined) c.hit = mv.motion.hit;
        moves[name] = c;
      }
    }
    clips.moves = moves;
  }
  return { idle, walk, attack: lazyFrames(3, (i) => attack.frames[picks[i]]), idleFps: mob.idleFps, walkFps: walkFpsAt(mob, pace), clips };
}

/** THE SHADE, in the shape the game holds a monster's pictures in; `pace`: the speed the rules will give it, in tiles a second (its glide is shown to match). */
export function makeShadeArt3(pace = SHADE.pace): ActorArt {
  return { front: mobSet(SHADE, 'front', pace), back: mobSet(SHADE, 'back', pace) };
}
/** THE BONEWARD, as the game holds a monster (see makeShadeArt3). */
export function makeBonewardArt3(pace = BONEWARD.pace): ActorArt {
  return { front: mobSet(BONEWARD, 'front', pace), back: mobSet(BONEWARD, 'back', pace) };
}
/** THE OSSUARY GOLEM, as the game holds a monster (see makeShadeArt3). */
export function makeGolemArt3(pace = GOLEM.pace): ActorArt {
  return { front: mobSet(GOLEM, 'front', pace), back: mobSet(GOLEM, 'back', pace) };
}

/** FOR TESTS AND PICTURES: the bones of a monster at a moment of one of its moves (its four, or one of its others), solved. */
export function skeletonAt(mob: Mob, which: MobAct | string, t: number): Skeleton {
  return solve(mob.build, posedAt(moveOf(mob, which), t));
}

/**
 * WHERE ITS HAND IS `t` seconds into one of its moves: in the figure's own lengths, forward, to its
 * left and up from its floor point (a tile is TILE3 of them along the floor; up, one is a picture
 * pixel). Where what it throws leaves its hand: the Golem's skull (its right), the Boneward's spear
 * (its right); and where the Boneward's hand closes on its spear, picking it up.
 */
export function handAt(mob: Mob, which: MobAct | string, t: number, side: 'L' | 'R' = 'R'): V3 {
  const s = skeletonAt(mob, which, t);
  return side === 'L' ? s.handL : s.handR;
}

// ---------------------------------------------------------------------------------------------
// WHAT THEY THROW (9 Oct). The Golem's skull in flight, painted as its bones are; its shadow and its
// burst, and the Boneward's spear in flight and lying on the floor, are drawn on the floor in the
// game's own pixels (art/mob_shots.ts).

/** THE GOLEM'S SKULL IN FLIGHT: a skull of its bones, turning over and over as it flies (`turn`, 0..1 once round), its eyes lit with the golem's fire, the enemy's edge round it. Its middle is on the anchor. */
export function paintSkullShot(turn: number, view: GameView = 'front'): Painted {
  const st = stage(view);
  const bits: Bit[] = [];
  const put: Put = (part, piece, shape) => {
    bits.push({ part, piece, shape });
  };
  const a = turn * Math.PI * 2;
  const look = faceAlong(norm([Math.cos(a), 0.35, Math.sin(a)]), [Math.sin(a) * -1, 0, Math.cos(a)]);
  skull(st, put, 'shot', 'shot', [0, 0, 0], look, [4.4, 4.0, 3.9], OSSUARY, eyesOf(st, look), 1, true, 5);
  const lights = paintBits(st, bits, [0, 0, 0]);
  return { px: st.whole(ENEMY_RIM), lights };
}
/** The frames of the skull in flight, once round (as the game holds a picture: cut down, its anchor at its middle). */
export const SKULL_SHOT_FRAMES = 8;
export function makeSkullShotArt(): Sprite[] {
  return lazyFrames(SKULL_SHOT_FRAMES, (i) => toSprite(paintSkullShot(i / SKULL_SHOT_FRAMES), null, CANVAS3.ax, CANVAS3.ay));
}
