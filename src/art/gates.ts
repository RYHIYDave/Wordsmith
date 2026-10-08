// DOORS AND GATES: their pictures (game/doors.ts has where they stand and what they do).
//
// The owner, 7 Oct 2026, 14:01: "wrought iron jail style bar doors that swing open, and that same
// bar style for gates going up and down with the spikes on the bottom.  Classic castle style."
// Of the first pictures (two leaves of bars the whole hallway wide, between posts), 16:57: "I’d
// like the gate to have an arch of stone above it.  And I’d like the boss gate to have some sort of
// emblem in the middle of the arch.  And the doors look too much like the gate.  Give them a stone
// outline to make the door smaller than the hallway width.  Have it open from one side, not from
// the middle on both sides". Of an emblem that was the boss's own face, 17:38: "It doesn't have to
// be the same face as the boss, just something carved in stone, maybe with a glove." (read as "a
// glow"; he was told so). And of the mark carved in stone that he was sent then, 17:43: "Better".
// AND TO THE QUESTION "is the look in doors_and_gates_second_look.png right to build?", 17:54 and
// 18:02: "Yes, the new doors and gates look very [good]." ("dim was a slip. It was supposed to
// say they look good.")
//
// What is painted here:
//   A DOOR: a tile wide, in the middle of a doorway of three. Round the opening a FRAME of dressed
//   stone: a square POST at each side of it, and a LINTEL of three stones across their heads. In
//   it ONE LEAF of iron bars with a lock, hung on one post.
//   A GATE: the whole doorway wide, between two stone PILLARS that carry an ARCH of dressed
//   stone. The portcullis runs up behind the arch. THE BOSS'S: a taller, heavier arch, and in the
//   middle of it AN EMBLEM CARVED IN THE STONE: the mark the Warden's maul carries (a lozenge
//   round a point), its cut aglow with the enemy's fire.
//
// Everything that stands flat in an upright plane is painted by (u, v), u picture pixels along the
// plane and v up from the floor, and cut into STRIPS eight pixels wide: each strip is stood at its
// own place in the order of things, so that a figure is in front of the part it is in front of
// and behind the part it is behind.
//
// The grid on the screen, in PICTURE pixels (two to a game pixel): a tile along +x in the world
// is 32 right and 16 down; along +y, 32 left and 16 down; a game pixel of height is 2 up.

import { Px } from '../engine/px';
import type { Sprite } from '../engine/px';
import { VAULT } from './ground';
import type { Theme } from './ground';
import { GRAIN } from './kit';
import { FLAME, IRON } from './mkit';

/**
 * Wrought iron: shadow, body, lit edge, glint (the monsters' iron: art/mkit.ts).
 *
 * THESE TONES, AND THE DRESSED STONE'S BELOW, ARE THE ONES OF THE PICTURES HE SAID YES TO. (At 17:54
 * he wrote "Yes, the new doors and gates look very dim.", and a brighter painting with a light of
 * its own round each door went to him at 17:57; at 18:02: "Yes, dim was a slip. It was supposed to
 * say they look good." So they are as they were, and the brighter painting is not in the game.)
 */
const DARK = IRON[0];
const BODY = IRON[2];
const LIT = IRON[3];
const GLINT = '#b4b0e4';

/** How wide a strip is, in picture pixels: a quarter of a tile. */
export const STRIP = 8;
/** A piece of a flat thing: its picture, and how far along the plane it begins, in tiles from where the thing's own u = 0 is. */
export interface Strip {
  s: Sprite;
  t: number;
}

function mix(a: string, b: string, t: number): string {
  const n = (s: string, i: number): number => parseInt(s.slice(1 + i * 2, 3 + i * 2), 16);
  const h = (i: number): string => Math.round(n(a, i) + (n(b, i) - n(a, i)) * t).toString(16).padStart(2, '0');
  return `#${h(0)}${h(1)}${h(2)}`;
}

/**
 * A thing that stands flat in an upright plane. (u, v): u picture pixels along the plane from
 * where the thing begins (u0 and u1, its ends, are multiples of STRIP), v up from the floor.
 * On the screen a plane along +x runs down to the right and one along +y down to the left, and a
 * row of the thing drops a pixel in every two as the walls' faces do (art/ground.ts, `bottomRow`).
 */
class Flat {
  private readonly col: (string | undefined)[];
  private readonly alpha: Uint8Array;
  readonly wide: number;
  constructor(readonly u0: number, readonly u1: number, readonly high: number) {
    this.wide = u1 - u0;
    this.col = new Array<string | undefined>(this.wide * high);
    this.alpha = new Uint8Array(this.wide * high);
  }
  set(u: number, v: number, c: string, a = 255): void {
    if (u < this.u0 || u >= this.u1 || v < 0 || v >= this.high) return;
    const i = v * this.wide + (u - this.u0);
    this.col[i] = c;
    this.alpha[i] = a;
  }
  has(u: number, v: number): boolean {
    return u >= this.u0 && u < this.u1 && v >= 0 && v < this.high && this.col[v * this.wide + (u - this.u0)] !== undefined;
  }
  /** The row of a strip's picture its anchor is on (a strip is `high + 6` rows). */
  get anchorRow(): number {
    return this.high + 1;
  }
  strips(alongX: boolean): Strip[] {
    const out: Strip[] = [];
    for (let s0 = this.u0; s0 < this.u1; s0 += STRIP) {
      const p = new Px(STRIP, this.high + 6);
      const ay = this.anchorRow;
      let any = false;
      for (let j = 0; j < STRIP; j++) {
        const x = alongX ? j : STRIP - 1 - j;
        const drop = Math.floor((j - 1) / 2);
        for (let v = 0; v < this.high; v++) {
          const i = v * this.wide + (s0 + j - this.u0);
          const c = this.col[i];
          if (c === undefined) continue;
          const y = ay + drop - v;
          p.set(x, y, c);
          if (this.alpha[i] < 255) p.d[(y * p.w + x) * 4 + 3] = this.alpha[i];
          any = true;
        }
      }
      if (any) out.push({ s: p.sprite(alongX ? 0 : STRIP, ay, GRAIN), t: s0 / 32 });
    }
    return out;
  }
}

/** Dressed stone: lighter than the wall it stands in (as the town's gate is: art/ground.ts, `gateAt`). */
interface Stone {
  joint: string;
  dark: string;
  body: string;
  odd: string;
  light: string;
}
/** `lit`: the face turned to screen-left (a plane along +x); else the one in shade. */
function dressed(theme: Theme, lit: boolean): Stone {
  const f = lit ? theme.lit : theme.shade;
  return { joint: f[0], dark: f[2], body: mix(f[4], '#ffffff', lit ? 0.12 : 0.1), odd: f[4], light: mix(f[4], '#ffffff', lit ? 0.42 : 0.3) };
}

// =================================================================================================
// THE DOOR

/** The door's opening: a tile wide; and how high. Its lintel over it. */
export const DOOR_WIDE = 32;
export const DOOR_HIGH = 60;
const LINTEL = 11;

/** How wide each of the two faces of a door's posts is, in picture pixels (a quarter of a tile). */
export const POST = 8;

/**
 * THE LINTEL OF A DOOR'S FRAME: a beam of three stones across the heads of its two posts, and what
 * is seen of its far end. u = 0 where the opening begins (the post the leaf hangs on stands just
 * before it, the other just after the opening's end).
 */
export function makeLintel(theme: Theme, alongX: boolean): Strip[] {
  const st = dressed(theme, alongX);
  const side = dressed(theme, !alongX);
  const L0 = -POST - 2;
  const L1 = DOOR_WIDE + POST + 2;
  const F = new Flat(-16, DOOR_WIDE + 24, DOOR_HIGH + LINTEL + POST + 2);
  // (light from the upper left of the screen: of a plane along +x that is the end it begins at)
  const litEnd = alongX ? L0 : L1 - 1;
  const darkEnd = alongX ? L1 - 1 : L0;
  for (let v = DOOR_HIGH; v < DOOR_HIGH + LINTEL; v++) {
    const up = v - DOOR_HIGH;
    // (the joints of the stones at its two ends lean outward as they rise)
    const ja = 8 - Math.floor(up / 3);
    const jb = DOOR_WIDE - 9 + Math.floor(up / 3);
    for (let u = L0; u < L1; u++) {
      let c = u >= ja && u <= jb ? st.body : st.odd;
      if (u === ja || u === jb) c = st.joint;
      else if (up === 0) c = st.dark;
      else if (up === LINTEL - 1) c = st.light;
      else if (u === litEnd) c = st.light;
      else if (u === darkEnd) c = st.dark;
      else if (alongX ? u === ja + 1 || u === jb + 1 : u === ja - 1 || u === jb - 1) c = st.light;
      F.set(u, v, c);
    }
    // its far end: the beam is as thick as the posts
    for (let k = 1; k <= POST; k++) F.set(L1 - 1 + k, v + k, up === 0 ? side.dark : up === LINTEL - 1 || k === 1 ? side.light : side.body);
  }
  return F.strips(alongX);
}

/**
 * THE LEAF OF A DOOR: iron bars in a frame of iron, with a lock. From its hinge (the sprite's
 * anchor, on the floor) to its free end, which is (ex, ey) picture pixels from the hinge along the
 * floor: so any angle of its swing is the same leaf with its end elsewhere.
 */
export function makeDoorLeaf(ex: number, ey: number, high = DOOR_HIGH - 4): Sprite {
  const pad = 6;
  const w = Math.abs(ex) + pad * 2;
  const h = high + Math.abs(ey) + pad * 2;
  const p = new Px(w, h);
  const ox = ex >= 0 ? pad : pad - ex;
  const oy = high + pad + (ey < 0 ? -ey : 0);
  const N = 4;
  const at = (t: number, up: number): [number, number] => [Math.round(ox + ex * t), Math.round(oy + ey * t - up)];
  // the bars between its stiles
  for (let k = 1; k < N; k++) {
    const [x, y] = at(k / N, 0);
    for (let up = 3; up <= high - 2; up++) {
      p.set(x, y - up, LIT);
      p.set(x + 1, y - up, BODY);
    }
  }
  // its rails: a band at the foot, one at the lock, one at the head
  for (const [up, thick] of [[2, 3], [Math.round(high * 0.46), 2], [high - 3, 3]] as const) {
    for (let q = 0; q < thick; q++) {
      const [x0, y0] = at(0, up + q);
      const [x1, y1] = at(1, up + q);
      p.line(x0, y0, x1, y1, q === thick - 1 ? LIT : q === 0 ? DARK : BODY);
    }
  }
  // its two stiles
  for (const t of [0, 1]) {
    const [x, y] = at(t, 0);
    for (let up = 1; up <= high; up++) {
      p.set(x - 1, y - up, BODY);
      p.set(x, y - up, LIT);
      p.set(x + 1, y - up, BODY);
      p.set(x + 2, y - up, DARK);
    }
    p.set(x, y - high - 1, GLINT);
  }
  // two hinges, on the stile it hangs by
  for (const up of [10, high - 12]) {
    const [x, y] = at(0, up);
    p.rect(x - 3, y - 2, 6, 4, BODY);
    p.hline(x - 3, y - 3, 6, LIT);
    p.hline(x - 3, y + 2, 6, DARK);
  }
  // its lock: a plate on the free stile, a keyhole, a ring to pull it by
  {
    const [x, y] = at(0.86, Math.round(high * 0.46));
    p.rect(x - 3, y - 6, 7, 11, BODY);
    p.hline(x - 3, y - 7, 7, GLINT);
    p.vline(x - 4, y - 6, 11, LIT);
    p.hline(x - 3, y + 5, 7, DARK);
    p.set(x, y - 2, DARK);
    p.set(x, y - 1, DARK);
    p.set(x, y, DARK);
    p.set(x - 1, y - 2, DARK);
    p.set(x + 1, y - 2, DARK);
  }
  return p.sprite(ox, oy, GRAIN);
}

// =================================================================================================
// THE GATE

/** How wide each of a pillar's two faces is, in picture pixels (three eighths of a tile). */
export const PILLAR = 12;
/** A gate with its pillars: u = 0 at the outer edge of the pillar it begins at; the way through is the three tiles between the pillars. */
const SPAN = 96;
const ARCH_WIDE = SPAN + PILLAR * 2;

/** The shape of an arch: where it springs from (the pillars' height), how far its underside rises to its middle, how thick its ring of stones is, how many stones. */
export interface ArchShape {
  spring: number;
  rise: number;
  ring: number;
  stones: number;
}
/** How far a gate goes up, in PICTURE pixels: its spikes hang just over a hero's head (56), under the middle of its arch. */
export const GATE_UP = 60;
/** A gate's arch, and the boss's: taller and heavier. */
export const ARCH: Readonly<ArchShape> = { spring: 40, rise: 42, ring: 10, stones: 13 };
export const ARCH_BOSS: Readonly<ArchShape> = { spring: 44, rise: 48, ring: 14, stones: 13 };

interface Curve {
  /** The middle of the arch along the plane, and the centre its ring is struck from. */
  mid: number;
  vc: number;
  rho: number;
}
function curveOf(a: ArchShape): Curve {
  const r = SPAN / 2;
  const rho = (r * r + a.rise * a.rise) / (2 * a.rise);
  return { mid: ARCH_WIDE / 2, vc: a.spring + a.rise - rho, rho };
}
/** How far a point is from the centre the ring is struck from. */
function reach(c: Curve, u: number, v: number): number {
  return Math.hypot(u + 0.5 - c.mid, v + 0.5 - c.vc);
}
/** Is a point of the plane in the arch's ring of stones? */
function inRing(a: ArchShape, c: Curve, u: number, v: number): boolean {
  if (u < 0 || u >= ARCH_WIDE || v < a.spring) return false;
  const d = reach(c, u, v);
  return d >= c.rho && d < c.rho + a.ring;
}
/** Is a point in the way through: between the pillars, under the arch? */
function inWay(a: ArchShape, c: Curve, u: number, v: number): boolean {
  if (u < PILLAR || u >= PILLAR + SPAN || v < 0) return false;
  return v < a.spring || reach(c, u, v) < c.rho;
}

/**
 * A STONE PILLAR, square, each of its two faces `wide` picture pixels: dressed stone in courses,
 * its foot a little darker, its head a band of lighter stone (what it carries springs from there).
 * Anchored at its front corner, on the floor. A gate's pillars; and, slimmer, a door's posts.
 */
export function makePillar(theme: Theme, high: number, wide = PILLAR): Sprite {
  const HW = wide;
  const p = new Px(HW * 2 + 8, high + 26);
  const cx = HW + 4;
  const base = high + 16;
  const L = dressed(theme, true);
  const R = dressed(theme, false);
  const COURSE = 12;
  for (let dx = -HW; dx < HW; dx++) {
    const left = dx < 0;
    const u = left ? dx + HW : HW - 1 - dx;
    const st = left ? L : R;
    const drop = -HW / 2 + Math.floor((u - 1) / 2);
    for (let v = 0; v < high; v++) {
      const r = v % COURSE;
      let c = Math.floor(v / COURSE) % 2 === 0 ? st.body : st.odd;
      if (r === 0 && v > 0) c = st.joint;
      else if (v >= high - 4) c = v === high - 4 ? st.dark : st.light;
      else if (v < 4) c = v === 3 ? st.light : st.dark;
      else if (r === COURSE - 1) c = st.light;
      else if (dx === -HW) c = st.light;
      else if (dx === HW - 1 || dx === -1) c = st.dark;
      else if (dx === 0) c = st.light;
      p.set(cx + dx, base + drop - v, c);
    }
  }
  return p.sprite(cx, base, GRAIN);
}

/**
 * THE EMBLEM OVER THE BOSS'S GATE: a round boss of stone in the middle of the arch, and cut in it
 * the mark the Warden's maul carries (art/monster_warden.ts, `RUNE`: "a lozenge round a point, an
 * eye that does not shut"). The cut glows with his fire: embers, or (`lit`) alight.
 *
 * The owner, 7 Oct 2026, 17:38, of a first emblem that was the Warden's own horned helm and skull on
 * a plaque of iron: "It doesn't have to be the same face as the boss, just something carved in
 * stone, maybe with a glove." ("glove" is read as "glow": he was told so at 17:39.) Of this one,
 * at 17:43: "Better".
 *
 * What it is at a place, (x, y) from its middle, x along the plane and y up, in its own measure (it
 * is twelve across to its rim); null where it is not. `lightLow`: the light comes from the end of
 * the plane that x counts from (a plane along +x in the world).
 */
function carvedAt(x: number, y: number, st: Stone, lit: boolean, lightLow: boolean): string | null {
  const d = Math.hypot(x, y);
  if (d > 12.4) return null;
  // (how far round toward the light a place is: the rim is lit there and in shade opposite)
  const toLight = y - (lightLow ? x : -x);
  if (d > 11.4) return st.joint;
  if (d > 9.4) return toLight > 5 ? st.light : toLight < -6 ? st.dark : st.body;
  // the mark, cut in the field: a lozenge round a point. (Tall and narrow: the plane slants across the
  // screen, and a lozenge as wide as it is high would be seen there as a leaning square.)
  const A = 4.2;
  const B = 8.6;
  const off = Math.abs(Math.abs(x) / A + Math.abs(y) / B - 1) / Math.hypot(1 / A, 1 / B); // how far from the lozenge's line
  if (off < 0.85) return lit ? (off < 0.4 ? FLAME[4] : FLAME[3]) : FLAME[1];
  if (d < 1.6) return lit ? FLAME[4] : FLAME[2];
  // (alight, the stone about the cut catches its light)
  if (lit && (off < 1.9 || d < 2.8)) return mix(st.odd, FLAME[2], 0.5);
  // the field is sunk a little: in shade under the rim on the side of the light, lit on the far side
  if (d > 8.2) return toLight > 3 ? st.dark : toLight < -3 ? st.light : st.odd;
  return st.odd;
}
/** How much bigger than its own measure the emblem is painted. */
const EMBLEM_SCALE = 1.35;
function paintEmblem(F: Flat, mid: number, vc: number, st: Stone, lit: boolean, lightLow: boolean): void {
  const reach = Math.ceil(13 * EMBLEM_SCALE);
  for (let py = -reach; py <= reach; py++) {
    for (let px = -reach; px <= reach; px++) {
      const c = carvedAt(px / EMBLEM_SCALE, py / EMBLEM_SCALE, st, lit, lightLow);
      if (c) F.set(mid + px, vc + py, c);
    }
  }
}
/** Where the middle of the emblem is over the floor: on the keystone. */
export function emblemMiddle(a: ArchShape): number {
  return a.spring + a.rise + Math.round(a.ring / 2);
}

/**
 * AN ARCH OF DRESSED STONE over a gate, from the outer edge of one pillar to the outer edge of the
 * other. Its ring of stones, their joints fanned, a keystone in the middle; what is seen of its
 * thickness: its underside where that turns toward the eye, and the end of it over the far pillar.
 * Nothing of its top (the walls have none). `emblem`: the mark carved over the boss's gate, its cut in embers or alight.
 */
export function makeArch(theme: Theme, alongX: boolean, a: ArchShape, emblem: 'none' | 'dim' | 'lit'): Strip[] {
  const c = curveOf(a);
  const st = dressed(theme, alongX);
  const side = dressed(theme, !alongX);
  const D = PILLAR;
  const F = new Flat(0, ARCH_WIDE + 16, a.spring + a.rise + a.ring + 30);
  // (where the ring's ends are, as angles round its centre)
  const a0 = Math.atan2(a.spring - c.vc, ARCH_WIDE / 2);
  const sweep = Math.PI - 2 * a0;
  const key = (a.stones - 1) / 2;
  for (let v = a.spring; v < F.high; v++) {
    for (let u = 0; u < F.u1; u++) {
      if (inRing(a, c, u, v)) {
        const du = u + 0.5 - c.mid;
        const d = reach(c, u, v);
        const ang = Math.atan2(v + 0.5 - c.vc, du);
        // (which stone, counted from the end the plane begins at)
        const k = ((Math.PI - a0 - ang) / sweep) * a.stones;
        const stone = Math.max(0, Math.min(a.stones - 1, Math.floor(k)));
        const edge = Math.abs(k - Math.round(k)) * (sweep / a.stones) * d; // pixels from the nearest joint
        let col = stone === key ? st.light : stone % 2 === 0 ? st.body : st.odd;
        if (edge < 0.55 && Math.round(k) > 0 && Math.round(k) < a.stones) col = st.joint;
        else if (d > c.rho + a.ring - 1.5) col = (alongX ? du < c.rho * 0.45 : du > -c.rho * 0.45) ? st.light : st.dark;
        else if (d < c.rho + 1.5) col = (alongX ? du > 6 : du < -6) ? st.light : st.dark;
        else if (v === a.spring) col = st.dark;
        F.set(u, v, col);
        continue;
      }
      // what is seen of its thickness: the same ring, set back by up to D (to the right and up on the plane)
      let hit = 0;
      for (let s = 1; s <= D; s++) {
        if (inRing(a, c, u - s, v - s)) {
          hit = s;
          break;
        }
      }
      if (hit === 0) continue;
      const d = reach(c, u, v);
      if (d < c.rho) {
        // its underside, where it turns toward the eye
        F.set(u, v, hit <= 1 ? side.dark : mix(side.odd, side.dark, 0.35));
      } else if (u >= ARCH_WIDE && inRing(a, c, ARCH_WIDE - 1, v - (u - ARCH_WIDE + 1))) {
        // its end, over the far pillar
        F.set(u, v, u === ARCH_WIDE ? side.light : (v - (u - ARCH_WIDE)) % 12 === 0 ? side.joint : side.body);
      }
    }
  }
  if (emblem !== 'none') paintEmblem(F, Math.floor(c.mid), emblemMiddle(a), st, emblem === 'lit', alongX);
  const out = F.strips(alongX);
  if (emblem === 'lit') {
    // (alight, the mark gives light: on the strip that has the middle of the arch)
    const mid = Math.floor(c.mid);
    const s0 = Math.floor(mid / STRIP) * STRIP;
    const strip = out.find((q) => q.t === s0 / 32);
    if (strip) {
      const j = mid - s0;
      strip.s.lights = [{ x: (alongX ? j : STRIP - 1 - j) / GRAIN, y: (F.anchorRow + Math.floor((j - 1) / 2) - emblemMiddle(a)) / GRAIN, r: 20, color: FLAME[2], a: 0.28 }];
    }
  }
  return out;
}

/**
 * THE PORTCULLIS of a gate, `raise` picture pixels off the floor: uprights every quarter of a tile,
 * each ending in a spike; cross bars. It stands at the BACK of its arch (the playtest stands it
 * there), and what of it is not in the way through is not there: it runs up behind the stones.
 * (u as the arch's: 0 at the outer edge of the pillar it begins at.)
 */
export function makePortcullis(alongX: boolean, a: ArchShape, raise: number, heavy: boolean): Strip[] {
  const c = curveOf(a);
  const F = new Flat(0, ARCH_WIDE, a.spring + a.rise + 2);
  // (what of it the arch's own thickness hides: the arch is as thick as its pillars, and the gate is at the back of it)
  const behindArch = (u: number, v: number): boolean => {
    for (let q = 1; q <= PILLAR; q++) if (inRing(a, c, u + q, v + q)) return true;
    return false;
  };
  const put = (u: number, v: number, col: string): void => {
    if (inWay(a, c, u, v) && !behindArch(u, v)) F.set(u, v, col);
  };
  const SPIKE = heavy ? 9 : 7;
  const tall = a.spring + a.rise + 8;
  // the cross bars
  for (let up = SPIKE + 5; up <= tall; up += 14) {
    for (let u = PILLAR; u < PILLAR + SPAN; u++) {
      put(u, up + raise + 1, GLINT);
      put(u, up + raise, LIT);
      put(u, up + raise - 1, BODY);
      put(u, up + raise - 2, DARK);
      if (heavy) put(u, up + raise - 3, DARK);
    }
  }
  // the uprights, each to a spike
  for (let u = PILLAR + 3; u < PILLAR + SPAN - 2; u += 8) {
    for (let up = 0; up <= tall; up++) {
      const v = up + raise;
      if (up < SPIKE) {
        put(u + 1, v, GLINT);
        if (up >= 2) put(u, v, LIT);
        if (up >= SPIKE / 2) put(u + 2, v, BODY);
        continue;
      }
      if (heavy) put(u - 1, v, LIT);
      put(u, v, GLINT);
      put(u + 1, v, LIT);
      put(u + 2, v, BODY);
      put(u + 3, v, DARK);
    }
  }
  return F.strips(alongX);
}


// =================================================================================================

/** How many steps a door's swing is painted in. */
export const SWING_STEPS = 8;

/** The pictures of a dungeon's doors and gates. Leaves, arches and gates are painted when first asked for and kept. */
export interface GateArt {
  /** A post of a door's frame (there are two), and the lintel across their heads in a plane along +x or along +y. */
  post: Sprite;
  lintel(alongX: boolean): Strip[];
  /** A door's leaf whose free end is (ex, ey) picture pixels from its hinge. */
  leaf(ex: number, ey: number): Sprite;
  /** A pillar of a gate (there are two): the boss's, or another's. */
  pillar(boss: boolean): Sprite;
  /** The arch over a gate. The boss's carries the emblem: its cut in embers, or (`lit`) alight. */
  arch(alongX: boolean, boss: boolean, lit: boolean): Strip[];
  /** A gate's portcullis, `raise` picture pixels off the floor (0 to GATE_UP: an even number of them). */
  portcullis(alongX: boolean, boss: boolean, raise: number): Strip[];
}

export function makeGateArt(theme: Theme = VAULT): GateArt {
  const lintels = new Map<number, Strip[]>();
  const leaves = new Map<number, Sprite>();
  const pillars = new Map<number, Sprite>();
  const arches = new Map<number, Strip[]>();
  const gates = new Map<number, Strip[]>();
  const shape = (boss: boolean): ArchShape => (boss ? ARCH_BOSS : ARCH);
  return {
    post: makePillar(theme, DOOR_HIGH, POST),
    lintel(alongX) {
      const key = alongX ? 1 : 0;
      let s = lintels.get(key);
      if (!s) lintels.set(key, (s = makeLintel(theme, alongX)));
      return s;
    },
    leaf(ex, ey) {
      const key = (ex + 512) * 1024 + (ey + 512);
      let s = leaves.get(key);
      if (!s) leaves.set(key, (s = makeDoorLeaf(ex, ey)));
      return s;
    },
    pillar(boss) {
      const key = boss ? 1 : 0;
      let s = pillars.get(key);
      if (!s) pillars.set(key, (s = makePillar(theme, shape(boss).spring)));
      return s;
    },
    arch(alongX, boss, lit) {
      const key = (alongX ? 4 : 0) + (boss ? 2 : 0) + (lit ? 1 : 0);
      let s = arches.get(key);
      if (!s) arches.set(key, (s = makeArch(theme, alongX, shape(boss), boss ? (lit ? 'lit' : 'dim') : 'none')));
      return s;
    },
    portcullis(alongX, boss, raise) {
      const r = Math.max(0, Math.min(GATE_UP, Math.round(raise / 2) * 2));
      const key = r * 4 + (alongX ? 2 : 0) + (boss ? 1 : 0);
      let s = gates.get(key);
      if (!s) gates.set(key, (s = makePortcullis(alongX, shape(boss), r, boss)));
      return s;
    },
  };
}
