// THE TINKERER'S CONTRAPTION, LOOKED AT AGAIN (the art chat, 24 Oct 2026). A MOCK-UP; NOTHING OF THE GAME IMPORTS IT.
//
// His brief, 23 Oct (Pacific), by 22:21: “I think she’ll set turrets on the ground that fire something.  Not an arrow or a
// bolt.  That’s the tap.  We’ll call those “Contraption”.”; what they fire, “Lobbed vials (Recommended)” (little brass
// mortars lobbing her potions in arcs, bursting where they land). Asked what next, 24 Oct, by 11:30: “Look at the
// Contraption”. And his art rulebook's rule 9 since 10:44: “Real shapes, not circles and squares”.
//
// SO: eight Contraptions to pick from, each a different machine for lobbing a vial, each knee high, set down on the floor
// and wound up: a FIELD MORTAR, a SPOON CATAPULT, a TREBUCHET, a KETTLE GUN, a BELLOWS HORN, a REVOLVER DRUM, a SLINGSHOT
// and a VOLLEY SLED. Brass, copper, steel and old wood; each with a vial loaded where it throws from, so what it does
// reads at a glance; a gear, a spring or a key to show it is clockwork. What glows on it is the friend's cyan (a vial of
// hers, a lamp); an honest fire burns orange. Sculpted (dev/sculpt.ts) and drawn as the heroes are.

import type { Ramp } from '../art/kit';
import { CYAN } from '../art/kit';
import { FRIEND_RIM } from '../art/hero3_knight';
import { CANVAS3 } from '../art/skin';
import type { GameView } from '../art/skin';
import { add, cross, lerp3, mul, norm, sub } from '../art/skeleton';
import type { V3 } from '../art/skeleton';
import { Sculpt, draw, onBall, onCone } from './sculpt';
import type { Cone, Drawn, Ell } from './sculpt';
import { BRASS, HIDE, shadeOf } from './sculpt_classes';
import { STEEL5 } from './sculpt_warlock';

const D = Math.PI / 180;
const dot3 = (a: V3, b: V3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const COPPER: Ramp = ['#2a0e0a', '#521c12', '#8a3a1e', '#c4642e', '#ec9a56'];
/** Old oak, dark with oil. */
const OAK: Ramp = ['#2a140a', '#4e2a14', '#7a4622', '#a86a34', '#d09a54'];
/** The dark of a bore, a grate, a hatch. */
const DARK: Ramp = ['#0a0810', '#141020', '#201a30', '#2e2640', '#3e3454'];
/** Her vials' glass (the bandolier's): violet, amber, and the friend's cyan. */
const VIOLET_G: Ramp = ['#1e0a3a', '#3a1466', '#5e2a9c', '#8c56cc', '#c09cf0'];
const AMBER_G: Ramp = ['#2a1406', '#5a2e0c', '#9a5a14', '#d89a2c', '#f8d070'];
/** An honest fire: a firebox's coals. */
const EMBER: Ramp = ['#3a0e04', '#7a2208', '#c24a10', '#f08a20', '#ffd060'];

/** Which Contraption: its id and its name for him. */
export type ContraptionBuild = 'mortar' | 'catapult' | 'trebuchet' | 'kettle' | 'bellows' | 'drum' | 'sling' | 'volley';
export const CONTRAPTION_BUILDS: { id: ContraptionBuild; name: string }[] = [
  { id: 'mortar', name: 'Field mortar' },
  { id: 'catapult', name: 'Spoon catapult' },
  { id: 'trebuchet', name: 'Trebuchet' },
  { id: 'kettle', name: 'Kettle gun' },
  { id: 'bellows', name: 'Bellows horn' },
  { id: 'drum', name: 'Revolver drum' },
  { id: 'sling', name: 'Slingshot' },
  { id: 'volley', name: 'Volley sled' },
];

/** A unit at right angles to `a`. */
const perp = (a: V3): V3 => norm(cross(a, Math.abs(a[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0]));

/** The Contraption sculpted, set down on the floor (its middle on the floor point), in one of the game's views. */
export function sculptContraptionBuild(view: GameView, build: ContraptionBuild, turn = 0): Drawn {
  const sc = new Sculpt();
  sc.spin = turn;
  // ITS STUFFS
  const brass = sc.mat({
    ramp: BRASS,
    paint: (h) => {
      // rivets round its bands
      if (h.prim.tag === 'band' && (h.x * 2 + h.y) % 4 === 0) return shadeOf(BRASS, h.tone + 1);
      return null;
    },
  });
  const copper = sc.mat({
    ramp: COPPER,
    paint: (h) => {
      // a barrel's hoops, a kettle's hammered face
      if (h.prim.tag === 'barrel' && h.prim.k === 'cone') {
        const { t } = onCone(h.prim as Cone, h.p, [0, 0, 1]);
        if (Math.floor(t * 7) % 3 === 0) return shadeOf(COPPER, h.tone - 1);
      }
      if (h.prim.tag === 'pot' && (h.x * 3 + h.y * 5) % 11 === 0) return shadeOf(COPPER, h.tone + 1);
      return null;
    },
  });
  const steel = sc.mat({ ramp: STEEL5 });
  const oak = sc.mat({
    ramp: OAK,
    paint: (h) => {
      // the grain, run along the plank
      if (h.prim.k === 'cone' || h.prim.k === 'box') {
        const v = h.prim.k === 'cone' ? norm(sub(h.prim.b, h.prim.a)) : norm(h.prim.axes[0]);
        const s = Math.floor(dot3(h.p, perp(v)) * 1.3 + dot3(h.p, cross(v, perp(v))) * 0.4);
        if (s % 3 === 0) return shadeOf(OAK, h.tone - 1);
      }
      return null;
    },
  });
  const leather = sc.mat({ ramp: HIDE });
  const dark = sc.mat({ ramp: DARK });
  const glass = [sc.mat({ ramp: CYAN, paint: (h) => (h.tone >= 3 ? '#e8ffff' : null) }), sc.mat({ ramp: VIOLET_G }), sc.mat({ ramp: AMBER_G })];
  const gearMat = sc.mat({
    ramp: BRASS,
    paint: (h) => {
      // its teeth round its rim, its hub sunk
      if (h.prim.k !== 'ell') return null;
      const b = onBall(h.prim as Ell, h.p);
      const ang = Math.atan2(b[2], b[1]);
      const r = Math.hypot(b[1], b[2]);
      if (r > 0.74 && Math.floor((ang + Math.PI) * 10 / Math.PI) % 2 === 0) return shadeOf(BRASS, h.tone - 2);
      if (r < 0.3) return shadeOf(BRASS, h.tone - 1);
      return null;
    },
  });

  // ITS PARTS
  /** A flat ring or disc: `R` across its face, `th` thick, its face toward `axis`. */
  const disc = (mat: number, piece: string, c: V3, axis: V3, R: number, th: number, tag?: string): void => {
    const a = norm(axis);
    const u = perp(a);
    const v = norm(cross(a, u));
    sc.ell(mat, piece, c, [mul(a, th), mul(u, R), mul(v, R)], 0.1, { tag });
  };
  /**
   * A barrel: from its breech `a` along `aim`, `len` long; `r` at the breech, `waist` along it, its mouth flared to `mouth`
   * and cut flat, the bore dark in it, a band round it at the breech and the mouth.
   */
  const barrel = (mat: number, piece: string, a: V3, aim: V3, len: number, r: number, waist: number, mouth: number): V3 => {
    const d = norm(aim);
    const m = add(a, mul(d, len));
    const cut = [{ n: d, o: dot3(d, m) }];
    sc.cone(mat, piece, a, lerp3(a, m, 0.62), r, waist, 0.8, { tag: 'barrel', cuts: cut });
    sc.cone(mat, piece, lerp3(a, m, 0.55), add(m, mul(d, mouth)), waist, mouth * 1.05, 0.9, { tag: 'barrel', cuts: cut });
    // (the breech: a knob behind it, as a cannon's cascabel)
    sc.ell(mat, piece, add(a, mul(d, -r * 0.7)), [mul(d, r * 0.7), mul(perp(d), r * 0.75), mul(cross(d, perp(d)), r * 0.75)], 0.6, { tag: 'breech' });
    disc(brass, piece, add(a, mul(d, r * 0.2)), d, r * 1.12, 0.5, 'band');
    // (the band and the bore stand a little proud of the mouth's face: the barrel's two lengths melt into each other there,
    // and the melt swells past the cut a little)
    disc(brass, piece, add(m, mul(d, -0.1)), d, mouth * 1.14, 0.5, 'band');
    disc(dark, piece, add(m, mul(d, 0.12)), d, mouth * 0.68, 0.42, 'bore');
    return m;
  };
  /** A vial of hers: glass, a brass cap; standing from `foot` along `up`. */
  const vial = (k: number, piece: string, foot: V3, up: V3, len = 2.6, r = 0.85): void => {
    const u = norm(up);
    sc.cone(glass[k % 3], piece, foot, add(foot, mul(u, len - r)), r, r * 0.92, 0.3, { tag: 'vial' });
    sc.ell(brass, piece, add(foot, mul(u, len + 0.1)), [mul(u, 0.45), mul(perp(u), r * 0.8), mul(cross(u, perp(u)), r * 0.8)], 0.1, { tag: 'cap' });
  };
  /** A spring: a coil round `axis` from `c`, `len` long, `R` round, `turns` times round. */
  const spring = (mat: number, piece: string, c: V3, axis: V3, len: number, R: number, turns: number, wire = 0.38): void => {
    const a = norm(axis);
    const u = perp(a);
    const v = norm(cross(a, u));
    const N = Math.round(turns * 8);
    let prev: V3 | null = null;
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      const th = t * turns * Math.PI * 2;
      const p = add(c, add(mul(a, t * len), add(mul(u, Math.cos(th) * R), mul(v, Math.sin(th) * R))));
      if (prev) sc.cone(mat, piece, prev, p, wire, wire, 0.05, { tag: 'coil' });
      prev = p;
    }
  };
  /** A gear: its face toward `axis`, `R` across, `th` thick, an axle through it. */
  const gear = (piece: string, c: V3, axis: V3, R: number, th = 0.5): void => {
    disc(gearMat, piece, c, axis, R, th, 'gear');
    sc.cone(steel, piece, add(c, mul(norm(axis), -th - 0.2)), add(c, mul(norm(axis), th + 0.4)), 0.35, 0.35, 0.1, { tag: 'axle' });
  };
  /** A wheel, spoked: its face toward `axle`, `R` across, its rim of short rods round it. */
  const wheel = (mat: number, piece: string, c: V3, axle: V3, R: number, spokes = 6, rim = 0.42): void => {
    const a = norm(axle);
    const u = perp(a);
    const v = norm(cross(a, u));
    const at = (th: number, r: number): V3 => add(c, add(mul(u, Math.cos(th) * r), mul(v, Math.sin(th) * r)));
    const N = 14;
    for (let i = 0; i < N; i++) sc.cone(mat, piece, at((i / N) * Math.PI * 2, R), at(((i + 1) / N) * Math.PI * 2, R), rim, rim, 0.25, { tag: 'rim' });
    for (let i = 0; i < spokes; i++) sc.cone(mat, piece, at(0, 0), at((i / spokes) * Math.PI * 2 + 0.3, R), 0.22, 0.2, 0.1, { tag: 'spoke' });
    sc.ell(brass, piece, c, [mul(a, 0.55), mul(u, 0.7), mul(v, 0.7)], 0.1, { tag: 'hub' });
  };
  /** A clawed foot: down from `ankle` to the floor at `toe`'s side, three toes splayed. */
  const clawFoot = (mat: number, piece: string, ankle: V3, out: V3): void => {
    const o = norm([out[0], out[1], 0]);
    const s = norm(cross(o, [0, 0, 1]));
    const heel: V3 = [ankle[0], ankle[1], 0.7];
    sc.cone(mat, piece, ankle, heel, 0.6, 0.65, 0.4, { tag: 'foot' });
    for (const k of [-1, 0, 1]) {
      const toe = add(heel, add(mul(o, 1.3), mul(s, k * 0.75)));
      sc.cone(mat, piece, heel, [toe[0], toe[1], 0.35], 0.42, 0.24, 0.3, { tag: 'toe' });
    }
  };
  /** Its winding key: a stem out of it along `out`, a bow of two lobes. */
  const key = (piece: string, at: V3, out: V3, size = 1): void => {
    const o = norm(out);
    const s = perp(o);
    const end = add(at, mul(o, 1.6 * size));
    sc.cone(brass, piece, at, end, 0.3 * size, 0.3 * size, 0.1, { tag: 'key' });
    for (const k of [1, -1]) sc.ell(brass, piece, add(end, add(mul(o, 0.5 * size), mul(s, k * 0.9 * size))), [mul(o, 0.32 * size), mul(s, 0.75 * size), mul(cross(o, s), 0.85 * size)], 0.3, { tag: 'bow' });
  };
  /** A lamp of the friend's cyan, lit while it is wound: its eye. */
  const lamp = (piece: string, at: V3, r = 0.7): void => {
    const m = sc.mat({ ramp: CYAN, paint: (h) => (h.tone >= 2 ? '#e8ffff' : CYAN[2]) });
    sc.ell(m, piece, at, [[r, 0, 0], [0, r, 0], [0, 0, r]], 0.1, { tag: 'lamp' });
  };

  // (where it throws: up and toward the picture's right, so its barrel or arm is seen side-on)
  let fwd: V3 = norm([0.7, 1, 0]);
  let side: V3 = norm(cross([0, 0, 1], fwd));
  const up: V3 = [0, 0, 1];
  const F = (f: number, s: number, z: number): V3 => add(mul(fwd, f), add(mul(side, s), [0, 0, z]));
  const aimAt = (deg: number): V3 => norm(add(mul(fwd, Math.cos(deg * D)), mul(up, Math.sin(deg * D))));

  if (build === 'mortar') {
    // THE FIELD MORTAR: a fat bronze mortar with a bell mouth, cocked up between two cheeks on a turntable, on three clawed
    // feet; a spring coiled behind its breech; a winding key in its base; a vial in the cradle at its side
    fwd = norm([1, 0.35, 0]);
    side = norm(cross([0, 0, 1], fwd));
    const base = F(0, 0, 3.0);
    sc.ell(brass, 'base', F(0, 0, 2.2), [mul(fwd, 5.2), mul(side, 5.2), [0, 0, 1.0]], 0.8, { tag: 'band' });
    sc.ell(brass, 'base', F(0, 0, 3.4), [mul(fwd, 4.0), mul(side, 4.0), [0, 0, 0.9]], 0.8, { tag: 'plinth' });
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2 + 0.4;
      const dir: V3 = [Math.cos(a), Math.sin(a), 0];
      const knee = add(base, add(mul(dir, 4.2), [0, 0, -0.6]));
      clawFoot(steel, 'legs', knee, dir);
    }
    for (const k of [1, -1]) sc.box(brass, 'cheek', F(-0.8, k * 3.0, 5.4), [mul(fwd, 2.4), mul(side, 0.45), [0, 0, 1.9]], 0.9, 0.5, { tag: 'cheek' });
    const aim = aimAt(46);
    const breech = F(-1.4, 0, 6.6);
    barrel(copper, 'barrel', breech, aim, 5.4, 2.7, 2.3, 3.3);
    for (const k of [1, -1]) sc.cone(steel, 'barrel', add(breech, mul(side, k * 2.3)), add(breech, mul(side, k * 3.6)), 0.7, 0.7, 0.1, { tag: 'pin' });
    key('base', F(-3.6, -1.6, 3.6), norm([-0.9, -0.4, 0.2]));
    // the cradle and the vial in it
    sc.ell(brass, 'cradle', F(1.6, -3.8, 4.4), [mul(fwd, 1.2), mul(side, 1.2), [0, 0, 0.5]], 0.3, { tag: 'cradle' });
    vial(0, 'cradle', F(1.6, -3.8, 4.6), [0.1, -0.2, 1]);
    lamp('base', F(3.2, 2.2, 4.0), 0.6);
  } else if (build === 'catapult') {
    // THE SPOON CATAPULT: an oak frame on four spoked wheels; an upright with a padded stop; the throwing arm cocked back,
    // a brass spoon at its end with a vial in it; a great spring wound at its pivot, a ratchet gear beside it
    const len = 6.2;
    const wide = 3.0;
    for (const k of [1, -1]) sc.box(oak, 'frame', F(0, k * wide, 3.0), [mul(fwd, len), mul(side, 0.6), [0, 0, 0.7]], 0.4, 0.4, { tag: 'rail' });
    for (const f of [-len + 1.2, len - 1.2]) sc.box(oak, 'frame', F(f, 0, 3.0), [mul(fwd, 0.6), mul(side, wide), [0, 0, 0.6]], 0.4, 0.4, { tag: 'cross' });
    for (const f of [-len + 1.8, len - 1.8]) for (const k of [1, -1]) wheel(oak, 'wheels', F(f, k * (wide + 1.0), 2.4), side, 2.0, 6, 0.4);
    // the upright and its padded stop
    for (const k of [1, -1]) sc.cone(oak, 'frame', F(1.6, k * wide, 3.4), F(0.6, k * 1.4, 10.0), 0.55, 0.45, 0.3, { tag: 'upright' });
    sc.cone(oak, 'frame', F(0.6, 1.6, 10.0), F(0.6, -1.6, 10.0), 0.6, 0.6, 0.3, { tag: 'stop' });
    sc.ell(leather, 'frame', F(0.2, 0, 10.0), [mul(fwd, 0.8), mul(side, 1.5), [0, 0, 0.8]], 0.3, { tag: 'pad' });
    // the pivot: a drum spring and a gear
    const pivot = F(-1.6, 0, 4.4);
    spring(steel, 'spring', add(pivot, mul(side, -2.0)), side, 4.0, 1.1, 4);
    gear('spring', add(pivot, mul(side, 2.7)), side, 1.7);
    // the arm cocked back, low, the spoon up
    const tip = F(-6.8, 0, 6.6);
    sc.cone(oak, 'arm', pivot, tip, 0.6, 0.5, 0.3, { tag: 'arm' });
    const spoon = add(tip, F(-0.6, 0, 0.9));
    sc.ell(brass, 'arm', spoon, [mul(fwd, 1.7), mul(side, 1.5), [0, 0, 0.7]], 0.4, { tag: 'spoon', cuts: [{ n: [0, 0, 1], o: spoon[2] + 0.25 }] });
    vial(2, 'arm', add(spoon, [0, 0, 0.1]), norm([-0.4, 0, 1]), 2.4, 0.8);
    lamp('frame', F(len - 0.6, 0, 4.2), 0.55);
  } else if (build === 'trebuchet') {
    // THE TREBUCHET: two oak A-frames on a sled; the arm on its axle, short end up with a brass counterweight shaped as a
    // bell, long end down behind with the sling and a vial in its pouch; a ratchet gear to wind it
    const L = 5.6;
    for (const k of [1, -1]) {
      sc.cone(oak, 'sled', F(-L, k * 2.8, 0.7), F(L, k * 2.8, 0.7), 0.7, 0.7, 0.3, { tag: 'runner' });
      sc.cone(oak, 'sled', F(L, k * 2.8, 0.7), F(L + 1.2, k * 2.8, 1.8), 0.7, 0.55, 0.3, { tag: 'runner' });
      sc.cone(oak, 'frame', F(-3.4, k * 2.6, 1.2), F(-0.2, k * 2.0, 12.4), 0.55, 0.45, 0.3, { tag: 'leg' });
      sc.cone(oak, 'frame', F(3.4, k * 2.6, 1.2), F(0.2, k * 2.0, 12.4), 0.55, 0.45, 0.3, { tag: 'leg' });
      sc.cone(oak, 'frame', F(-2.0, k * 2.4, 5.0), F(2.0, k * 2.4, 5.0), 0.4, 0.4, 0.2, { tag: 'brace' });
    }
    const ax = F(0, 0, 12.4);
    sc.cone(steel, 'arm', add(ax, mul(side, -2.6)), add(ax, mul(side, 2.6)), 0.5, 0.5, 0.1, { tag: 'axle' });
    gear('frame', add(ax, mul(side, 2.9)), side, 1.6);
    // the arm: short end up and forward, long end down and back
    const shortEnd = add(ax, F(2.6, 0, 2.2));
    const longEnd = add(ax, F(-6.4, 0, -7.0));
    sc.cone(oak, 'arm', shortEnd, longEnd, 0.7, 0.45, 0.3, { tag: 'arm' });
    // the counterweight: a brass bell hung under the short end
    const w = add(shortEnd, [0, 0, -2.2]);
    sc.cone(steel, 'arm', shortEnd, add(w, [0, 0, 1.0]), 0.25, 0.25, 0.1, { tag: 'hanger' });
    sc.cone(brass, 'weight', add(w, [0, 0, 0.8]), add(w, [0, 0, -1.2]), 1.0, 2.0, 0.8, { tag: 'band' });
    sc.ell(brass, 'weight', add(w, [0, 0, -1.4]), [mul(fwd, 2.1), mul(side, 2.1), [0, 0, 0.45]], 0.4, { tag: 'lip' });
    // the sling: two cords from the long end down to a leather pouch on the sled's back, a vial in it
    const pouch = F(-L + 0.6, 0, 2.6);
    for (const k of [1, -1]) sc.cone(leather, 'sling', longEnd, add(pouch, mul(side, k * 0.9)), 0.18, 0.18, 0.05, { tag: 'cord' });
    sc.ell(leather, 'sling', pouch, [mul(fwd, 1.3), mul(side, 1.3), [0, 0, 0.8]], 0.3, { tag: 'pouch', cuts: [{ n: [0, 0, 1], o: pouch[2] + 0.4 }] });
    vial(1, 'sling', add(pouch, [0, 0, 0.1]), norm([-0.3, 0, 1]), 2.2, 0.8);
  } else if (build === 'kettle') {
    // THE KETTLE GUN: a fat copper kettle on three stubby clawed legs, a firebox glowing under it, its spout raised as the
    // barrel, a lid with a whistle, a gauge on its side, a handle arched over; vials racked at its back
    const belly = F(0, 0, 7.2);
    sc.ell(copper, 'pot', belly, [mul(fwd, 5.0), mul(side, 5.0), [0, 0, 3.9]], 0.8, { tag: 'pot' });
    sc.ell(copper, 'pot', F(0, 0, 10.6), [mul(fwd, 3.4), mul(side, 3.4), [0, 0, 1.8]], 1.6, { tag: 'pot' });
    disc(brass, 'pot', F(0, 0, 6.2), up, 5.2, 0.5, 'band');
    // the lid and its whistle
    sc.ell(brass, 'lid', F(0, 0, 12.2), [mul(fwd, 2.4), mul(side, 2.4), [0, 0, 0.8]], 0.3, { tag: 'lid' });
    sc.cone(brass, 'lid', F(0, 0, 12.6), F(0, 0, 14.0), 0.45, 0.65, 0.2, { tag: 'whistle' });
    // the handle arched over it, front to back
    let prev = F(-3.6, 0, 10.4);
    for (let i = 1; i <= 6; i++) {
      const t = i / 6;
      const p = F(-3.6 + t * 7.2, 0, 10.4 + Math.sin(t * Math.PI) * 5.0);
      sc.cone(steel, 'handle', prev, p, 0.42, 0.42, 0.1, { tag: 'handle' });
      prev = p;
    }
    // the spout, curving up and out: the barrel
    const s0 = F(3.6, 0, 7.6);
    const s1 = F(6.2, 0, 9.4);
    sc.cone(copper, 'spout', s0, s1, 1.5, 1.2, 0.8, { tag: 'spout' });
    barrel(copper, 'spout', s1, aimAt(48), 3.0, 1.2, 1.1, 1.8);
    // three stubby legs, clawed, and the firebox between them
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2 + 0.9;
      const dir: V3 = [Math.cos(a), Math.sin(a), 0];
      const top = add(F(0, 0, 4.2), mul(dir, 3.2));
      const ankle = add(F(0, 0, 1.6), mul(dir, 4.0));
      sc.cone(brass, 'legs', top, ankle, 0.9, 0.7, 0.4, { tag: 'leg' });
      clawFoot(brass, 'legs', ankle, dir);
    }
    sc.ell(dark, 'fire', F(0, 0, 3.2), [mul(fwd, 2.2), mul(side, 2.2), [0, 0, 0.9]], 0.3, { tag: 'grate' });
    sc.ell(sc.mat({ ramp: EMBER, paint: (h) => ((h.x + h.y) % 3 === 0 ? EMBER[4] : EMBER[3]) }), 'fire', F(0.4, 0, 3.0), [mul(fwd, 1.5), mul(side, 1.5), [0, 0, 0.7]], 0.2, { tag: 'coals' });
    // the gauge on its side
    const g = F(1.6, -4.2, 8.4);
    disc(brass, 'gauge', g, norm(add(mul(side, -1), [0.4, -0.2, 0.2])), 1.3, 0.35, 'rim');
    lamp('gauge', add(g, mul(side, -0.3)), 0.75);
    // vials racked at its back
    for (let i = 0; i < 3; i++) vial(i, 'rack', F(-4.6, (i - 1) * 1.8, 7.0), norm([-0.5, 0, 1]), 2.4, 0.75);
    sc.cone(leather, 'rack', F(-4.4, -2.8, 7.4), F(-4.4, 2.8, 7.4), 0.5, 0.5, 0.2, { tag: 'strap' });
  } else if (build === 'bellows') {
    // THE BELLOWS HORN: a great leather bellows between two oak boards on a trestle, an iron weight on a lever over it to
    // squeeze it, its nozzle a long brass horn flaring up and out; the vial in the hatch at the horn's throat
    for (const k of [1, -1]) {
      sc.cone(oak, 'trestle', F(-4.0, k * 3.2, 0.5), F(-1.0, k * 1.6, 6.0), 0.5, 0.45, 0.3, { tag: 'leg' });
      sc.cone(oak, 'trestle', F(3.0, k * 3.2, 0.5), F(1.0, k * 1.6, 6.0), 0.5, 0.45, 0.3, { tag: 'leg' });
    }
    // the boards: teardrops, broad behind, narrow at the nozzle
    const lowB = F(-0.4, 0, 6.4);
    const highB = F(-0.4, 0, 10.0);
    for (const b of [lowB, highB]) {
      sc.ell(oak, 'boards', b, [mul(fwd, 4.4), mul(side, 3.0), [0, 0, 0.45]], 0.3, { tag: 'board', cuts: [{ n: mul(fwd, 1), o: dot3(fwd, b) + 3.2 }] });
      sc.cone(oak, 'boards', add(b, mul(fwd, 2.2)), add(b, mul(fwd, 4.2)), 0.6, 0.45, 0.4, { tag: 'board' });
    }
    // the leather between them, pleated
    for (let i = 0; i < 4; i++) {
      const z = 6.9 + i * 0.85;
      const r = i % 2 === 0 ? 2.9 : 2.3;
      sc.ell(leather, 'pleats', F(-0.8, 0, z), [mul(fwd, r * 1.25), mul(side, r), [0, 0, 0.55]], 0.25, { tag: 'pleat' });
    }
    // the horn: from the nozzle up and out, flaring
    const n0 = add(lowB, F(4.6, 0, 1.8));
    const aim = aimAt(40);
    sc.cone(brass, 'horn', n0, add(n0, mul(aim, 3.0)), 0.9, 1.0, 0.5, { tag: 'horn' });
    const mouth = barrel(brass, 'horn', add(n0, mul(aim, 3.0)), aim, 4.2, 1.0, 1.3, 3.0);
    void mouth;
    // the hatch at its throat and the vial in it
    vial(0, 'horn', add(n0, F(0.6, 0, 1.0)), [0, 0, 1], 2.2, 0.75);
    // the lever and its weight, over the top board
    const fulcrum = F(-4.6, 0, 11.4);
    sc.cone(steel, 'lever', F(-4.6, 0, 6.4), fulcrum, 0.4, 0.4, 0.1, { tag: 'post' });
    sc.cone(steel, 'lever', fulcrum, F(2.4, 0, 12.4), 0.38, 0.32, 0.1, { tag: 'lever' });
    sc.cone(steel, 'lever', F(0.4, 0, 11.9), F(0.4, 0, 10.4), 0.3, 0.3, 0.1, { tag: 'rod' });
    sc.box(steel, 'lever', F(2.6, 0, 13.4), [mul(fwd, 1.2), mul(side, 1.2), [0, 0, 1.1]], 0.5, 0.3, { tag: 'weight' });
    spring(brass, 'lever', F(-4.6, 0, 7.0), up, 3.6, 0.8, 4, 0.3);
  } else if (build === 'drum') {
    // THE REVOLVER DRUM: a steel tripod, a turret head on it: a drum of six chambers, a vial in each, turning to feed a short
    // flared barrel cocked up; a crank on its side
    const head = F(0, 0, 9.6);
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2 + 0.5;
      const dir: V3 = [Math.cos(a), Math.sin(a), 0];
      const knee = add(F(0, 0, 4.0), mul(dir, 3.4));
      sc.cone(steel, 'legs', add(head, [0, 0, -2.0]), knee, 0.65, 0.5, 0.3, { tag: 'leg' });
      sc.cone(steel, 'legs', knee, add([dir[0] * 5.6, dir[1] * 5.6, 0], [0, 0, 0.5]), 0.5, 0.4, 0.3, { tag: 'leg' });
      sc.ell(brass, 'legs', [dir[0] * 5.8, dir[1] * 5.8, 0.4], [[1.0, 0, 0], [0, 1.0, 0], [0, 0, 0.4]], 0.2, { tag: 'foot' });
    }
    sc.ell(brass, 'head', add(head, [0, 0, -1.6]), [mul(fwd, 2.4), mul(side, 2.4), [0, 0, 0.8]], 0.5, { tag: 'band' });
    // the drum: its axle along the aim, six vials round it pointing back out of their chambers
    const aim = aimAt(36);
    const dc = add(head, mul(aim, -0.6));
    const u = perp(aim);
    const v = norm(cross(aim, u));
    sc.cone(brass, 'drum', add(dc, mul(aim, -1.6)), add(dc, mul(aim, 1.6)), 2.9, 2.9, 0.4, { tag: 'drum', cuts: [{ n: aim, o: dot3(aim, dc) + 1.6 }, { n: mul(aim, -1) as V3, o: -dot3(aim, dc) + 1.6 }] });
    for (let i = 0; i < 6; i++) {
      const th = (i / 6) * Math.PI * 2;
      const at = add(dc, add(mul(u, Math.cos(th) * 1.9), mul(v, Math.sin(th) * 1.9)));
      vial(i, 'drum', add(at, mul(aim, -1.2)), mul(aim, -1), 2.0, 0.62);
    }
    barrel(copper, 'barrel', add(dc, mul(aim, 1.4)), aim, 4.6, 1.5, 1.3, 2.1);
    // the crank on its side
    const c0 = add(dc, mul(side, -3.0));
    sc.cone(steel, 'crank', add(dc, mul(side, -2.6)), c0, 0.35, 0.35, 0.1, { tag: 'crank' });
    sc.cone(steel, 'crank', c0, add(c0, [0, 0, -2.2]), 0.35, 0.35, 0.1, { tag: 'crank' });
    sc.cone(oak, 'crank', add(c0, add([0, 0, -2.2], mul(side, -0.1))), add(c0, add([0, 0, -2.2], mul(side, -1.4))), 0.45, 0.45, 0.1, { tag: 'grip' });
    lamp('head', add(head, F(-1.6, 1.8, 1.8)), 0.55);
  } else if (build === 'sling') {
    // THE SLINGSHOT: an oak fork on an iron stake, braced on three struts; its leather band drawn back by a line to a
    // clockwork winch at its foot, a vial in the pouch. (Its throw away from the eye, so its band comes toward it.)
    fwd = norm([-1, 0.35, 0]);
    side = norm(cross([0, 0, 1], fwd));
    const foot = F(0, 0, 1.0);
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2 + 1.2;
      const dir: V3 = [Math.cos(a), Math.sin(a), 0];
      sc.cone(steel, 'stake', F(0, 0, 4.0), [dir[0] * 4.4, dir[1] * 4.4, 0.6], 0.6, 0.5, 0.2, { tag: 'strut' });
      sc.ell(brass, 'stake', [dir[0] * 4.6, dir[1] * 4.6, 0.4], [[0.9, 0, 0], [0, 0.9, 0], [0, 0, 0.4]], 0.1, { tag: 'peg' });
    }
    sc.cone(steel, 'stake', foot, F(0, 0, 6.0), 0.9, 0.8, 0.3, { tag: 'stake' });
    // the fork: a stem of oak, two tines up and apart
    sc.cone(oak, 'fork', F(0, 0, 5.4), F(0, 0, 8.6), 1.15, 1.0, 0.5, { tag: 'stem' });
    const tines: V3[] = [];
    for (const k of [1, -1]) {
      const t = F(0.4, k * 3.0, 13.2);
      sc.cone(oak, 'fork', F(0, k * 0.4, 8.2), t, 1.0, 0.8, 0.6, { tag: 'tine' });
      disc(brass, 'fork', add(t, [0, 0, -0.5]), up, 0.95, 0.4, 'band');
      tines.push(t);
    }
    // the band drawn back to the pouch
    const pouch = F(-4.4, 0, 10.0);
    for (const t of tines) sc.cone(leather, 'band', t, add(pouch, mul(sub(t, pouch), 0.12)), 0.5, 0.45, 0.1, { tag: 'band' });
    sc.ell(leather, 'band', pouch, [mul(fwd, 1.2), mul(side, 1.7), [0, 0, 1.6]], 0.4, { tag: 'pouch' });
    vial(0, 'band', add(pouch, F(0.5, 0, 0.6)), norm(add(mul(fwd, 0.5), [0, 0, 1])), 2.8, 1.0);
    // the winch at the foot, its line up to the pouch
    const winch = F(-3.0, -0.6, 2.2);
    sc.cone(brass, 'winch', add(winch, mul(side, -1.6)), add(winch, mul(side, 1.6)), 1.5, 1.5, 0.3, { tag: 'band', cuts: [{ n: side, o: dot3(side, winch) + 1.6 }, { n: mul(side, -1) as V3, o: -dot3(side, winch) + 1.6 }] });
    gear('winch', add(winch, mul(side, -2.0)), side, 1.9);
    sc.cone(steel, 'winch', winch, pouch, 0.3, 0.3, 0.05, { tag: 'line' });
    lamp('stake', F(0.9, -0.9, 6.8), 0.6);
  } else {
    // THE VOLLEY SLED: three short mortars side by side in a fan on an oak block, on a sled whose runners curl up at the
    // front; each loaded, a vial showing in its mouth; a gear and a key to wind them. (Their mouths toward the eye, in a row.)
    fwd = norm([1, -1, 0]);
    side = norm(cross([0, 0, 1], fwd));
    const L = 6.0;
    for (const k of [1, -1]) {
      sc.cone(oak, 'sled', F(-L, k * 3.0, 0.6), F(L - 1.0, k * 3.0, 0.6), 0.6, 0.6, 0.3, { tag: 'runner' });
      let prev = F(L - 1.0, k * 3.0, 0.6);
      for (let i = 1; i <= 4; i++) {
        const th = (i / 4) * Math.PI * 0.75;
        const p = F(L - 1.0 + Math.sin(th) * 1.6, k * 3.0, 0.6 + (1 - Math.cos(th)) * 1.6);
        sc.cone(oak, 'sled', prev, p, 0.6, 0.55, 0.3, { tag: 'runner' });
        prev = p;
      }
      for (const f of [-L + 1.4, 0, L - 2.4]) sc.cone(oak, 'sled', F(f, k * 3.0, 0.9), F(f, k * 2.2, 2.6), 0.4, 0.4, 0.2, { tag: 'post' });
    }
    sc.box(oak, 'block', F(-0.6, 0, 3.8), [mul(fwd, 4.6), mul(side, 4.0), [0, 0, 1.2]], 0.6, 0.5, { tag: 'block' });
    for (let i = 0; i < 3; i++) {
      const s = (i - 1) * 3.0;
      const aim = norm(add(aimAt(66), mul(side, (i - 1) * 0.25)));
      const b0 = F(-1.6 + (i === 1 ? 0.8 : 0), s, 6.0);
      const m = barrel(copper, 'barrels', b0, aim, 4.2, 1.8, 1.5, 1.9);
      // the vial loaded, its cap showing in the mouth
      vial(i, 'barrels', add(m, mul(aim, -1.9)), aim, 2.4, 0.85);
    }
    gear('block', F(1.2, -4.3, 3.9), side, 1.8);
    key('block', F(-4.8, 0, 4.0), norm([-1, 0, 0.3]), 0.9);
    lamp('block', F(3.2, 2.0, 4.8), 0.55);
  }
  scaleBy(sc, CONTRAPTION_SCALE);
  return draw(sc, view, CANVAS3.ax, CANVAS3.ay, CANVAS3, undefined, FRIEND_RIM);
}

/** How big it is drawn: its parts are laid out in a small measure, then all of it scaled up by this, knee high to her. */
export const CONTRAPTION_SCALE = 1.6;

/** Every solid (and mark) of a figure scaled about the floor point under it. */
function scaleBy(sc: Sculpt, k: number): void {
  const s = (p: V3): V3 => [p[0] * k, p[1] * k, p[2] * k];
  for (const p of sc.prims) {
    p.blend *= k;
    if (p.cuts) p.cuts = p.cuts.map((c) => ({ n: c.n, o: c.o * k }));
    if (p.k === 'cone') {
      p.a = s(p.a);
      p.b = s(p.b);
      p.ra *= k;
      p.rb *= k;
    } else if (p.k === 'tri') {
      p.a = s(p.a);
      p.b = s(p.b);
      p.c = s(p.c);
      p.thick *= k;
    } else {
      p.c = s(p.c);
      p.axes = [s(p.axes[0]), s(p.axes[1]), s(p.axes[2])];
      if (p.k === 'box') p.round *= k;
    }
  }
  for (const m of sc.marks) m.p = s(m.p);
}
